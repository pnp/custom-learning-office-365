# Microsoft 365 learning pathways

Train employees with Microsoft 365 learning pathways, a digital, customizable learning solution that helps customers transform their organization. Microsoft 365 learning pathways provides:

- Comprehensive end user training content: product and scenario-based training, in video and article format
- Easily customizable: Hide and show content to align with how you have set up Office 365 in your environment
- Create your own training playlists: Add your own custom training content and playlists to feature your organization-specific scenarios
- Always up-to-date content: As Office 365 changes, the Microsoft 365 learning pathways content will be updated. Content updates will be made and communicated to customers on a monthly basis

## Version 5 Release

Version 5 has been released with added accessibility and technology updates. Included in the V5 release we have added a custom analytics webhook. For [webhook configuration instructions](installation/ConfigureAnalyticsWebHook.md). For for new installations see the [Installation Instructions](./installation/README.md) for upgrade instructions on an existing Microsoft 365 Learning Pathways site follow the [V4 to V5 Upgrade instructions](./installation/UpdateV4-V5.md).

## Overview Video

A video was recorded during a PnP Monthly Community call and that video is available here: [Community Demo - Microsoft 365 Learning Pathways Architectural Overview](https://www.youtube.com/watch?v=-sLXl_rKGxQ). It may help you gain a better understanding of what Microsoft 365 learning pathways is and how to go about using it.

In addition there is a new recording showing an overview of the V4 multilingual release available here: [Microsoft 365 learning pathways v4 Feature Overview](https://youtu.be/xayqnUAcGXc)

## Current Release Version

Stable Version: ![drop](https://img.shields.io/badge/drop-5.0-green.svg)

## Prerequisites & Installation

For a list of prerequisites and installation instructions see [Overview of multilingual support for learning pathways](https://github.com/pnp/custom-learning-office-365/tree/main/installation)

>Note: if you are upgrading from V3 to V4 please review the [instructions](./installation/UpdateV3-V4.md) prior to doing the upgrade as these instructions will provide valuable instructions on enabling multilingual support.

### Teams Installation

If you would like to install the Microsoft 365 Learning Pathways in Microsoft Teams you can do so as both a Teams Personal App and as a Teams Tab. YOu can get instructions for [Teams Installation in the Installation ReadMe](./installation/README.md#teams-installation).  

## Author(s)

- Derek Cash-Peterson (Sympraxis Consulting) - [@spdcp](https://twitter.com/spdcp)
- Julie Turner (Sympraxis Consulting) - [@jfj1997](https://twitter.com/jfj1997)
- Stefan Bauer (N8D) - [@stfbauer](https://twitter.com/stfbauer)

## Disclaimer

THIS CODE IS PROVIDED AS IS WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.

## Change Log

For a list of issues/updates made in each release see the [CHANGELOG](CHANGELOG.md).

### SharePoint Framework Version

![drop](https://img.shields.io/badge/drop-1.19.0-green.svg)

The Microsoft Custom Learning Web Part is build using the [SharePoint Framework](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/sharepoint-framework-overview). To manually install and configure the web part and site collection you will need to complete the steps outlined in the [Manually installing and configuring Microsoft 365 learning pathways Instructions](./installation/README.md)

## Disabling telemetry collection

Microsoft collects active usage data from your organization’s use of Microsoft 365 learning pathways and the use of Microsoft’s online content. Microsoft will use this data to help improve the future Microsoft 365 learning pathways solutions. To learn more about Microsoft privacy policies see [https://go.microsoft.com/fwlink/?LinkId=521839](https://go.microsoft.com/fwlink/?LinkId=521839).

If you would like to opt out of this data collection, please follow these instructions:

1. Go to script `M365lpConfiguration.ps1`.
1. Change the `$optInTelemetry = $true` command line to `$false`.
1. Run the script with the change implemented.

If you are not performing a manual install and would like to turn telemetry tracking off, a separate script `TelemetryOptOut.ps1` has been included that when run will disable telemetry tracking.

## Changing the URL of your Microsoft 365 learning pathways site

If you need to rename the url of the main Microsoft 365 learning pathways site you can do so but it will also require you to run a PowerShell script to update the Tenant App property that controls what that site URL is for the web parts. After renaming the URL in the SharePoint Admin Center or via PowerShell additionally run teh following script to update the Tenant App property.
[UpdateM365lpSiteUrl.ps1](./installation/UpdateM365lpSiteUrl.ps1)

## Contributions

- At this time **NO** pull-requests will be accepted for the `docs` folder.
- Target your pull requests to the **dev** branch
- Keep your pull-requests as simple as possible and describe the changes to help the reviewer understand your work
- If you have an idea for a larger change to the library please [open an 'Enhancement Idea'](https://github.com/pnp/custom-learning-office-365/issues) and let's discuss before you invest many hours - these are very welcome but want to ensure it is something we can merge before you spend the time :)

## Getting Help

If you find you're having difficulty installing the solution, have found what you believe is a bug, or just have general questions please submit an issue in the repository. We try to monitor and respond to issues as fast as you can.

### Issue List Etiquette

- This repository is set up to handle three issue types, please choose the one that best represents your reason for submitting (Question, Bug, Enhancement) and then please attempt to fill in the issue template as best as you can. We have created them to help us help expedite a solution.
- Please **DO NOT** submit a response to a closed issue. If you have the same issue, or a related issue please start a new issue and reference the closed issue(s) by using the pound (#) sign and the issue number, e.g. Related to #1. If you respond to a closed issue you will either not get a response or you may eventually be asked to submit a new issue as we will prioritize open issues.

## Code of Conduct

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

### "Sharing is Caring"
