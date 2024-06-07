import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import HOOPivotBar, { IHOOPivotItem } from "@n8d/htwoo-react/HOOPivotBar";

import isEqual from "lodash-es/isEqual";

export interface ISearchResultHeaderProps {
  headerItems: IHOOPivotItem[];
  filterValue: string | number;
  searchValue: string;
  selectTab: (ev: React.MouseEvent, key: string | number) => void;
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

  public shouldComponentUpdate(nextProps: Readonly<ISearchResultHeaderProps>, nextState: Readonly<ISearchResultHeaderState>): boolean {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<ISearchResultHeaderProps> {
    try {
      return (
        <HOOPivotBar
          onClick={this.props.selectTab}
          pivotItems={this.props.headerItems}
          selectedKey={this.props.filterValue}
        />
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}