import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import filter from "lodash-es/filter";
import HOOButton, { HOOButtonType } from "@n8d/htwoo-react/HOOButton";

import { FilterTypes } from "../../../common/models/Enums";
import { IFilter, IFilterValue } from "../../../common/models/Models";
import * as strings from "M365LPStrings";

export interface IFilterPanelProps {
  filter: IFilter;
  filterValues: IFilterValue[];
  setFilter: (filterValue: IFilterValue) => void;
}

export interface IFilterPanelState {
  show: boolean;
}

export class FilterPanelState implements IFilterPanelState {
  constructor(
    public show: boolean = false
  ) { }
}

export default class FilterPanel extends React.PureComponent<IFilterPanelProps, IFilterPanelState> {
  private LOG_SOURCE: string = "FilterPanel";

  constructor(props) {
    super(props);
    this.state = new FilterPanelState();
  }

  public showFilter = (): void => {
    const show = this.state.show;
    this.setState({
      show: !show
    });
  }

  public render(): React.ReactElement<IFilterPanelProps> {
    try {
      const filterValuesLevel = filter(this.props.filterValues, { Type: FilterTypes.Level });
      const filterValuesAudience = filter(this.props.filterValues, { Type: FilterTypes.Audience });
      return (
        <div data-component={this.LOG_SOURCE} className={`sldpnl ${this.state.show ? "show" : "hide"}`}>
          <div className="sldpnl-header">
            <div className="sldpnl-title">
              {strings.FilterPanelHeader}
            </div>
            <div className="sldpnl-toggle">
              <HOOButton type={HOOButtonType.Icon} iconName={(this.state.show) ? "icon-chevron-up-regular" : "icon-chevron-down-regular"} disabled={false} onClick={() => { this.showFilter(); }} />
            </div>
          </div>
          <div className="sldpnl-content">
            <table className="selector">
              <tr className="selector-row">
                <th className="selector-header">{strings.FilterPanelAudienceLabel}</th>
                <td className="selector-data">
                  {filterValuesAudience.map((audience, idx) => {
                    return (
                      <HOOButton type={HOOButtonType.Standard}
                        key={idx}
                        label={audience.Value}
                        onClick={() => { this.props.setFilter(audience); }}
                        rootElementAttributes={{ className: (this.props.filter.Audience.indexOf(audience.Key) > -1) ? "selected" : "" }} />
                    );
                  })}
                </td>
              </tr>
              <tr className="selector-row">
                <th className="selector-header">{strings.FilterPanelSkillsetLabel}</th>
                <td className="selector-data">
                  {filterValuesLevel.map((level, idx) => {
                    return (
                      <HOOButton type={HOOButtonType.Standard}
                        key={idx}
                        onClick={() => { this.props.setFilter(level); }}
                        label={level.Value}
                        rootElementAttributes={{ className: (this.props.filter.Level.indexOf(level.Key) > -1) ? "selected" : "" }} />
                    );
                  })}
                </td>
              </tr>
            </table>
          </div>
        </div>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}
