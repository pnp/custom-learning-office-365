param([string]$TenantName)

# verify the PnP cmdlets we need are installed
if (Get-Command Get-PnPStoredCredentiaal -ErrorAction SilentlyContinue  ) {
  Write-Host "Could not find PnP PowerShell cmdlets"
  Write-Host "Please install them and run this script again"
  Write-Host "You can install them with the following line:"
  Write-Host "`nInstall-Module SharePointPnPPowerShellOnline`n"
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
  Write-Host "Failed to authenticate to $AdminURL"
  Write-Host $_
  break
}
    
Set-PnPStorageEntity -Key MicrosoftCustomLearningTelemetryOn -Value $false -Description "Microsoft 365 learning pathways Telemetry Setting"
Get-PnPStorageEntity -Key MicrosoftCustomLearningTelemetryOn