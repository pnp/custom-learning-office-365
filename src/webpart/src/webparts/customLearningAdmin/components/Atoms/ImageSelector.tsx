import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash-es/isEqual";

import "@pnp/sp/folders";
import "@pnp/sp/files";

import * as strings from 'M365LPStrings';
import FilePickerDialog from "../../../filePicker/FilePickerDialog";
import { FileItem } from "../../../filePicker/Models";

export interface IImageSelectorProps {
  imageSource: string;
  imageWidth?: number;
  imageHeight?: number;
  disabled: boolean;
  setImageSource: (imageSource: string) => void;
}

export interface IImageSelectorState {
  openDialog: boolean;
}

export class ImageSelectorState implements IImageSelectorState {
  public constructor(
    public openDialog: boolean = false
  ) { }
}

declare module 'react' {
  interface HTMLAttributes<T> extends React.DOMAttributes<T> {
    // extends React's HTMLAttributes for lazy loading
    loading?: string;
  }
}

export default class ImageSelector extends React.Component<IImageSelectorProps, IImageSelectorState> {
  private LOG_SOURCE: string = "ImageSelector";

  constructor(props) {
    super(props);
    this.state = new ImageSelectorState();
  }

  public shouldComponentUpdate(nextProps: Readonly<IImageSelectorProps>, nextState: Readonly<IImageSelectorState>): boolean {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private imageChanged = async (imageFile: FileItem): Promise<void> => {
    try {
      if (imageFile.webUrl && imageFile.webUrl.length > 0) {
        this.props.setImageSource(imageFile.webUrl);
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (imageChanged) - ${err}`, LogLevel.Error);
    }
  }

  public render(): React.ReactElement<IImageSelectorProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE} className="adm-itemimage">
          <img
            src={this.props.imageSource}
            alt={strings.ImageSelectorImageAlt}
            className="adm-itemimage"
            height="278px"
            width="200px"
            loading="lazy" />
          <label className="adm-fileUrl">
            https://pnp.github.io/custom-learning-office-365/learningpathways/v4/en-us/images/playlists/LP-security-security-at-work.png
          </label>
          {!this.props.disabled &&
            <FilePickerDialog onImageSelect={this.imageChanged} />
          }
        </div>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}