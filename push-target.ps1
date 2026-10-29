# Push this plugin to a specific existing (or new) GitHub repo.
# Usage:  .\push-target.ps1
#         .\push-target.ps1 -Owner someone -Repo my-name
param(
  [string]$Owner = "xichaungzhu",
  [string]$Repo = "-"
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

gh auth status *> $null
if ($LASTEXITCODE -ne 0) { throw "not logged in: run gh auth login first" }

$full = "$Owner/$Repo"
Write-Host "[1/5] target repo: $full"

gh repo view $full *> $null
if ($LASTEXITCODE -ne 0) {
  Write-Host "    not visible to this account, trying to create ..."
  gh repo create $full --private --source . --remote origin --push 2>&1 | Select-Object -Last 2
  if ($LASTEXITCODE -ne 0) {
    throw "cannot create $full - GitHub may reject a repo name that is only '-'"
  }
} else {
  Write-Host "    repo found"
}

Write-Host "[2/5] wiring remote ..."
$url = "https://github.com/$full.git"
git remote remove origin 2>$null
git remote add origin $url
Write-Host "    $url"

Write-Host "[3/5] push main ..."
git add -A
if (git status --porcelain) { git commit -m "chore: snapshot before push" *> $null }
git push --force -u origin main 2>&1 | Select-Object -Last 3
if ($LASTEXITCODE -ne 0) { throw "git push failed (proxy? auth?)" }

Write-Host "[4/5] stamp urls into package.json ..."
$pkgPath = Join-Path $PSScriptRoot "package.json"
$pkg = Get-Content $pkgPath -Raw -Encoding utf8 | ConvertFrom-Json
$pkg.dsh.install.git = "https://github.com/$full.git"
$pkg.dsh.install.tarball = "https://github.com/$full/archive/refs/heads/main.tar.gz"
$pkg.dsh.install.zip = "https://github.com/$full/archive/refs/heads/main.zip"
$pkg | ConvertTo-Json -Depth 12 | Set-Content $pkgPath -Encoding utf8 -NoNewline
git add package.json
git commit -m "chore: stamp repository urls" *> $null
git push *> $null
git tag -f v0.3.0 *> $null
git push -f origin v0.3.0 *> $null

Write-Host "[5/5] done" -ForegroundColor Green
Write-Host ""
Write-Host ("  repo      : https://github.com/" + $full)
Write-Host ("  install   : plugin_manager install_bundle target=git+https://github.com/" + $full + ".git")
Write-Host ("  tarball   : plugin_manager install_bundle target=" + $pkg.dsh.install.tarball)
Write-Host ""
Write-Host "  restart dsh once after installing."
