import { IColumn } from 'office-ui-fabric-react';

import { ViewType } from ".";
import { IFile } from "../../../../services/FileBrowserService.types";
import { IFilePickerResult } from "../../FilePicker.types";

export enum LoadingState {
  idle = 1,
  loading = 2,
  loadingNextPage
}

export interface IFileBrowserState {
  loadingState: LoadingState;
  items: IFile[];
  nextPageQueryString: string;
  filePickerResult: IFilePickerResult;
  columns: IColumn[];
  selectedView: ViewType;
}
