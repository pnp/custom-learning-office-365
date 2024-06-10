import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import HOOButton, { HOOButtonType } from "@n8d/htwoo-react/HOOButton";

import isEqual from "lodash-es/isEqual";
import * as strings from "M365LPStrings";

export interface ITechnologyHeadingProps {
  heading: string;
  visible: boolean;
  onVisibility: (visible: boolean) => void;
}

export interface ITechnologyHeadingState {
}

export class TechnologyHeadingState implements ITechnologyHeadingState {
  constructor() { }
}

export default class TechnologyHeading extends React.Component<ITechnologyHeadingProps, ITechnologyHeadingState> {
  private LOG_SOURCE: string = "TechnologyHeading";

  constructor(props) {
    super(props);
    this.state = new TechnologyHeadingState();
  }

  public shouldComponentUpdate(nextProps: Readonly<ITechnologyHeadingProps>, nextState: Readonly<ITechnologyHeadingState>): boolean {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<ITechnologyHeadingProps> {
    try {
      return (
        <h3 data-component={this.LOG_SOURCE} className="admpl-heading">{this.props.heading}
          <HOOButton type={HOOButtonType.Icon}
            iconName={(this.props.visible) ? "icon-eye-filled" : "icon-eye-off-filled"} 
            iconTitle={`${(this.props.visible) ? strings.Hide : strings.Show} ${strings.TechnologyHeadingLabel}`}
            rootElementAttributes={{className: "admpl-heading-edit"}}
            onClick={() => { this.props.onVisibility(this.props.visible); }} />
        </h3>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}