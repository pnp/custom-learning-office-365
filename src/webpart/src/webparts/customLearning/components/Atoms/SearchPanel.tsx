import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash-es/isEqual";
import { IHOOPivotItem } from "@n8d/htwoo-react/HOOPivotBar";
import HOOSearch from "@n8d/htwoo-react/HOOSearch";

import SearchResults from "../../../common/components/Molecules/SearchResults";
import { ISearchResult } from "../../../common/models/Models";
import * as strings from "M365LPStrings";
import { SearchResultHeaderFilters, SearchResultView } from "../../../common/models/Enums";


export interface ISearchPanelProps {
  panelOpen: string;
  doSearch: (serachValue: string) => void;
  searchResults: ISearchResult[];
  loadSearchResult: (subcategoryId: string, playlistId: string, assetId: string) => void;
}

export interface ISearchPanelState {
  searchValue: string;
}

export class SearchPanelState implements ISearchPanelState {
  constructor(
    public searchValue: string = ""
  ) { }
}

export default class SearchPanel extends React.Component<ISearchPanelProps, ISearchPanelState> {
  private LOG_SOURCE: string = "SearchPanel";
  private _headerItems: IHOOPivotItem[] = [{ key: SearchResultHeaderFilters.All, text: SearchResultHeaderFilters.All }, { key: SearchResultHeaderFilters.Playlists, text: SearchResultHeaderFilters.Playlists }, { key: SearchResultHeaderFilters.Assets, text: SearchResultHeaderFilters.Assets }];

  constructor(props) {
    super(props);
    this.state = new SearchPanelState();
  }

  // TODO Check and see if we need this
  // public componentDidMount() {
  //   try {
  //     if (this.props.panelOpen && this.props.searchResults.length < 1)
  //       this.searchInput.focus();
  //   } catch (err) {
  //     Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (componentDidMount) - ${err}`, LogLevel.Error);
  //   }
  // }

  public shouldComponentUpdate(nextProps: Readonly<ISearchPanelProps>, nextState: Readonly<ISearchPanelState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public componentDidUpdate() {
    try {
      if (this.props.panelOpen !== "Search" && (this.props.searchResults.length > 0)) {
        this.setState({ searchValue: "" });
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (componentDidUpdate) - ${err}`, LogLevel.Error);
    }
  }

  private executeSearch = (searchValue: string) => {
    try {
      this.setState({ searchValue: searchValue });
      this.props.doSearch(searchValue);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (executeSearch) - ${err}`, LogLevel.Error);
    }
  }

  private onSearchChange = async (ev: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    try {
      const search: string = ev.currentTarget.value;
      this.executeSearch(search);
    } catch (err) {
      console.error(`🎓 M365LP:${this.LOG_SOURCE} (onSearchChange) - ${err}`);
    }
  }

  public render(): React.ReactElement<ISearchPanelProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE} className={`headerpanel fbcolumn ${(this.props.panelOpen.length > 0) ? "show" : ""}`}>
          <HOOSearch
            onChange={this.onSearchChange}
            onSearch={this.executeSearch}
            placeholder={strings.SearchPanelPlaceHolderLabel}
            value={this.state.searchValue}
            disabled={false} />
          <div className="srch-result">
            {this.props.searchResults.length > 0 && (this.props.searchResults[0].Result.Id !== "0") &&
              <SearchResults
                resultView={SearchResultView.Full}
                headerItems={this._headerItems}
                searchValue={this.state.searchValue}
                searchResults={this.props.searchResults}
                loadSearchResult={this.props.loadSearchResult}
              />
            }
            {this.props.searchResults.length > 0 && (this.props.searchResults[0].Result.Id === "0") &&
              <p>{this.props.searchResults[0].Result.Title}</p>
            }
          </div>
        </div>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}
