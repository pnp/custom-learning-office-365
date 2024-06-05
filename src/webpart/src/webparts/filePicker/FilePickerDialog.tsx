import HOODialog, { HOODialogType } from "@n8d/htwoo-react/HOODialog";
import HOODialogContent from "@n8d/htwoo-react/HOODialogContent";
import HOODialogHeader from "@n8d/htwoo-react/HOODialogHeader";
import * as React from "react";
import FilePicker from "./FilePicker";
import { FileItem } from "./Models";

export interface IFilePickerDialogProps {
}

export interface IFilePickerDialogState {
  showFilePicker: boolean;
}

export class FilePickerDialogState implements IFilePickerDialogState {
  public constructor(
    public showFilePicker: boolean = false
  ) { }
}

export default class FilePickerDialog extends React.PureComponent<IFilePickerDialogProps, IFilePickerDialogState> {
  private LOG_SOURCE = "🟢Container";

  public constructor(props: IFilePickerDialogProps) {
    super(props);
    this.state = new FilePickerDialogState();
  }

  //This assumes there's a state property for the image file...
  private _setToolImage = (imageFile: FileItem): void => {
    try {
      //this.setState({ imageFile });
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (_setToolImage) - ${err}`);
    }
  }

  public render(): React.ReactElement<IFilePickerDialogProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE}>
          // Make type whatever dialog style is appropriate, sidebar right is probably more in line with what the SharePoint UI is doing currently.
          <HOODialog
            type={HOODialogType.Center}
            visible={this.state.showFilePicker}
            changeVisibility={() => { this.setState({ showFilePicker: !this.state.showFilePicker }); }}>
            <HOODialogHeader title="Select File" closeDisabled={false} closeIconName="icon-close" closeOnClick={() => { this.setState({ showFilePicker: false }); }} />
            <HOODialogContent>
              <FilePicker title="File Picker" addImage={this._setToolImage} closeDialog={() => { this.setState({ showFilePicker: false }); }} />
            </HOODialogContent>
          </HOODialog>
        </div>
      );
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (render) - ${err}`);
      return null;
    }
  }
}