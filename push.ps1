# Push this plugin to a private GitHub repo and stamp the repo URL into package.json.
# Usage:  .\push.ps1
#         .\push.ps1 -Repo some-name -Visibility private
param(
  [string]$Repo = "dsh-human-voice-copy",
  [string]$Visibility = "private"
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "[1/5] checking gh login ..."
gh auth status *> $null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Not logged in. Run:  gh auth login" -ForegroundColor Yellow
  Write-Host "Then re-run this script."
  exit 1
}
$owner = (gh api user --jq .login).Trim()
if ([string]::IsNullOrWhiteSpace($owner)) { throw "cannot read GitHub login" }
Write-Host "    owner=$owner repo=$Repo visibility=$Visibility"

Write-Host "[2/5] git init + commit ..."
if (-not (Test-Path ".git")) {
  git init *> $null
  git branch -M main
}
git add -A
if (git status --porcelain) {
  git commit -m "chore: snapshot before push" *> $null
  Write-Host "    committed local changes"
} else {
  Write-Host "    nothing to commit"
}

Write-Host "[3/5] create or reuse repo ..."
$exists = gh repo view "$owner/$Repo" *> $null
if ($LASTEXITCODE -ne 0) {
  gh repo create $Repo --$Visibility --source . --remote origin --push *> $null
  if ($LASTEXITCODE -ne 0) { throw "gh repo create failed" }
  Write-Host "    created and pushed"
} else {
  $remote = git remote get-url origin 2>$null
  if (-not $remote) {
    git remote add origin "https://github.com/$owner/${Repo}.git"
  }
  git push -u origin main
  Write-Host "    pushed to existing repo"
}

Write-Host "[4/5] stamping repo urls into package.json ..."
$pkgPath = Join-Path $PSScriptRoot "package.json"
$pkg = Get-Content $pkgPath -Raw -Encoding utf8 | ConvertFrom-Json
$pkg.dsh.install.git = "https://github.com/$owner/${Repo}.git"
$pkg.dsh.install.tarball = "https://github.com/$owner/${Repo}/archive/refs/heads/main.tar.gz"
$pkg.dsh.install.zip = "https://github.com/$owner/${Repo}/archive/refs/heads/main.zip"
$pkg | ConvertTo-Json -Depth 12 | Set-Content $pkgPath -Encoding utf8 -NoNewline
git add package.json
git commit -m "chore: stamp repository urls" *> $null
git push *> $null
git tag -f v0.3.0 *> $null
git push -f origin v0.3.0 *> $null
Write-Host "    done"

$origin = "git@github.com:" + $owner + "/" + $Repo + ".git"
$https = "git+https://<THEIR_TOKEN>@github.com/" + $owner + "/" + $Repo + ".git"
$sshInstall = "git+ssh://" + $origin

Write-Host ""
Write-Host "[5/5] share these two commands:" -ForegroundColor Green
Write-Host ""
Write-Host "  # 1) verify the other machine can reach the repo"
Write-Host ("  git ls-remote " + $origin)
Write-Host ""
Write-Host "  # 2) install inside a dsh session, then restart dsh once"
Write-Host ("  plugin_manager install_bundle target=" + $sshInstall)
Write-Host ""
Write-Host "  # no SSH key on their side: use a token url instead (keep it out of docs)"
Write-Host ("  plugin_manager install_bundle target=" + $https)
Write-Host ""
Write-Host ("repo: https://github.com/" + $owner + "/" + $Repo) -ForegroundColor Green
