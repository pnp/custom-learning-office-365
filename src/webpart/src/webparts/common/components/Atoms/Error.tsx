import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import HOODialog from "@n8d/htwoo-react/HOODialog";
import HOODialogContent from "@n8d/htwoo-react/HOODialogContent";

export interface IErrorProps {
  message: string;
}

export default class Error extends React.PureComponent<IErrorProps> {
  private LOG_SOURCE: string = "Error";

  constructor(props) {
    super(props);
  }

  public render(): React.ReactElement<IErrorProps> {
    try {
      return (
        <HOODialog
          changeVisibility={function noRefCheck() { }}
          type={1}
          visible
        >

          <HOODialogContent>
            {this.props.message}
          </HOODialogContent>

        </HOODialog>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }

}