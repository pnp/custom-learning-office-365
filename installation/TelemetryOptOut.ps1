<#
  This script uses the latest PnP.PowerShell (1.5.4 at the time of commit).
  This newer version of PowerShell requires registration of an Azure App Registration,
  either running Register-PnPAzureADApp or creating your own registration via 
  the Azure Active Directory portal.

  The following instructions are to install PnP.PowerShell, on Windows, and then register with AAD, 
  using the Register-PnPAzureADApp Cmdlet:

  1. Ensure you have the latest PowerShellGet package provider:
      Get-PackageProvider -Name PowerShellGet -ListAvailable​

  2. If you do not see PowerShellGet with at least 2.2.5, run the following:
      Install-PackageProvider -Name Nuget -Scope AllUsers -Force
      Install-PackageProvider -Name PowerShellGet -MinimumVersion 2.2.5.0 -Scope AllUsers -Force​

  3. Install the latest PnP.PowwrShell (nightly) with the following:
      Install-Module -Name PnP.PowerShell -AllowPrerelease -SkipPublisherCheck -Scope AllUsers -Force​

  4. Confirm the lastest version of PnP.PowerShell is installed with:
      Get-Module -Name PnP.PowerShell -ListAvailable​

  5. Close and reopen a new instance of PowerShell, then run:
      Import-Module PnP.PowerShell

  6. Run the Register-PnPAzureADApp cmdlet with the appropriate arguments, e.g:

      Commercial Tenant: 
        Register-PnPAzureADApp `
          -Interactive `
          -ApplicationName "PnP.PowerShell" `
          -Tenant "mytenant.onmicrosoft.com" `
          -AzureEnvironment Production `
          -SharePointDelegatePermissions AllSites.FullControl `
          -SharePointApplicationPermissions Sites.FullControl.All `
          -GraphApplicationPermissions Group.ReadWrite.All `
          -GraphDelegatePermissions Group.ReadWrite.All

  7. Make a note of the provide credentials and consent to the allow the permissions.

  8. Make a note of the returned Client Id, to pass as a parameter to this script.
#>

[CmdletBinding()]Param(
  [Parameter(Mandatory = $false, ParameterSetName = "Credentials")]
  [PSCredential]$Credentials,

  [Parameter(Mandatory = $false, ParameterSetName = "Credentials")]
  [Switch]$CurrentCredentials,

  [Parameter(Mandatory = $false, ParameterSetName = "ACSAppOnly")]
  [String]$Realm,

  [Parameter(Mandatory = $false, ParameterSetName = "ACSAppOnly")]
  [String]$ClientSecret,

  [Parameter(Mandatory = $true, ParameterSetName = "SPOManagement")]
  [Switch]$SPOManagementShell,

  [Parameter(Mandatory = $true, ParameterSetName = "DeviceLogin")]
  [Switch]$DeviceLogin,

  [Parameter(Mandatory = $false, ParameterSetName = "DeviceLogin")]
  [Parameter(Mandatory = $false, ParameterSetName = "Interative")]
  [Switch]$LaunchBrowser,

  [Parameter(Mandatory = $false, ParameterSetName = "Credentials")]
  [Parameter(Mandatory = $true, ParameterSetName = "AppOnlyAADCertificate")]
  [Parameter(Mandatory = $true, ParameterSetName = "AppOnlyAADThumbprint")]
  [Parameter(Mandatory = $true, ParameterSetName = "ACSAppOnly")]
  [Parameter(Mandatory = $false, ParameterSetName = "Interactive")]
  [Parameter(Mandatory = $false, ParameterSetName = "DeviceLogin")]
  [String]$ClientId,

  [Parameter(Mandatory = $false, ParameterSetName = "Credentials")]
  [String]$RedirectUri,

  [Parameter(Mandatory = $true, ParameterSetName = "AppOnlyAADCertificate")]
  [Parameter(Mandatory = $true, ParameterSetName = "AppOnlyAADThumbprint")]
  [Parameter(Mandatory = $false, ParameterSetName = "Interactive")]
  [String]$TenantName,
 
  [Parameter(Mandatory = $false, ParameterSetName = "AppOnlyAADCertificate")]
  [String]$CertificatePath,

  [Parameter(Mandatory = $false, ParameterSetName = "AppOnlyAADCertificate")]
  [SecureString]$CertificatePassword,

  [Parameter(Mandatory = $true, ParameterSetName = "AppOnlyAADThumbprint")]
  [String]$Thumbprint,

  [Parameter(Mandatory = $false, ParameterSetName = "Credentials")]
  [Parameter(Mandatory = $false, ParameterSetName = "AppOnlyAADCertificate")]
  [Parameter(Mandatory = $false, ParameterSetName = "AppOnlyAADThumbprint")]
  [Parameter(Mandatory = $false, ParameterSetName = "ACSAppOnly")]
  [Parameter(Mandatory = $false, ParameterSetName = "DeviceLogin")]
  [Parameter(Mandatory = $false, ParameterSetName = "Interactive")]
  [Parameter(Mandatory = $false, ParameterSetName = "AccessToken")]
  [ValidateSet("Production", "China", "Germany", "USGovernment", "USGovernmentHigh", "USGovernmentDoD")]
  [String]$AzureEnvironment = "Production",

  [Parameter(Mandatory = $true, ParameterSetName = "Interactive")]
  [Switch]$Interactive,

  [Parameter(Mandatory = $true, ParameterSetName = "AccessToken")]
  [String]$AccessToken);

$script:ParamSetName = $PSCmdLet.ParameterSetName.ToUpper();

Function Connect-SPO {
  Param(
    [Parameter(Mandatory = $true)][string]$siteUrl,
    [Parameter(Mandatory = $true)][scriptblock]$callback);
  Try {
    $connected = $false;
    Switch ($script:ParamSetName) {
      "CREDENTIALS" { 
        if ($null -ne $Credentials) {
          Connect-PnPOnline `
            -Credentials $Credentials `
            -RedirectUri $RedirectUri `
            -Url $siteUrl `
            -AzureEnvironment $AzureEnvironment `
            -ErrorAction Stop; 
        }
        else {
          Connect-PnPOnline `
            -CurrentCredentials `
            -Url $siteUrl `
            -AzureEnvironment $AzureEnvironment `
            -ErrorAction Stop;
        }
      }
      "APPONLYAADCERTIFICATE" { 
        Connect-PnPOnline `
          -ClientId $ClientId `
          -CertificatePath $CertificatePath `
          -CertificatePassword $CertificatePassword `
          -Tenant $TenantNameFull `
          -Url $siteUrl `
          -AzureEnvironment $AzureEnvironment `
          -ErrorAction Stop; 
      }
      "APPONLYAADTHUMBPRINT" {
        Connect-PnPOnline `
          -ClientId $ClientId `
          -Thumbprint $Thumbprint `
          -Tenant $TenantNameFull `
          -Url $siteUrl `
          -AzureEnvironment $AzureEnvironment `
          -ErrorAction Stop;
      }
      "ACSAPPONLY" {
        Connect-PnPOnline `
          -ClientId $ClientId `
          -Realm $Realm `
          -ClientSecret $ClientSecret `
          -Url $siteUrl `
          -AzureEnvironment $AzureEnvironment `
          -ErrorAction Stop;
      }
      "DEVICELOGIN" {
        Connect-PnPOnline `
          -ClientId $ClientId `
          -DeviceLogin:$DeviceLogin `
          -LaunchBrowser:$LaunchBrowser `
          -ClientId $ClientId `
          -Url $siteUrl `
          -AzureEnvironment $AzureEnvironment `
          -ErrorAction Stop;
      }
      "INTERACTIVE" {
        Connect-PnPOnline `
          -ClientId $ClientId `
          -Interactive:$Interactive `
          -LaunchBrowser:$LaunchBrowser `
          -Url $siteUrl `
          -AzureEnvironment $AzureEnvironment `
          -Tenant $TenantNameFull `
          -ErrorAction Stop;
      }
      "ACCESSTOKEN" {
        Connect-PnPOnline `
          -ClientId $ClientId `
          -AccessToken $AccessToken `
          -Url $siteUrl `
          -AzureEnvironment $AzureEnvironment `
          -ErrorAction Stop;
      }
      "SPOMANAGEMENT" {
        Connect-PnPOnline `
          -Url $siteUrl `
          -SPOManagementShell `
          -ErrorAction Stop;
      }
    }
    $connected = $true;
    &$callback;
  }
  Catch {
    Write-Host "Failed to authenticate to $siteUrl";
    Write-Host $_;
    break;
  }
  Finally {
    if ($connected) { Disconnect-PnPOnline; }
    $connected = $false;
  }
}

Function Get-TenantURL {
  # Check if tenant name was passed in
  while ([string]::IsNullOrWhitespace($TenantName)) {
    # No TenantName was passed, prompt the user
    $TenantName = Read-Host "Please enter your tenant name: (contoso) "; 
    $TenantName = $TenantName.Trim();
  }
  if ($TenantName -imatch "(.+)\.onmicrosoft\..+") {
    $script:TenantNamePartial = $Matches[1];
    $script:TenantNameFull = $TenantName;
  }
  else {
    $script:TenantNamePartial = $TenantName;
    $script:TenantNameFull = "$TenantName.onmicrosoft.com";
  }
  # Construct the URL from the environment.
  Switch ($AzureEnvironment) {
    "Production" { $TenantURL = "https://$($script:TenantNamePartial)-admin.sharepoint.com"; }
    "China" { $TenantURL = "https://$($script:TenantNamePartial)-admin.sharepoint.cn"; }
    "Germany" { $TenantURL = "https://$($script:TenantNamePartial)-admin.sharepoint.de"; }
    "USGovernment" { $TenantURL = "https://$($script:TenantNamePartial)-admin.sharepoint.com"; }
    "USGovernmentHigh" { $TenantURL = "https://$($script:TenantNamePartial)-admin.sharepoint.us"; }
    "USGovernmentDoD" { $TenantURL = "https://$($script:TenantNamePartial)-admin.sharepoint-mil.us"; }
  }
  # Test that it's a mostly valid URL
  # This doesn't catch everything
  if (!([system.uri]::IsWellFormedUriString($TenantURL, [System.UriKind]::Absolute))) {
    Write-Host "$TenantURL is not a valid URL." -BackgroundColor Black -ForegroundColor Red;
    Clear-Variable TenantNameFull -Scope Script;
    Clear-Variable TenantNamePartial -Scope Script;
    return $null;
  }
  return $TenantURL;
}
 
################# Do the work #################

# Verify the PnP cmdlets we need are installed
if (-not (Get-Command Connect-PnPOnline -ErrorAction SilentlyContinue  )) {
  Write-Warning "Could not find PnP PowerShell cmdlets";
  Write-Warning "Please install them and run this script again";
  Write-Warning "You can install them with the following line:";
  Write-Warning "`nInstall-Module PnP.PowerShell`n";
  break;
} 

# Get the tenant Url.
$taSite = Get-TenantURL;
# Connect to Admin site.
Connect-SPO -siteUrl $taSite -callback {
  Set-PnPStorageEntity -Key MicrosoftCustomLearningTelemetryOn -Value $false -Description "Microsoft 365 learning pathways Telemetry Setting";
  Get-PnPStorageEntity -Key MicrosoftCustomLearningTelemetryOn;  
}
