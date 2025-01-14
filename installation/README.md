# Installing and configuring Microsoft 365 learning pathways

## Installation Options

There are two manual installation options for Microsoft 365 Learning Pathways.

### Minimal Install

This will install the webpart and set it up for use in your tenant. This will not create any pages other than the admin page and viewer page. Please follow the [Minimal Installation Overview](README.md#Minimal-Installation-Overview) for instructions.

### Site Template Installation (formerly via LookBook)

This method will install the Learning Pathways site template previously hosted from the LookBook. To install the site template please follow [these instructions](https://learn.microsoft.com/en-us/sharepoint/dev/solution-guidance/applying-pnp-templates). This tutorial will walk you through the process of creating a site collection, downloading and installing the site template. You will then need to run the M365lpConfiguration.ps1 in the [Execute PowerShell Configuration Script](https://github.com/pnp/custom-learning-office-365/tree/main/installation#execute-powershell-configuration-script) to set the tenant app property.

## Upgrade Instructions

If you are upgrading an existing Microsoft 365 Learning Pathways site please follow the instructions for your version. For V3-V4 upgrade instruction please follow [V3-V4 Upgrade](UpdateV3-V4.md). For V4 to V5 upgrade please follow the [V4 to V5 Upgrade instructions](./UpdateV4-V5.md).

## Minimal Installation Overview

The Microsoft 365 learning pathways solution is built using the [SharePoint Framework](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/npmsharepoint-framework-overview) version 1.19.0.

To manually install and configure the web part and site collection you will need to complete the following steps:

1. Validate that you have met all the prerequisites.
1. Install the `customlearning.sppkg` file in your Office 365 Tenant App Catalog.
1. Provision/Identify a modern communication site to act as your Microsoft 365 learning pathways home site.
1. Execute a PowerShell script that will configure your tenant with the appropriate artifacts that Microsoft 365 learning pathways depends on.
1. Navigate to the CustomLearningAdmin.aspx site page to load the admin web part to initialize the custom content configuration.

## Prerequisites

- You will need to be a SharePoint Administrator to be able to deploy this solution to the target tenant and have Site Collection
- You must have set up and configured the tenant-wide App Catalog. Please see [Set up your Office 365 tenant](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant#create-app-catalog-site) and follow the Create app catalog site section. If your tenant-wide App Catalog has already been provisioned you will need access to an account that has rights to upload a package to it to complete this setup process. Generally this is an account with the SharePoint administrator role. If an account with that role does not work, go to the SharePoint admin center and find the Site Collection Administrators for the app catalog site collection and either log in as one of the Site Collection Administrators, or add the SharePoint administrator account that failed to the Site Collection Administrators. You will also need access to an account that is a SharePoint Administrator.
- Provisioning with the PnP Lookbook template will provision all 10 langauges. If you need multilingual support ensure that your default language is set on the site collection BEFORE installing the Lookbook template. For more information on multilingual support see [Overview of multilingual support for learning pathways](https://docs.microsoft.com/en-us/office365/customlearning/custom_overview_ml).

## Install WebPart in Tenant App Catalog

To install the Microsoft 365 learning pathways solution you will upload the `customlearning.sppkg` file to the tenant-wide App Catalog and deploy it. Please see [Use the App Catalog to make custom business apps available for your SharePoint Online environment](https://docs.microsoft.com/en-us/sharepoint/use-app-catalog) for detailed instructions on how to add an app to the app catalog.

## Provision/Identify Modern Communication Site

Either identify and existing or provision a new modern communication site in your SharePoint Online tenant. For more information about how to provision a communication site see [Create a communication site in SharePoint Online](https://support.office.com/en-us/article/create-a-communication-site-in-sharepoint-online-7fb44b20-a72f-4d2c-9173-fc8f59ba50eb) and follow the Steps to create a communication site.

You will want to add everyone who should be able to view content to the Visitors group and everyone who should be able to administer custom playlists to the Members group. To configure the site for Microsoft 365 learning pathways the first time the user must be either a site collection administrator or part of the Owners group.

Add `Microsoft 365 learning pathways` App to the site collection.

## Execute PowerShell Configuration Script

A PowerShell script `M365lpConfiguration.ps1` is included that you will need to execute to create three [tenant properties](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/tenant-properties) that the solution uses. In addition, the script creates two [single part app pages](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/single-part-app-pages) in the site pages library to host the admin and user web parts at a known location.

Using the script looks like this:
`.\M365lpConfiguration.ps1 -TenantName contoso -SiteCollectionName MicrosoftTraining`

The line above requires that a Communications site exists at `https://contoso.sharepoint.com/sites/MicrosoftTraining`. Enter credentials for a user that both has the SharePoint Administrator role in your tenant and is a site collection owner of the site collection. The script will configure the App Catalog with values the solution needs and create two pages in the site collection CustomLearningViewer.aspx and CustomLearningAdmin.aspx and add the appropriate web parts to each. These pages are used to view and configure the Microsoft 365 learning pathways content. If either page already exists the script will delete the existing page and recreate them.

The script will work with both the legacy SharePointPnPPowerShellOnline (supported on PowerShell 5) and the current PnP.PowerShell (supported on PowerShell 7) modules, checking to see if PnP.PowerShell is installed as the default but if not, checking for SharePointPnPPowerShellOnline. This allows you to still use the scripts if you do not have access to permit an app registration to the tenant - if you are not sure what this is, the SharePointPnPPowerShellOnline will be a simpler route for you.

To successfully install Microsoft 365 learning pathways you must have an administrative role that allows you write entries to the tenant’s app catalog and you must also be a site collection admin for the site collection you are installing Microsoft 365 learning pathways to. That is not always the same user. To address this the script can run each of these parts separately allowing different users to do the part they have permission to do. First, the user with the administrative rights should run the following command:

`.\M365lpConfiguration.ps1 -TenantName contoso -SiteCollectionName M365LP -AppCatalogAdminOnly`

When prompted enter the credentials of a user with the SharePoint Administrator Role in your tenant. With the `-AppCatalogAdminOnly` switch the script will only write the configuration values to the tenant’s app catalog and then exit. After that has successfully run a site collection owner for the M365LP site collection should run this command:

`.\M365lpConfiguration.ps1 -TenantName contoso -SiteCollectionName M365LP – SiteAdminOnly`

When prompted enter the credentials of a Site Collection Owner of the M365LP Site Collection. The `–SiteAdminOnly` switch tells the configuration script not to try to do any tenant level configuration and jump right to the site collection setup.

After both parts of the script have successfully executed Microsoft 365 learning pathways will be installed and configured and ready for you to customize and use.

## API permissions

New in version 5 we have changed the way that we are providing functionality for uploading custom images for custom images. To that end we are using Microsoft Graph Files.ReadWrite.All permissions. After you install the solution you will need to go to the SharePoint Admin Center. Under Advanced select API Access. Select the pending request for File.ReadWrite.All and approve it. Note: You will need to be a global admin to approve this setting. Not approving this setting will not affect how Microsoft 365 Learning Pathways works except that you will not be able to add custom images for your playlists or assets.

## Configuring the Custom Analytics Webhook

If you would like to test the custom analytics webhook follow the [webhook configuration instructions](installation/ConfigureAnalyticsWebHook.md).

## Teams Installation

You can install Microsoft 365 Learning Pathways as both a Personal App AND as a Teams Tab.

### Personal App

To enable Microsoft 365 Learning Pathways as a Personal App enable the M365 Learning Pathways app as an app in the root site collection then add the app to Teams as a Personal App.

### Teams Tab

To enable Microsoft 365 Learning Pathways as a Teams Tab enable the M365 Learning Pathways app as an app in the site behind the Team. If you would like to enable it in all sites without having to enable the app in individual site collections you need to deploy the app in the app catalog using Tenant Wide Deployment.

### Disabling Telemetry Collection

Part of this solution includes anonymized telemetry tracking opt in, which by default is set to on. If you are performing a manual install and you would like to turn telemetry tracking off, please change the `M365lpConfiguration.ps1` script to set the $optInTelemetry variable to $false.

If you are not performing a manual install and would like to turn telemetry tracking off, a separate script `TelemetryOptOut.ps1` has been included that when run will disable telemetry tracking.

## Initialize web part custom configuration

After the PowerShell script is successfully run, please navigate to `<YOUR-SITE-COLLECTION-URL>/SitePages/CustomLearningAdmin.aspx`. Doing so will initialize the CustomConfig list item that sets up Microsoft 365 learning pathways for its first use.

The configuration is now complete and you can move forward with using Microsoft 365 learning pathways. Please see the user documentation for more information.
