import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash/isEqual";

export interface ITextButtonProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

export interface ITextButtonState {
}

export class TextButtonState implements ITextButtonState {
  constructor() { }
}

export default class TextButton extends React.Component<ITextButtonProps, ITextButtonState> {
  private LOG_SOURCE: string = "TextButton";

  constructor(props) {
    super(props);
    this.state = new TextButtonState();
  }

  public shouldComponentUpdate(nextProps: Readonly<ITextButtonProps>, nextState: Readonly<ITextButtonState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<ITextButtonProps> {
    try {
      return (
        <button className={`btn-small ${(this.props.selected) ? "selected" : ""}`} onClick={() => { this.props.onClick(); }}>{this.props.label}</button>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}