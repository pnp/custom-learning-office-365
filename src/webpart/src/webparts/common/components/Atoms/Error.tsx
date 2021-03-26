import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash/isEqual";
import { MessageBar, MessageBarType } from "office-ui-fabric-react";

export interface IErrorProps {
  message: string;
}

export interface IErrorState {
}

export class ErrorState implements IErrorState {
  constructor() { }
}

export default class Error extends React.Component<IErrorProps, IErrorState> {
  private LOG_SOURCE: string = "Error";

  constructor(props) {
    super(props);
    this.state = new ErrorState();
  }

  public shouldComponentUpdate(nextProps: Readonly<IErrorProps>, nextState: Readonly<IErrorState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<IErrorProps> {
    try {
      return (
        <MessageBar messageBarType={MessageBarType.error}>
          {this.props.message}
        </MessageBar>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }

}