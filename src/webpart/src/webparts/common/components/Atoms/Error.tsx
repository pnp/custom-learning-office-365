import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import HOODialog from "@n8d/htwoo-react/HOODialog";
import HOODialogContent from "@n8d/htwoo-react/HOODialogContent";
import HOODialogActions from "@n8d/htwoo-react/HOODialogActions";
import HOOButton from "@n8d/htwoo-react/HOOButton";

import isEqual from "lodash-es/isEqual";

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

  public shouldComponentUpdate(nextProps: Readonly<IErrorProps>, nextState: Readonly<IErrorState>): boolean {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<IErrorProps> {
    try {
      return (
        <HOODialog
          changeVisibility={function noRefCheck() { }}
          type={1} visible={false}        >
          <HOODialogContent>
            {this.props.message}
          </HOODialogContent>
          <HOODialogActions>
            <HOOButton
              iconName="hoo-icon-close"
              onClick={function noRefCheck() { }}
              type={0}
            />
          </HOODialogActions>
        </HOODialog>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }

}