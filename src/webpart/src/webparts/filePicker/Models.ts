export interface FileItem {
  name: string;
  webDavUrl: string;
  webUrl: string;
  size: number;
  id: string;
  parentReference: string;
  sharepointIds: ISharePointIds;
}

export interface ISharePointIds {
  listItemUniqueId: string;
  listItemId: string;
  listId: string;
  webId: string;
  siteId: string;
  siteUrl: string;
}

export interface ISPFileItem {
  Id: string;
  DisplayName: string;
  Url: string;
  ListItemId: string;
  ListId: string;
  SiteUrl: string;
  ToolDescription: string;
}

export class SPFileItem implements ISPFileItem {
  constructor(
    public Id: string = "",
    public DisplayName: string = "",
    public Url: string = "",
    public ListItemId: string = "",
    public ListId: string = "",
    public SiteUrl: string = "",
    public ToolDescription: string = ""
  ) { }
}