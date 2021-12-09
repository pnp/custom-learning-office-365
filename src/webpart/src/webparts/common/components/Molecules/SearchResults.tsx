import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash/isEqual";
import filter from "lodash/filter";

import { PivotItem } from 'office-ui-fabric-react';
import { ISearchResult } from "../../models/Models";
import SearchResultItem from "../Atoms/SearchResultItem";
import { Templates, SearchResultHeaderFilters } from "../../models/Enums";
import SearchResultHeader from "../Atoms/SearchResultHeader";
import Paging from "../Atoms/Paging";

export interface ISearchResultsProps {
  headerItems: string[];
  resultView: string;
  searchValue: string;
  searchResults: ISearchResult[];
  loadSearchResult: (subcategoryId: string, playlistId: string, assetId: string) => void;
}

export interface ISearchResultsState {
  filterValue: string;
  currentPage: number;
}

export class SearchResultsState implements ISearchResultsState {
  constructor(
    public pages: number = 0,
    public currentPage: number = 0,
    public filterValue: string = "All"
  ) { }
}

export default class SearchResults extends React.Component<ISearchResultsProps, ISearchResultsState> {
  private LOG_SOURCE: string = "SearchResults";
  private _searchChanged: boolean = false;
  private _pageSize: number = 10;

  constructor(props) {
    super(props);
    this.state = new SearchResultsState();
  }

  public shouldComponentUpdate(nextProps: Readonly<ISearchResultsProps>, nextState: Readonly<ISearchResultsState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    if (!isEqual(nextProps.searchResults, this.props.searchResults))
      this._searchChanged = true;
    return true;
  }

  public componentDidUpdate() {
    if (this._searchChanged) {
      this._searchChanged = false;
      this.setState({
        currentPage: 0
      });
    }
  }

  private changeFilter = (newFilter: PivotItem) => {
    this.setState({
      filterValue: newFilter.props.linkText
    });
  }

  public render(): React.ReactElement<ISearchResultsProps> {
    try {
      let pages = 0;
      let filterResults = this.props.searchResults;
      if (this.state.filterValue !== SearchResultHeaderFilters.All) {
        if (this.state.filterValue == SearchResultHeaderFilters.Assets) {
          filterResults = filter(filterResults, { Type: Templates.Asset });
        } else if (this.state.filterValue == SearchResultHeaderFilters.Playlists) {
          filterResults = filter(filterResults, { Type: Templates.Playlist });
        }
      }
      //Add results paging
      let pageResults: ISearchResult[];
      if (filterResults.length >= this._pageSize) {
        pages = Math.ceil(filterResults.length / this._pageSize) - 1;
        pageResults = filterResults.slice((this.state.currentPage * this._pageSize), (this.state.currentPage * this._pageSize) + this._pageSize);
      } else {
        pageResults = filterResults;
      }
      return (
        <div>
          <SearchResultHeader
            headerItems={this.props.headerItems}
            searchValue={this.props.searchValue}
            selectTab={this.changeFilter}
          />
          {pageResults && pageResults.length > 0 && pageResults.map((result) => {
            return (
              <SearchResultItem
                resultView={this.props.resultView}
                result={result}
                loadSearchResult={this.props.loadSearchResult}
              />
            );
          })}
          <Paging
            pages={pages}
            currentPage={this.state.currentPage}
            changePage={(newPage) => { this.setState({ currentPage: newPage }); }}
          />
        </div>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}