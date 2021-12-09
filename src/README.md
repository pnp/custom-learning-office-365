# Microsoft 365 learning pathways

## Summary

This solution contains two web parts that when used together provide a client side solution to surface the Microsoft 365 learning pathways content into your tenant. For more details on the solution overall please see the main [README](README.md).

## Used SharePoint Framework Version

![drop](https://img.shields.io/badge/drop-1.12.1-green.svg)

## Applies to

* [SharePoint Framework](https://docs.microsoft.com/sharepoint/dev/spfx/sharepoint-framework-overview)
* [Office 365 tenant](https://docs.microsoft.com/sharepoint/dev/spfx/set-up-your-development-environment)

## Prerequisites

### Required Permissions

The first installation in a tenant will require tenant admin permissions.

### Configuration

There are various settings that are required, please review the manual installation instructions located in the [installation folder](installation/README.md). A PowerShell script that creates the tenant app properties and two single app part pages with the web parts installed on them is located in [DeveloperSetup.ps1](./DeveloperSetup.ps1)

### Tooling

Node.js version 10.x is required to build this project.
[PnP PowerShell](https://docs.microsoft.com/powershell/sharepoint/sharepoint-pnp/sharepoint-pnp-cmdlets?view=sharepoint-ps) is required to run DeveloperSetup.ps1

## Known Issues

None at this time.

## Solution

Solution|Author(s)
--------|---------
Microsoft 365 learning pathways | Julie Turner (Sympraxis Consulting) - [@jfj1997](https://twitter.com/jfj1997) <br/> Stefan Bauer (N8D) - [@StfBauer](https://twitter.com/stfbauer)

## Version history

Please see [CHANGELOG](src/CHANGELOG.md) for details.

## Disclaimer

**THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## Minimal Path to Awesome

* Clone this repository
* Move to right solution folder
* Edit and Run PowerShell script to configure the necessary tenant app properties [DeveloperSetup.ps1](./DeveloperSetup.ps1).
* in the command line run:
  * `npm install`
  * `gulp serve`

<img src="https://telemetry.sharepointpnp.com/sp-dev-solutions/solutions/M365LP" />
