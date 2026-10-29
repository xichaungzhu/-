# Push this plugin to a private Gitee repo and stamp the repo urls into package.json.
# Usage:
#   $env:GITEE_TOKEN = "xxx"; .\push-gitee.ps1
#   .\push-gitee.ps1 -Token xxx -Repo dsh-human-voice-copy
param(
  [string]$Token = $env:GITEE_TOKEN,
  [string]$Repo = "dsh-human-voice-copy"
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if ([string]::IsNullOrWhiteSpace($Token)) {
  Write-Host "缺少令牌。先设环境变量再跑：" -ForegroundColor Yellow
  Write-Host '  $env:GITEE_TOKEN = "你的私人令牌"'
  Write-Host "令牌地址：https://gitee.com/profile/personal_access_tokens"
  exit 1
}

Write-Host "[1/5] reading account ..."
$me = Invoke-RestMethod -Uri ("https://gitee.com/api/v5/user?access_token=" + $Token) -TimeoutSec 20
$owner = $me.login
if ([string]::IsNullOrWhiteSpace($owner)) { throw "cannot read gitee login" }
Write-Host "    owner=$owner repo=$Repo"

Write-Host "[2/5] creating private repo ..."
$body = @{ access_token = $Token; name = $Repo; private = $true; auto_init = $false }
try {
  Invoke-RestMethod -Method Post -Uri "https://gitee.com/api/v5/user/repos" -Body $body -TimeoutSec 30 | Out-Null
  Write-Host "    created"
} catch {
  Write-Host "    already exists or create failed (continuing): $($_.Exception.Message)"
}

Write-Host "[3/5] git commit ..."
if (-not (Test-Path ".git")) {
  git init *> $null
  git branch -M main
}
git add -A
if (git status --porcelain) {
  git commit -m "chore: snapshot before push" *> $null
}

Write-Host "[4/5] push ..."
$remoteUrl = "https://" + $owner + ":" + $Token + "@gitee.com/" + $owner + "/" + $Repo + ".git"
git remote remove origin 2>$null
git remote add origin $remoteUrl
git push -u origin main 2>&1 | Select-Object -Last 3
if ($LASTEXITCODE -ne 0) { throw "git push failed" }

Write-Host "[5/5] stamping repo urls into package.json ..."
$pkgPath = Join-Path $PSScriptRoot "package.json"
$pkg = Get-Content $pkgPath -Raw -Encoding utf8 | ConvertFrom-Json
$pkg.dsh.install.git = "https://gitee.com/$owner/${Repo}.git"
$pkg.dsh.install.tarball = "https://gitee.com/$owner/${Repo}/repository/archive/main.tar.gz"
$pkg.dsh.install.zip = "https://gitee.com/$owner/${Repo}/repository/archive/main.zip"
$pkg | ConvertTo-Json -Depth 12 | Set-Content $pkgPath -Encoding utf8 -NoNewline
git add package.json
git commit -m "chore: stamp gitee urls" *> $null
git push 2>&1 | Select-Object -Last 2
git tag -f v0.3.0 *> $null
git push -f origin v0.3.0 2>&1 | Select-Object -Last 1

$publicGit = "https://gitee.com/" + $owner + "/" + $Repo + ".git"
$tokenGit = "git+https://" + $owner + ":" + "<TOKEN>" + "@gitee.com/" + $owner + "/" + $Repo + ".git"

Write-Host ""
Write-Host "done. share these:" -ForegroundColor Green
Write-Host ""
Write-Host ("  repo page : https://gitee.com/" + $owner + "/" + $Repo)
Write-Host ("  clone url : " + $publicGit)
Write-Host ""
Write-Host "  # install inside a dsh session (private repo needs a credential):"
Write-Host ("  plugin_manager install_bundle target=" + $tokenGit)
Write-Host ""
Write-Host "  # or from a tarball:"
Write-Host ("  plugin_manager install_bundle target=file:C:\path\dsm-human-voice-copy-0.3.0.tgz")
