import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash/isEqual";
import { TextField, PrimaryButton } from 'office-ui-fabric-react';

import * as strings from "M365LPStrings";

export interface ILinkPanelProps {
  panelOpen: string;
  linkUrl: string;
}

export interface ILinkPanelState {
}

export class LinkPanelState implements ILinkPanelState {
  constructor() { }
}

export default class LinkPanel extends React.Component<ILinkPanelProps, ILinkPanelState> {
  private LOG_SOURCE: string = "LinkPanel";

  constructor(props) {
    super(props);
    this.state = new LinkPanelState();
  }

  public shouldComponentUpdate(nextProps: Readonly<ILinkPanelProps>, nextState: Readonly<ILinkPanelState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private linkClick = (): void => {
    try {
      let selBox = document.createElement('textarea');
      selBox.style.height = "0";
      selBox.style.width = "0";
      selBox.value = this.props.linkUrl;

      let headers = document.getElementsByClassName("headerpanel");
      let element: Element = null;
      if (headers.length > 0)
        element = headers[0];
      if (!element)
        element = document.body;

      element.appendChild(selBox);
      selBox.focus();
      selBox.select();
      document.execCommand('copy');
      element.removeChild(selBox);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (linkClick) - ${err}`, LogLevel.Error);
    }
  }

  public render(): React.ReactElement<ILinkPanelProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE} className={`headerpanel fbcolumn ${(this.props.panelOpen.length > 0) ? "show" : ""}`}>
          <div className="copypanel">
            <TextField defaultValue={this.props.linkUrl} value={this.props.linkUrl} readOnly />
            <PrimaryButton text={strings.LinkPanelCopyLabel} ariaLabel={strings.LinkPanelCopyLabel} onClick={this.linkClick} />
          </div>
        </div>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}
