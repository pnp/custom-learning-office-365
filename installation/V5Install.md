# Version 5 Installation

>Although it has been tested thoroughly, as with any major update you should plan for the worst and back up your content first. There are many third party solutions that will assist you with this, if you do not have access to any then the simplest method is to back up your content using Microsoft Excel. Specifically all the items in the _CustomPlaylists_ and _CustomAssets_ lists plus the `CustomSubCategories` item in the _CustomConfig_ list. Please see [Backup Playlist Content](BackupInstructions.md) for more detail instructions.

## If you already have Microsoft 365 learning pathways installed

- Download the latest [beta package](https://github.com/pnp/custom-learning-office-365/tree/main/installation/Beta/V5_0_0_Beta)
- In your app catalog replace the existing package with the beta package. You should see version 5.x.x in the app catalog
- Grant the Graph API access request. Note: This is used in the admin interface to add images to the local site collection
- Navigate to `<YOUR-SITE-COLLECTION-URL>/SitePages/CustomLearningAdmin.aspx` and ensure that the administration webpart loads
- Navigate to `<YOUR-SITE-COLLECTION-URL>/SitePages/CustomLearningViewer.aspx` and ensure that the webpart loads

## If you do not already have Microsoft 365 learning pathways installed

- Follow the [instructions](README.md) for installing the tool
- Instead of installing the V4 sppkg file install the latest [beta package](https://github.com/pnp/custom-learning-office-365/tree/main/installation/Beta/V5_0_0_Beta)
- Grant the Graph API access request. Note: This is used in the admin interface to add images to the local site collection
- Navigate to `<YOUR-SITE-COLLECTION-URL>/SitePages/CustomLearningAdmin.aspx` and ensure that the administration webpart loads
- Navigate to `<YOUR-SITE-COLLECTION-URL>/SitePages/CustomLearningViewer.aspx` and ensure that the webpart loads

## Beta Installation Notes

- We have received some reports that after an update the administration webpart doesn't load on the page. If this occurs, delete the sppkg file from the app catalog and then add it again. This resolves the issue.
