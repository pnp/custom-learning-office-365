import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash/isEqual";
import { IButtonType } from "../../models/Models";

export interface ILinkButtonProps {
  buttonType: IButtonType;
  buttonLabel: string;
  onClick: () => void;
  disabled: boolean;
}

export interface ILinkButtonState {
}

export class LinkButtonState implements ILinkButtonState {
  constructor() { }
}

export default class LinkButton extends React.Component<ILinkButtonProps, ILinkButtonState> {
  private LOG_SOURCE: string = "LinkButton";

  constructor(props) {
    super(props);
    this.state = new LinkButtonState();
  }

  public shouldComponentUpdate(nextProps: Readonly<ILinkButtonProps>, nextState: Readonly<ILinkButtonState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<ILinkButtonProps> {
    try {
      return (
        <button className={`link-btn ${(this.props.disabled) ? "disabled" : ""}`} onClick={() => { if (!this.props.disabled) { this.props.onClick(); } }}>
          <span className="link-btn-icon" dangerouslySetInnerHTML={{ "__html": this.props.buttonType.SVG }} >
          </span>
          <span className="link-btn-label">{this.props.buttonLabel}</span>
        </button>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }

}