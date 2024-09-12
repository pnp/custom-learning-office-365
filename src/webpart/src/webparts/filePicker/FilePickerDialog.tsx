import HOODialog, { HOODialogType } from "@n8d/htwoo-react/HOODialog";
import HOODialogContent from "@n8d/htwoo-react/HOODialogContent";
import * as React from "react";
import FilePicker from "./FilePicker";
import { FileItem } from "./Models";
import HOOButton from "@n8d/htwoo-react/HOOButton";
import * as strings from "M365LPStrings";

export interface IFilePickerDialogProps {
  onImageSelect: (image: FileItem) => void;
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

  public render(): React.ReactElement<IFilePickerDialogProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE}>
          <HOOButton
            label={strings.ImageSelectorButton}
            onClick={() => { this.setState({ showFilePicker: true }); }}
            type={1}
          />
          <HOODialog
            type={HOODialogType.SidebarRight}
            visible={this.state.showFilePicker}
            changeVisibility={() => { this.setState({ showFilePicker: !this.state.showFilePicker }); }} width="80vw" height="90hv">
            <HOODialogContent>
              <FilePicker title="File Picker" addImage={this.props.onImageSelect} closeDialog={() => { this.setState({ showFilePicker: false }); }} />
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