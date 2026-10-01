param([switch]$NoBrowser)
$ErrorActionPreference = 'Stop'
$siteDirectory = $PSScriptRoot
$siteUrl = 'http://127.0.0.1:4173/'
$siteMutex = New-Object System.Threading.Mutex($false, 'Local\LIU_PersonalIceSiteLauncher')
$hasLock = $false
function Get-SiteReady {
    try {
        $response = Invoke-WebRequest -Uri $siteUrl -UseBasicParsing -TimeoutSec 2
        return $response.StatusCode -eq 200 -and $response.Content.Contains('window.__PERSONAL__=true')
    } catch { return $false }
}
try {
    $hasLock = $siteMutex.WaitOne(20000)
    if (-not $hasLock) { throw 'Website startup is already in progress. Please try again shortly.' }
    if (-not (Get-SiteReady)) {
        $nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
        if (-not $nodeCommand) { throw 'Node.js was not found. Install Node.js to start the website.' }
        $logDirectory = Join-Path $siteDirectory 'logs'
        New-Item -ItemType Directory -Force -Path $logDirectory | Out-Null
        $previousPort = $env:PORT
        try {
            $env:PORT = '4173'
            $siteProcess = Start-Process -FilePath $nodeCommand.Source -ArgumentList 'server.mjs' -WorkingDirectory $siteDirectory -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logDirectory 'server.log') -RedirectStandardError (Join-Path $logDirectory 'server-error.log') -PassThru
        } finally { $env:PORT = $previousPort }
        $ready = $false
        for ($attempt = 0; $attempt -lt 40; $attempt++) {
            if (Get-SiteReady) { $ready = $true; break }
            if ($siteProcess.HasExited) { break }
            Start-Sleep -Milliseconds 250
        }
        if (-not $ready) { throw 'The website could not start. Port 4173 may be occupied. See igloo-site\logs\server-error.log.' }
    }
    if (-not $NoBrowser) { Start-Process $siteUrl }
    Write-Output ('Website ready: ' + $siteUrl)
} catch {
    if ($NoBrowser) { throw }
    Add-Type -AssemblyName System.Windows.Forms
    [System.Windows.Forms.MessageBox]::Show($_.Exception.Message, 'Personal Website', 'OK', 'Error') | Out-Null
    exit 1
} finally {
    if ($hasLock) { $siteMutex.ReleaseMutex() }
    $siteMutex.Dispose()
}
