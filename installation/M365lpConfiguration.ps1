param([PSCredential]$Credentials,
  [string]$TenantName,
  [string]$SiteCollectionName,
  [switch]$AppCatalogAdminOnly,
  [switch]$SiteAdminOnly)
 
if ($AppCatalogAdminOnly -and $SiteAdminOnly) {
  Write-Host "Select either -AppCatalogAdminOnly or -SiteAdminOnly"
  Write-Host "If you want to run both tenant and site admin parts, don't pass either parameter"
  break
}
$AppCatalogAdmin = $AppCatalogAdminOnly
$SiteAdmin = $SiteAdminOnly
if (!($AppCatalogAdminOnly) -and !($SiteAdminOnly)) {
  $AppCatalogAdmin = $true
  $SiteAdmin = $true
}
#region Legal stuff for Telemetry
Write-Host "Microsoft collects active usage data from your organization’s use of Microsoft 365 learning pathways and the use of Microsoft’s online content. Microsoft will use this data to help improve the future Microsoft 365 learning pathways solutions. To learn more about Microsoft privacy policies see https://go.microsoft.com/fwlink/?LinkId=521839. If you would like to opt out of this data collection, please type Ctrl-C to stop this script and see Readme file (`"Disabling Telemetry Collection section`") for instructions on how to opt out.`n"
Read-Host "Press Enter to Continue"
$optInTelemetry = $true
#endregion
# verify the PnP cmdlets we need are installed
if (-not (Get-Command Connect-PnPOnline -ErrorAction SilentlyContinue  )) {
  Write-Warning "Could not find PnP PowerShell cmdlets"
  Write-Warning "Please install them and run this script again"
  Write-Warning "You can install them with the following line:"
  Write-Warning "`nInstall-Module PnP.PowerShell`n"
  break
} 
# Check if tenant name was passed in
while ([string]::IsNullOrWhitespace($TenantName)) {
  # No TenantName was passed, prompt the user
  $TenantName = Read-Host "Please enter your tenant name: (contoso) " 
  $TenantName = $TenantName.Trim()
  $TestTenantURL = "https://$TenantName.sharepoint.com"
  # Test that it's a mostly valid URL
  # This doesn't catch everything
  if (!([system.uri]::IsWellFormedUriString($TestTenantURL, [System.UriKind]::Absolute))) {
    Write-Host "$TestTenantURL is not a valid URL."  -BackgroundColor Black -ForegroundColor Red
    Clear-Variable TenantName
  }
} 
# Check if $SiteCollectionName was passed in
if ([string]::IsNullOrWhitespace($SiteCollectionName) ) {
  # No Site Collection was passed, prompt the user
  $SiteCollectionName = Read-Host "Please enter your site collection name: (Press Enter for `'MicrosoftTraining`') "
  if ([string]::IsNullOrWhitespace($SiteCollectionName)) {
    $SiteCollectionName = "MicrosoftTraining"
  }
}
$clSite = "https://$TenantName.sharepoint.com/sites/$SiteCollectionName"
try {
  # If Credentials were passed, try them
  if (-not [string]::IsNullOrWhitespace($Credentials)) {
    Connect-PnPOnline -Url $clSite -Credentials $Credentials -ErrorAction Stop
  } else {
    # If not, prompt for authentication. This supports MFA
    Connect-PnPOnline -Url $clSite -UseWebLogin -ErrorAction Stop
  }
}
catch {
  Write-Host "Failed to authenticate to $clSite"
  Write-Host $_
  break
}
#region Connect to Admin site.
if ($AppCatalogAdmin) {   
  # Need an App Catalog site collection defined for Set-PnPStorageEntity to work
  if (!(Get-PnPTenantAppCatalogUrl)) {
    Write-Warning "Tenant $TenantName must have an App Catalog site defined" -BackgroundColor Black -ForegroundColor Red
    Write-Warning "Please visit https://social.technet.microsoft.com/wiki/contents/articles/36933.create-app-catalog-in-sharepoint-online.aspx to learn how, then run this setup script again"
    Write-Host "`n"
    Disconnect-PnPOnline
    break
  }
  $appcatalog = Get-PnPTenantAppCatalogUrl
    
  try {
    # Test that user can write values to the App Catalog
    Set-PnPStorageEntity -Key MicrosoftCustomLearningCdn -Value "https://pnp.github.io/custom-learning-office-365/learningpathways/" -Description "Microsoft 365 learning pathways CDN source" -ErrorAction Stop 
  }
  catch {
    # Get the username and 
    $user = ((Get-PnPConnection).PSCredential).username 
    Write-Warning "$user cannot write to App Catalog site" -BackgroundColor Black -ForegroundColor Red
    Write-Warning "Please make sure they are a Site Collection Admin for $appcatalog"
    Write-Warning $_
    Disconnect-PnPOnline
    break
  }
  Get-PnPStorageEntity -Key MicrosoftCustomLearningCdn
  Set-PnPStorageEntity -Key MicrosoftCustomLearningSite -Value $clSite -Description "Microsoft 365 learning pathways Site Collection"
  Get-PnPStorageEntity -Key MicrosoftCustomLearningSite
  Set-PnPStorageEntity -Key MicrosoftCustomLearningTelemetryOn -Value $optInTelemetry -Description "Microsoft 365 learning pathways Telemetry Setting"
  Get-PnPStorageEntity -Key MicrosoftCustomLearningTelemetryOn
  
  if ($AppCatalogAdminOnly) {
    Write-Host "`nTenant is configured. Run this script with the -SiteAdminOnly parameter to configure the site collection"
  }
}
#endregion
#region Content stuff
if ($SiteAdmin) { 
  # Get the app
  # Check for it at the tenant level first
  $id = (Get-PnPApp | Where-Object -Property title -Like -Value "Microsoft 365 learning pathways").id 
  if ($id -ne $null) { 
    # Found the app in the tenant app catalog
    # Install it to the site collection if it's not already there
    Install-PnPApp -Identity $id -ErrorAction SilentlyContinue 
  }
  else { 
    Write-Warning "Could not find `"Microsoft 365 learning pathways`" app. Please install in it your app catalog and run this script again."
    break
  }
  $sitePagesList = Get-PnPList -Identity "SitePages"
  if($sitePagesList -ne $null) {    
    # Delete pages if they exist. Alert user.
    $clv = Get-PnPListItem -List $sitePagesList -Query "<View><Query><Where><Eq><FieldRef Name='FileLeafRef'/><Value Type='Text'>CustomLearningViewer.aspx</Value></Eq></Where></Query></View>"
    if ($clv -ne $null) {
      Write-Host "Found an existing CustomLearningViewer.aspx page. Deleting it."
      # Renaming and moving to Recycle Bin to prevent potential naming overlap
      Set-PnPListItem -List $sitePagesList -Identity $clv.Id -Values @{"FileLeafRef" = "CustomLearningViewer$((Get-Date).Minute)$((Get-date).second).aspx" }
      Move-PnPListItemToRecycleBin -List $sitePagesList -Identity $clv.Id -Force
    }
    # Now create the page whether it was there before or not
    $clvPage = Add-PnPClientSidePage "CustomLearningViewer" # Will fail if user can't write to site collection
    $clvSection = Add-PnPClientSidePageSection -Page $clvPage -SectionTemplate OneColumn -Order 1
    # Before I try to add the Microsoft 365 learning pathways web parts verify they have been deployed to the site collection
    $timeout = New-TimeSpan -Minutes 1 # wait for a minute then time out
    $stopwatch = [diagnostics.stopwatch]::StartNew()
    Write-Host "." -NoNewline
    $WebPartsFound = $false
    while ($stopwatch.elapsed -lt $timeout) {
      if (Get-PnPAvailableClientSideComponents -page CustomLearningViewer.aspx -Component "Microsoft 365 learning pathways administration") {
        Write-Host "Microsoft 365 learning pathways web parts found"
        $WebPartsFound = $true
        break
      }
      Write-Host "." -NoNewline
      Start-Sleep -Seconds 10
    }
    # loop either timed out or web parts were found. Let's see which it was
    if ($WebPartsFound -eq $false) {
      Write-Warning "Could not find Microsoft 365 learning pathways Web Parts."
      Write-Warning "Please verify the Microsoft 365 learning pathways Package is installed and run this installation script again."
      break 
    }
      
    Add-PnPClientSideWebPart -Page $clvPage -Component "Microsoft 365 learning pathways"
    Set-PnPClientSidePage -Identity $clvPage -Publish
    $clv = Get-PnPListItem -List $sitePagesList -Query "<View><Query><Where><Eq><FieldRef Name='FileLeafRef'/><Value Type='Text'>CustomLearningViewer.aspx</Value></Eq></Where></Query></View>"
    $clv["PageLayoutType"] = "SingleWebPartAppPage"
    $clv.Update()
    Invoke-PnPQuery # Done with the viewer page
    $cla = Get-PnPListItem -List $sitePagesList -Query "<View><Query><Where><Eq><FieldRef Name='FileLeafRef'/><Value Type='Text'>CustomLearningAdmin.aspx</Value></Eq></Where></Query></View>"
    if ($cla -ne $null) {
      Write-Host "Found an existing CustomLearningAdmin.aspx page. Deleting it."
      # Renaming and moving to Recycle Bin to prevent potential naming overlap
      Set-PnPListItem -List $sitePagesList -Identity $cla.Id -Values @{"FileLeafRef" = "CustomLearningAdmin$((Get-Date).Minute)$((Get-date).second).aspx" }
      Move-PnPListItemToRecycleBin -List $sitePagesList -Identity $cla.Id -Force    
    }
    $claPage = Add-PnPClientSidePage "CustomLearningAdmin" -Publish
    $claSection = Add-PnPClientSidePageSection -Page $claPage -SectionTemplate OneColumn -Order 1
    Add-PnPClientSideWebPart -Page $claPage -Component "Microsoft 365 learning pathways administration"
    Set-PnPClientSidePage -Identity $claPage -Publish
    $cla = Get-PnPListItem -List $sitePagesList -Query "<View><Query><Where><Eq><FieldRef Name='FileLeafRef'/><Value Type='Text'>CustomLearningAdmin.aspx</Value></Eq></Where></Query></View>"
    $cla["PageLayoutType"] = "SingleWebPartAppPage"
    $cla.Update()
    Invoke-PnPQuery # Done with the Admin page
    
  }
  else { 
    Write-Warning "Could not find `"Site Pages`" library. Please make sure you are running this on a Modern SharePoint site"
    break
  }
}
Disconnect-PnPOnline # Disconnect from SharePoint Admin
Write-Host "Microsoft 365 learning pathways Pages created at $clSite"
#endregion
