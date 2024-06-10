import * as React from 'react';
import { Logger, LogLevel } from '@pnp/logging';

import cloneDeep from "lodash-es/cloneDeep";

import { IPlaylist, IHistoryItem, IAsset } from '../../../common/models/Models';
import { WebpartModeOptions } from '../../../common/models/Enums';
import { UXServiceContext } from '../../../common/services/UXService';
import HeaderToolbar from "../Atoms/HeaderToolbar";
import HeaderPanel from "../Organisms/HeaderPanel";

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
  webpartTitle: string;
  alwaysShowSearch: boolean;
}

export interface ILearningHeaderState {
  panelOpen: string;
}

export class LearningHeaderState implements ILearningHeaderState {
  constructor(
    public panelOpen: string = ""
  ) { }
}

export default class LearningHeader extends React.PureComponent<ILearningHeaderProps, ILearningHeaderState> {
  static contextType = UXServiceContext;

  private LOG_SOURCE: string = "LearningHeader";
  private _uxService: React.ContextType<typeof UXServiceContext>;

  constructor(props) {
    super(props);
    const panelOpen = (props.webpartMode === WebpartModeOptions.searchonly) ? "Search" : "";
    this.state = new LearningHeaderState(panelOpen);
  }

  public componentDidMount(): void {
    this._uxService = this.context;
  }

  private buttonClick = (buttonType: string): void => {
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
          />
          {(this._uxService.WebPartMode !== WebpartModeOptions.contentonly || this.props.alwaysShowSearch) &&
            <HeaderPanel
              panelOpen={this.state.panelOpen}
              closePanel={() => {this.setState({ panelOpen: "" });}}
              linkUrl={this.props.linkUrl}
              alwaysShowSearch={this.props.alwaysShowSearch}
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