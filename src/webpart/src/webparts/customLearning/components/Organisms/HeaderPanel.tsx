import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash/isEqual";
import { ISearchResult } from "../../../common/models/Models";
import LinkPanel from "../Atoms/LinkPanel";
import SearchPanel from "../Atoms/SearchPanel";

export interface IHeaderPanelProps {
  panelOpen: string;
  linkUrl: string;
  searchResults: ISearchResult[];
  doSearch: (searchValue: string) => void;
  loadSearchResult: (subcategoryId: string, playlistId: string, assetId: string) => void;
}

export interface IHeaderPanelState { }

export class HeaderPanelState implements IHeaderPanelState {
  constructor() { }
}

export default class HeaderPanel extends React.Component<IHeaderPanelProps, IHeaderPanelState> {
  private LOG_SOURCE: string = "HeaderPanel";

  constructor(props) {
    super(props);
    this.state = new HeaderPanelState();
  }

  public shouldComponentUpdate(nextProps: Readonly<IHeaderPanelProps>, nextState: Readonly<IHeaderPanelState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public componentDidUpdate() {
    try {
      if (this.props.panelOpen !== "Search" && (this.props.searchResults.length > 0)) {
        this.props.doSearch("");
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (componentDidUpdate) - ${err}`, LogLevel.Error);
    }
  }

  public render(): React.ReactElement<IHeaderPanelProps> {
    try {
      let element: any;
      switch (this.props.panelOpen) {
        case "Link":
          element = <LinkPanel
            panelOpen={this.props.panelOpen}
            linkUrl={this.props.linkUrl} />;
          break;
        case "Search":
          element = <SearchPanel
            panelOpen={this.props.panelOpen}
            doSearch={this.props.doSearch}
            searchResults={this.props.searchResults}
            loadSearchResult={this.props.loadSearchResult} />;
          break;
        default:
          element = null;
      }
      return (
        element
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}
