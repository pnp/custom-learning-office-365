param([string]$TenantName)

# verify the PnP cmdlets we need are installed
if (Get-Command Get-PnPStoredCredentiaal -ErrorAction SilentlyContinue  ) {
  Write-Host "Could not find PnP PowerShell cmdlets"
  Write-Host "Please install them and run this script again"
  Write-Host "You can install them with the following line:"
  Write-Host "`nInstall-Module SharePointPnPPowerShellOnline`n"
  break
} 

$Credentials = Get-Credential

# Check if tenant name was passed in
if ([string]::IsNullOrWhitespace($TenantName)) {
  # No TenantName was passed, prompt the user
  $TenantName = Read-Host "Please enter your tenant name: (contoso) "
}
$AdminURL = "https://$TenantName-admin.sharepoint.com"

# Connect to Admin site.
# Todo: Differentiate between valid $adminurl and authentication error (bad password or no access)
try {
  Connect-PnPOnline -Url $AdminURL -Credentials $Credentials
}
catch {
  Write-Host "Failed to authenticate to $AdminURL"
  Write-Host $_
  break
}
    
Set-PnPStorageEntity -Key MicrosoftCustomLearningTelemetryOn -Value $false -Description "Custom Learning Telemetry Collection"
Get-PnPStorageEntity -Key MicrosoftCustomLearningTelemetryOn