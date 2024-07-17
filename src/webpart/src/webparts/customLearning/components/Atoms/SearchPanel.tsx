import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import { IHOOPivotItem } from "@n8d/htwoo-react/HOOPivotBar";
import HOOSearch from "@n8d/htwoo-react/HOOSearch";

import SearchResults from "../../../common/components/Molecules/SearchResults";
import { ISearchResult } from "../../../common/models/Models";
import * as strings from "M365LPStrings";
import { SearchResultHeaderFilters, SearchResultView } from "../../../common/models/Enums";
import { UXServiceContext } from '../../../common/services/UXService';

export interface ISearchPanelProps {
  panelOpen: boolean;
  closePanel: () => void;
}

export interface ISearchPanelState {
  searchValue: string;
  searchResults: ISearchResult[];
}

export class SearchPanelState implements ISearchPanelState {
  constructor(
    public searchValue: string = "",
    public searchResults: ISearchResult[] = []
  ) { }
}

export default class SearchPanel extends React.PureComponent<ISearchPanelProps, ISearchPanelState> {
  static contextType = UXServiceContext;

  private LOG_SOURCE: string = "SearchPanel";
  private _uxService: React.ContextType<typeof UXServiceContext>;
  private _timeOutId: NodeJS.Timeout;
  private _headerItems: IHOOPivotItem[] = [{ key: SearchResultHeaderFilters.All, text: SearchResultHeaderFilters.All }, { key: SearchResultHeaderFilters.Playlists, text: SearchResultHeaderFilters.Playlists }, { key: SearchResultHeaderFilters.Assets, text: SearchResultHeaderFilters.Assets }];

  constructor(props) {
    super(props);
    this.state = new SearchPanelState();
  }

  private _reInit = (): void => {
    this.render();
  }

  private _debounceTypeahead = (fn: () => void, delay: number): void => {
    try {
      if (this._timeOutId) {
        clearTimeout(this._timeOutId);
      }
      this._timeOutId = setTimeout(() => {
        fn();
      }, delay);
    } catch (err) {
      console.error(`err - ${this.LOG_SOURCE} (_debounceTypeahead)`);
    }
  }

  private executeSearch = (searchValue: string, enter: boolean): void => {
    try {
      if (!enter) {
        this.setState({ searchValue }, () => {
          if (searchValue.length > 0) {
            this._debounceTypeahead(() => {
              const searchResults = this._uxService.DoSearch(searchValue);
              this.setState({ searchResults });
            }, 500);
          } else {
            this.setState({ searchResults: [] });
          }
        });
      } else {
        if (searchValue.length > 0) {
          const searchResults = this._uxService.DoSearch(searchValue);
          this.setState({ searchResults });
        } else {
          this.setState({ searchResults: [] });
        }
      }

    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (executeSearch) - ${err}`, LogLevel.Error);
    }
  }

  private _loadSearchResult = (subcategoryId: string, playlistId: string, assetId: string): void => {
    try {
      this._uxService.LoadSearchResultAsset(subcategoryId, playlistId, assetId);
      this.props.closePanel();
      this.setState({ searchValue: "", searchResults: [] });
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (_loadSearchResult) - ${err}`);
    }
  }

  public render(): React.ReactElement<ISearchPanelProps> {
    if (this._uxService == undefined) {
      this._uxService = this.context;
      const renderFunction = {};
      renderFunction[this.LOG_SOURCE] = this._reInit;
      this._uxService.FCLWPRender = renderFunction;
    }
    try {
      return (
        <div data-component={this.LOG_SOURCE} className={`headerpanel fbcolumn ${(this.props.panelOpen) ? "show" : ""}`}>
          <HOOSearch
            placeholder={strings.SearchPanelPlaceHolderLabel}
            value={this.state.searchValue}
            disabled={false}
            onChange={(event) => this.executeSearch(event.target.value, false)}
            onSearch={newValue => this.executeSearch(newValue, true)} />
          <div className="srch-result">
            {this.state.searchResults.length > 0 && (this.state.searchResults[0].Result.Id !== "0") &&
              <SearchResults
                resultView={SearchResultView.Full}
                headerItems={this._headerItems}
                searchValue={this.state.searchValue}
                searchResults={this.state.searchResults}
                loadSearchResult={this._loadSearchResult}
              />
            }
            {this.state.searchResults.length > 0 && (this.state.searchResults[0].Result.Id === "0") &&
              <p>{this.state.searchResults[0].Result.Title}</p>
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
