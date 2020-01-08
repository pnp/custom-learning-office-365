# Change Log

## Version 3.0.3

**If updating from version 2.x of the webpart please see the notes about [Version 3.0.0](#version_3_0_0)**

- Bug fix for issue [#174](../../../issues/174) - Link function doesn't work with custom content pack.

## Version 3.0.2

**If updating from version 2.x of the webpart please see the notes about [Version 3.0.0](#version_3_0_0)**

- Bug fix for issue [#161](../../../issues/161) - Content resizing for iFramed custom content showing scroll bars
- Bug fix for issue [#162](../../../issues/162) - HubNav menu showing in iFramed custom content
- Bug fix for issue [#163](../../../issues/163) - Updated breadcrumb navigation for consistent experience
- Updated tenant app property description in manual provisioning script.
- Added UpdateM365lpCDN.ps1 script to allow users to update to the most optimized CDN url for learning pathways *(this is optional unless you have having difficulty accessing the learning pathways content after the update to version 3.x.x)*

## Version 3.0.1

**If updating from version 2.x of the webpart please see the notes about [Version 3.0.0](#version_3_0_0)**

- Updated web part so that audience and level are no longer required.
- Hardened upgrade code from v2 to v3 so that failures will be more evident.

## Version 3.0.0

**This version is a major release that includes new features and updates to the underlying data structure. You should take appropriate caution when updating to this version of the web part by backing up your learning pathways master site content, specifically your custom subcategories, custom playlists, and custom assets. Please see [Backup Playlist Content](./webpart/BackupInstructions.md) for more detail instructions.**

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
