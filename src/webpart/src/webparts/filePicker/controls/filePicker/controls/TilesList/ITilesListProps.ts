import { Selection } from 'office-ui-fabric-react';

import { FileBrowserService } from "../../../../services/FileBrowserService";
import { IFile } from "../../../../services/FileBrowserService.types";
import { IFilePickerResult } from "../../FilePicker.types";

export interface ITilesListProps {
  fileBrowserService: FileBrowserService;
  filePickerResult: IFilePickerResult;
  selection: Selection;
  items: IFile[];

  onFolderOpen: (item: IFile) => void;
  onFileSelected: (item: IFile) => void;
  onNextPageDataRequest: () => void;
}
