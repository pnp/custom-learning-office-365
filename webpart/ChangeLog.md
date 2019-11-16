# Change Log

## Version 3.0.1

**If updating from version 2.x of the webpart please see the notes about [Version 3.0.0](#version_3_0_0)**

- Updated web part so that audience and level are no longer required.
- Hardened upgrade code from v2 to v3 so that failures will be more evident.

## Version 3.0.0

**This version is a major release that includes new features and updates to the underlying data structure. You should take appropriate caution when updating to this version of the web part by backing up your learning pathways master site content, specifically your custom subcategories, custom playlists, and custom assets. Please see [Backup Playlist Content](./webpart/BackupInstructions.md) for more detail instructions.**

For more information about what features are released please refer to the following article: [Microsoft 365 learning pathways feature updates](https://docs.microsoft.com/en-us/office365/customlearning/custom_featureupdates).

## Version 2.0.17

- Fixed Bug #82 - typo
- Added version check based on manifest and current web part version installed, notification on admin web part of updates available.
- Added better error reporting on admin web part load.
- Added better error information on viewer web part load.

## Version 2.0.16

- Bug fix for issue #72. When a administrator modified a custom playlist and then refreshed the viewer web part on another page, some content would not be visible.

## Version 2.0.15

- Bug fix for issue #65. Users with custom assets or custom playlists over 100 were experiencing issues.
