import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash/isEqual";
import { ITechnology, ISubject } from "../../../common/models/Models";
import TechnologyHeading from "../Atoms/TechnologyHeading";
import TechnologySubjectEdit from "../Atoms/TechnologySubjectEdit";
import TechnologyNav from "../Atoms/TechnologyNav";

export interface ITechnologyProps {
  className: string;
  technologies: ITechnology[];
  hiddenTech: string[];
  hiddenSub: string[];
  updateTechnology: (techName: string, subTech: string, exists: boolean) => void;
}

export interface ITechnologyState {
  selectedTechnology: ITechnology;
}

export class TechnologyState implements ITechnologyState {
  constructor(
    public selectedTechnology: ITechnology = null
  ) { }
}

export default class Technology extends React.Component<ITechnologyProps, ITechnologyState> {
  private LOG_SOURCE: string = "Technology";

  constructor(props) {
    super(props);
    this.state = new TechnologyState();
  }

  public shouldComponentUpdate(nextProps: Readonly<ITechnologyProps>, nextState: Readonly<ITechnologyState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private selectTech = (selected: ITechnology): void => {
    if (!isEqual(this.state.selectedTechnology, selected)) {
      this.setState({
        selectedTechnology: selected
      });
    }
  }

  public render(): React.ReactElement<ITechnologyProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE} className={`adm-content ${this.props.className}`}>
          <div className="adm-navsection-subcat">
            <TechnologyNav
              technologies={this.props.technologies}
              selectedId={(this.state.selectedTechnology) ? this.state.selectedTechnology.Id : ""}
              onClick={this.selectTech}
            />
          </div>
          {this.state.selectedTechnology &&
            <div className="adm-content-main">
              <TechnologyHeading
                heading={this.state.selectedTechnology.Name}
                visible={this.props.hiddenTech.indexOf(this.state.selectedTechnology.Id) < 0}
                onVisibility={(visible: boolean) => { this.props.updateTechnology(this.state.selectedTechnology.Id, null, visible); }}
              />
              <ul className="adm-content-playlist">
                {this.state.selectedTechnology.Subjects && this.state.selectedTechnology.Subjects.length > 0 && this.state.selectedTechnology.Subjects.map((subject: ISubject) => {
                  return (
                    <li>
                      <TechnologySubjectEdit
                        technologyId={this.state.selectedTechnology.Id}
                        subject={subject}
                        visible={this.props.hiddenSub.indexOf(subject.Id) < 0}
                        onVisibility={(visible: boolean) => { this.props.updateTechnology(this.state.selectedTechnology.Id, subject.Id, visible); }}
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          }
        </div>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}
