import HOOPivotBar, { IHOOPivotItem } from "@n8d/htwoo-react/HOOPivotBar";
import { Logger, LogLevel } from "@pnp/logging";
import * as React from "react";

export interface ISearchResultHeaderProps {
  headerItems: IHOOPivotItem[];
  filterValue: string | number;
  searchValue: string;
  selectTab: (ev: React.MouseEvent, key: string | number) => void;
}

export default class SearchResultHeader extends React.PureComponent<ISearchResultHeaderProps> {
  private LOG_SOURCE: string = "SearchResultHeader";

  constructor(props) {
    super(props);
  }

  public render(): React.ReactElement<ISearchResultHeaderProps> {
    try {
      return (
        <HOOPivotBar
          onClick={this.props.selectTab}
          pivotItems={this.props.headerItems}
          selectedKey={this.props.filterValue}
          hasOverflow={true}
        />
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}