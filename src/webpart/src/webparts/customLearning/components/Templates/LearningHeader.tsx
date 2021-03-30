import * as React from 'react';
import { Logger, LogLevel } from '@pnp/logging';

import isEqual from "lodash/isEqual";
import cloneDeep from "lodash/cloneDeep";
import { IPlaylist, IHistoryItem, IAsset, ISearchResult } from '../../../common/models/Models';
import HeaderToolbar from "../Atoms/HeaderToolbar";
import HeaderPanel from "../Organisms/HeaderPanel";
import { WebpartMode } from '../../../common/models/Enums';

export interface ILearningHeaderProps {
  template: string;
  detail: IPlaylist;
  history: IHistoryItem[];
  historyClick: (template: string, templateId: string, nav: boolean) => void;
  selectAsset: (assetId: string) => void;
  assets: IAsset[];
  currentAsset: IAsset;
  linkUrl: string;
  onAdminPlaylists: () => void;
  doSearch: (searchValue: string) => void;
  searchResults: ISearchResult[];
  loadSearchResult: (subcategoryId: string, playlistId: string, assetId: string) => void;
  webpartMode: string;
  webpartTitle: string;
}

export interface ILearningHeaderState {
  panelOpen: string;
}

export class LearningHeaderState implements ILearningHeaderState {
  constructor(
    public panelOpen: string = ""
  ) { }
}

export default class LearningHeader extends React.Component<ILearningHeaderProps, ILearningHeaderState> {
  private LOG_SOURCE: string = "LearningHeader";
  private _reInit: boolean = false;

  constructor(props) {
    super(props);
    this.state = new LearningHeaderState();
  }

  public shouldComponentUpdate(nextProps: Readonly<ILearningHeaderProps>, nextState: Readonly<ILearningHeaderState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    if (this.state.panelOpen) {
      this._reInit = true;
    }

    return true;
  }

  public componentDidUpdate() {
    //Close the panels for search, copy, and admin if they are open and you move pages
    if (this._reInit && (!this.props.searchResults || this.props.searchResults.length <= 0)) {
      this._reInit = false;
      this.buttonClick(this.state.panelOpen);
    }
  }

  private buttonClick = (buttonType: string) => {
    try {
      if (buttonType === "Gear") {
        this.props.onAdminPlaylists();
      } else {
        let panelOpen = cloneDeep(this.state.panelOpen);
        if (panelOpen === buttonType)
          panelOpen = "";
        else
          panelOpen = buttonType;

        this.setState({
          panelOpen: panelOpen
        });
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (buttonClick) - ${err}`, LogLevel.Error);
    }
  }

  private loadSearchResultClosePanel = (subcategoryId: string, playlistId: string, assetId: string) => {
    try {
      this.setState({ panelOpen: "" });
      this.props.loadSearchResult(subcategoryId, playlistId, assetId);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (loadSearchResultClosePanel) - ${err}`, LogLevel.Error);
    }
  }

  public render(): React.ReactElement<ILearningHeaderProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE} className="learningheader">
          <HeaderToolbar
            template={this.props.template}
            history={this.props.history}
            historyClick={this.props.historyClick}
            buttonClick={this.buttonClick}
            panelOpen={this.state.panelOpen}
            webpartMode={this.props.webpartMode}
          />
          {(this.props.webpartMode !== WebpartMode.contentonly) &&
            <HeaderPanel
              panelOpen={this.state.panelOpen}
              linkUrl={this.props.linkUrl}
              doSearch={this.props.doSearch}
              searchResults={this.props.searchResults}
              loadSearchResult={this.loadSearchResultClosePanel}
            />
          }
        </div>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }

}