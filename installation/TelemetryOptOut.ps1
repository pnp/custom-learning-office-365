param([string]$TenantName)

# verify the PnP cmdlets we need are installed
if (-not (Get-Command Connect-PnPOnline -ErrorAction SilentlyContinue )) {
  Write-Warning "Could not find PnP PowerShell cmdlets"
  Write-Warning "Please install them and run this script again"
  Write-Warning "You can install them with the following line:"
  Write-Warning "`nInstall-Module SharePointPnPPowerShellOnline`n"
  break
} 

# Check if tenant name was passed in
if ([string]::IsNullOrWhitespace($TenantName)) {
  # No TenantName was passed, prompt the user
  $TenantName = Read-Host "Please enter your tenant name: (contoso) "
}
$AdminURL = "https://$TenantName.sharepoint.com"

# Connect to Admin site.
# 2/6/20 Removed -Credential and replaced it with -UseWebLogin to support MFA. -tk
try {
  Connect-PnPOnline -Url $AdminURL -UseWebLogin
}
catch {
  Write-Warning "Failed to authenticate to $AdminURL"
  Write-Warning $_
  break
}
    
Set-PnPStorageEntity -Key MicrosoftCustomLearningTelemetryOn -Value $false -Description "Microsoft 365 learning pathways Telemetry Setting"
Get-PnPStorageEntity -Key MicrosoftCustomLearningTelemetryOn

Disconnect-PnPOnline
