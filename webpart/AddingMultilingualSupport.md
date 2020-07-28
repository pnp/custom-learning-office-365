# Adding Multilingual Support to Microsoft 365 learning pathways

With the release of the [Multilingual Pages for SharePoint Online](https://support.office.com/article/2bb7d610-5453-41c6-a0e8-6f40b3ed750c), we releasing version 4.x of the Microsoft 365 learning pathways solution. As part of this version, we have added support for multiple languages, to learn more see [Overview of multilingual support for learning pathways](https://docs.microsoft.com/en-us/office365/customlearning/custom_overview_ml). Depending on the needs of your organization we have outlined below 3 possible scenarios for upgrading to this new release.

## Scenario 1: We do not need multilingual support

Good news, version 4 will work just fine for you if you do not enable the multilingual pages feature in your site collection. By upgrading you get a couple of updates that might be useful to you like an image selector UI for choosing the image for a custom playlist and the addition of a UI for changing the default image to a custom sub category. In addition some other small fixes have been made to the viewer web part. Check out the upgrade instructions outlined in the [Updating the Solution](../README.md#Updating-the-solution).

## Scenario 2: We need multilingual support and the default language of the site collection is our default language

Good news, version 4.x will support you enabling the multilingual pages feature in your site collection! For the best experience follow these steps for upgrading the solution.

1. Navigate to your Microsoft 365 learning pathways main site collection, this is the one with the CustomLearningAdmin.aspx page in the site pages library.

1. Enable multilingual publishing feature in your existing Microsoft 365 learning pathways site. See the following instructions for more details [Create multilingual communication sites, pages, and news](https://support.office.com/en-us/article/create-multilingual-communication-sites-pages-and-news-2bb7d610-5453-41c6-a0e8-6f40b3ed750c). You only need to enable the languages you want to support. Please be careful **NOT** to enable languages that the the solution is not supporting. If you do your users will end up with a partial experience where the menus and Microsoft provided content will be displayed in the default language and your custom content will be shown in the unsupported language assuming the user has that language selected as their default. A full list of languages supported by learning pathways can be found at [Overview of multilingual support for learning pathways](https://docs.microsoft.com/en-us/office365/customlearning/custom_overview_ml).

1. Follow the instructions for [Updating the Solution](../README.md#Updating-the-solution) which will install version 4.x.x of Microsoft 365 learning pathways solution.

1. Navigate to the `CustomLearningAdmin.aspx` page in the site pages library of your Microsoft 365 learning pathways site collection which will initiate the upgrade process. Version 4.x includes a new upgrade experience that will log every upgrade step that is being processed. The upgrade process can be run again at any time by adding `?forceUpdate=v3` to the end of the admin page url. The `v3` value indicates what version of learning pathways you're upgrading from. For example:
   > `https://contoso.sharepoint.com/sites/M365LP/SitePages/CustomLearningAdmin.aspx?forceUpdate=v3`

## Scenario 3: We need multilingual support and the default language of the site collection is **NOT** our default language

So for you, there is good news and bad news. The good news is that version 4 will support your scenario, the bad news is that you cannot change the default language of a site collection AFTER it's been created. If you have no custom content, your path forward is fairly simple, so we'll start there.

### Creating a new Microsoft 365 learning pathways site - No custom content

1. Create a new site collection, making sure to choose the default language for your site collection based on the default language for your learning content (referred to as /NewLP).

1. Enable multilingual publishing feature in your /NewLP site. See the following instructions for more details [Create multilingual communication sites, pages, and news](https://support.office.com/en-us/article/create-multilingual-communication-sites-pages-and-news-2bb7d610-5453-41c6-a0e8-6f40b3ed750c). You only need to enable the languages you want to support. Please be careful **NOT** to enable languages that the the solution is not supporting. If you do your users will end up with a partial experience where the menus and Microsoft provided content will be displayed in the default language and your custom content will be shown in the unsupported language assuming the user has that language selected as their default. A full list of languages supported by learning pathways can be found at [Overview of multilingual support for learning pathways](https://docs.microsoft.com/en-us/office365/customlearning/custom_overview_ml).

1. Install the new customlearning.sppkg file following the upgrade instructions outlined in the [Updating the Solution](../README.md#Updating-the-solution).

1. Run the [M365lpConfiguration.ps1](./M365lpConfiguration.ps1) PowerShell script making sure to pass in the /NewLP site as the site collection. Reminder, you will need site collection admin access to the App Catalog site as well as the /NewLP site to run this script successfully.

1. Assuming the PowerShell script completed successfully you should be able to navigate to the /NewLP/site pages/CustomLearningAdmin.aspx page which will initiate the upgrade process. Version 4 includes a new upgrade experience that will log every upgrade step that is being processed. The upgrade process can be run again at any time by adding `?forceUpdate=v3` to the end of the admin page url. The `v3` value indicates what version of learning pathways you're upgrading from. For example:
   > `https://contoso.sharepoint.com/sites/M365LP/SitePages/CustomLearningAdmin.aspx?forceUpdate=v3`

>If you no longer need the old learning pathways site, once the new site's admin page (`CustomLearningAdmin.aspx`) is working correctly it can be deleted.

### Creating a new Microsoft 365 learning pathways site - Custom playlists and assets

After you reestablish your learning pathways site by following the steps above, you will need to work to move the contents of your `CustomPlaylists` list and your `CustomAssets` list. You can also, optionally, move the actual custom pages that make up your custom assets if they live in the existing learning pathways site, and your intent is to delete it.

The difficulty of this task is that for all the items in the `CustomPlaylists` list, the ID of the list item in the `CustomAssets` list is buried in the JSONData field of each playlist list item. Therefore, simply moving the contents of the `CustomPlaylists` list from one site to the other will not be sufficient. Further, the `CustomAssets` list contains the absolute URL to the custom asset's page in the JSONData field of the list item. If the assets aren't moved and the site isn't renamed (thus changing the absolute URL to the asset's page) then this can remain. However, if either of those things happen you're going to need to manually correct the entries.

Given the complexity of this type of migration we suggest you consider enlisting one of our learning pathways partners to assist you in making this transition.
