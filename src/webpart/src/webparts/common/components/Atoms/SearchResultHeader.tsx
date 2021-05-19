import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash/isEqual";

import { Pivot, PivotItem } from 'office-ui-fabric-react';

export interface ISearchResultHeaderProps {
  headerItems: string[];
  searchValue: string;
  selectTab: (tab: PivotItem) => void;
}

export interface ISearchResultHeaderState {
}

export class SearchResultHeaderState implements ISearchResultHeaderState {
  constructor() { }
}

export default class SearchResultHeader extends React.Component<ISearchResultHeaderProps, ISearchResultHeaderState> {
  private LOG_SOURCE: string = "SearchResultHeader";

  constructor(props) {
    super(props);
    this.state = new SearchResultHeaderState();
  }

  public shouldComponentUpdate(nextProps: Readonly<ISearchResultHeaderProps>, nextState: Readonly<ISearchResultHeaderState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<ISearchResultHeaderProps> {
    try {
      return (
        <div>
          <Pivot
            onLinkClick={this.props.selectTab}
          >
            {this.props.headerItems && this.props.headerItems.map((header) => {
              return (<PivotItem linkText={header} />);
            })}
          </Pivot>
        </div>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}