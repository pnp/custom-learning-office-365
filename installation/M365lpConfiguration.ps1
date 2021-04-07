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
  [String]$AccessToken,

  [Parameter(Mandatory = $false, ParameterSetName = "Credentials")]
  [Parameter(Mandatory = $false, ParameterSetName = "AppOnlyAADCertificate")]
  [Parameter(Mandatory = $false, ParameterSetName = "AppOnlyAADThumbprint")]
  [Parameter(Mandatory = $false, ParameterSetName = "ACSAppOnly")]
  [Parameter(Mandatory = $false, ParameterSetName = "DeviceLogin")]
  [Parameter(Mandatory = $false, ParameterSetName = "Interactive")]
  [Parameter(Mandatory = $false, ParameterSetName = "AccessToken")]
  [String]$SiteCollectionName,

  [Parameter(Mandatory = $false, ParameterSetName = "Credentials")]
  [Parameter(Mandatory = $false, ParameterSetName = "AppOnlyAADCertificate")]
  [Parameter(Mandatory = $false, ParameterSetName = "AppOnlyAADThumbprint")]
  [Parameter(Mandatory = $false, ParameterSetName = "ACSAppOnly")]
  [Parameter(Mandatory = $false, ParameterSetName = "DeviceLogin")]
  [Parameter(Mandatory = $false, ParameterSetName = "Interactive")]
  [Parameter(Mandatory = $false, ParameterSetName = "AccessToken")]
  [Switch]$AppCatalogAdminOnly,
  
  [Parameter(Mandatory = $false, ParameterSetName = "Credentials")]
  [Parameter(Mandatory = $false, ParameterSetName = "AppOnlyAADCertificate")]
  [Parameter(Mandatory = $false, ParameterSetName = "AppOnlyAADThumbprint")]
  [Parameter(Mandatory = $false, ParameterSetName = "ACSAppOnly")]
  [Parameter(Mandatory = $false, ParameterSetName = "DeviceLogin")]
  [Parameter(Mandatory = $false, ParameterSetName = "Interactive")]
  [Parameter(Mandatory = $false, ParameterSetName = "AccessToken")]
  [Switch]$SiteAdminOnly);

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

if ($AppCatalogAdminOnly -and $SiteAdminOnly) {
  Write-Host "Select either -AppCatalogAdminOnly or -SiteAdminOnly";
  Write-Host "If you want to run both tenant and site admin parts, don't pass either parameter";
  break;
}
$AppCatalogAdmin = $AppCatalogAdminOnly;
$SiteAdmin = $SiteAdminOnly;
if (!($AppCatalogAdminOnly) -and !($SiteAdminOnly)) {
  $AppCatalogAdmin = $true;
  $SiteAdmin = $true;
}

# Legal stuff for Telemetry
Write-Host "Microsoft collects active usage data from your organization’s use of Microsoft 365 learning pathways and the use of Microsoft’s online content. Microsoft will use this data to help improve the future Microsoft 365 learning pathways solutions. To learn more about Microsoft privacy policies see https://go.microsoft.com/fwlink/?LinkId=521839. If you would like to opt out of this data collection, please type Ctrl-C to stop this script and see Readme file (`"Disabling Telemetry Collection section`") for instructions on how to opt out.`n";
Read-Host "Press Enter to Continue";
$optInTelemetry = $true;

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
# Check if $SiteCollectionName was passed in
if ([string]::IsNullOrWhitespace($SiteCollectionName) ) {
  # No Site Collection was passed, prompt the user
  $SiteCollectionName = Read-Host "Please enter your site collection name: (Press Enter for `'MicrosoftTraining`') ";
  if ([string]::IsNullOrWhitespace($SiteCollectionName)) {
    $SiteCollectionName = "MicrosoftTraining";
  }
}
$clSite = ($taSite -replace '-admin.', '.') + "/sites/$SiteCollectionName";

# Connect to Admin site.
if ($AppCatalogAdmin) {  
  Connect-SPO -siteUrl $taSite -callback { 
    # Need an App Catalog site collection defined for Set-PnPStorageEntity to work
    if (!(Get-PnPTenantAppCatalogUrl)) {
      Write-Warning "Tenant $TenantNamePartial must have an App Catalog site defined";
      Write-Warning "Please visit https://social.technet.microsoft.com/wiki/contents/articles/36933.create-app-catalog-in-sharepoint-online.aspx to learn how, then run this setup script again";
      Write-Host "`n";
      Disconnect-PnPOnline;
      break;
    }
    $appcatalog = Get-PnPTenantAppCatalogUrl;
    Try {
      # Test that user can write values to the App Catalog
      Set-PnPStorageEntity `
        -Key MicrosoftCustomLearningCdn `
        -Value "https://pnp.github.io/custom-learning-office-365/learningpathways/" `
        -Description "Microsoft 365 learning pathways CDN source" `
        -ErrorAction Stop; 
    }
    Catch {
      # Get the username and write error. 
      $user = ((Get-PnPConnection).PSCredential).username; 
      Write-Warning "$user cannot write to App Catalog site";
      Write-Warning "Please make sure they are a Site Collection Admin for $appcatalog";
      Write-Warning $_;
    }
    Get-PnPStorageEntity -Key MicrosoftCustomLearningCdn;
    Set-PnPStorageEntity -Key MicrosoftCustomLearningSite -Value $clSite -Description "Microsoft 365 learning pathways Site Collection";
    Get-PnPStorageEntity -Key MicrosoftCustomLearningSite;
    Set-PnPStorageEntity -Key MicrosoftCustomLearningTelemetryOn -Value $optInTelemetry -Description "Microsoft 365 learning pathways Telemetry Setting";
    Get-PnPStorageEntity -Key MicrosoftCustomLearningTelemetryOn;
  
    if ($AppCatalogAdminOnly) {
      Write-Host "`nTenant is configured. Run this script with the -SiteAdminOnly parameter to configure the site collection";
    }

    # See if the site collection exists.
    if ($SiteAdmin) {
      $site = Get-PnPTenantSite $clSite -ErrorAction SilentlyContinue;
      if ($null -eq $site) {
        Write-Host "Site collection for Learning Pathways not found, creating...";
        New-PnPSite -Type CommunicationSite -Title "Microsoft 365 Learning Pathways" -Url $clSite -Wait;
      }
    }
  }
}

# Content stuff
if ($SiteAdmin) { 
  Connect-SPO -siteUrl $clSite -callback { 
    # Allow custom scripts.
    Set-PnPTenantSite -Identity $clSite -DenyAddAndCustomizePages:$false
    # Get the app
    # Check for it at the tenant level first
    $id = (Get-PnPApp | Where-Object -Property title -Like -Value "Microsoft 365 learning pathways").id; 
    if ($null -ne $id) { 
      # Found the app in the tenant app catalog
      # Install it to the site collection if it's not already there
      Install-PnPApp -Identity $id -ErrorAction SilentlyContinue;
    }
    else { 
      Write-Warning "Could not find `"Microsoft 365 learning pathways`" app. Please install in it your app catalog and run this script again.";
      break;
    }
    $sitePagesList = Get-PnPList -Identity "SitePages";
    if ($null -ne $sitePagesList) {    
      # Delete pages if they exist. Alert user.
      $clv = Get-PnPListItem -List $sitePagesList -Query "<View><Query><Where><Eq><FieldRef Name='FileLeafRef'/><Value Type='Text'>CustomLearningViewer.aspx</Value></Eq></Where></Query></View>";
      if ($null -ne $clv) {
        Write-Host "Found an existing CustomLearningViewer.aspx page. Deleting it.";
        # Renaming and moving to Recycle Bin to prevent potential naming overlap
        Set-PnPListItem -List $sitePagesList -Identity $clv.Id -Values @{"FileLeafRef" = "CustomLearningViewer$((Get-Date).Minute)$((Get-date).second).aspx" }
        Move-PnPListItemToRecycleBin -List $sitePagesList -Identity $clv.Id -Force;
      }
      # Now create the page whether it was there before or not
      $clvPage = Add-PnPPage -Name "CustomLearningViewer"; # Will fail if user can't write to site collection
      Add-PnPPageSection -Page $clvPage -SectionTemplate OneColumn -Order 1;
      # Before I try to add the Microsoft 365 learning pathways web parts verify they have been deployed to the site collection
      $timeout = New-TimeSpan -Minutes 1 # wait for a minute then time out
      $stopwatch = [diagnostics.stopwatch]::StartNew();
      Write-Host "." -NoNewline;
      $WebPartsFound = $false;
      while ($stopwatch.elapsed -lt $timeout) {
        if (Get-PnPPageComponent -ListAvailable -Page CustomLearningViewer.aspx | Where-Object { $_.Name -ieq "Microsoft 365 learning pathways administration" }) {
          Write-Host "Microsoft 365 learning pathways web parts found";
          $WebPartsFound = $true;
          break;
        }
        Write-Host "." -NoNewline;
        Start-Sleep -Seconds 10;
      }
      # loop either timed out or web parts were found. Let's see which it was
      if ($WebPartsFound -eq $false) {
        Write-Warning "Could not find Microsoft 365 learning pathways Web Parts.";
        Write-Warning "Please verify the Microsoft 365 learning pathways Package is installed and run this installation script again.";
        break; 
      }
      
      Add-PnPPageWebPart -Page $clvPage -Component "Microsoft 365 learning pathways";
      Set-PnPPage -Identity $clvPage -Publish;
      $clv = Get-PnPListItem -List $sitePagesList -Query "<View><Query><Where><Eq><FieldRef Name='FileLeafRef'/><Value Type='Text'>CustomLearningViewer.aspx</Value></Eq></Where></Query></View>";
      $clv["PageLayoutType"] = "SingleWebPartAppPage";
      $clv.Update();
      Invoke-PnPQuery # Done with the viewer page
      $cla = Get-PnPListItem -List $sitePagesList -Query "<View><Query><Where><Eq><FieldRef Name='FileLeafRef'/><Value Type='Text'>CustomLearningAdmin.aspx</Value></Eq></Where></Query></View>";
      if ($null -ne $cla) {
        Write-Host "Found an existing CustomLearningAdmin.aspx page. Deleting it.";
        # Renaming and moving to Recycle Bin to prevent potential naming overlap
        Set-PnPListItem -List $sitePagesList -Identity $cla.Id -Values @{"FileLeafRef" = "CustomLearningAdmin$((Get-Date).Minute)$((Get-date).second).aspx" }
        Move-PnPListItemToRecycleBin -List $sitePagesList -Identity $cla.Id -Force;
      }
      $claPage = Add-PnPPage "CustomLearningAdmin" -Publish;
      Add-PnPPageSection -Page $claPage -SectionTemplate OneColumn -Order 1;
      Add-PnPPageWebPart -Page $claPage -Component "Microsoft 365 learning pathways administration";
      Set-PnPPage -Identity $claPage -Publish;
      $cla = Get-PnPListItem -List $sitePagesList -Query "<View><Query><Where><Eq><FieldRef Name='FileLeafRef'/><Value Type='Text'>CustomLearningAdmin.aspx</Value></Eq></Where></Query></View>";
      $cla["PageLayoutType"] = "SingleWebPartAppPage";
      $cla.Update();
      Invoke-PnPQuery; # Done with the Admin page
    }
    else { 
      Write-Warning "Could not find `"Site Pages`" library. Please make sure you are running this on a Modern SharePoint site";
      break;
    }
  }
}
Write-Host "Microsoft 365 learning pathways Pages created at $clSite";

