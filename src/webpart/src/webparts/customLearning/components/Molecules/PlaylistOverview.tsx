import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash/isEqual";
import { IAsset, IMultilingualString } from "../../../common/models/Models";
import AssetItem from "../Atoms/AssetItem";
import * as strings from "M365LPStrings";

export interface IPlaylistOverviewProps {
  playlistAssets: IAsset[];
  currentAssetId: string;
  assetClick: (assetId: string) => void;
}

export interface IPlaylistOverviewState {
}

export class PlaylistOverviewState implements IPlaylistOverviewState {
  constructor() { }
}

export default class PlaylistOverview extends React.Component<IPlaylistOverviewProps, IPlaylistOverviewState> {
  private LOG_SOURCE: string = "PlaylistOverview";

  constructor(props) {
    super(props);
    this.state = new PlaylistOverviewState();
  }

  public shouldComponentUpdate(nextProps: Readonly<IPlaylistOverviewProps>, nextState: Readonly<IPlaylistOverviewState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<IPlaylistOverviewProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE} className="plov">
          {this.props.playlistAssets && this.props.playlistAssets.length > 0 && this.props.playlistAssets.map((a, index) => {
            return (
              <AssetItem
                assetTitle={(a.Title instanceof Array) ? (a.Title as IMultilingualString[])[0].Text : a.Title as string}
                onClick={() => { this.props.assetClick(a.Id); }}
              />
            );
          })}
          {!this.props.playlistAssets &&
            <h3>{strings.PlaylistOverviewDesignMessage}</h3>
          }
        </div>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}