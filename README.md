# Custom Learning for Office 365

Train employees with Custom Learning for Office 365, a digital, customizable learning solution that helps customers transform their organization. Custom Learning for Office 365 provides:

- Comprehensive end user training content: product and scenario-based training, in video and article format
- Easy to install: Deploy from the [SharePoint Provisioning Service](https://provisioning.sharepointpnp.com) within minutes and without any coding
- Easily customizable: Hide and show content to align with how you have set up Office 365 in your environment
- Create your own training playlists: Add your own custom training content and playlists to feature your organization-specific scenarios
- Always up-to-date content: As Office 365 changes, the Custom Learning for Office 365 content will be updated. Content updates will be made and communicated to customers on a monthly basis

## Prerequisites

- You will need to be a tenant administrator to be able to deploy this solution to the target tenant.
Note that you can get free developer tenant from [Office 365 developer program](https://developer.microsoft.com/en-us/office/dev-program), if needed
- Automatic end-to-end provisioning only works with English tenants. All solutions and web parts are also English in the current implementation
- A tenant `App Catalog` must have been created within the `Apps` option of the SharePoint Admin Center. Please see [Set up your Office 365 tenant](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant#create-app-catalog-site) and follow the Create app catalog site section. If your tenant-wide App Catalog has already been provisioned, you will need access to an account that has rights to upload a package to it to complete this setup process. Generally, this is an account with the SharePoint administrator role. If an account with that role does not work, go to the SharePoint admin center and find the Site Collection Administrators for the app catalog site collection and either log in as one of the Site Collection Administrators, or add the SharePoint administrator account that failed to the Site Collection Administrators. You will also need access to an account that is a SharePoint Tenant Admin.

## Author(s)

Peter Krebs

## Disclaimer

THIS CODE IS PROVIDED AS IS WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.

## Manually installing and configuring Custom Learning for Office 365

The Microsoft Custom Learning Web Part is build using the [SharePoint Framework](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/sharepoint-framework-overview) version 1.7.1. To manually install and configure the web part and site collection you will need to complete the following steps:

1. Validate that you have met all the prerequisites.
1. Install the `customlearning.sppkg` file in your Office 365 Tenant App Catalog.
1. Provision/Identify a modern communication site to act as your Custom Learning for Office 365 home site.
1. Add the Custom Learning for Office 365 app to the site
1. Execute a PowerShell script that will configure your tenant with the appropriate artifacts that Custom Learning depends on.
1. Navigate to the CustomLearningAdmin.aspx site page to load the admin web part to initialize the custom content configuration.

### Install WebPart in Tenant App Catalog

To install the Custom Learning for Office 365 solution you will upload the `customlearning.sppkg` file to the tenant-wide App Catalog and deploy it. Please see [Use the App Catalog to make custom business apps available for your SharePoint Online environment](https://docs.microsoft.com/en-us/sharepoint/use-app-catalog) for detailed instructions on how to add an app to the app catalog.

### Provision/Identify Modern Communication Site

Either identify an existing, or provision a new, modern communication site in your SharePoint Online tenant. For more information about how to provision a communication site see [Create a communication site](https://support.office.com/en-us/article/create-a-communication-site-in-sharepoint-online-7fb44b20-a72f-4d2c-9173-fc8f59ba50eb) in SharePoint Online and follow the steps to create a communication site.

You will want to add everyone who should be able to view content to the Visitors group and everyone who should be able to administer custom playlists to the Members group. To configure the site for Custom Learning the first time the user must be either a site collection administrator or part of the Owners group.

### Add the Custom Learning for Office 365 app to the site

1. From the SharePoint site, click the System menu, then click **Add an App**.
2. Under **Your Apps**, click **From Your Organization**, and then click **Custom Learning for Office 365**.

### Execute PowerShell Configuration Script

A PowerShell script `CustomLearningConfiguration.ps1` is included that you will need to execute to create three [tenant properties](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/tenant-properties) that the solution uses. In addition the script creates two [single part app pages](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/single-part-app-pages) in the site pages library to host the admin and user web parts at a known location.

Using the script looks like this:
`.\CustomLearningConfiguration.ps1 -TenantName contoso -SiteCollectionName MicrosoftTraining`

The line above requires that a Communications site exists at `https://contoso.sharepoint.com/sites/MicrosoftTraining`. Enter credentials for a user that both has the SharePoint Administrator role in your tenant and is a site collection owner of the site collection. The script will configure the App Catalog with values the Custom Learning framework needs and create two pages in the site collection to view and configure the Custom Learning content. It will create two pages, CustomLearningViewer.aspx and CustomLearningAdmin.aspx and add the appropriate web parts to each. If either page already exists the script will delete the existing page and create the correct one.

To successfully install Custom Learning for Office 365 you must have an administrative role that allows you write entries to the tenant’s app catalog and you must also be a site collection admin for the site collection you are installing the Custom Learning into. That is not always the same user. To address this the script can run each of these parts separately allowing different users to do the part they have permission to do. First, the user with the administrative rights should run the following command:

`.\CustomLearningConfiguration.ps1 -TenantName contoso -SiteCollectionName CustomLearning -AppCatalogAdminOnly`

When prompted enter the credentials of a user with the SharePoint Administrator Role in your tenant. With the `-AppCatalogAdminOnly` switch the script will only write the configuration values to the tenant’s app catalog and then exit. After that has successfully run a site collection owner for the CustomLearning site collection should run this command:

`.\CustomLearningConfiguration.ps1 -TenantName contoso -SiteCollectionName CustomLearning – SiteAdminOnly`

When prompted enter the credentials of a Site Collection Owner of the CustomLearning Site Collection. The `–SiteAdminOnly` switch tells the configuration script not to try to do any tenant level configuration and jump right to the site collection setup.

After both parts of the script have successfully executed the Microsoft Custom Learning for Office 365 will be installed and configured and ready for you to customize and use.

### Initialize web part custom configuration

After the PowerShell script is successfully run, please navigate to `<YOUR-SITE-COLLECTION-URL>/SitePages/CustomLearningAdmin.aspx`. Doing so will initialize the CustomConfig list item that sets up custom learning for its first use.

The configuration is now complete. You can move forward with using Custom Learning for Office 365. Please see the user documentation for more information.

## Disabling telemetry collection

Microsoft collects active usage data from your organization’s use of Custom Learning for Office 365. Microsoft will use this data to help improve the future Custom Learning for Office 365 solutions. To learn more about Microsoft privacy policies see [https://go.microsoft.com/fwlink/?LinkId=521839](https://go.microsoft.com/fwlink/?LinkId=521839).

If you would like to opt out of this data collection, please follow these instructions:

1. Go to script `CustomLearningConfiguration.ps1`.
1. Change the `$optInTelemetry = $true` command line to `$false`.
1. Run the script with the change implemented.

If you are not performing a manual install and would like to turn telemetry tracking off, a separate script `TelemetryOptOut.ps1` has been included that when run will disable telemetry tracking.

## Contributions

User contributions to Custom Learning for Office 365 are currently not being accepted.  
