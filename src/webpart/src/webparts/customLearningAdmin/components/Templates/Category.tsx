import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash/isEqual";
import find from "lodash/find";
import findIndex from "lodash/findIndex";
import cloneDeep from "lodash/cloneDeep";
import filter from "lodash/filter";
import { MessageBar, MessageBarType, MessageBarButton } from 'office-ui-fabric-react';

import * as strings from "M365LPStrings";
import { ICategory, IPlaylist, IAsset, ITechnology, ICustomizations, IMetadataEntry, IMultilingualString, SubCat, IListing } from "../../../common/models/Models";
import CategoryHeading from "../Molecules/CategoryHeading";
import PlaylistItem from "../Atoms/PlaylistItem";
import { CustomWebpartSource } from "../../../common/models/Enums";
import PlaylistInfo from "../Organizms/PlaylistInfo";
import CategoryNav from "../Atoms/CategoryNav";

export interface ICategoryProps {
  className: string;
  customization: ICustomizations;
  categories: ICategory[];
  technologies: ITechnology[];
  playlists: IPlaylist[];
  assets: IAsset[];
  levels: IMetadataEntry[];
  audiences: IMetadataEntry[];
  updatePlaylistVisibility: (playlistId: string, exists: boolean) => void;
  upsertPlaylist: (playlist: IPlaylist) => Promise<string>;
  upsertAsset: (asset: IAsset) => Promise<string>;
  upsertSubCategory: (categoryId: string, heading: ICategory) => void;
  deletePlaylist: (playlistId: string) => void;
  updateSubcategory: (subCategory: string, exists: boolean) => void;
  deleteSubcategory: (categoryId: string, subCategoryId: string) => void;
  copyPlaylist: (playlist: IPlaylist) => Promise<string>;
  translatePlaylist: (playlist: IPlaylist) => IPlaylist;
  translateAsset: (asset: IAsset) => IAsset;
}

export interface ICategoryState {
  selectedCategoryId: string;
  selectedCategoryType: string;
  selectedCategory: ICategory;
  selectedSubCategory: ICategory;
  listings: IListing[];
  editDisabled: boolean;
  editPlaylistId: string;
  editPlaylistDirty: boolean;
  editRedirectSelected: ICategory | ICategory;
  message: string;
  success: boolean;
}

export class CategoryState implements ICategoryState {
  constructor(
    public selectedCategoryId: string = "",
    public selectedCategoryType: string = "",
    public selectedCategory: ICategory = null,
    public selectedSubCategory: ICategory = null,
    public listings: IListing[] = null,
    public editDisabled: boolean = false,
    public editPlaylistId: string = "",
    public editPlaylistDirty: boolean = false,
    public editRedirectSelected: ICategory | ICategory = null,
    public message: string = "",
    public success: boolean = true
  ) { }
}

export default class Category extends React.Component<ICategoryProps, ICategoryState> {
  private LOG_SOURCE: string = "Category";
  private _reInit: boolean = false;

  constructor(props) {
    super(props);
    this.state = new CategoryState();
  }

  public shouldComponentUpdate(nextProps: Readonly<ICategoryProps>, nextState: Readonly<ICategoryState>) {
    try {
      if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
        return false;
      if (!isEqual(nextProps.categories, this.props.categories) ||
        !isEqual(nextProps.playlists, this.props.playlists))
        this._reInit = true;
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (shouldComponentUpdate) - ${err}`, LogLevel.Error);
    }
    return true;
  }

  public componentDidUpdate() {
    try {
      if (this._reInit) {
        this._reInit = false;
        let selectedCategory = find(this.props.categories, { Id: this.state.selectedCategory.Id });
        if (!selectedCategory) {
          for (let i = 0; i < this.props.categories.length; i++) {
            for (let j = 0; j < this.props.categories[i].SubCategories.length; j++) {
              if (this.props.categories[i].SubCategories[j].Id === this.state.selectedCategory.Id) {
                selectedCategory = this.props.categories[i].SubCategories[j];
                break;
              }
            }
            if (selectedCategory)
              break;
          }
        }
        if (selectedCategory) {
          this.selectCategory(selectedCategory);
        } else {
          this.selectCategory(this.props.categories[0]);
        }
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (componentDidUpdate) - ${err}`, LogLevel.Error);
    }
  }

  private selectCategory = (selected: ICategory | ICategory): void => {
    try {
      let editPlaylistId = cloneDeep(this.state.editPlaylistId);
      let editPlaylistDirty = cloneDeep(this.state.editPlaylistDirty);
      if (this.state.editPlaylistDirty && this.state.editPlaylistId.length > 0) {
        this.setState({
          editRedirectSelected: selected
        });
        return;
      } else {
        editPlaylistId = "";
        editPlaylistDirty = false;
      }

      let selectedCategoryId: string;
      let selectedCategoryType: string = "SubCategory";
      for (let i = 0; i < this.props.categories.length; i++) {
        if (this.props.categories[i].Id === selected.Id) {
          selectedCategoryId = selected.Id;
          selectedCategoryType = "Category";
        }
      }
      if (!selectedCategoryId) {
        //Assume a subcategory and find parent
        for (let i = 0; i < this.props.categories.length; i++) {
          if (this.props.categories[i].SubCategories.length > 0) {
            for (let j = 0; j < this.props.categories[i].SubCategories.length; j++) {
              if (this.props.categories[i].SubCategories[j].Id === selected.Id) {
                selectedCategoryId = this.props.categories[i].Id;
              }
            }
          }
        }
      }
      //Create listing
      let listings: IListing[] = [];
      if (selected && selected.SubCategories.length > 0) {
        selected.SubCategories.forEach((sub) => {
          let l: IListing = { heading: sub, playlists: null };
          if (sub.SubCategories.length < 1) {
            l.playlists = filter(this.props.playlists, { CatId: sub.Id });
          }
          listings.push(l);
        });
      } else if (selected) {
        let l: IListing = { heading: selected, playlists: null };
        if (selected.SubCategories.length < 1) {
          l.playlists = filter(this.props.playlists, { CatId: selected.Id });
        }
        listings.push(l);
      }

      this.setState({
        selectedCategoryId: selectedCategoryId,
        selectedCategoryType: selectedCategoryType,
        selectedCategory: selected,
        listings: listings,
        editPlaylistId: editPlaylistId,
        editPlaylistDirty: editPlaylistDirty,
        editRedirectSelected: null
      });
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (selectCategory) - ${err}`, LogLevel.Error);
    }
  }

  private saveSubCategory = async (heading: ICategory): Promise<void> => {
    delete heading.Count;
    await this.props.upsertSubCategory(this.state.selectedCategoryId, heading);
  }

  private setEditPlaylistDirty = (dirty: boolean) => {
    this.setState({
      editPlaylistDirty: dirty
    });
  }

  private upsertPlaylist = async (playlist: IPlaylist): Promise<boolean> => {
    try {
      let newPlaylist = (playlist.Id === "0");
      let editPlaylistId = cloneDeep(this.state.editPlaylistId);
      let playlistResult = await this.props.upsertPlaylist(playlist);
      let message: string = "";
      let success: boolean = true;
      if (playlistResult !== "0") {
        if (newPlaylist)
          editPlaylistId = playlistResult;
        //message = strings.CategoryPlaylistSavedMessage;
      } else {
        message = strings.CategoryPlaylistSaveFailedMessage;
        success = false;
      }
      this.setState({
        editPlaylistId: editPlaylistId,
        editPlaylistDirty: false,
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
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (upsertPlaylist) - ${err}`, LogLevel.Error);
      return false;
    }
  }

  private editPlaylist = (subcategory: ICategory, editPlaylistId: string, editDisabled: boolean) => {
    try {
      let category = find(this.props.categories, (item) => { return findIndex(item.SubCategories, { Id: subcategory.Id }) > -1; });
      this.setState({
        editPlaylistId: editPlaylistId,
        editDisabled: editDisabled,
        selectedCategory: category,
        selectedSubCategory: subcategory
      });
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (editPlaylist) - ${err}`, LogLevel.Error);
    }
  }

  private deleteSubcategory = (listing: IListing) => {
    this.props.deleteSubcategory(this.state.selectedCategoryId, listing.heading.Id);
  }

  private copyPlaylist = async (playlist: IPlaylist): Promise<void> => {
    let copyPlaylist = await this.props.copyPlaylist(playlist);
    if (copyPlaylist != undefined) {
      this.setState({
        editPlaylistId: copyPlaylist,
        editDisabled: false
      });
    } else {
      this.setState({
        editPlaylistId: null,
        editPlaylistDirty: false,
        message: strings.CategoryCopyPlaylistFail,
        success: false
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
    }
  }

  public render(): React.ReactElement<ICategoryProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE} className={`adm-content ${this.props.className}`}>
          <div className="adm-navsection-subcat">
            <CategoryNav
              categories={this.props.categories}
              selectedId={(this.state.selectedCategory) ? this.state.selectedCategory.Id : ""}
              onClick={this.selectCategory}
            />
          </div>
          <div className="adm-content-main">
            {this.state.editPlaylistId === "" && this.state.listings && this.state.listings.length > 0 && this.state.listings.map((listing: IListing) => {
              return (
                <div>
                  <CategoryHeading
                    heading={listing.heading}
                    new={false}
                    canEdit={listing.heading.Source === CustomWebpartSource.Tenant}
                    visible={this.props.customization.HiddenSubCategories.indexOf(listing.heading.Id) < 0}
                    canDelete={!listing.playlists || listing.playlists.length < 1}
                    saveSubCategory={this.saveSubCategory}
                    addPlaylist={() => this.editPlaylist(listing.heading, "0", false)}
                    onVisibility={this.props.updateSubcategory}
                    onDelete={() => this.deleteSubcategory(listing)}
                  />
                  <ul className="adm-content-playlist">
                    {listing.playlists && listing.playlists.length > 0 && listing.playlists.map((playlist) => {
                      return (
                        <li>
                          <PlaylistItem
                            playlistId={playlist.Id}
                            playlistTitle={(playlist.Title instanceof Array) ? (playlist.Title as IMultilingualString[])[0].Text : playlist.Title as string}
                            playlistVisible={this.props.customization.HiddenPlaylistsIds.indexOf(playlist.Id) < 0}
                            playlistEditable={playlist.Source === CustomWebpartSource.Tenant}
                            onVisible={this.props.updatePlaylistVisibility}
                            onEdit={() => { this.editPlaylist(listing.heading, playlist.Id, (playlist.Source !== CustomWebpartSource.Tenant)); }}
                            onClick={() => { this.editPlaylist(listing.heading, playlist.Id, (playlist.Source !== CustomWebpartSource.Tenant)); }}
                            onMoveDown={() => { console.error("not implemented"); }}
                            onMoveUp={() => { console.error("not implemented"); }}
                            onDelete={() => { this.props.deletePlaylist(playlist.Id); }}
                          />
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
            {this.state.editPlaylistId === "" && this.state.selectedCategory && this.state.selectedCategoryType === "Category" && isNaN(+this.state.selectedCategoryId) &&
              <div>
                <CategoryHeading
                  heading={new SubCat()}
                  new={true}
                  visible={true}
                  canEdit={true}
                  canDelete={true}
                  saveSubCategory={this.saveSubCategory}
                  onVisibility={() => { }}
                  onDelete={() => { }}
                />
              </div>
            }
            {(this.state.message !== "") &&
              <MessageBar
                messageBarType={(this.state.success) ? MessageBarType.success : MessageBarType.error}
                isMultiline={false}
                onDismiss={() => { this.setState({ message: "", success: true }); }}
                dismissButtonAriaLabel={strings.CloseButton}>
                {this.state.message}
              </MessageBar>
            }
            {this.state.editRedirectSelected && this.state.editPlaylistDirty && this.state.editPlaylistId.length > 0 &&
              <MessageBar
                messageBarType={MessageBarType.blocked}
                actions={
                  <div>
                    <MessageBarButton onClick={() => { this.setState({ editPlaylistId: "", editPlaylistDirty: false }, () => { this.selectCategory(this.state.editRedirectSelected); }); }}>Yes</MessageBarButton>
                    <MessageBarButton onClick={() => { this.setState({ editRedirectSelected: null }); }}>No</MessageBarButton>
                  </div>
                }
              >
                <span>{(this.state.editPlaylistId === "0" ? strings.CategoryNewPlayListMessage : strings.CategoryEditedPlayListMessage)}</span>
              </MessageBar>
            }
            {this.state.editPlaylistId !== "" &&
              <PlaylistInfo
                playlists={this.props.playlists}
                assets={this.props.assets}
                categories={this.props.categories}
                technologies={this.props.technologies}
                levels={this.props.levels}
                audiences={this.props.audiences}
                playlistId={this.state.editPlaylistId}
                selectedCategory={this.state.selectedCategory}
                selectedSubCategory={this.state.selectedSubCategory}
                editDisabled={this.state.editDisabled}
                close={() => { this.setState({ editPlaylistId: "", editPlaylistDirty: false }); }}
                upsertAsset={this.props.upsertAsset}
                savePlaylist={this.upsertPlaylist}
                setEditPlaylistDirty={this.setEditPlaylistDirty}
                copyPlaylist={this.copyPlaylist}
                translatePlaylist={this.props.translatePlaylist}
                translateAsset={this.props.translateAsset}
              />
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
