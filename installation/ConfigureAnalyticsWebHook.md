# Custom Analytics Webhook

With version 5.0 of Microsoft 365 Learning Pathways we are introducing the ability to add your own custom analytics webhook. By setting the custom webhook property you can pass the analytics payload to a custom application for storage and reporting. This allows you to get specific analytics what assets are being viewed in your Microsoft 365 Learning Pathways site. This webhook can be used with any service that will handle an HTTP POST (PowerAutomate Flow, Azure Function, Custom Endpoint).

## Configuring Analytics Webhook

To enable custom analytics you need to set a tenant app property. To do this the person running the script needs to be able a Global Admin and have the ability to run PowerShell or have the CLI for Microsoft 365 set up. You can use the following script to set the tenant app property using [PowerShell](ConfigureAnalyticsWebHook.ps1) or [CLI for Microsoft 365](ConfigureAnalyticsWebHook.sh).

### Configuration Properties

The `MicrosoftCustomLearningWebhookConfig` tenant app property contains a stringified version of the follow JSON object

```Text
{
  Url: string;
  AnonymizeUser: boolean;
  KeyHeader?: string;
  Key?: string;
}
```

- Url: The url that will receive the POST request from instances of the Microsoft 365 learning pathways webpart.
- AnonymizeUser: (default is true) - true sends user identity as SHA256 hash, false sends user data unencrypted.
- KeyHeader: (Optional) - If you would like to include a custom header in the POST http call for an API key, please include the name for the property. If a Key is set but not a KeyHeader the value M365LP-API-KE will be used.
- Key: (Optional) - The API key to include in the POST http call using the KeyHeader value as the property name.

## Test Analytics using PowerAutomate

To test the analytics you can create a Cloud Flow using PowerAutomate. 

1. Create a new instant cloud flow using the "When HTTP request is received" trigger (This is a premium connector)
2. Set the "Who can trigger this flow" property to Anyone
3. Copy the HTTP Post URL
4. Run the script to set the analytics webhook property using either PowerShell or M365 CLI. The HTTP Post URL will be the URL property of the webhook property
5. Navigate to your Microsoft 365 Learning Pathways site and view an asset.
6. Review the run history of your flow. You should be able to see that the call was triggered.

## Sample Payload

```JSON
{
        "user": "Hashed User ID",
        "tenant": {
            "_guid": "1234567"
        },
        "webpart_ver": "v4",
        "language": "en-us",
        "eventType": "AssetViewed",
        "pageUrl": "<https://YOURTENANT.sharepoint.com/sites/M365LP/SitePages/Get-started-with-Microsoft-365.aspx>",
        "playlistId": "037adb49-b480-4a70-8389-5caeaec1a640",
        "playlistName": "Creating a Champion Program",
        "asset": {
            "Id": "dbf90b66-4789-40d0-a383-0beb3773a333",
            "Title": "Get started building a Champion program",
            "Description": "",
            "Url": "<https://support.office.com/en-us/f1/article/8ac0c945-ee18-477b-86dd-bf43357a5c2a?embed=true>",
            "TechnologyId": "0ae04ffb-5e69-461d-919d-a2215109bf49",
            "SubjectId": "",
            "Source": "Microsoft",
            "StatusTagId": "",
            "StatusNote": ""
        }
    }
```