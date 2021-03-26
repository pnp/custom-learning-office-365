import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import isEqual from "lodash/isEqual";


import { IButtonType } from "../../models/Models";

export interface IButtonProps {
  buttonType: IButtonType;
  disabled: boolean;
  onClick: () => void;
  selected?: boolean;
  className?: string;
  title?: string;
  preTextLabel?: string;
  postTextLabel?: string;
}

export interface IButtonState {
}

export class ButtonState implements IButtonState {
  constructor() { }
}

export default class Button extends React.Component<IButtonProps, IButtonState> {
  private LOG_SOURCE: string = "Button";

  constructor(props) {
    super(props);
    this.state = new ButtonState();
  }

  public shouldComponentUpdate(nextProps: Readonly<IButtonProps>, nextState: Readonly<IButtonState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<IButtonProps> {


    let preTextLabel = this.props.preTextLabel !== undefined ? (<span className="iconbutton-label">{this.props.preTextLabel}</span>) : "";

    let postTextLabel = this.props.postTextLabel !== undefined ? (<span className="iconbutton-label">{this.props.postTextLabel}</span>) : "";

    try {
      return (
        <button title={this.props.title} className={`${(this.props.className) ? this.props.className : ""} iconbutton ${(this.props.disabled) ? "disabled" : ""} ${(this.props.selected) ? "selected" : ""}`} onClick={() => { if (!this.props.disabled) { this.props.onClick(); } }}>{preTextLabel}
          <span className={`${(this.props.className) ? this.props.className : ""} iconbutton-img`} dangerouslySetInnerHTML={{ "__html": this.props.buttonType.SVG }} >
          </span> {postTextLabel}
        </button>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}