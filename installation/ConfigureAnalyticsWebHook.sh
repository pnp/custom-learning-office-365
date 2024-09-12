## SETUP
## EXAMPLE: clSite=$("https://$TenantName.sharepoint.com/sites/$SiteCollectionName")

clSite="https://contoso.sharepoint.com/sites/M365lp"
echo "Learning Pathways Site: ${clSite}"
## Url: the URL of the https endpoint that will be called with a post request including payload
## AnonymizeUser: Default is true, set to false to send unhashed usernames in payload
## KeyHeader: (Optional) An optional custom header that will be sent with the post request, default is "M365LP-API-KEY"
## Key: (Optional) An optional custom header value to be sent with the post request, default is null
webhookConfig="{Url: "", AnonymizeUser: true, KeyHeader: "", Key: ""}"

echo "Webhook Config: ${webhookConfig}"

## LOGIN
m365 login --authType browser

## SCRIPT
tacUrl=$(m365 spo tenant appcatalogurl get)
tacLength=${#tacUrl}
count=$((tacLength-2))
tenantAppCatalogUrl=${tacUrl:1:count}
echo "Found Tenant App Catalog Url: ${tenantAppCatalogUrl}"

m365 spo storageentity set -k MicrosoftCustomLearningWebhookConfig -v $webhookConfig -d "Microsoft 365 learning pathways webhook configuration" -u $tenantAppCatalogUrl

m365 spo storageentity get -k MicrosoftCustomLearningWebhookConfig