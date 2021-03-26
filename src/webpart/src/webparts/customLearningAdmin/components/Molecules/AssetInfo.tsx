import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash/isEqual";
import filter from "lodash/filter";
import includes from "lodash/includes";
import concat from "lodash/concat";
import uniqBy from "lodash/uniqBy";
import sortBy from "lodash/sortBy";
import find from "lodash/find";
import cloneDeep from "lodash/cloneDeep";
import forEach from "lodash/forEach";

import { Pivot, PivotItem, SearchBox, CommandBarButton } from "office-ui-fabric-react";

import * as strings from "M365LPStrings";
import AssetDetailsCommands from "../Atoms/AssetDetailsCommands";
import AssetDetails from "./AssetDetails";
import AssetSearchPanel from "./AssetSearchPanel";
import { IAsset, ITechnology, IPlaylist, IMultilingualString, Asset } from "../../../common/models/Models";
import { CustomWebpartSource, SearchFields } from "../../../common/models/Enums";

export interface IAssetInfoProps {
  editDisabled: boolean;
  assets: IAsset[];
  technologies: ITechnology[];
  playlist: IPlaylist;
  playlistDirty: (dirty: boolean) => void;
  updatePlaylist: (playlist: IPlaylist, save: boolean) => void;
  upsertAsset: (asset: IAsset) => Promise<string>;
  translateAsset: (asset: IAsset) => IAsset;
}

export interface IAssetInfoState {
  currentPivot: string;
  editAsset: IAsset;
  edit: boolean;
  message: string;
  success: boolean;
  playlistChanged: boolean;
  searchAsset: boolean;
  searchValue: string;
  searchResults: IAsset[];
}

export class AssetInfoState implements IAssetInfoState {
  constructor(
    public playlistChanged: boolean = false,
    public editAsset: IAsset = null,
    public edit: boolean = false,
    public message: string = "",
    public success: boolean = true,
    public searchAsset: boolean = false,
    public searchValue: string = "",
    public searchResults: IAsset[] = null,
    public currentPivot: string = "CurrentPlaylist"
  ) { }
}

export default class AssetInfo extends React.Component<IAssetInfoProps, IAssetInfoState> {
  private LOG_SOURCE: string = "AssetInfo";

  constructor(props) {
    super(props);
    this.state = new AssetInfoState();
  }

  public shouldComponentUpdate(nextProps: Readonly<IAssetInfoProps>, nextState: Readonly<IAssetInfoState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private moveAsset(array: string[], oldIndex, newIndex) {
    try {
      if (newIndex >= array.length) {
        var k = newIndex - array.length + 1;
        while (k--) {
          array.push(undefined);
        }
      }
      array.splice(newIndex, 0, array.splice(oldIndex, 1)[0]);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (moveAsset) - ${err}`, LogLevel.Error);
    }
  }

  private moveAssetUp = (index: number) => {
    try {
      let playlist = cloneDeep(this.props.playlist);
      this.moveAsset(playlist.Assets, index, index - 1);
      this.props.updatePlaylist(playlist, true);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (moveAssetUp) - ${err}`, LogLevel.Error);
    }
  }

  private moveAssetDown = (index: number) => {
    try {
      let playlist = cloneDeep(this.props.playlist);
      this.moveAsset(playlist.Assets, index, index + 1);
      this.props.updatePlaylist(playlist, true);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (moveAssetDown) - ${err}`, LogLevel.Error);
    }
  }

  private removeAsset = (index: number) => {
    try {
      let playlist = cloneDeep(this.props.playlist);
      playlist.Assets.splice(index, 1);
      this.props.updatePlaylist(playlist, true);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (removeAsset) - ${err}`, LogLevel.Error);
    }
  }

  private doSearch = (searchValue: string): void => {
    let searchResults: IAsset[] = [];
    try {
      if (searchValue.length > 0) {
        //Search Assets
        //Matching technologies and subjects
        let technologies: string[] = [];
        let subjects: string[] = [];
        forEach(this.props.technologies, (t) => {
          if (t.Name && t.Name.toLowerCase().indexOf(searchValue.toLowerCase()) > -1) {
            technologies.push(t.Id);
          }
          if (t.Subjects && t.Subjects.length > 0) {
            forEach(t.Subjects, (s) => {
              if (s.Name.toLowerCase().indexOf(searchValue.toLowerCase()) > -1) {
                subjects.push(s.Id);
              }
            });
          }
        });

        let spTech = filter(this.props.assets, o => {
          return (includes(technologies, o.TechnologyId));
        });
        searchResults = concat(searchResults, spTech);

        let spSub = filter(this.props.assets, o => {
          return (includes(subjects, o.SubjectId));
        });
        searchResults = concat(searchResults, spSub);

        //Matching search fields
        for (let i = 0; i < SearchFields.length; i++) {
          let sp = filter(this.props.assets, o => {
            if (o[SearchFields[i]] == undefined) return false;
            let fieldValue: string = null;
            if (o[SearchFields[i]] instanceof Array)
              fieldValue = (o[SearchFields[i]] as IMultilingualString[])[0].Text;
            else
              fieldValue = o[SearchFields[i]];
            return (fieldValue.toLowerCase().indexOf(searchValue.toLowerCase()) > -1);
          });
          searchResults = concat(searchResults, sp);
        }
        searchResults = uniqBy(searchResults, (r) => { return r.Id; });
        searchResults = sortBy(searchResults, (r) => {
          let title = (r.Title instanceof Array) ? (r.Title as IMultilingualString[])[0].Text : r.Title as string;
          return title.toLowerCase();
        });
      }
      this.setState({
        searchValue: searchValue,
        searchResults: searchResults,
        currentPivot: "SearchResults"
      });
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (doSearch) - ${err}`, LogLevel.Error);
    }
  }

  private insertAsset = (assetId: string) => {
    try {
      let playlist = cloneDeep(this.props.playlist);
      playlist.Assets.push(assetId);
      this.props.updatePlaylist(playlist, true);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (insertAsset) - ${err}`, LogLevel.Error);
    }
  }

  private upsertAsset = async (asset: IAsset): Promise<boolean> => {
    try {
      let newAsset = (asset.Id === "0");
      if (newAsset)
        this.props.playlistDirty(true);
      let assetResult = await this.props.upsertAsset(asset);
      let message: string = "";
      let success: boolean = true;
      if (assetResult !== "0") {
        if (newAsset) {
          this.insertAsset(assetResult);
        }
        //message = strings.PlaylistEditAssetSavedMessage;
      } else {
        if (newAsset)
          this.props.playlistDirty(false);
        message = strings.PlaylistEditAssetSaveFailedMessage;
        success = false;
      }
      this.setState({
        message: message,
        success: success
      }, () => {
        if (this.state.message.length > 0) {
          //Auto dismiss message
          window.setTimeout(() => {
            this.setState({
              message: "",
              success: true
            });
          }, 5000);
        }
      });
      return success;
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (upsertAsset) - ${err}`, LogLevel.Error);
      return false;
    }
  }

  private selectSearchAsset = async (assets: string[]) => {
    try {
      if (assets && assets.length > 0) {
        let playlist = cloneDeep(this.props.playlist);
        playlist.Assets = playlist.Assets.concat(assets);
        this.props.updatePlaylist(playlist, true);
        this.closeSearch();
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (selectSearchAsset) - ${err}`, LogLevel.Error);
    }
  }

  private closeSearch = () => {
    this.setState({
      searchValue: "",
      searchResults: [],
      searchAsset: false,
      currentPivot: "CurrentPlaylist"
    });
  }

  public render(): React.ReactElement<IAssetInfoProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE}>
          {!this.props.editDisabled &&
            <div className="cmdbar-beta">
              <CommandBarButton
                text={strings.PlaylistEditAssetNewLabel}
                iconProps={{ iconName: "Add" }}
                disabled={(this.props.playlist.Id === "0")}
                onClick={() => this.setState({ editAsset: new Asset(), edit: true })}
              />
              <SearchBox
                placeholder={strings.AssetSearchPlaceHolderLabel}
                onSearch={this.doSearch}
                onClear={() => { this.doSearch(""); }}
              />
            </div>
          }
          <Pivot selectedKey={this.state.currentPivot} onLinkClick={(i: PivotItem) => { this.setState({ currentPivot: i.props.itemKey }); }}>
            <PivotItem headerText={strings.HeaderPlaylistPanelCurrentPlaylistLabel} itemKey="CurrentPlaylist" key="CurrentPlaylist">
              {(this.state.editAsset && this.state.editAsset.Id === "0") &&
                <AssetDetails
                  technologies={this.props.technologies}
                  asset={this.state.editAsset}
                  cancel={() => { this.setState({ editAsset: null, edit: false }); }}
                  save={this.upsertAsset}
                  edit={true}
                />
              }
              {this.props.playlist.Assets && this.props.playlist.Assets.length > 0 && this.props.playlist.Assets.map((a, index) => {
                let asset = cloneDeep(find(this.props.assets, { Id: a }));
                if (asset.Source !== CustomWebpartSource.Tenant)
                  asset = this.props.translateAsset(asset);
                return (
                  <div className="learningwrapper">
                    <AssetDetailsCommands
                      assetIndex={index}
                      assetTotal={this.props.playlist.Assets.length - 1}
                      assetTitle={(asset.Title instanceof Array) ? (asset.Title as IMultilingualString[])[0].Text : asset.Title as string}
                      editDisabled={this.props.editDisabled || (asset && asset.Source !== CustomWebpartSource.Tenant) || (this.state.edit)}
                      allDisabled={this.props.editDisabled}
                      edit={() => { this.setState({ editAsset: asset, edit: true }); }}
                      moveUp={() => { this.moveAssetUp(index); }}
                      moveDown={() => { this.moveAssetDown(index); }}
                      remove={() => { this.removeAsset(index); }}
                      select={() => { this.setState({ editAsset: (this.state.editAsset === null) ? asset : null, edit: false }); }}
                    />
                    {this.state.editAsset && (this.state.editAsset.Id === asset.Id) &&
                      <AssetDetails
                        technologies={this.props.technologies}
                        asset={asset}
                        cancel={() => { this.setState({ editAsset: null, edit: false }); }}
                        save={this.upsertAsset}
                        edit={this.state.edit}
                      />
                    }
                  </div>
                );
              })}
            </PivotItem>
            {!this.props.editDisabled && (this.state.searchValue && this.state.searchValue.length > 0) &&
              <PivotItem headerText="Search Results" itemKey="SearchResults" key="SearchResults" >
                <AssetSearchPanel
                  allTechnologies={this.props.technologies}
                  searchResults={this.state.searchResults}
                  loadSearchResult={this.selectSearchAsset}
                />
              </PivotItem>
            }
          </Pivot>
        </div>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}