# Version 5.x.x Upgrade Notice
>
>The version 5.x.x version is a major update and includes major changes to the user interface and the technology under the covers. There is not change to the underlying data structure.
>
>**_PLEASE_** If you are upgrading from V3 to V5 review the content of [Adding Multilingual Support to Microsoft 365 learning pathways](AddingMultilingualSupport.md) document before proceeding.
>
>Although it has been tested thoroughly, as with any major update you should plan for the worst and back up your content first. There are many third party solutions that will assist you with this, if you do not have access to any then the simplest method is to back up your content using Microsoft Excel. Specifically all the items in the _CustomPlaylists_ and _CustomAssets_ lists plus the `CustomSubCategories` item in the _CustomConfig_ list. Please see [Backup Playlist Content](BackupInstructions.md) for more detail instructions. 

The current solution is provided in it's packaged form in the web part folder [customlearning.sppkg](customlearning.sppkg).

To validate the version of the web part installed in your tenant you must have access to the tenant-wide App Catalog. The custom learning solution will be installed there and you can verify the current version number against the **_version number noted above_** (not the version in the screen shot).

![Tenant App Catalog Screenshot](../images/TenantAppCatalog.png)

If you find that your package is out of date, you can download the latest version from this repository and then upload it into your tenant app catalog (you will need appropriate access to do this step).

To download the SPPKG file, navigate to the [customlearning.sppkg](https://github.com/pnp/custom-learning-office-365/blob/main/installation/customlearning.sppkg) file in the webpart folder of this repository. Select `Download` to save the file to your computer.

![Download SPPKG file screenshot](../images/DownloadSPPKG.png)

Upload this file into the app catalog by selecting upload, finding the file, and then selecting Deploy.

![Upload new sppkg file to tenant app catalog](../images/UploadPackage.png)

![Deploy package to tenant](../images/DeployM365LP.png)

If you've updated the package you will also want to update it in the custom learning site collection. Navigate to the site collection that is your custom learning main site, then site contents, and then click on the menu for `Microsoft 365 learning pathways` and select Details. (Previously called Custom Learning for Office 365)

![Site Collection App Version](../images/SiteCollectionAppVersion.png)

If your application needs to be updated in this site collection you will see that there is a new version and you can select the `Get It` link to update.

![Update App](../images/UpdateApp.png)

Finally, in your main custom learning site, navigate to the Site Pages library and to the `CustomLearningAdmin.aspx` page. Make sure this admin page load successfully without error. You may be prompted to complete a 'Data Upgrade' if you are updating to a new major version of the solution. Please run the update and assuming everything works as expected you would then close the update and the admin web part will load the content. If you have problems at this point, please open a new issue for assistance.

## V5 Update Note
During testing we received some reports that after an update the administration webpart doesn't load on the page. If this occurs, delete the sppkg file from the app catalog and then add it again. This resolves the issue.
