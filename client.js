window.__ModuleLoader__.load({
	id: "dsh-human-voice-copy",
	factory: (require) => {
		const React = require("react");
		const h = React.createElement;
		const { useCallback, useEffect, useMemo, useRef, useState } = React;

		const NS = "human-voice-copy";
		const PANEL_ID = "human-voice-copy";
		const API = "/human-voice-copy/api";
		const SAVE = "/human-voice-copy/save";
		const TOGGLE = "/human-voice-copy/toggle";

		const inject = ["slots", "locale"];

		const zh = {
			panel: "文案工坊",
			title: "文案工坊",
			subtitle: "真人语感文案 · 去 AI 腔、去官腔、去广告腔",
			refresh: "刷新",
			refreshed: "已刷新",
			loadFailed: "读取失败",
			retry: "重试",
			statusOn: "技能已注册",
			statusOff: "技能已停用",
			statusOnHint: "会话里可以调用 human-voice-copy",
			statusOffHint: "模型看不到这个技能，页面仍可编辑",
			toggleLabel: "启用人类语感文案技能",
			toggleFailed: "切换失败",
			studio: "生成指令",
			studioHint: "选体裁、填场景，拼一条能直接粘进对话的指令",
			genre: "体裁",
			tone: "基调",
			voice: "说话人",
			topic: "主题 / 产品",
			scene: "场景",
			audience: "对谁说",
			duration: "时长",
			topicPlaceholder: "北极甜虾 · 拍两盒发三盒",
			scenePlaceholder: "周末炖了一锅，孩子吃了两碗",
			audiencePlaceholder: "35 岁上班族，做饭但不爱收拾",
			generate: "生成指令",
			regenerate: "重新生成",
			promptTitle: "粘到对话里即可",
			promptEmpty: "填好上面的项，生成结果会出现在这里",
			copy: "复制",
			copied: "已复制",
			copyFailed: "复制失败，请手动选中文本",
			editor: "SKILL.md",
			references: "参考资料",
			save: "保存",
			saving: "保存中…",
			saved: "已保存",
			saveFailed: "保存失败",
			revert: "还原",
			reverted: "已还原到上次读取的版本",
			dirty: "未保存的修改",
			savedState: "与磁盘一致",
			updated: "更新于",
			lines: "行",
			chars: "字符",
			shortcut: "Ctrl / ⌘ + S 保存",
			missingFrontmatter: "frontmatter 缺少 name 或 description，保存会让技能失效",
			noFrontmatter: "找不到 frontmatter 块，文件开头应当是 --- 分隔的字段",
			searchRefs: "搜索参考资料",
			noRefs: "这个技能没有附带参考资料",
			noMatch: "没有匹配的参考资料",
			refCopy: "复制全文",
			expand: "展开",
			collapse: "收起",
			emptyPrompt: "先填至少一项，再生成指令"
		};

		const en = {
			panel: "Copy Studio",
			title: "Copy Studio",
			subtitle: "Human-voice Chinese copy · no AI tone, no corporate tone, no ad tone",
			refresh: "Refresh",
			refreshed: "Refreshed",
			loadFailed: "Load failed",
			retry: "Retry",
			statusOn: "Skill registered",
			statusOff: "Skill paused",
			statusOnHint: "human-voice-copy is available in a session",
			statusOffHint: "Hidden from the model; the page stays editable",
			toggleLabel: "Enable the human-voice-copy skill",
			toggleFailed: "Toggle failed",
			studio: "Build a brief",
			studioHint: "Pick a format, add the scene, get a prompt you can paste",
			genre: "Format",
			tone: "Register",
			voice: "Speaker",
			topic: "Subject / product",
			scene: "Scene",
			audience: "Audience",
			duration: "Length",
			topicPlaceholder: "Arctic shrimp · buy 2 get 3",
			scenePlaceholder: "Cooked a pot on Sunday, the kid had two bowls",
			audiencePlaceholder: "35-year-old office worker who cooks, hates cleanup",
			generate: "Build prompt",
			regenerate: "Rebuild",
			promptTitle: "Paste this into the conversation",
			promptEmpty: "Fill the form and the prompt shows up here",
			copy: "Copy",
			copied: "Copied",
			copyFailed: "Copy failed — select the text manually",
			editor: "SKILL.md",
			references: "References",
			save: "Save",
			saving: "Saving…",
			saved: "Saved",
			saveFailed: "Save failed",
			revert: "Revert",
			reverted: "Reverted to the loaded version",
			dirty: "Unsaved changes",
			savedState: "Matches disk",
			updated: "updated",
			lines: "lines",
			chars: "chars",
			shortcut: "Ctrl / ⌘ + S to save",
			missingFrontmatter: "frontmatter is missing name or description — saving would disable the skill",
			noFrontmatter: "No frontmatter block found — the file must open with --- fields",
			searchRefs: "Search references",
			noRefs: "This skill ships no references",
			noMatch: "No reference matches",
			refCopy: "Copy file",
			expand: "Expand",
			collapse: "Collapse",
			emptyPrompt: "Fill at least one field first"
		};

		const GENRES = ["口播稿", "字幕短句版", "朋友圈", "小红书", "公众号", "产品详情页", "私信 / 客服", "广告语 / 海报", "短信 / 推送", "招聘 JD", "自我介绍"];
		const TONES = ["A 喊话体", "B 聊天体", "C 说明体"];
		const VOICES = ["小店主", "宝妈", "退休教师", "程序员", "销售", "手艺人", "95 后", "老板", "医生", "房东", "健身教练", "老乡"];
		const LENGTHS = ["15s", "30s", "45s", "60s", "90s", "不限"];

		/** One stylesheet, one prefix, theme tokens only: no literal palette. */
		const css = `
.hvc_root{
	--hvc-hair:var(--dsw-alias-border-l2);
	--hvc-line:var(--dsw-alias-border-l3);
	--hvc-line-strong:var(--dsw-alias-border-l4);
	--hvc-mute:var(--dsw-alias-label-secondary);
	--hvc-faint:var(--dsw-alias-label-tertiary);
	--hvc-fill:var(--dsw-alias-bg-module-platform);
	--hvc-track:var(--dsw-alias-interactive-bg-active);
	--hvc-accent:color-mix(in srgb,var(--dsw-alias-state-business-primary) 84%,var(--dsw-alias-label-primary));
	--hvc-accent-soft:color-mix(in srgb,var(--dsw-alias-state-business-primary) 14%,transparent);
	--hvc-accent-hover:color-mix(in srgb,var(--dsw-alias-state-business-primary) 72%,var(--dsw-alias-label-primary));
	--hvc-mono:ui-monospace,SFMono-Regular,"SF Mono",Menlo,Consolas,"Liberation Mono",monospace;
	position:relative;display:flex;flex-direction:column;height:100%;min-height:0;
	overflow-y:auto;overscroll-behavior:contain;
	background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);
	font-size:14px;line-height:1.55;
	scrollbar-width:thin;scrollbar-color:var(--dsw-alias-scrollbar-bg-l1) transparent;
}
.hvc_root::-webkit-scrollbar{width:10px;height:10px}
.hvc_root::-webkit-scrollbar-thumb{background:var(--dsw-alias-scrollbar-bg-l1);border:3px solid transparent;background-clip:padding-box;border-radius:999px}
.hvc_root::-webkit-scrollbar-thumb:hover{background:var(--dsw-alias-scrollbar-hover-l1);background-clip:padding-box}
.hvc_root ::selection{background:var(--dsw-alias-bg-document-selection)}
.hvc_page{box-sizing:border-box;width:100%;max-width:1240px;margin:0 auto;padding:20px 20px 28px;display:flex;flex-direction:column;gap:16px}

.hvc_head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap}
.hvc_id{display:flex;align-items:flex-start;gap:11px;min-width:0}
.hvc_mark{flex:none;width:32px;height:32px;border-radius:10px;display:grid;place-items:center;background:var(--hvc-accent-soft);color:var(--hvc-accent)}
.hvc_title{margin:0;font-size:16px;font-weight:600;line-height:1.35;letter-spacing:.1px}
.hvc_sub{margin-top:2px;font-size:12px;line-height:1.5;color:var(--hvc-mute)}
.hvc_actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}

.hvc_power{display:inline-flex;align-items:center;gap:8px;height:32px;padding:0 6px 0 10px;border-radius:999px;border:1px solid var(--hvc-line);background:var(--hvc-fill)}
.hvc_dot{flex:none;width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-state-success-primary);box-shadow:0 0 0 3px var(--dsw-alias-state-success-tertiary)}
.hvc_dot_off{background:var(--dsw-alias-state-idle-primary);box-shadow:0 0 0 3px var(--dsw-alias-bg-skeleton)}
.hvc_powerTxt{font-size:12px;line-height:1;color:var(--hvc-mute);white-space:nowrap}

.hvc_switch{position:relative;flex:none;width:34px;height:20px;padding:0;border:0;border-radius:999px;cursor:pointer;background:var(--dsw-alias-state-idle-primary);transition:background .18s ease}
.hvc_switch:focus-visible{outline:2px solid var(--hvc-accent);outline-offset:2px}
.hvc_switchOn{background:var(--hvc-accent)}
.hvc_knob{position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:var(--dsw-alias-label-primary-foreground);box-shadow:var(--dsw-elevation-soft);transition:transform .18s cubic-bezier(.2,.8,.3,1)}
.hvc_switchOn .hvc_knob{transform:translateX(14px)}
.hvc_switch[disabled]{opacity:.5;cursor:default}

.hvc_btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:32px;padding:0 12px;border-radius:var(--dsw-radius-sm);border:1px solid var(--hvc-line);background:transparent;color:var(--dsw-alias-label-primary);font-family:inherit;font-size:13px;line-height:1;white-space:nowrap;cursor:pointer;transition:background .15s ease,border-color .15s ease,color .15s ease,opacity .15s ease}
.hvc_btn:hover{background:var(--dsw-alias-interactive-bg-hover)}
.hvc_btn:active{background:var(--dsw-alias-interactive-bg-active)}
.hvc_btn:focus-visible{outline:2px solid var(--hvc-accent);outline-offset:1px}
.hvc_btn[disabled]{opacity:.45;cursor:not-allowed;background:transparent;border-color:var(--hvc-line)}
.hvc_btnPrimary{background:var(--hvc-accent);border-color:transparent;color:var(--dsw-alias-label-primary-foreground);font-weight:500}
.hvc_btnPrimary:hover{background:var(--hvc-accent-hover)}
.hvc_btnPrimary:active{background:var(--hvc-accent-hover)}
.hvc_btnPrimary[disabled]{background:var(--hvc-accent);border-color:transparent}
.hvc_btnGhost{border-color:transparent;background:transparent;color:var(--hvc-mute)}
.hvc_btnGhost:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.hvc_btnSm{height:28px;padding:0 10px;font-size:12.5px}
.hvc_iconBtn{display:inline-flex;align-items:center;justify-content:center;flex:none;width:32px;height:32px;padding:0;border:1px solid transparent;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--hvc-mute);cursor:pointer;transition:background .15s ease,color .15s ease}
.hvc_iconBtn:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.hvc_iconBtn:focus-visible{outline:2px solid var(--hvc-accent);outline-offset:1px}
.hvc_iconBtnSm{width:26px;height:26px;border-radius:6px}
.hvc_spin{animation:hvc_spin .9s linear infinite}

.hvc_body{display:grid;grid-template-columns:minmax(320px,3.4fr) minmax(0,6.6fr);gap:16px;align-items:start}
@media (max-width:1080px){.hvc_body{grid-template-columns:minmax(0,1fr)}}

.hvc_card{box-sizing:border-box;min-width:0;border:1px solid var(--hvc-line);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-layer-1);box-shadow:var(--dsw-elevation-soft);overflow:hidden}
.hvc_cardHead{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 14px;border-bottom:1px solid var(--hvc-hair)}
.hvc_cardTitle{font-size:11.5px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--hvc-mute)}
.hvc_cardMeta{font-size:11.5px;color:var(--hvc-faint);white-space:nowrap;font-variant-numeric:tabular-nums}

.hvc_studio{display:flex;flex-direction:column}
.hvc_form{display:flex;flex-direction:column;gap:12px;padding:14px}
.hvc_field{display:flex;flex-direction:column;gap:6px;min-width:0}
.hvc_label{font-size:12px;font-weight:500;color:var(--hvc-mute)}
.hvc_pair{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:10px}
.hvc_input,.hvc_textarea,.hvc_select{box-sizing:border-box;width:100%;min-width:0;border:1px solid var(--hvc-line);border-radius:var(--dsw-radius-sm);background:var(--hvc-fill);color:var(--dsw-alias-label-primary);font-family:inherit;font-size:13px;transition:border-color .15s ease,box-shadow .15s ease}
.hvc_input,.hvc_select{height:32px;padding:0 10px}
.hvc_textarea{min-height:62px;padding:7px 10px;line-height:1.55;resize:vertical}
.hvc_input::placeholder,.hvc_textarea::placeholder{color:var(--dsw-alias-label-caption)}
.hvc_input:hover,.hvc_textarea:hover,.hvc_select:hover{border-color:var(--hvc-line-strong)}
.hvc_input:focus,.hvc_textarea:focus,.hvc_select:focus{outline:none;border-color:var(--hvc-accent);box-shadow:0 0 0 3px var(--hvc-accent-soft)}
.hvc_select{appearance:none;cursor:pointer;padding-right:28px}
.hvc_selectWrap{position:relative;display:flex}
.hvc_selectIcon{position:absolute;right:9px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--hvc-faint)}

.hvc_chips{display:flex;flex-wrap:wrap;gap:6px}
.hvc_chip{height:28px;padding:0 10px;border-radius:999px;border:1px solid var(--hvc-line);background:transparent;color:var(--hvc-mute);font-family:inherit;font-size:12.5px;line-height:1;white-space:nowrap;cursor:pointer;transition:background .15s ease,border-color .15s ease,color .15s ease}
.hvc_chip:hover{border-color:var(--hvc-line-strong);color:var(--dsw-alias-label-primary)}
.hvc_chip:focus-visible{outline:2px solid var(--hvc-accent);outline-offset:1px}
.hvc_chipOn{background:var(--hvc-accent-soft);border-color:transparent;color:var(--hvc-accent);font-weight:500}

.hvc_seg{display:flex;gap:2px;padding:2px;border-radius:10px;background:var(--hvc-track)}
.hvc_segItem{flex:1;min-width:0;height:26px;padding:0 6px;border:0;border-radius:8px;background:transparent;color:var(--hvc-mute);font-family:inherit;font-size:12.5px;line-height:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer;transition:background .15s ease,color .15s ease}
.hvc_segItem:hover{color:var(--dsw-alias-label-primary)}
.hvc_segItem:focus-visible{outline:2px solid var(--hvc-accent);outline-offset:1px}
.hvc_segOn{background:var(--hvc-accent-soft);color:var(--hvc-accent);font-weight:500}

.hvc_gen{display:flex;align-items:center;gap:10px;padding:12px 14px;border-top:1px solid var(--hvc-hair)}
.hvc_genHint{font-size:11.5px;line-height:1.5;color:var(--hvc-faint)}

.hvc_out{margin:0 14px 14px;border:1px solid var(--hvc-hair);border-radius:var(--dsw-radius-sm);background:var(--dsw-alias-markdown-code-block);overflow:hidden}
.hvc_outHead{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:7px 8px 7px 11px;border-bottom:1px solid var(--hvc-hair)}
.hvc_outTitle{font-size:11.5px;color:var(--hvc-mute)}
.hvc_outBody{margin:0;padding:10px 11px;max-height:210px;overflow:auto;font-family:var(--hvc-mono);font-size:11.5px;line-height:1.7;white-space:pre-wrap;word-break:break-word;scrollbar-width:thin}
.hvc_slot{display:flex;align-items:center;gap:8px;margin:0 14px 14px;padding:12px;border:1px dashed var(--hvc-line);border-radius:var(--dsw-radius-sm);color:var(--hvc-faint);font-size:12px}

.hvc_work{display:flex;flex-direction:column;min-height:440px}
.hvc_pane{display:flex;flex-direction:column;flex:1;min-height:0}
.hvc_workHead{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:9px 10px;border-bottom:1px solid var(--hvc-hair)}
.hvc_tabs{display:flex;gap:2px;padding:2px;border-radius:10px;background:var(--hvc-track)}
.hvc_tab{display:inline-flex;align-items:center;gap:6px;height:26px;padding:0 11px;border:0;border-radius:8px;background:transparent;color:var(--hvc-mute);font-family:inherit;font-size:12.5px;line-height:1;white-space:nowrap;cursor:pointer;transition:background .15s ease,color .15s ease}
.hvc_tab:hover{color:var(--dsw-alias-label-primary)}
.hvc_tab:focus-visible{outline:2px solid var(--hvc-accent);outline-offset:1px}
.hvc_tabOn{background:var(--hvc-accent-soft);color:var(--hvc-accent);font-weight:500}
.hvc_badge{display:inline-grid;place-items:center;min-width:16px;height:16px;padding:0 5px;border-radius:999px;background:var(--hvc-track);color:var(--hvc-mute);font-size:10.5px;font-weight:600;font-variant-numeric:tabular-nums}
.hvc_dirtyDot{flex:none;width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-state-warn-primary)}
.hvc_workHeadSpacer{flex:1;min-width:8px}

.hvc_edBar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:8px 12px;border-bottom:1px solid var(--hvc-hair)}
.hvc_edMeta{display:flex;align-items:center;gap:7px;font-family:var(--hvc-mono);font-size:11.5px;color:var(--hvc-faint);min-width:0}
.hvc_sep{color:var(--hvc-line-strong)}
.hvc_edWrap{display:flex;flex:1;min-height:0;transition:box-shadow .15s ease}
.hvc_edWrap:focus-within{box-shadow:inset 0 0 0 1.5px var(--hvc-accent)}
.hvc_ed{flex:1;width:100%;box-sizing:border-box;min-height:380px;border:0;outline:none;background:transparent;color:var(--dsw-alias-label-primary);padding:12px 14px;font-family:var(--hvc-mono);font-size:12.5px;line-height:1.7;resize:vertical;tab-size:2;scrollbar-width:thin}
.hvc_edFoot{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;padding:7px 12px;border-top:1px solid var(--hvc-hair);font-size:11.5px;color:var(--hvc-faint);font-variant-numeric:tabular-nums}

.hvc_warn{display:flex;gap:7px;align-items:flex-start;margin:10px 12px 0;padding:8px 10px;border-radius:var(--dsw-radius-sm);background:var(--dsw-alias-state-warn-tertiary);color:var(--dsw-alias-state-warn-label);font-size:12px;line-height:1.45}
.hvc_warn svg{flex:none;margin-top:1px}

.hvc_refs{display:flex;flex-direction:column;gap:8px;padding:12px;overflow:auto;max-height:min(70vh,600px);scrollbar-width:thin}
.hvc_ref{border:1px solid var(--hvc-hair);border-radius:var(--dsw-radius-sm);overflow:hidden;transition:border-color .15s ease}
.hvc_ref:hover{border-color:var(--hvc-line)}
.hvc_refTop{display:flex;align-items:center;gap:9px;padding:7px 8px 7px 11px}
.hvc_refIcon{flex:none;color:var(--hvc-faint)}
.hvc_refName{font-family:var(--hvc-mono);font-size:12px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.hvc_refMeta{display:flex;align-items:center;gap:6px;margin-left:auto;font-size:11px;color:var(--hvc-faint);white-space:nowrap;font-variant-numeric:tabular-nums}
.hvc_refBody{margin:0;padding:10px 12px;max-height:300px;overflow:auto;border-top:1px solid var(--hvc-hair);background:var(--dsw-alias-markdown-code-block);font-family:var(--hvc-mono);font-size:11.5px;line-height:1.65;white-space:pre-wrap;word-break:break-word;scrollbar-width:thin}
.hvc_searchWrap{position:relative;display:flex;align-items:center;flex:1;min-width:120px;max-width:240px}
.hvc_searchIcon{position:absolute;left:8px;color:var(--hvc-faint);pointer-events:none}
.hvc_search{box-sizing:border-box;width:100%;height:28px;padding:0 9px 0 27px;border:1px solid var(--hvc-line);border-radius:var(--dsw-radius-sm);background:var(--hvc-fill);color:inherit;font-family:inherit;font-size:12.5px}
.hvc_search:focus{outline:none;border-color:var(--hvc-accent);box-shadow:0 0 0 3px var(--hvc-accent-soft)}
.hvc_search::placeholder{color:var(--dsw-alias-label-caption)}

.hvc_empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:44px 20px;color:var(--hvc-faint);font-size:12.5px;text-align:center}
.hvc_emptyIcon{display:grid;place-items:center;width:38px;height:38px;border-radius:12px;background:var(--hvc-fill);color:var(--hvc-mute)}

.hvc_errCard{display:flex;gap:10px;align-items:flex-start;padding:14px;border:1px solid var(--hvc-hair);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-layer-1)}
.hvc_errIcon{flex:none;color:var(--dsw-alias-state-error-primary)}
.hvc_errTitle{font-size:13px;font-weight:600}
.hvc_errText{margin-top:2px;font-family:var(--hvc-mono);font-size:11.5px;line-height:1.6;color:var(--hvc-mute);word-break:break-word}

.hvc_sk{height:12px;border-radius:999px;background:var(--dsw-alias-bg-skeleton);animation:hvc_pulse 1.3s ease-in-out infinite}
.hvc_skCard{padding:16px;display:flex;flex-direction:column;gap:10px}
.hvc_skGrid{display:grid;grid-template-columns:minmax(320px,3.4fr) minmax(0,6.6fr);gap:16px;align-items:start}
@media (max-width:1080px){.hvc_skGrid{grid-template-columns:minmax(0,1fr)}}

.hvc_toastWrap{position:sticky;bottom:0;display:flex;justify-content:center;padding-bottom:10px;pointer-events:none;margin-top:-4px}
.hvc_toast{display:inline-flex;align-items:center;gap:7px;max-width:min(520px,90%);padding:7px 13px;border-radius:999px;background:var(--dsw-alias-toast-bg);color:var(--dsw-alias-toast-label);font-size:12.5px;box-shadow:var(--dsw-elevation-soft);animation:hvc_in .18s ease-out}
.hvc_toastErr{color:var(--dsw-alias-state-error-primary)}

@keyframes hvc_in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@keyframes hvc_spin{to{transform:rotate(360deg)}}
@keyframes hvc_pulse{0%,100%{opacity:1}50%{opacity:.42}}
@media (prefers-reduced-motion:reduce){.hvc_root *,.hvc_root *::before,.hvc_root *::after{animation-duration:.001ms !important;transition-duration:.001ms !important}}
`;

		/* ---------------- icons (outline, 1.7 stroke, lucide proportions) ---------------- */

		function svg(props, defaultSize, children) {
			return h(
				"svg",
				{
					width: props?.size ?? defaultSize,
					height: props?.size ?? defaultSize,
					viewBox: "0 0 24 24",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: 1.7,
					strokeLinecap: "round",
					strokeLinejoin: "round",
					"aria-hidden": true,
					focusable: false,
					className: props?.className,
					style: { display: "block", flex: "none" }
				},
				...children
			);
		}

		const IconRefresh = (p) => svg(p, 15, [h("path", { key: "a", d: "M20.5 12a8.5 8.5 0 1 1-2.5-6" }), h("path", { key: "b", d: "M20.5 4v5h-5" })]);
		const IconCopy = (p) => svg(p, 14, [h("rect", { key: "a", x: "9", y: "9", width: "11", height: "11", rx: "2.4" }), h("path", { key: "b", d: "M15 6.2A2.2 2.2 0 0 0 12.8 4H6.2A2.2 2.2 0 0 0 4 6.2v6.6A2.2 2.2 0 0 0 6.2 15" })]);
		const IconCheck = (p) => svg(p, 14, [h("path", { key: "a", d: "M4.5 12.6l5 5L19.5 6.8" })]);
		const IconSave = (p) => svg(p, 14, [h("path", { key: "a", d: "M5 4.5h11.2L20 8.3V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19V6a1.5 1.5 0 0 1 1-1.5Z" }), h("path", { key: "b", d: "M8 4.5v5h7" }), h("path", { key: "c", d: "M7.5 20.5v-5h9v5" })]);
		const IconRevert = (p) => svg(p, 14, [h("path", { key: "a", d: "M4 10h5" }), h("path", { key: "b", d: "M4 10V5" }), h("path", { key: "c", d: "M4.6 9a8 8 0 1 1 1.9 8.4" })]);
		const IconSparkle = (p) => svg(p, 14, [h("path", { key: "a", d: "M12 3.5l1.9 4.9 4.9 1.9-4.9 1.9L12 17.1l-1.9-4.9L5.2 10.3l4.9-1.9L12 3.5Z" }), h("path", { key: "b", d: "M18.6 16.4l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z" })]);
		const IconSearch = (p) => svg(p, 13, [h("circle", { key: "a", cx: "11", cy: "11", r: "6.4" }), h("path", { key: "b", d: "M16 16l4.2 4.2" })]);
		const IconChevronDown = (p) => svg(p, 14, [h("path", { key: "a", d: "M6 9.5l6 6 6-6" })]);
		const IconChevronRight = (p) => svg(p, 14, [h("path", { key: "a", d: "M9.5 6l6 6-6 6" })]);
		const IconAlert = (p) => svg(p, 14, [h("path", { key: "a", d: "M12 4.4l8.4 15H3.6L12 4.4Z" }), h("path", { key: "b", d: "M12 10v4" }), h("path", { key: "c", d: "M12 17.2h.01" })]);
		const IconFile = (p) => svg(p, 14, [h("path", { key: "a", d: "M13.4 3.5H7.2A1.7 1.7 0 0 0 5.5 5.2v13.6a1.7 1.7 0 0 0 1.7 1.7h9.6a1.7 1.7 0 0 0 1.7-1.7V8.3l-5.1-4.8Z" }), h("path", { key: "b", d: "M13.2 3.6v4.9h5" }), h("path", { key: "c", d: "M8.8 13h6.4" }), h("path", { key: "d", d: "M8.8 16.4h4.2" })]);
		const IconInbox = (p) => svg(p, 17, [h("path", { key: "a", d: "M4 13.5 6.4 5.6A1.6 1.6 0 0 1 7.9 4.4h8.2a1.6 1.6 0 0 1 1.5 1.2L20 13.5" }), h("path", { key: "b", d: "M4 13.5h4l1.3 2.3h5.4L16 13.5h4v4.1a1.6 1.6 0 0 1-1.6 1.6H5.6A1.6 1.6 0 0 1 4 17.6v-4.1Z" })]);

		/** Sidebar + settings entry icon. */
		function PanelIcon(props) {
			const size = props?.size ?? 18;
			return h(
				"svg",
				{
					width: size,
					height: size,
					viewBox: "0 0 24 24",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: 1.6,
					strokeLinecap: "round",
					strokeLinejoin: "round",
					"aria-hidden": true,
					focusable: false,
					style: { display: "block" }
				},
				h("path", { d: "M4 5.2h16A1.8 1.8 0 0 1 21.8 7v8.4a1.8 1.8 0 0 1-1.8 1.8h-6.6L8 21v-3.8H4A1.8 1.8 0 0 1 2.2 15.4V7A1.8 1.8 0 0 1 4 5.2Z" }),
				h("path", { d: "M6.6 9.4h7.4" }),
				h("path", { d: "M6.6 12.6h4.6" })
			);
		}

		/* ---------------- helpers ---------------- */

		function cx(...parts) {
			return parts.filter(Boolean).join(" ");
		}

		function formatBytes(n) {
			if (typeof n !== "number") return "—";
			return n >= 1024 ? `${(n / 1024).toFixed(1)} KB` : `${n} B`;
		}

		function formatTime(iso) {
			if (!iso) return "—";
			const date = new Date(iso);
			if (Number.isNaN(date.getTime())) return "—";
			return date.toLocaleString();
		}

		function countLines(text) {
			if (text === "") return 0;
			return text.split("\n").length;
		}

		/** Mirror of the host's frontmatter parser: warn before a save the host would reject. */
		function inspectFrontmatter(text) {
			const raw = String(text ?? "").replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
			if (!raw.startsWith("---\n")) return { kind: "missing-block" };
			const end = raw.indexOf("\n---", 4);
			if (end < 0) return { kind: "missing-block" };
			const fields = {};
			for (const line of raw.slice(4, end).split("\n")) {
				const match = /^([A-Za-z][\w-]*):\s*(.*)$/.exec(line.trim());
				if (match === null) continue;
				fields[match[1]] = match[2].replace(/^["']|["']$/g, "").trim();
			}
			const missing = ["name", "description"].filter((key) => !fields[key]);
			return missing.length === 0 ? { kind: "ok", fields } : { kind: "missing-fields", missing, fields };
		}

		/* ---------------- controls ---------------- */

		function Switch({ checked, disabled, label, onChange }) {
			return h(
				"button",
				{
					type: "button",
					role: "switch",
					"aria-checked": checked,
					"aria-label": label,
					title: label,
					disabled: Boolean(disabled),
					className: cx("hvc_switch", checked && "hvc_switchOn"),
					onClick: () => onChange(!checked)
				},
				h("span", { className: "hvc_knob" })
			);
		}

		function Segmented({ label, options, value, onChange }) {
			return h(
				"div",
				{ className: "hvc_seg", role: "radiogroup", "aria-label": label },
				options.map((option) =>
					h(
						"button",
						{
							key: option,
							type: "button",
							role: "radio",
							"aria-checked": value === option,
							className: cx("hvc_segItem", value === option && "hvc_segOn"),
							onClick: () => onChange(option)
						},
						option
					)
				)
			);
		}

		function Chips({ label, options, value, onChange }) {
			return h(
				"div",
				{ className: "hvc_chips", role: "radiogroup", "aria-label": label },
				options.map((option) =>
					h(
						"button",
						{
							key: option,
							type: "button",
							role: "radio",
							"aria-checked": value === option,
							className: cx("hvc_chip", value === option && "hvc_chipOn"),
							onClick: () => onChange(option)
						},
						option
					)
				)
			);
		}

		function Select({ label, options, value, onChange }) {
			return h(
				"div",
				{ className: "hvc_selectWrap" },
				h(
					"select",
					{ className: "hvc_select", "aria-label": label, value, onChange: (event) => onChange(event.target.value) },
					options.map((option) => h("option", { key: option, value: option }, option))
				),
				h(IconChevronDown, { size: 14, className: "hvc_selectIcon" })
			);
		}

		function Fields({ label, children }) {
			return h("div", { className: "hvc_field", role: "group", "aria-label": label }, h("span", { className: "hvc_label" }, label), children);
		}

		function Toast({ toast }) {
			if (toast === null) return null;
			return h(
				"div",
				{ className: "hvc_toastWrap", role: "status", "aria-live": "polite" },
				h(
					"span",
					{ className: cx("hvc_toast", toast.kind === "error" && "hvc_toastErr") },
					toast.kind === "error" ? h(IconAlert, { size: 13 }) : h(IconCheck, { size: 13 }),
					toast.text
				)
			);
		}

		function Skeleton() {
			const bar = (width, key) => h("div", { key, className: "hvc_sk", style: { width } });
			return h(
				"div",
				{ className: "hvc_skGrid", "aria-busy": true },
				h(
					"div",
					{ className: "hvc_card" },
					h("div", { className: "hvc_skCard" }, bar("32%", "a"), bar("100%", "b"), bar("78%", "c"), bar("100%", "d"), bar("62%", "e"), bar("100%", "f"), bar("45%", "g"))
				),
				h(
					"div",
					{ className: "hvc_card" },
					h("div", { className: "hvc_skCard" }, bar("24%", "h"), bar("100%", "i"), bar("92%", "j"), bar("88%", "k"), bar("96%", "l"), bar("70%", "m"))
				)
			);
		}

		/* ---------------- page ---------------- */

		function Page() {
			const t = React.useContext(i18nContext);
			const [phase, setPhase] = useState("loading");
			const [data, setData] = useState(null);
			const [error, setError] = useState("");
			const [draft, setDraft] = useState("");
			const [saving, setSaving] = useState(false);
			const [toggling, setToggling] = useState(false);
			const [refreshing, setRefreshing] = useState(false);
			const [tab, setTab] = useState("skill");
			const [prompt, setPrompt] = useState("");
			const [toast, setToast] = useState(null);
			const [openRef, setOpenRef] = useState("");
			const [query, setQuery] = useState("");
			const [form, setForm] = useState({
				genre: GENRES[0],
				tone: TONES[1],
				voice: VOICES[1],
				topic: "",
				scene: "",
				audience: "",
				duration: "45s"
			});
			const toastTimer = useRef(undefined);

			const notify = useCallback((kind, text) => {
				setToast({ kind, text });
				if (toastTimer.current !== undefined) clearTimeout(toastTimer.current);
				toastTimer.current = setTimeout(() => setToast(null), kind === "error" ? 3200 : 1800);
			}, []);

			useEffect(
				() => () => {
					if (toastTimer.current !== undefined) clearTimeout(toastTimer.current);
				},
				[]
			);

			const load = useCallback(
				async (quiet) => {
					if (quiet) setRefreshing(true);
					else setPhase("loading");
					try {
						const response = await fetch(API, { cache: "no-store", credentials: "same-origin" });
						const body = await response.json();
						if (!body?.ok) throw new Error(body?.error || t("loadFailed"));
						setData(body);
						setDraft(body.skill?.content ?? "");
						setError("");
						setPhase("ready");
						if (quiet) notify("ok", t("refreshed"));
					} catch (cause) {
						const detail = String(cause?.message ?? cause);
						setError(detail);
						if (quiet) notify("error", `${t("loadFailed")}: ${detail}`);
						else setPhase("error");
					} finally {
						setRefreshing(false);
					}
				},
				[notify, t]
			);

			useEffect(() => {
				load(false);
			}, [load]);

			const content = data?.skill?.content ?? "";
			const dirty = phase === "ready" && draft !== content;
			const frontmatter = useMemo(() => inspectFrontmatter(draft), [draft]);
			const blocked = frontmatter.kind !== "ok";

			const copy = useCallback(
				async (text) => {
					try {
						await navigator.clipboard.writeText(text);
						notify("ok", t("copied"));
					} catch {
						notify("error", t("copyFailed"));
					}
				},
				[notify, t]
			);

			const save = useCallback(async () => {
				if (phase !== "ready" || saving || blocked || !dirty) return;
				setSaving(true);
				try {
					const response = await fetch(SAVE, {
						method: "POST",
						credentials: "same-origin",
						headers: { "content-type": "application/json" },
						body: JSON.stringify({ file: "SKILL.md", content: draft })
					});
					const body = await response.json();
					if (!body?.ok) throw new Error(body?.error || t("saveFailed"));
					setData((current) => ({
						...(current ?? {}),
						skill: { ...(current?.skill ?? {}), content: draft, bytes: body.bytes, updatedAt: body.updatedAt }
					}));
					notify("ok", `${t("saved")} · ${formatBytes(body.bytes)}`);
				} catch (cause) {
					notify("error", `${t("saveFailed")}: ${String(cause?.message ?? cause)}`);
				} finally {
					setSaving(false);
				}
			}, [blocked, dirty, draft, notify, phase, saving, t]);

			const toggle = useCallback(async () => {
				if (data === null || toggling) return;
				setToggling(true);
				try {
					const response = await fetch(TOGGLE, {
						method: "POST",
						credentials: "same-origin",
						headers: { "content-type": "application/json" },
						body: JSON.stringify({ enabled: !data.enabled })
					});
					const body = await response.json();
					if (!body?.ok) throw new Error(body?.error || t("toggleFailed"));
					setData((current) => ({ ...(current ?? {}), enabled: body.enabled }));
					notify("ok", body.enabled ? t("statusOn") : t("statusOff"));
				} catch (cause) {
					notify("error", `${t("toggleFailed")}: ${String(cause?.message ?? cause)}`);
				} finally {
					setToggling(false);
				}
			}, [data, notify, t, toggling]);

			const build = useCallback(() => {
				const lines = ["用 human-voice-copy 写一条文案，直接给成稿正文，不要解释。"];
				const push = (label, value) => {
					if (value && value !== "不限") lines.push(`${label}：${value}`);
				};
				push("体裁", form.genre);
				push("基调", form.tone);
				push("说话人", form.voice);
				push("主题 / 产品", form.topic.trim());
				push("场景", form.scene.trim());
				push("对谁说", form.audience.trim());
				push("时长", form.duration);
				if (lines.length === 1) {
					notify("error", t("emptyPrompt"));
					return;
				}
				setPrompt(lines.join("\n"));
			}, [form, notify, t]);

			// Latest-closure refs: the window shortcut listener mounts once.
			const saveRef = useRef(save);
			saveRef.current = save;
			const openRefRef = useRef(openRef);
			openRefRef.current = openRef;

			useEffect(() => {
				const onKeyDown = (event) => {
					if ((event.metaKey || event.ctrlKey) && !event.altKey && event.key.toLowerCase() === "s") {
						event.preventDefault();
						saveRef.current();
						return;
					}
					if (event.key === "Escape" && openRefRef.current !== "") setOpenRef("");
				};
				window.addEventListener("keydown", onKeyDown);
				return () => window.removeEventListener("keydown", onKeyDown);
			}, []);

			const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

			const filteredRefs = useMemo(() => {
				const all = data?.references ?? [];
				const keyword = query.trim().toLowerCase();
				if (keyword === "") return all;
				return all.filter((reference) => reference.id.toLowerCase().includes(keyword));
			}, [data, query]);

			const enabled = data === null ? undefined : data.enabled !== false;
			const draftBytes = useMemo(() => new TextEncoder().encode(draft).length, [draft]);

			const header = h(
				"header",
				{ className: "hvc_head" },
				h(
					"div",
					{ className: "hvc_id" },
					h("div", { className: "hvc_mark" }, h(PanelIcon, { size: 18 })),
					h(
						"div",
						{ style: { minWidth: 0 } },
						h("h1", { className: "hvc_title" }, t("title")),
						h("div", { className: "hvc_sub" }, t("subtitle"))
					)
				),
				h(
					"div",
					{ className: "hvc_actions" },
					data === null
						? null
						: h(
								"span",
								{ className: "hvc_power", title: enabled ? t("statusOnHint") : t("statusOffHint") },
								h("span", { className: cx("hvc_dot", !enabled && "hvc_dot_off") }),
								h("span", { className: "hvc_powerTxt" }, enabled ? t("statusOn") : t("statusOff")),
								h(Switch, { checked: enabled === true, disabled: toggling, label: t("toggleLabel"), onChange: toggle })
						  ),
					h(
						"button",
						{
							type: "button",
							className: "hvc_iconBtn",
							title: t("refresh"),
							"aria-label": t("refresh"),
							disabled: refreshing,
							onClick: () => load(true)
						},
						h(IconRefresh, { size: 16, className: refreshing ? "hvc_spin" : undefined })
					)
				)
			);

			const studio = h(
				"section",
				{ className: "hvc_card hvc_studio", "aria-label": t("studio") },
				h("div", { className: "hvc_cardHead" }, h("span", { className: "hvc_cardTitle" }, t("studio")), h("span", { className: "hvc_cardMeta" }, form.genre)),
				h(
					"div",
					{ className: "hvc_form" },
					h(Fields, { label: t("genre") }, h(Chips, { label: t("genre"), options: GENRES, value: form.genre, onChange: (value) => setField("genre", value) })),
					h(Fields, { label: t("tone") }, h(Segmented, { label: t("tone"), options: TONES, value: form.tone, onChange: (value) => setField("tone", value) })),
					h(
						"div",
						{ className: "hvc_pair" },
						h(Fields, { label: t("voice") }, h(Select, { label: t("voice"), options: VOICES, value: form.voice, onChange: (value) => setField("voice", value) })),
						h(Fields, { label: t("duration") }, h(Select, { label: t("duration"), options: LENGTHS, value: form.duration, onChange: (value) => setField("duration", value) }))
					),
					h(
						Fields,
						{ label: t("topic") },
						h("input", {
							className: "hvc_input",
							value: form.topic,
							"aria-label": t("topic"),
							placeholder: t("topicPlaceholder"),
							onChange: (event) => setField("topic", event.target.value)
						})
					),
					h(
						Fields,
						{ label: t("scene") },
						h("textarea", {
							className: "hvc_textarea",
							value: form.scene,
							rows: 2,
							"aria-label": t("scene"),
							placeholder: t("scenePlaceholder"),
							onChange: (event) => setField("scene", event.target.value)
						})
					),
					h(
						Fields,
						{ label: t("audience") },
						h("input", {
							className: "hvc_input",
							value: form.audience,
							"aria-label": t("audience"),
							placeholder: t("audiencePlaceholder"),
							onChange: (event) => setField("audience", event.target.value)
						})
					)
				),
				h(
					"div",
					{ className: "hvc_gen" },
					h("button", { type: "button", className: "hvc_btn hvc_btnPrimary", onClick: build }, h(IconSparkle, { size: 14 }), prompt === "" ? t("generate") : t("regenerate")),
					h("span", { className: "hvc_genHint" }, t("studioHint"))
				),
				prompt === ""
					? h("div", { className: "hvc_slot" }, h(IconSparkle, { size: 14 }), t("promptEmpty"))
					: h(
							"div",
							{ className: "hvc_out" },
							h(
								"div",
								{ className: "hvc_outHead" },
								h("span", { className: "hvc_outTitle" }, t("promptTitle")),
								h("button", { type: "button", className: "hvc_btn hvc_btnGhost hvc_btnSm", onClick: () => copy(prompt) }, h(IconCopy, { size: 13 }), t("copy"))
							),
							h("pre", { className: "hvc_outBody" }, prompt)
					  )
			);

			const skillTab = h(
				"div",
				{ className: "hvc_pane", role: "tabpanel", id: "hvc-panel-skill", "aria-labelledby": "hvc-tab-skill" },
				h(
					"div",
					{ className: "hvc_edBar" },
					h(
						"div",
						{ className: "hvc_edMeta" },
						dirty ? h("span", { className: "hvc_dirtyDot", title: t("dirty") }) : null,
						h("span", null, dirty ? t("dirty") : t("savedState")),
						h("span", { className: "hvc_sep" }, "·"),
						h("span", null, formatBytes(draftBytes)),
						h("span", { className: "hvc_sep" }, "·"),
						h("span", null, `${t("updated")} ${formatTime(data?.skill?.updatedAt)}`)
					),
					h(
						"div",
						{ style: { display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" } },
						h(
							"button",
							{
								type: "button",
								className: "hvc_btn hvc_btnGhost hvc_btnSm",
								disabled: !dirty,
								onClick: () => {
									setDraft(content);
									notify("ok", t("reverted"));
								}
							},
							h(IconRevert, { size: 13 }),
							t("revert")
						),
						h(
							"button",
							{ type: "button", className: "hvc_btn hvc_btnPrimary hvc_btnSm", disabled: !dirty || blocked || saving, onClick: save },
							h(IconSave, { size: 13 }),
							saving ? t("saving") : t("save")
						)
					)
				),
				blocked
					? h(
							"div",
							{ className: "hvc_warn", role: "alert" },
							h(IconAlert, { size: 14 }),
							h("span", null, frontmatter.kind === "missing-fields" ? t("missingFrontmatter") : t("noFrontmatter"))
					  )
					: null,
				h(
					"div",
					{ className: "hvc_edWrap" },
					h("textarea", {
						className: "hvc_ed",
						value: draft,
						spellCheck: false,
						"aria-label": t("editor"),
						onChange: (event) => setDraft(event.target.value),
						onKeyDown: (event) => {
							if (event.key !== "Tab" || event.altKey || event.ctrlKey || event.metaKey || event.isComposing) return;
							event.preventDefault();
							const node = event.currentTarget;
							const start = node.selectionStart;
							const next = `${node.value.slice(0, start)}  ${node.value.slice(node.selectionEnd)}`;
							setDraft(next);
							requestAnimationFrame(() => {
								node.selectionStart = start + 2;
								node.selectionEnd = start + 2;
							});
						}
					})
				),
				h("div", { className: "hvc_edFoot" }, h("span", null, `${countLines(draft)} ${t("lines")} · ${draft.length} ${t("chars")}`), h("span", null, t("shortcut")))
			);

			const refsTab = h(
				"div",
				{ className: "hvc_refs", role: "tabpanel", id: "hvc-panel-refs", "aria-labelledby": "hvc-tab-refs" },
				(data?.references ?? []).length === 0
					? h("div", { className: "hvc_empty" }, h("div", { className: "hvc_emptyIcon" }, h(IconInbox, { size: 18 })), t("noRefs"))
					: filteredRefs.length === 0
					? h("div", { className: "hvc_empty" }, h("div", { className: "hvc_emptyIcon" }, h(IconSearch, { size: 16 })), t("noMatch"))
					: filteredRefs.map((reference) => {
							const expanded = openRef === reference.id;
							const name = reference.id.replace(/^references\//, "");
							return h(
								"div",
								{ key: reference.id, className: "hvc_ref" },
								h(
									"div",
									{ className: "hvc_refTop" },
									h(IconFile, { size: 14, className: "hvc_refIcon" }),
									h("span", { className: "hvc_refName", title: reference.id }, name),
									h("span", { className: "hvc_refMeta" }, formatBytes(reference.bytes), h("span", { className: "hvc_sep" }, "·"), formatTime(reference.updatedAt)),
									h(
										"button",
										{
											type: "button",
											className: "hvc_iconBtn hvc_iconBtnSm",
											title: t("refCopy"),
											"aria-label": `${t("refCopy")} ${name}`,
											onClick: () => copy(reference.content)
										},
										h(IconCopy, { size: 13 })
									),
									h(
										"button",
										{
											type: "button",
											className: "hvc_iconBtn hvc_iconBtnSm",
											title: expanded ? t("collapse") : t("expand"),
											"aria-label": `${expanded ? t("collapse") : t("expand")} ${name}`,
											"aria-expanded": expanded,
											onClick: () => setOpenRef(expanded ? "" : reference.id)
										},
										h(expanded ? IconChevronDown : IconChevronRight, { size: 14 })
									)
								),
								expanded ? h("pre", { className: "hvc_refBody" }, reference.content) : null
							);
					  })
			);

			const workspace = h(
				"section",
				{ className: "hvc_card hvc_work" },
				h(
					"div",
					{ className: "hvc_workHead" },
					h(
						"div",
						{
							className: "hvc_tabs",
							role: "tablist",
							"aria-label": t("title"),
							onKeyDown: (event) => {
								if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
								event.preventDefault();
								const next = tab === "skill" ? "refs" : "skill";
								setTab(next);
								const node = event.currentTarget.querySelector(`[data-tab="${next}"]`);
								if (node !== null && typeof node.focus === "function") node.focus();
							}
						},
						h(
							"button",
							{
								type: "button",
								role: "tab",
								id: "hvc-tab-skill",
								"data-tab": "skill",
								"aria-controls": "hvc-panel-skill",
								"aria-selected": tab === "skill",
								tabIndex: tab === "skill" ? 0 : -1,
								className: cx("hvc_tab", tab === "skill" && "hvc_tabOn"),
								onClick: () => setTab("skill")
							},
							t("editor"),
							dirty ? h("span", { className: "hvc_dirtyDot" }) : null
						),
						h(
							"button",
							{
								type: "button",
								role: "tab",
								id: "hvc-tab-refs",
								"data-tab": "refs",
								"aria-controls": "hvc-panel-refs",
								"aria-selected": tab === "refs",
								tabIndex: tab === "refs" ? 0 : -1,
								className: cx("hvc_tab", tab === "refs" && "hvc_tabOn"),
								onClick: () => setTab("refs")
							},
							t("references"),
							h("span", { className: "hvc_badge" }, (data?.references ?? []).length)
						)
					),
					tab === "refs"
						? h(
								"div",
								{ className: "hvc_searchWrap", style: { marginLeft: "auto" } },
								h(IconSearch, { size: 13, className: "hvc_searchIcon" }),
								h("input", {
									className: "hvc_search",
									value: query,
									placeholder: t("searchRefs"),
									"aria-label": t("searchRefs"),
									onChange: (event) => setQuery(event.target.value)
								})
						  )
						: h("span", { className: "hvc_workHeadSpacer" }),
					tab === "skill" ? h("span", { className: "hvc_cardMeta" }, data?.skill?.name ?? "skill") : null
				),
				tab === "skill" ? skillTab : refsTab
			);

			const body =
				phase === "loading"
					? h(Skeleton)
					: phase === "error"
					? h(
							"div",
							{ className: "hvc_errCard" },
							h(IconAlert, { size: 16, className: "hvc_errIcon" }),
							h(
								"div",
								{ style: { minWidth: 0 } },
								h("div", { className: "hvc_errTitle" }, t("loadFailed")),
								h("div", { className: "hvc_errText" }, error),
								h("button", { type: "button", className: "hvc_btn hvc_btnSm", style: { marginTop: 10 }, onClick: () => load(false) }, h(IconRefresh, { size: 13 }), t("retry"))
							)
					  )
					: h("div", { className: "hvc_body" }, studio, workspace);

			return h("div", { className: "hvc_root" }, h("style", null, css), h("div", { className: "hvc_page" }, header, body, h(Toast, { toast })));
		}

		const i18nContext = React.createContext((key) => key);

		/** Slot registrations for the sidebar entry and its main-column page. */
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, { zh, en }), "human-voice-copy: dictionaries");
			const t = ctx.locale.bind(NS);
			const Bound = () => h(i18nContext.Provider, { value: t }, h(Page));
			ctx.slots.inject("main", () => ctx.slots.register({ name: "main", key: PANEL_ID, locale: NS }, Bound));
			ctx.slots.inject("sidebar.panellist", () =>
				ctx.slots.register({ name: "sidebar.panellist", id: PANEL_ID, order: 20, locale: NS, label: () => t("panel") }, PanelIcon)
			);
			// 设置 → 文案工坊。settings.section 只投影 id/order/label，导航图标由设置外壳按 id 落默认齿轮。
			ctx.slots.inject("settings.section", () =>
				ctx.slots.register({ name: "settings.section", id: PANEL_ID, order: 460, locale: NS, label: () => t("panel") }, Bound)
			);
		}

		const exports = { apply, inject };
		return exports;
	}
});
