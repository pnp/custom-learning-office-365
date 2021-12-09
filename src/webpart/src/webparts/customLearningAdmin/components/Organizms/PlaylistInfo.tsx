import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash/isEqual";
import find from "lodash/find";
import cloneDeep from "lodash/cloneDeep";

import { MessageBar, MessageBarType, ActionButton } from "office-ui-fabric-react";

import * as strings from "M365LPStrings";
import { params } from "../../../common/services/Parameters";
import { IPlaylist, Playlist, IAsset, ICategory, ITechnology, IMetadataEntry, IMultilingualString } from "../../../common/models/Models";
import { CustomWebpartSource } from "../../../common/models/Enums";
import PlaylistDetails from "../Molecules/PlaylistDetails";
import AssetInfo from "../Molecules/AssetInfo";

export interface IPlaylistInfoProps {
  playlists: IPlaylist[];
  assets: IAsset[];
  categories: ICategory[];
  technologies: ITechnology[];
  levels: IMetadataEntry[];
  audiences: IMetadataEntry[];
  playlistId: string;
  selectedCategory: ICategory;
  selectedSubCategory: ICategory;
  editDisabled: boolean;
  close: () => void;
  upsertAsset: (asset: IAsset) => Promise<string>;
  savePlaylist: (playlist: IPlaylist) => Promise<boolean>;
  setEditPlaylistDirty: (dirty: boolean) => void;
  copyPlaylist: (playlist: IPlaylist) => Promise<void>;
  translatePlaylist: (playlist: IPlaylist) => IPlaylist;
  translateAsset: (asset: IAsset) => IAsset;
}

export interface IPlaylistInfoState {
  edit: boolean;
  playlist: IPlaylist;
  editAssetId: string;
  message: string;
  success: boolean;
  playlistChanged: boolean;
  searchAsset: boolean;
  searchValue: string;
  searchResults: IAsset[];
  editAsset: boolean;
  currentPivot: string;
}

export class PlaylistInfoState implements IPlaylistInfoState {
  constructor(
    public playlist: IPlaylist = null,
    public edit: boolean = false,
    public playlistChanged: boolean = false,
    public editAssetId: string = "",
    public message: string = "",
    public success: boolean = true,
    public searchAsset: boolean = false,
    public searchValue: string = "",
    public searchResults: IAsset[] = null,
    public editAsset: boolean = false,
    public currentPivot: string = "CurrentPlaylist"
  ) { }
}

export default class PlaylistInfo extends React.Component<IPlaylistInfoProps, IPlaylistInfoState> {
  private LOG_SOURCE: string = "PlaylistInfo";
  private _reInit: boolean = false;

  constructor(props) {
    super(props);
    try {
      let playlist: IPlaylist;
      if (this.props.playlistId === "0") {
        playlist = new Playlist();
        (playlist.Image as IMultilingualString[])[0].Text = params.baseCdnPlaylistImage;
        playlist.CatId = props.selectedSubCategory.Id;
      } else {
        playlist = cloneDeep(find(this.props.playlists, { Id: this.props.playlistId }));
        if (!playlist) {
          playlist = new Playlist();
          (playlist.Image as IMultilingualString[])[0].Text = params.baseCdnPlaylistImage;
        }
        if (playlist.Source !== CustomWebpartSource.Tenant) {
          playlist = props.translatePlaylist(playlist);
        }
      }
      this.state = new PlaylistInfoState(
        playlist,
        (this.props.playlistId === "0") ? true : false,
        (this.props.playlistId === "0") ? true : false
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (constructor) - ${err}`, LogLevel.Error);
    }
  }

  public init = (): void => {
    try {
      let playlist: IPlaylist;
      if (this.props.playlistId === "0") {
        playlist = new Playlist();
      } else {
        playlist = cloneDeep(find(this.props.playlists, { Id: this.props.playlistId }));
        if (!playlist)
          playlist = new Playlist();
      }
      this.setState({
        playlist: playlist,
        edit: (this.props.playlistId === "0") ? true : false,
        playlistChanged: (this.props.playlistId === "0") ? true : false
      });
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (init) - ${err}`, LogLevel.Error);
    }
  }

  public shouldComponentUpdate(nextProps: Readonly<IPlaylistInfoProps>, nextState: Readonly<IPlaylistInfoState>) {
    try {
      if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
        return false;
      if (nextProps.playlistId !== this.props.playlistId)
        this._reInit = true;
      if (nextState.playlistChanged !== this.state.playlistChanged)
        this.props.setEditPlaylistDirty(nextState.playlistChanged);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (shouldComponentUpdate) - ${err}`, LogLevel.Error);
    }
    return true;
  }

  public componentDidUpdate() {
    if (this._reInit) {
      this._reInit = false;
      this.init();
    }
  }

  private updatePlaylist = (newPlaylist: IPlaylist, save: boolean = false) => {
    try {
      this.setState({
        playlist: newPlaylist,
        playlistChanged: true
      }, () => {
        if (save)
          this.savePlaylist();
      });

    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (updatePlaylist) - ${err}`, LogLevel.Error);
    }
  }

  private savePlaylist = async () => {
    try {
      if (this.props.savePlaylist(this.state.playlist)) {
        this.setState({
          playlistChanged: false,
          edit: false
        });
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (savePlaylist) - ${err}`, LogLevel.Error);
    }
  }

  private playlistValid(): boolean {
    let valid = true;
    try {
      if (this.state.playlist.Title instanceof Array) {
        if (((this.state.playlist.Title as IMultilingualString[])[0].Text.length < 1) ||
          ((this.state.playlist.Description as IMultilingualString[])[0].Text.length < 1) ||
          ((this.state.playlist.Image as IMultilingualString[])[0].Text.length < 1) ||
          (this.state.playlist.CatId.length < 1)
        )
          valid = false;
      } else {
        if (((this.state.playlist.Title as string).length < 1) ||
          ((this.state.playlist.Description as string).length < 1) ||
          ((this.state.playlist.Image as string).length < 1) ||
          (this.state.playlist.CatId.length < 1)
        )
          valid = false;
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (playlistValid) - ${err}`, LogLevel.Error);
    }

    return valid;
  }

  private playlistHeader = () => {
    let header: string = "";
    try {
      if (this.state.playlist.Id === "0") {
        header = strings.PlaylistEditCreatePlaylistHeader;
      } else {
        let title = (this.state.playlist.Title instanceof Array) ? (this.state.playlist.Title as IMultilingualString[])[0].Text : this.state.playlist.Title as string;
        header = `${strings.PlaylistEditPlaylistDetailsHeader} ${title}`;
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (playlistHeader) - ${err}`, LogLevel.Error);
    }
    return header;
  }

  private renderPlaylistButtons = () => {
    let retVal = [];
    try {
      let copy = <ActionButton iconProps={{ iconName: 'Copy' }} text={strings.PlaylistEditCopyLabel} onClick={() => this.props.copyPlaylist(this.state.playlist)} disabled={false} />;
      let close = <ActionButton iconProps={{ iconName: 'ChromeClose' }} text={strings.PlaylistEditCloseLabel} onClick={this.props.close} />;

      if (!this.props.editDisabled) {
        if (!this.state.edit) {
          retVal.push(copy);
          retVal.push(close);
        } else {
          if (this.props.playlistId === "0") {
            retVal.push(close);
          }
        }
      } else {
        if (!this.state.edit) {
          retVal.push(copy);
        }
        retVal.push(close);
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (renderPlaylistButtons) - ${err}`, LogLevel.Error);
    }
    return retVal;
  }

  public render(): React.ReactElement<IPlaylistInfoProps> {
    try {
      let playlistButtons = this.renderPlaylistButtons();
      return (
        <>
          <div data-component={this.LOG_SOURCE} className="adm-content-section">
            <h2>{this.playlistHeader()}</h2>
            <div className={`adm-itemaction ${(playlistButtons.length < 1) ? "hidden" : ""}`}>
              {playlistButtons}
            </div>
            <PlaylistDetails
              playlist={this.state.playlist}
              categories={this.props.categories}
              technologies={this.props.technologies}
              levels={this.props.levels}
              audiences={this.props.audiences}
              updatePlaylist={this.updatePlaylist}
              editMode={this.state.edit}
              cancel={() => { this.init(); }}
              dirty={this.state.playlistChanged}
              valid={this.playlistValid()}
              edit={() => { this.setState({ edit: true }); }}
            />
          </div>
          <div data-component={this.LOG_SOURCE} className="adm-content-section">
            <h2>{strings.PlaylistEditPlaylistAssetsHeader}</h2>
            {(this.state.message !== "") &&
              <MessageBar
                messageBarType={(this.state.success) ? MessageBarType.success : MessageBarType.error}
                isMultiline={false}
                onDismiss={() => { this.setState({ message: "", success: true }); }}
                dismissButtonAriaLabel={strings.CloseButton}>
                {this.state.message}
              </MessageBar>
            }
            <AssetInfo
              editDisabled={this.props.editDisabled}
              assets={this.props.assets}
              technologies={this.props.technologies}
              playlist={this.state.playlist}
              playlistDirty={this.props.setEditPlaylistDirty}
              updatePlaylist={this.updatePlaylist}
              upsertAsset={this.props.upsertAsset}
              translateAsset={this.props.translateAsset}
            />
          </div>
        </>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}
