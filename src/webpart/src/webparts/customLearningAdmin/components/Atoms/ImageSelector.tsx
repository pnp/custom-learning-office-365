import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash/isEqual";

import { sp } from "@pnp/sp";
import "@pnp/sp/folders";
import "@pnp/sp/files";

import { IFileAddResult } from "@pnp/sp/files/types";
import { FilePicker, IFilePickerResult } from '../../../filePicker';
import { Label } from 'office-ui-fabric-react';
import * as strings from 'M365LPStrings';
import { params } from "../../../common/services/Parameters";


export interface IImageSelectorProps {
  imageSource: string;
  imageWidth?: number;
  imageHeight?: number;
  disabled: boolean;
  setImageSource: (imageSource: string) => void;
}

export interface IImageSelectorState { }

export class ImageSelectorState implements IImageSelectorState { }

declare module 'react' {
  interface HTMLAttributes<T> extends React.DOMAttributes<T> {
    // extends React's HTMLAttributes for lazy loading
    loading?: string;
  }
}

export default class ImageSelector extends React.Component<IImageSelectorProps, IImageSelectorState> {
  private LOG_SOURCE: string = "ImageSelector";
  private textInput;

  constructor(props) {
    super(props);
    this.textInput = React.createRef();
  }

  public shouldComponentUpdate(nextProps: Readonly<IImageSelectorProps>, nextState: Readonly<IImageSelectorState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private imageChanged = async (filePickerResult: IFilePickerResult) => {
    if (filePickerResult.fileAbsoluteUrl && filePickerResult.fileAbsoluteUrl.length > 0) {
      this.props.setImageSource(filePickerResult.fileAbsoluteUrl);
    } else {
      try {
        let file = await filePickerResult.downloadFileContent();
        let fileObject: File = file;
        if (file instanceof Array) {
          fileObject = file[0];
        }
        let fileAsset: IFileAddResult = await sp.web.getFolderByServerRelativeUrl("siteassets").files.add(fileObject.name, fileObject, true);
        this.props.setImageSource(window.location.origin + fileAsset.data.ServerRelativeUrl);
      } catch (err) {
        Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (imageChanged) - ${err}`, LogLevel.Error);
      }
    }
  }

  public render(): React.ReactElement<IImageSelectorProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE} className='adm-itemimage'>
          <img
            src={this.props.imageSource}
            alt={strings.ImageSelectorImageAlt}
            className='adm-itemimage'
            height="278px"
            width="200px"
            loading="lazy"
          />
          <Label className="adm-fileUrl" onClick={e => (e as any).target.select()}>{this.props.imageSource}</Label>
          {!this.props.disabled &&
            <FilePicker
              //label={strings.ImageSelectorLabel}
              accepts={[".gif", ".jpg", ".jpeg", ".bmp", ".dib", ".tif", ".tiff", ".ico", ".png", ".jxr", ".svg"]}
              //buttonIcon="FileImage"
              buttonLabel={strings.ImageSelectorButton}
              onSave={this.imageChanged}
              onChanged={this.imageChanged}
              context={params.context as any}
              hideOneDriveTab={true}
            />
          }
        </div>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}