import * as React from 'react';
import { Logger, LogLevel } from '@pnp/logging';

import isEqual from "lodash/isEqual";
import includes from "lodash/includes";
import { IAsset } from '../../../common/models/Models';
import styles from "../../../common/CustomLearningCommon.module.scss";
import { CustomWebpartSource } from '../../../common/models/Enums';
import { AppInsightsService } from '../../../common/services/AppInsightsService';

export interface IAssetViewProps {
  playlistId: string;
  playlistName: string;
  asset: IAsset;
  assets: IAsset[];
  assetOrigins: string[];
  selectAsset: (assetId: string) => void;
}

export interface IAssetViewState {
}

export class AssetViewState implements IAssetViewState {
  constructor() { }
}

declare module 'react' {
  interface HTMLAttributes<T> extends React.DOMAttributes<T> {
    // extends React's HTMLAttributes for lazy loading
    loading?: string;
  }
}


export default class AssetView extends React.Component<IAssetViewProps, IAssetViewState> {
  private LOG_SOURCE: string = "AssetView";
  private _IFrame: React.RefObject<HTMLIFrameElement>;
  private _IFrameCont;

  private _messageReceived: boolean = false;
  private _Height: number = 6000;

  constructor(props) {
    super(props);
    this.state = new AssetViewState();
    this._IFrame = React.createRef();
    this._IFrameCont = React.createRef();
  }

  public shouldComponentUpdate(nextProps: Readonly<IAssetViewProps>, nextState: Readonly<IAssetViewState>) {
    try {
      if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
        return false;
      if (!nextProps.asset)
        return false;
      if ((!this.props.asset && nextProps.asset) || (nextProps.asset && (nextProps.asset.Url != this.props.asset.Url))) {
        //Reset iFrame height
        let iFrameCont = (document.getElementsByClassName(styles.outerframe))[0] as HTMLElement;
        if (iFrameCont)
          iFrameCont.style.height = "0px";
        //Scroll to top
        window.scrollTo(0, 0);
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (shouldComponentUpdate) - ${err}`, LogLevel.Error);
    }
    return true;
  }

  public componentDidUpdate() {
    try {
      this._messageReceived = false;
      AppInsightsService.trackViewAsset(this.props.playlistId, this.props.playlistName, this.props.asset);
      this._IFrame.current.contentWindow.location.replace(this.decorateAssetUrl());
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (componentDidUpdate) - ${err}`, LogLevel.Error);
    }
  }

  public componentDidMount() {
    try {
      //get iframe content size
      window.addEventListener("message", this.handleIFrameSize, false);
      //if window re-mounts due to resize, update url
      if (this._IFrame.current && this._IFrame.current.contentWindow.location.href === "about:blank") {
        this._IFrame.current.contentWindow.location.replace(this.decorateAssetUrl());
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (componentDidMount) - ${err}`, LogLevel.Error);
    }
  }

  public componentWillUnmount() {
    //Release windows events
    window.removeEventListener("message", this.handleIFrameSize);
  }

  private decorateAssetUrl(): string {
    if (AppInsightsService.isTelemetryEnabled && this.props.asset.Source !== CustomWebpartSource.Tenant) {
      const separator = (this.props.asset.Url as string).lastIndexOf('?') > 0 ? '&' : '?';
      return `${this.props.asset.Url}${separator}fromOrigin=${document.location.origin}`;
    }
    return this.props.asset.Url as string;
  }

  private handleIFrameSize = (event: MessageEvent) => {
    try {
      //Callback function from post message to get iFrame content size.
      if (includes(this.props.assetOrigins, event.origin) && event.data.indexOf("") > -1) {
        this._messageReceived = true;
        let height = 6000;
        let messageArray = event.data.split("=");
        if (messageArray.length > 0 && messageArray[0] === "help_getClientHeight" && !isNaN(+messageArray[1]) && +messageArray !== height) {
          height = +messageArray[1];
        }
        this.resizeFrame(height);
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (handleIFrameSize) - ${err}`, LogLevel.Error);
    }
  }

  private resizeFrame(size: number) {
    try {
      if (this._IFrameCont.current) {
        this._Height = size;
        this._IFrameCont.current.style.height = this._Height + "px";
        //Make sure scroll is at the top
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (resizeFrame) - ${err}`, LogLevel.Error);
    }
  }

  private getContentHeight(section: any): number {
    let iFrameContent = (section) ? section : null;
    let iFrameContentHeight = (iFrameContent) ? Math.max(iFrameContent.scrollHeight, iFrameContent.offsetHeight, iFrameContent.clientHeight) : 0;
    return iFrameContentHeight;
  }

  private resizeIFrame = (): void => {
    try {
      let url = new URL(this.props.asset.Url as string);
      if (!includes(this.props.assetOrigins, url.origin)) {
        try {
          let iFrameDoc = this._IFrame.current.contentDocument ? this._IFrame.current.contentDocument : this._IFrame.current.contentWindow.document;
          //Find page header and hub nav and hide it
          let iFrameDocHeader: HTMLDivElement = iFrameDoc.querySelector('[data-automation-id="pageHeader"]') as HTMLDivElement;
          if (iFrameDocHeader)
            iFrameDocHeader.style.display = "none";
          let iFrameHubNav: HTMLDivElement = iFrameDoc.querySelector('.ms-HubNav') as HTMLDivElement;
          if (iFrameHubNav)
            iFrameHubNav.style.display = "none";

          //Get the page content
          let iFrameDocBody = iFrameDoc.getElementById("spPageCanvasContent");
          //Add 150 for comments section spacer
          let iFrameDocComments = iFrameDoc.querySelector('[aria-label="Comments"]');
          this._Height = this.getContentHeight(iFrameDocBody) + this.getContentHeight(iFrameDocComments) + 150;
          //Use windows timeout to resize for slow responsive pages
          window.setTimeout(() => {
            //If comments weren't rendered during initial resize
            if (!iFrameDocComments)
              iFrameDocComments = iFrameDoc.querySelector('[aria-label="Comments"]');
            //Add 150 for comments section spacer
            let newHeight = this.getContentHeight(iFrameDocBody) + this.getContentHeight(iFrameDocComments) + 150;
            if (newHeight !== this._Height) {
              this._Height = newHeight;
              this.resizeFrame(this._Height);
            }
          }, 2000);
        } catch (err) {
          this._Height = 6000;
        }
        this.resizeFrame(this._Height);
      } else {
        this._messageReceived = false;
        this._IFrame.current.contentWindow.postMessage("help_getClientHeight", url.origin);
        window.setTimeout(() => {
          if (this._messageReceived) {
            this._messageReceived = false;
          } else {
            this.resizeFrame(6000);
            Logger.write(`Origin ${url.origin} is not responding in a timely manner to "help_getClientHeight" post message. Default iFrame height set. - ${this.LOG_SOURCE} (resizeIFrame)`, LogLevel.Error);
          }
        }, 5000);
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (resizeIFrame) - ${err}`, LogLevel.Error);
    }
  }

  public render(): React.ReactElement<IAssetViewProps> {
    try {
      if (!this.props.asset) { return null; }
      return (
        <div
          data-component={this.LOG_SOURCE}
          ref={this._IFrameCont}
          className={(this.props.asset.Source === CustomWebpartSource.Tenant) ? styles.spouterframe : styles.outerframe}
        >
          <iframe
            id="contentIFrame"
            ref={this._IFrame}
            scrolling="No"
            frameBorder="0"
            allowFullScreen
            className={styles.innerframe}
            onLoad={() => { this.resizeIFrame(); }}
            loading="lazy"
          >
          </iframe>
        </div>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}
