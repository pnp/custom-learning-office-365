import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash/isEqual";
import filter from "lodash/filter";
import Button from "../../../common/components/Atoms/Button";
import { ButtonTypes, FilterTypes } from "../../../common/models/Enums";
import TextButton from "../../../common/components/Atoms/TextButton";
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

export default class FilterPanel extends React.Component<IFilterPanelProps, IFilterPanelState> {
  private LOG_SOURCE: string = "FilterPanel";

  constructor(props) {
    super(props);
    this.state = new FilterPanelState();
  }

  public shouldComponentUpdate(nextProps: Readonly<IFilterPanelProps>, nextState: Readonly<IFilterPanelState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public showFilter = (): void => {
    let show = this.state.show;
    this.setState({
      show: !show
    });
  }

  public render(): React.ReactElement<IFilterPanelProps> {
    try {
      let filterValuesLevel = filter(this.props.filterValues, { Type: FilterTypes.Level });
      let filterValuesAudience = filter(this.props.filterValues, { Type: FilterTypes.Audience });
      return (
        <div data-component={this.LOG_SOURCE} className={`sldpnl ${this.state.show ? "show" : "hide"}`}>
          <div className="sldpnl-header">
            <div className="sldpnl-title">
              {strings.FilterPanelHeader}
            </div>
            <div className="sldpnl-toggle">
              <Button buttonType={(this.state.show) ? ButtonTypes.ChevronUp : ButtonTypes.ChevronDown} disabled={false} onClick={() => { this.showFilter(); }} />
            </div>
          </div>
          <div className="sldpnl-content">
            <table className="selector">
              <tr className="selector-row">
                <th className="selector-header">{strings.FilterPanelAudienceLabel}</th>
                <td className="selector-data">
                  {filterValuesAudience.map((audience) => {
                    return (
                      <TextButton onClick={() => { this.props.setFilter(audience); }} label={audience.Value} selected={this.props.filter.Audience.indexOf(audience.Key) > -1} />
                    );
                  })}
                </td>
              </tr>
              <tr className="selector-row">
                <th className="selector-header">{strings.FilterPanelSkillsetLabel}</th>
                <td className="selector-data">
                  {filterValuesLevel.map((level) => {
                    return (
                      <TextButton onClick={() => { this.props.setFilter(level); }} label={level.Value} selected={this.props.filter.Level.indexOf(level.Key) > -1} />
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
