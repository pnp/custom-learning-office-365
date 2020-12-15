import { IBreadcrumbItem } from "office-ui-fabric-react";
import { IFile } from "../../../services/FileBrowserService.types";

export interface OneDriveFilesBreadcrumbItem extends IBreadcrumbItem {
  folderData?: IFile;
}
