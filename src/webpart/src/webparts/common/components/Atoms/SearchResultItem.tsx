import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash/isEqual";
import { ICategory, IPlaylist, ISearchResult } from "../../models/Models";
import { Templates, SearchResultView } from "../../models/Enums";
import * as strings from "M365LPStrings";

export interface ISearchResultItemProps {
  result: ISearchResult;
  resultView: string;
  loadSearchResult: (subcategoryId: string, playlistId: string, assetId: string) => void;
}

export interface ISearchResultItemState {
}

export class SearchResultItemState implements ISearchResultItemState {
  constructor() { }
}

export default class SearchResultItem extends React.Component<ISearchResultItemProps, ISearchResultItemState> {
  private LOG_SOURCE: string = "SearchResultItem";

  constructor(props) {
    super(props);
    this.state = new SearchResultItemState();
  }

  public shouldComponentUpdate(nextProps: Readonly<ISearchResultItemProps>, nextState: Readonly<ISearchResultItemState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<ISearchResultItemProps> {
    try {
      return (
        <div>
          {(this.props.result.Type === Templates.Asset) &&
            <div className="plov-item plov-noimg">
              <div className="plov-desc">
                <h3 className="plov-title" onClick={() => { this.props.loadSearchResult(null, this.props.result.Parent ? this.props.result.Parent.Id : null, this.props.result.Result.Id); }}>{this.props.result.Result.Title}</h3>
                {this.props.resultView === SearchResultView.Full &&
                  <div className="plov-audience">
                    <span>{strings.SearchResultItemPlayListLabel}</span>
                    <span className="plov-title" onClick={() => { this.props.loadSearchResult(null, this.props.result.Parent.Id, null); }}>{(this.props.result.Parent as IPlaylist).Title}</span>
                  </div>
                }
              </div>
            </div>
          }
          {(this.props.result.Type === Templates.Playlist) &&
            <div className="plov-item plov-noimg">
              <div className="plov-desc">
                <h3 className="plov-title" onClick={() => { this.props.loadSearchResult(this.props.result.Parent ? this.props.result.Parent.Id : null, this.props.result.Result.Id, null); }}>{this.props.result.Result.Title}</h3>
                {this.props.resultView !== SearchResultView.Minimal &&
                  <p className="plov-short">{(this.props.result.Result as IPlaylist).Description}</p>
                }
                {this.props.resultView === SearchResultView.Full &&
                  <div className="plov-audience">
                    <span>{strings.SearchResultItemCategoryLabel}</span>
                    <span className="plov-title" onClick={() => { this.props.loadSearchResult(this.props.result.Parent.Id, null, null); }}>{(this.props.result.Parent as ICategory).Name}</span>
                  </div>
                }
              </div>
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