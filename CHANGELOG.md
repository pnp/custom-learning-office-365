# Change Log

## Version 4.3.1

- Added fix for display issue when expanded to full screen. See Issue [#606](../../../issues/606)

## Version 4.3

- Added support for longer descriptions in playlists.
- Fixed bug with changing themes requiring a page refresh.
- Optimized image rendering to support 16:9 aspect ratio
- Update web part to SPFx 1.12.1

## Content Update 2021/May

Please see details of content update in the following location: [Microsoft 365 Learning Pathways Content Updates](https://docs.microsoft.com/en-us/office365/customlearning/custom_contentupdates)

## Version 4.2

- Added support for SharePoint section background colors. Because this update requires a change to the web part manifest, after the solution is deployed into the tenant app catalog, any existing web parts will need to be removed and added again to take advantage of the theme backgrounds. This is an optional step and only required if you need support for section background colors.
- Updated console logging to add visual indicator (graduation cap icon) to all log entires made by Microsoft 365 Learning Pathways to help clarify issues for support.

## Version 4.1.3

**If updating from version 2.x/3/x of the web part please see the notes about [Version 4.0.0](#version_4_0_0)**

- Bug fix for [#325](../../../issues/325) - Navigation Bar for End Users and Admin not applying site Theme Colors.

## Version 4.1.2

**If updating from version 2.x/3/x of the web part please see the notes about [Version 4.0.0](#version_4_0_0)**

- Bug fix for [#320](../../../issues/320) - default site language not in configuredLanguages which caused the inability to create custom sub categories and playlists.

## Version 4.1.1

**If updating from version 2.x/3/x of the web part please see the notes about [Version 4.0.0](#version_4_0_0)**

- Bug fix for admin center not notifying of updated version of web part.

## Version 4.1.0

**If updating from version 2.x/3/x of the web part please see the notes about [Version 4.0.0](#version_4_0_0)**

- Enhancement that adds custom sort capability to a filtered custom learning web part instance. For more details see: [Sort subcategories and playlists](https://docs.microsoft.com/en-us/office365/customlearning/custom_sortsubplay).

## Version 4.0.2

**If updating from version 2.x/3/x of the web part please see the notes about [Version 4.0.0](#version_4_0_0)**

- Bug fix for issue [#300](../../../issues/300) - IE11 rendering bug.

## Version 4.0.1

**If updating from version 2.x/3/x of the web part please see the notes about [Version 4.0.0](#version_4_0_0)**

- Bug fix for issue [#298](../../../issues/298) - Issue for site's default language being unsupported by multilingual version and not falling back to English (en-us) to match version 3 experience.

## Version 4.0.0

**This version is a major release that includes new features and updates to the underlying data structure. It will support updating from either the version 2.x or 3.x of the learning pathways solution. You should take appropriate caution when updating to this version of the web part by backing up your learning pathways master site content, specifically your custom subcategories, custom playlists, and custom assets. Please see [Backup Playlist Content](./installation/BackupInstructions.md) for more detail instructions.**

Before updating **please** review the [Adding Multilingual Support](./AddingMultilingualSupport.md) document to completely familiarize yourself with the different options. Taking a few minutes to review the 3 scenarios could save significant problems with your update process.

For more information about what features are released please refer to the following article: [Overview of multilingual support for learning pathways](https://docs.microsoft.com/en-us/office365/customlearning/custom_overview_ml).

- Added support for multiple languages, enabled if OOB Multilingual Pages feature is enabled in the Microsoft 365 learning pathways site collection.
- Added support for customizing the subcategory image using an image selector UX.
- Added support for customizing the playlist image using an image selector UX.

## Version 3.0.4

**If updating from version 2.x of the web part please see the notes about [Version 3.0.0](#version_3_0_0)**

- Bug fix for issue [#165](../../../issues/165) - Corrected asset URL for 'Create and share files in a library'.
- Bug fix for issue [#192](../../../issues/195) - Duplicate of 165.
- Bug fix for issue [#204](../../../issues/204) - Corrected asset URL for 'Import a Word outline into PowerPoint'.
- Enhancement: No longer display successful save messages that shift the UI when editing custom playlists.

## Version 3.0.3

**If updating from version 2.x of the web part please see the notes about [Version 3.0.0](#version_3_0_0)**

- Bug fix for issue [#174](../../../issues/174) - Link function doesn't work with custom content pack.

## Version 3.0.2

**If updating from version 2.x of the web part please see the notes about [Version 3.0.0](#version_3_0_0)**

- Bug fix for issue [#161](../../../issues/161) - Content resizing for iFramed custom content showing scroll bars
- Bug fix for issue [#162](../../../issues/162) - HubNav menu showing in iFramed custom content
- Bug fix for issue [#163](../../../issues/163) - Updated breadcrumb navigation for consistent experience
- Updated tenant app property description in manual provisioning script.
- Added UpdateM365lpCDN.ps1 script to allow users to update to the most optimized CDN url for learning pathways *(this is optional unless you have having difficulty accessing the learning pathways content after the update to version 3.x.x)*

## Version 3.0.1

**If updating from version 2.x of the web part please see the notes about [Version 3.0.0](#version_3_0_0)**

- Updated web part so that audience and level are no longer required.
- Hardened upgrade code from v2 to v3 so that failures will be more evident.

## Version 3.0.0

**This version is a major release that includes new features and updates to the underlying data structure. You should take appropriate caution when updating to this version of the web part by backing up your learning pathways master site content, specifically your custom subcategories, custom playlists, and custom assets. Please see [Backup Playlist Content](./installation/BackupInstructions.md) for more detail instructions.**

For more information about what features are released please refer to the following article: [Microsoft 365 learning pathways feature updates](https://docs.microsoft.com/en-us/office365/customlearning/custom_featureupdates).

## Version 2.0.17

- Fixed Bug [#82](../../../issues/82) - typo
- Added version check based on manifest and current web part version installed, notification on admin web part of updates available.
- Added better error reporting on admin web part load.
- Added better error information on viewer web part load.

## Version 2.0.16

- Bug fix for issue [#72](../../../issues/72). When a administrator modified a custom playlist and then refreshed the viewer web part on another page, some content would not be visible.

## Version 2.0.15

- Bug fix for issue [#65](../../../issues/65). Users with custom assets or custom playlists over 100 were experiencing issues.
