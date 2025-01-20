/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";

import { FileItem } from "./Models";
import { authSvc } from "../common/services/AuthService";
import { params } from "../common/services/Parameters";

export interface IFilePickerProps {
  title: string;
  addImage: (image: FileItem) => void;
  closeDialog: () => void;
}

export interface IFilePickerState {
  valid: boolean;
}

export class FilePickerState implements IFilePickerState {
  constructor(
    public valid: boolean = true,
  ) { }
}

export default class FilePicker extends React.PureComponent<IFilePickerProps, IFilePickerState> {
  private LOG_SOURCE: string = "🟢FilePicker";
  private FILE_PICKER_URL: string;

  //private _container: React.RefObject<HTMLDivElement>;
  private _IFrameElement: React.RefObject<HTMLIFrameElement>;
  private _FilePickerParams: any;
  private _QueryString: URLSearchParams;
  private _filePickerMessagePort: MessagePort = null;

  constructor(props: IFilePickerProps) {
    super(props);
    this.state = new FilePickerState();
    this._IFrameElement = React.createRef();
    //this._container = React.createRef();
  }

  public componentDidMount(): void {
    try {
      this._init();
      //this._container.current.focus();
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (componentDidMount) - ${err}`);
    }
  }

  private _init = async (): Promise<void> => {
    authSvc.Init(params.context.aadTokenProviderFactory);
    try {
      this.FILE_PICKER_URL = `${params.learningSiteUrl}/_layouts/15/FilePicker.aspx`;
      this._FilePickerParams = {
        sdk: "8.0",
        entry: {
          sharePoint: {
            byPath: {
              web: params.learningSiteUrl,
              list: `SiteAssets`
            },
          },
        },
        authentication: {},
        messaging: {
          origin: `${window.location.protocol}//${window.location.host}`,
          channelId: "27"
        },
        typesAndSources: {
          mode: "files",
          filters: [".jpg", ".png", ".gif"],
          pivots: {
            oneDrive: false,
            recent: false,
            sharedLibraries: false,
            site: true,
            shared: true
          },
        },
      }

      this._QueryString = new URLSearchParams({
        filePicker: JSON.stringify(this._FilePickerParams),
      });

      const authToken = await authSvc.GetAADToken(`${window.location.protocol}//${window.location.host}`);
      if (authToken != null) {
        const form = this._IFrameElement.current.contentWindow.document.createElement("form");
        form.setAttribute("action", `${this.FILE_PICKER_URL}?${this._QueryString}`);
        form.setAttribute("method", "POST");
        this._IFrameElement.current.contentWindow.document.body.append(form);

        const input = this._IFrameElement.current.contentWindow.document.createElement("input");
        input.setAttribute("type", "hidden")
        input.setAttribute("name", "access_token");
        input.setAttribute("value", authToken);
        form.appendChild(input);

        form.submit();

        window.addEventListener("message", this._messageListener);
      } else {
        this.setState({ valid: false });
        console.warn(`${this.LOG_SOURCE} (_init) - No valid authorization token for FilePicker.`);
      }
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (_init) - ${err}`);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _messageListener = (event: MessageEvent<any>): void => {
    try {
      if (event.source && event.source === this._IFrameElement.current.contentWindow) {
        const message = event.data;
        if (message.type === "initialize" && message.channelId === this._FilePickerParams.messaging.channelId) {
          this._filePickerMessagePort = event.ports[0];
          this._filePickerMessagePort.addEventListener("message", this._filePickerMessageListener);
          this._filePickerMessagePort.start();
          this._filePickerMessagePort.postMessage({
            type: "activate",
          });
        }
      }
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (_messageListener) - ${err}`);
    }
  }

  public componentWillUnmount(): void {
    try {
      window.removeEventListener("message", this._messageListener);
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (componentWillUnmount) - ${err}`);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _filePickerMessageListener = async (message: any): Promise<void> => {
    switch (message.data.type) {
      case "notification":
        //console.log(`${this.LOG_SOURCE} (_filePickerMessageListener) - Notification: ${JSON.stringify(message.data)}`);
        break;
      case "command": {
        this._filePickerMessagePort.postMessage({
          type: "acknowledge",
          id: message.data.id,
        });

        const command: any = message.data.data;
        switch (command.command) {
          case "authenticate": {
            //(command)
            const token: string = await authSvc.GetAADToken(`${window.location.protocol}//${window.location.host}`);
            if (typeof token !== "undefined" && token !== null) {
              this._filePickerMessagePort.postMessage({
                type: "result",
                id: message.data.id,
                data: {
                  result: "token",
                  token,
                }
              });
            } else {
              console.error(`${this.LOG_SOURCE} (_filePickerMessageListener) - Could not get auth token for command: ${JSON.stringify(command)}`);
            }
            break;
          }
          case "close":
            this.props.closeDialog();
            break;
          case "pick": {
            const items: FileItem[] = command.items;
            if (items.length > 0) {
              this.props.addImage(items[0]);
              this.props.closeDialog();
            }
            break;
          }
          default:
            console.error(`${this.LOG_SOURCE} (_filePickerMessageListener) - Unsupported command: ${JSON.stringify(command)}`);
            this._filePickerMessagePort.postMessage({
              result: "error",
              error: {
                code: "unsupportedCommand",
                message: command.command
              },
              isExpected: true,
            });
            break;
        }
        break;
      }
    }
  }



  public render(): React.ReactElement<IFilePickerProps> {
    try {
      if (!this.state.valid) { return null; }
      return (
        <iframe ref={this._IFrameElement} data-component={this.LOG_SOURCE} className="hoo-dlg-iframe" src="" loading="lazy" />
      );
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (render) - ${err}`);
      return null;
    }
  }
}