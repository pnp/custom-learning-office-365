param([PSCredential]$Credentials,
[string]$TenantName,
[string]$SiteCollectionName)


#region Legal stuff for Telemetry

Write-Host "Microsoft collects active usage data from your organization’s use of Custom Learning for Office 365. Microsoft will use this data to help improve the future Custom Learning for Office 365 solutions. To learn more about Microsoft privacy policies see https://go.microsoft.com/fwlink/?LinkId=521839. If you would like to opt out of this data collection, please type Ctrl-C to stop this script and see Readme file (“Disabling Telemetry Collection” section) for instructions on how to opt out.`n"
Read-Host "Press Enter to Continue"

$optInTelemetry = $true
#endregion

# verify the PnP cmdlets we need are installed
if (!(Get-Command Connect-PnPOnline -ErrorAction SilentlyContinue  ))
    {
        Write-Host "Could not find PnP PowerShell cmdlets"
        Write-Host "Please install them and run this script again"
        Write-Host "You can install them with the following line:"
        Write-Host "`nInstall-Module SharePointPnPPowerShellOnline`n"
        break
    } 

# Now let's check if $Credentials is empty 
while ([string]::IsNullOrWhitespace($Credentials)) 
    {
        # Prompt the user
        $Credentials = Get-Credential -Message "Please enter SharePoint Online admin account"
    }

# Check if tenant name was passed in
while ([string]::IsNullOrWhitespace($TenantName)) 
    {
        # No TenantName was passed, prompt the user
        $TenantName = Read-Host "Please enter your tenant name: (contoso) "
        $TestAdminURL = "https://$TenantName-admin.sharepoint.com"
        # Test that it's a mostly valid URL
        # This doesn't catch everything
        if (!([system.uri]::IsWellFormedUriString($TestAdminURL,[System.UriKind]::Absolute)))
            {
                Write-Host "$TestAdminURL is not a valid URL."
                Clear-Variable TenantName
            }
    } 

$AdminURL = "https://$TenantName-admin.sharepoint.com"

# Check if $SiteCollectionName was passed in
if ([string]::IsNullOrWhitespace($SiteCollectionName) )
    {
        # No TenantName was passed, prompt the user
        $SiteCollectionName = Read-Host "Please enter your site collection name: (Press Enter for `'MicrosoftTraining`') "
        if ([string]::IsNullOrWhitespace($SiteCollectionName)) 
        {
            $SiteCollectionName = "MicrosoftTraining"
        }
    }
$clSite = "https://$TenantName.sharepoint.com/sites/$SiteCollectionName"

#region Connect to Admin site.
try {
	Connect-PnPOnline -Url $AdminURL -Credentials $Credentials
} catch {
	Write-Host "Failed to authenticate to $AdminURL"
	Write-Host $_
    break
}
    # Need an App Catalog site collection defined for Set-PnPStorageEntity to work
    if (!(Get-PnPTenantAppCatalogUrl))
    {
        Write-Host "Tenant $TenantName must have an App Catalog site defined"
        Write-Host "Please visit https://social.technet.microsoft.com/wiki/contents/articles/36933.create-app-catalog-in-sharepoint-online.aspx to learn how, then run this setup script again"
        Write-Host "`n"
        break

    }
    
    # try/catch	- Regular tenant users can auth to admin but can't write values
    Set-PnPStorageEntity -Key MicrosoftCustomLearningCdn -Value "https://sharepoint.github.io/sp-custom-learning/v2/" -Description "CDN source for Microsoft Content"
    Get-PnPStorageEntity -Key MicrosoftCustomLearningCdn
    Set-PnPStorageEntity -Key MicrosoftCustomLearningSite -Value $clSite -Description "Custom Learning Site Collection"
    Get-PnPStorageEntity -Key MicrosoftCustomLearningSite
    Set-PnPStorageEntity -Key MicrosoftCustomLearningTelemetryOn -Value $optInTelemetry -Description "Custom Learning Telemetry Collection"
    Get-PnPStorageEntity -Key MicrosoftCustomLearningTelemetryOn

#endregion

#region Content stuff

try {
	Connect-PnPOnline -Url $clSite -Credentials $Credentials -ErrorAction Stop
} catch {
	if ($_.exception.message -like "*(404) Not Found*") 
        {
            Write-Host "Failed to find to $clSite"
            $CreateIt = Read-Host "Would you like to create it? (y/n)"
        if ($CreateIt -ne "y")
            {
                Write-Host "Please create a Modern Communications site at $clsite and rerun this setup script"
                break
            } else {
                New-PnPSite -Type CommunicationSite -Title "Microsoft Learning" -Url $clSite
                Write-Host "Please wait for $clsite to be created, then rerun this setup script"
                break
                }
        } else {
               Write-Host $_.exception.message
               break
               }
        } # end catch

# Get the app
$id = (Get-PnPApp | Where-Object -Property title -Like -Value "Custom Learning for Office 365").id

# Install it to the site collection
Install-PnPApp -Identity $id


    $clv = Get-PnPListItem -List "Site Pages" -Query "<View><Query><Where><Eq><FieldRef Name='FileLeafRef'/><Value Type='Text'>CustomLearningViewer.aspx</Value></Eq></Where></Query></View>"
    if($clv -eq $null){
        $clvPage = Add-PnPClientSidePage "CustomLearningViewer"
        $clvSection = Add-PnPClientSidePageSection -Page $clvPage -SectionTemplate OneColumn -Order 1
        Add-PnPClientSideWebPart -Page $clvPage -Component "Custom Learning for Office 365"
        Set-PnPClientSidePage -Identity $clvPage -Publish
        $clv = Get-PnPListItem -List "Site Pages" -Query "<View><Query><Where><Eq><FieldRef Name='FileLeafRef'/><Value Type='Text'>CustomLearningViewer.aspx</Value></Eq></Where></Query></View>"
    }
    $clv["PageLayoutType"] = "SingleWebPartAppPage"
    $clv.Update()
    Invoke-PnPQuery
    
    $cla = Get-PnPListItem -List "Site Pages" -Query "<View><Query><Where><Eq><FieldRef Name='FileLeafRef'/><Value Type='Text'>CustomLearningAdmin.aspx</Value></Eq></Where></Query></View>"
    if($cla -eq $null){
        $claPage = Add-PnPClientSidePage "CustomLearningAdmin" -Publish
        $claSection = Add-PnPClientSidePageSection -Page $claPage -SectionTemplate OneColumn -Order 1
        Add-PnPClientSideWebPart -Page $claPage -Component "Custom Learning Admin for Office 365 Web Part"
        Set-PnPClientSidePage -Identity $claPage -Publish
        $cla = Get-PnPListItem -List "Site Pages" -Query "<View><Query><Where><Eq><FieldRef Name='FileLeafRef'/><Value Type='Text'>CustomLearningAdmin.aspx</Value></Eq></Where></Query></View>"
    }
    $cla["PageLayoutType"] = "SingleWebPartAppPage"
    $cla.Update()
    Invoke-PnPQuery
#endregion

