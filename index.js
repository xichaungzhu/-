import { readFile, readdir, rename, stat, writeFile } from "node:fs/promises";
import { join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Host half of the 真人语感文案 plugin.
 *
 * 1. Registers the `human-voice-copy` skill provider (see `assets/SKILL.md`).
 * 2. Serves the sidebar page's small JSON API: read the skill, edit it, list
 *    references, and toggle whether the skill is offered to the agent at all.
 *
 * The toggle is persisted next to the skill so it survives restarts, and it
 * invalidates the skill catalog so the change is visible without a reload.
 */

const ASSETS_DIR = fileURLToPath(new URL("./assets/", import.meta.url));
const SKILL_PATH = join(ASSETS_DIR, "SKILL.md");
const REFERENCES_DIR = join(ASSETS_DIR, "references");
const STATE_PATH = join(ASSETS_DIR, ".state.json");
const PROVIDER_NAME = "human-voice-copy";
/** Precedence rank of a custom skill root; lower wins over user/agents roots. */
const RANK = 300;
const MAX_BODY_BYTES = 512 * 1024;

function splitFrontmatter(raw) {
	const text = raw.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
	if (!text.startsWith("---\n")) return { fields: {}, body: text.trim() };
	const end = text.indexOf("\n---", 4);
	if (end < 0) return { fields: {}, body: text.trim() };
	const fields = {};
	for (const line of text.slice(4, end).split("\n")) {
		const match = /^([A-Za-z][\w-]*):\s*(.*)$/.exec(line.trim());
		if (match === null) continue;
		fields[match[1]] = match[2].replace(/^["']|["']$/g, "").trim();
	}
	const bodyStart = text.indexOf("\n", end + 1);
	return { fields, body: (bodyStart < 0 ? "" : text.slice(bodyStart + 1)).trim() };
}

/** Skill bodies shipped in this bundle. Both are read fresh from disk on every access. */
const SKILL_FILES = [
	{ file: "SKILL.md", fallbackName: "human-voice-copy" },
	{ file: "copy-audit.md", fallbackName: "copy-audit" }
];

/** No module-level body cache: editing the markdown takes effect on the next read. */
async function readSkillFile(file) {
	return splitFrontmatter(await readFile(join(ASSETS_DIR, file), "utf8"));
}

async function readState() {
	try {
		const parsed = JSON.parse(await readFile(STATE_PATH, "utf8"));
		return { enabled: parsed?.enabled !== false };
	} catch {
		return { enabled: true };
	}
}

async function writeState(next) {
	const tmp = `${STATE_PATH}.tmp`;
	await writeFile(tmp, `${JSON.stringify(next, null, 2)}\n`, "utf8");
	await rename(tmp, STATE_PATH);
}

function identity(fields, fallbackName = PROVIDER_NAME) {
	const description = fields.description;
	if (typeof description !== "string" || description.length === 0) {
		throw new Error(`human-voice-copy: ${fallbackName} frontmatter needs a description`);
	}
	return {
		name: fields.name ?? fallbackName,
		description,
		...(fields.whenToUse === undefined ? {} : { whenToUse: fields.whenToUse }),
		invocation: { modelInvocable: true, userInvocable: true },
		provider: PROVIDER_NAME,
		source: "custom",
		rank: RANK,
		resourceBase: { kind: "directory", path: ASSETS_DIR }
	};
}

let invalidateCatalog = () => {};

const provider = {
	name: PROVIDER_NAME,
	async list() {
		if (!(await readState()).enabled) return [];
		const out = [];
		for (const entry of SKILL_FILES) {
			let fields;
			try {
				({ fields } = await readSkillFile(entry.file));
			} catch {
				continue;
			}
			out.push({
				...identity(fields, entry.fallbackName),
				locator: { path: join(ASSETS_DIR, entry.file) }
			});
		}
		return out;
	},
	async get(candidate) {
		const wanted = candidate?.locator?.path;
		const entry = SKILL_FILES.find((item) => join(ASSETS_DIR, item.file) === wanted) ?? SKILL_FILES[0];
		const { fields, body } = await readSkillFile(entry.file);
		return { ...identity(fields, entry.fallbackName), content: body };
	}
};

function sendJson(response, status, value) {
	const body = JSON.stringify(value);
	response.writeHead(status, {
		"content-type": "application/json; charset=utf-8",
		"content-length": Buffer.byteLength(body),
		"cache-control": "no-store"
	});
	response.end(body);
}

function readBody(request) {
	return new Promise((resolve, reject) => {
		const chunks = [];
		let size = 0;
		request.on("data", (chunk) => {
			size += chunk.length;
			if (size > MAX_BODY_BYTES) {
				reject(new Error("请求体过大"));
				request.destroy();
				return;
			}
			chunks.push(chunk);
		});
		request.on("end", () => {
			try {
				resolve(chunks.length === 0 ? {} : JSON.parse(Buffer.concat(chunks).toString("utf8")));
			} catch {
				reject(new Error("请求体不是合法 JSON"));
			}
		});
		request.on("error", reject);
	});
}

/** Resolve a page-supplied file id inside assets: `SKILL.md` or `references/<name>.md`. */
function resolveAsset(id) {
	const raw = String(id ?? "");
	if (raw !== "SKILL.md" && raw !== "copy-audit.md" && !/^references\/[A-Za-z0-9._-]+\.md$/.test(raw)) return undefined;
	const target = normalize(join(ASSETS_DIR, raw));
	if (!target.startsWith(ASSETS_DIR.endsWith(sep) ? ASSETS_DIR : ASSETS_DIR + sep)) return undefined;
	return target;
}

async function describeFile(id, path) {
	const info = await stat(path).catch(() => undefined);
	if (info === undefined || !info.isFile()) return undefined;
	return { id, bytes: info.size, updatedAt: info.mtime.toISOString() };
}

async function snapshot() {
	const state = await readState();
	const skill = await describeFile("SKILL.md", SKILL_PATH);
	const skillText = await readFile(SKILL_PATH, "utf8").catch(() => "");
	const { fields } = splitFrontmatter(skillText);
	const names = await readdir(REFERENCES_DIR).catch(() => []);
	const references = [];
	for (const name of names.filter((entry) => entry.endsWith(".md")).sort()) {
		const id = `references/${name}`;
		const described = await describeFile(id, join(REFERENCES_DIR, name));
		if (described === undefined) continue;
		references.push({ ...described, content: await readFile(join(REFERENCES_DIR, name), "utf8") });
	}
	return {
		ok: true,
		provider: PROVIDER_NAME,
		enabled: state.enabled,
		skill: {
			...(skill ?? { id: "SKILL.md", bytes: 0, updatedAt: null }),
			name: fields.name ?? PROVIDER_NAME,
			description: fields.description ?? "",
			content: skillText
		},
		references
	};
}

function registerRoutes(scope) {
	return scope.effect(() => {
		const disposers = [];
		const route = (spec) => {
			const dispose = scope.webServer.register(spec, "human-voice-copy: page api");
			if (typeof dispose === "function") disposers.push(dispose);
			return dispose;
		};

		route({
			kind: "exact",
			path: "/human-voice-copy/api",
			handler: async (request, response) => {
				if (request.method !== "GET") {
					response.writeHead(405, { allow: "GET" });
					response.end();
					return;
				}
				try {
					sendJson(response, 200, await snapshot());
				} catch (error) {
					sendJson(response, 500, { ok: false, error: String(error?.message ?? error) });
				}
			}
		});

		route({
			kind: "exact",
			path: "/human-voice-copy/save",
			handler: async (request, response) => {
				if (request.method !== "POST") {
					response.writeHead(405, { allow: "POST" });
					response.end();
					return;
				}
				try {
					const body = await readBody(request);
					const target = resolveAsset(body.file);
					if (target === undefined) {
						sendJson(response, 400, { ok: false, error: "只能写 SKILL.md 或 references/*.md" });
						return;
					}
					if (typeof body.content !== "string" || body.content.length === 0) {
						sendJson(response, 400, { ok: false, error: "内容为空" });
						return;
					}
					if (body.file === "SKILL.md") {
						const { fields } = splitFrontmatter(body.content);
						if (fields.name === undefined || fields.description === undefined) {
							sendJson(response, 400, {
								ok: false,
								error: "frontmatter 缺少 name 或 description，保存会让技能失效"
							});
							return;
						}
					}
					const tmp = `${target}.tmp`;
					await writeFile(tmp, body.content, "utf8");
					await rename(tmp, target);
					invalidateCatalog();
					const info = await stat(target);
					sendJson(response, 200, { ok: true, bytes: info.size, updatedAt: info.mtime.toISOString() });
				} catch (error) {
					sendJson(response, 500, { ok: false, error: String(error?.message ?? error) });
				}
			}
		});

		route({
			kind: "exact",
			path: "/human-voice-copy/toggle",
			handler: async (request, response) => {
				if (request.method !== "POST") {
					response.writeHead(405, { allow: "POST" });
					response.end();
					return;
				}
				try {
					const body = await readBody(request);
					const next = { enabled: body.enabled !== false };
					await writeState(next);
					invalidateCatalog();
					sendJson(response, 200, { ok: true, ...next });
				} catch (error) {
					sendJson(response, 500, { ok: false, error: String(error?.message ?? error) });
				}
			}
		});

		return () => {
			for (const dispose of disposers) dispose();
		};
	});
}

/** Cordis plugin name. */
export const name = "human-voice-copy";
/** Service required to register the skill provider. */
export const inject = ["skills"];

/** Register the skill provider and, when a web server exists, the page API. */
export function apply(ctx, config) {
	ctx.skills.registerProvider((control) => {
		invalidateCatalog = control.invalidate;
		return provider;
	});
	if (config?.http === false) return;
	ctx.inject(["webServer"], (scope) => {
		registerRoutes(scope);
	});
}
