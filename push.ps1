# 把本目录推到 GitHub 私有库，并回填 package.json 里的仓库地址。
# 用法：在包目录执行  .\push.ps1
#       .\push.ps1 -Repo other-name -Visibility private
param(
  [string]$Repo = "dsh-human-voice-copy",
  [string]$Visibility = "private"
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "[1/5] 检查 gh 登录…"
gh auth status *> $null
if ($LASTEXITCODE -ne 0) {
  Write-Host "未登录 GitHub。先执行：  gh auth login" -ForegroundColor Yellow
  Write-Host "（选 HTTPS 或 SSH 都行，登录一次后本脚本可重复用）"
  exit 1
}
$owner = (gh api user --jq .login).Trim()
if ([string]::IsNullOrWhiteSpace($owner)) { throw "拿不到 GitHub 账号名" }
Write-Host "    账号：$owner / 仓库：$Repo / 可见性：$Visibility"

Write-Host "[2/5] 初始化 git 并提交…"
if (-not (Test-Path ".git")) {
  git init *> $null
  git branch -M main
}
git add -A
if (git status --porcelain) {
  git commit -m "feat: 真人语感文案 dsh 插件 v0.3.0" *> $null
  Write-Host "    已提交本地改动"
} else {
  Write-Host "    无新改动，跳过提交"
}

Write-Host "[3/5] 创建或连接私有库…"
gh repo view "$owner/$Repo" *> $null
if ($LASTEXITCODE -ne 0) {
  gh repo create $Repo --$Visibility --source . --remote origin --push *> $null
  if ($LASTEXITCODE -ne 0) { throw "创建仓库失败，检查网络或权限" }
  Write-Host "    已创建并推送"
} else {
  if (-not (git remote get-url origin 2>$null)) {
    git remote add origin "https://github.com/$owner/$Repo.git"
  }
  git push -u origin main
  Write-Host "    已推送到已有仓库"
}

Write-Host "[4/5] 回填 package.json 的仓库地址…"
$pkgPath = Join-Path $PSScriptRoot "package.json"
$pkg = Get-Content $pkgPath -Raw -Encoding utf8 | ConvertFrom-Json
$pkg.dsh.install.git = "https://github.com/$owner/$Repo.git"
$pkg.dsh.install.tarball = "https://github.com/$owner/$Repo/archive/refs/heads/main.tar.gz"
$pkg.dsh.install.zip = "https://github.com/$owner/$Repo/archive/refs/heads/main.zip"
$pkg | ConvertTo-Json -Depth 12 | Set-Content $pkgPath -Encoding utf8 -NoNewline
git add package.json
git commit -m "chore: 填入仓库安装地址" *> $null
git push *> $null
git tag -f v0.3.0 *> $null
git push -f origin v0.3.0 *> $null
Write-Host "    done"

Write-Host ""
Write-Host "[5/5] 分享给对方的两条命令：" -ForegroundColor Green
Write-Host ""
Write-Host "  # 1) 先确认能拉到代码（应列出 main 等分支）"
Write-Host "  git ls-remote git@github.com:$owner/$Repo.git"
Write-Host ""
Write-Host "  # 2) 在 dsh 会话里安装（装完重启一次 dsh）"
Write-Host "  plugin_manager install_bundle target=git+ssh://git@github.com:$owner/$Repo.git"
Write-Host ""
Write-Host "对方没有 SSH key 时，改用带 token 的地址（别写进公开文档）："
Write-Host "  plugin_manager install_bundle target=git+https://<THEIR_TOKEN>@github.com/$owner/$Repo.git"
Write-Host ""
Write-Host "仓库地址：https://github.com/$owner/$Repo" -ForegroundColor Green
