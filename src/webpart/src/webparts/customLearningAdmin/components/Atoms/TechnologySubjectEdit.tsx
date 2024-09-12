import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import HOOButton, { HOOButtonType } from "@n8d/htwoo-react/HOOButton";

import { ISubject } from "../../../common/models/Models";

export interface ITechnologySubjectEditProps {
  technologyId: string;
  subject: ISubject;
  visible: boolean;
  onVisibility: (visible: boolean) => void;
}

export default class TechnologySubjectEdit extends React.PureComponent<ITechnologySubjectEditProps> {
  private LOG_SOURCE: string = "TechnologySubjectEdit";

  constructor(props) {
    super(props);
  }

  public render(): React.ReactElement<ITechnologySubjectEditProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE} className="pl-edit-item">
          <span className="pl-edit-title">{this.props.subject.Name}</span>
          <span className="pl-edit-actions">
            <HOOButton type={HOOButtonType.Icon}
              iconName={(this.props.visible) ? "icon-eye-filled" : "icon-eye-off-filled"}
              onClick={() => { this.props.onVisibility(this.props.visible); }} />
          </span>
        </div>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}