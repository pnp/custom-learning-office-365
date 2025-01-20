import * as React from 'react';
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash-es/isEqual";
import find from "lodash-es/find";
import findIndex from "lodash-es/findIndex";
import includes from "lodash-es/includes";
import cloneDeep from "lodash-es/cloneDeep";
import filter from "lodash-es/filter";
import indexOf from "lodash-es/indexOf";
import forEach from "lodash-es/forEach";
import HOODialog from '@n8d/htwoo-react/HOODialog';
import HOODialogHeader from '@n8d/htwoo-react/HOODialogHeader';
import HOODialogContent from '@n8d/htwoo-react/HOODialogContent';

import styles from "../../common/CustomLearningCommon.module.scss";
import * as strings from "M365LPStrings";
import { params } from "../../common/services/Parameters";
import { IPlaylist, ICategory, IHistoryItem, HistoryItem, IAsset, IFilterValue, IFilter, FilterValue, Filter, IMultilingualString } from '../../common/models/Models';
import { Templates, FilterTypes, WebPartModeOptions } from '../../common/models/Enums';
import Categories from './Organisms/Categories';
import SubCategories from './Templates/SubCategories';
import LearningHeader from './Templates/LearningHeader';
import AssetView from './Atoms/AssetView';
import PlaylistControl from "./Molecules/PlaylistControl";
import { UXServiceContext } from '../../common/services/UXService';

export interface ICustomLearningProps {
  webpartTitle: string;
  teamsEntityId: string;
  alwaysShowSearch: boolean;
  openAssetsInDialog: boolean;
  defaultWebPartHeight: string;

}

export interface ICustomLearningState {
  template: string;
  templateId: string;
  parent: ICategory;
  detail: ICategory[] | IPlaylist[] | IPlaylist;
  assets: IAsset[];
  currentAsset: IAsset;
  filterValue: IFilter;
  filterValues: IFilterValue[];
  url: string;
  renderPanel: boolean;
  fullSizeAsset: boolean;
}

export class CustomLearningState implements ICustomLearningState {
  constructor(
    public template: string = "",
    public templateId: string = "",
    public parent: ICategory = null,
    public detail: ICategory[] | IPlaylist[] | IPlaylist = null,
    public assets: IAsset[] = null,
    public currentAsset: IAsset = null,
    public history: IHistoryItem[] = [],
    public filterValue: IFilter = new Filter(),
    public filterValues: IFilterValue[] = [],
    public url: string = "",
    public renderPanel: boolean = false,
    public fullSizeAsset: boolean = false
  ) { }
}

export default class CustomLearning extends React.Component<ICustomLearningProps, ICustomLearningState> {
  static contextType = UXServiceContext;

  private LOG_SOURCE: string = "CustomLearning";
  private _uxService: React.ContextType<typeof UXServiceContext>;

  private teamsContext: boolean = false;
  private teamsContextUrl: string = "";

  constructor(props) {
    super(props);
    this.state = new CustomLearningState();
    this.teamsContext = props.teamsEntityId && props.teamsEntityId.length > 0;

    if (this.teamsContext)
      this.teamsContextUrl = `https://teams.microsoft.com/l/entity/141d4ab7-b6ca-4bf4-ac59-25b7bf93642d/${props.teamsEntityId}?context={"subEntityId":`;
  }

  public componentDidMount(): void {
    this._init();
    this._loadDetail(this._uxService.WebPartStartup.startingType, this._uxService.WebPartStartup.startingLocation);
  }

  private _init(): void {
    this._uxService.FShowSearchResults = this._loadSearchResultAsset;
    this._uxService.FShowHistory = this._showHistory;
    const renderFunction = {};
    renderFunction[this.LOG_SOURCE] = this._reInit;
    this._uxService.FCLWPRender = renderFunction;
    if (this._uxService.WebPartMode === WebPartModeOptions.contentonly) { return; }
    try {
      //If startLocation is specified then pin starting location as root menu item
      //else, pin 'Home' as root menu location
      if (this._uxService.WebPartStartup.startingLocation.length < 1) {
        //During constructor, update state directly.
        this._uxService.History.push(new HistoryItem("", strings.NavigationHome, ""));
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (_init) - ${err}`, LogLevel.Error);
    }
  }

  private _reInit = (): void => {
    try {
      this._loadDetail(this._uxService.WebPartStartup.startingType, this._uxService.WebPartStartup.startingLocation);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (_reInitF) - ${err}`, LogLevel.Error);
    }
  }

  private _findParentCategory(id: string, categories: ICategory[], lastParent: ICategory[]): ICategory[] {
    const parent: ICategory[] = lastParent;
    try {
      for (let i = 0; i < categories.length; i++) {
        if (categories[i].SubCategories.length > 0) {
          let found: boolean = false;
          for (let j = 0; j < categories[i].SubCategories.length; j++) {
            if (categories[i].SubCategories[j].Id == id) {
              found = true;
              parent.push(categories[i].SubCategories[j]);
              break;
            }
          }
          if (found) {
            parent.push(categories[i]);
            break;
          }
        }
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (_findParentCategory) - ${err}`, LogLevel.Error);
    }
    return parent;
  }

  private _getFilterValues(subcategory: ICategory): IFilterValue[] {
    const filterValues: IFilterValue[] = [];
    try {
      let foundAudience = -1;
      let foundLevel = -1;
      const checkPlaylists = (playlists: IPlaylist[]): void => {
        for (let i = 0; i < playlists.length; i++) {
          if (playlists[i].AudienceId && playlists[i].AudienceId.length > 0) {
            foundAudience = findIndex(filterValues, { Type: FilterTypes.Audience, Key: playlists[i].AudienceId });
            if (foundAudience < 0)
              filterValues.push(new FilterValue(FilterTypes.Audience, playlists[i].AudienceId, playlists[i].AudienceValue.Name));
          } else {
            foundAudience = findIndex(filterValues, { Type: FilterTypes.Audience, Key: "" });
            if (foundAudience < 0)
              filterValues.push(new FilterValue(FilterTypes.Audience, "", strings.FilterNotSet));
          }
          if (playlists[i].LevelId.length > 0) {
            foundLevel = findIndex(filterValues, { Type: FilterTypes.Level, Key: playlists[i].LevelId });
            if (foundLevel < 0)
              filterValues.push(new FilterValue(FilterTypes.Level, playlists[i].LevelId, playlists[i].LevelValue.Name));
          } else {
            foundLevel = findIndex(filterValues, { Type: FilterTypes.Level, Key: "" });
            if (foundLevel < 0)
              filterValues.push(new FilterValue(FilterTypes.Level, "", strings.FilterNotSet));
          }
        }
      };

      const subs: ICategory[] = (subcategory.SubCategories.length == 0) ? [subcategory] : subcategory.SubCategories;
      for (let i = 0; i < subs.length; i++) {
        const pl = filter(this._uxService.CacheConfig.CachedPlaylists, { CatId: subs[i].Id });
        if (pl.length > 0)
          checkPlaylists(pl);
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (_getFilterValues) - ${err}`, LogLevel.Error);
    }

    return filterValues;
  }

  private _filterPlaylists = (playlists: IPlaylist[], filterValue: IFilter): IPlaylist[] => {
    try {
      const filtered: IPlaylist[] = playlists.filter((pl) => {
        let retVal = true;
        if (filterValue.Level.length > 0)
          retVal = includes(filterValue.Level, pl.LevelId);
        if (filterValue.Audience.length > 0 && retVal)
          retVal = includes(filterValue.Audience, pl.AudienceId);
        return retVal;
      });
      return filtered;
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (_filterPlaylists) - ${err}`, LogLevel.Error);
      return [];
    }
  }

  private _applyCustomSort = (array: (ICategory[] | IPlaylist[])): (ICategory[] | IPlaylist[]) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newArray: any = [];
    try {
      if (!this._uxService.CustomSortOrder || this._uxService.CustomSortOrder.length < 1) { return array; }
      const copyArray = cloneDeep(array);
      forEach(this._uxService.CustomSortOrder, (sortId) => {
        let idx: number = -1;
        forEach(copyArray, (value: (ICategory | IPlaylist), index: number) => {
          if (value.Id === sortId) {
            idx = index;
            return false;
          }
        });
        if (idx > -1) {
          const detailItem = cloneDeep(copyArray[idx]);
          newArray.push(detailItem);
          copyArray.splice(idx, 1);
        }
      });
      forEach(copyArray, (item) => {
        newArray.push(item);
      });
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (_applyCustomSort) - ${err}`, LogLevel.Error);
      return array;
    }
    return newArray;
  }

  private _loadDetail = (template: string, templateId: string, filterValue?: IFilter, assetId?: string): void => {
    try {
      let updateHistory: boolean = true;
      let openInDialog: boolean = false;
      if (!filterValue) {
        filterValue = new Filter();
      } else {
        updateHistory = false;
      }

      //Continue loading
      let parent: ICategory;
      let detail: ICategory[] | IPlaylist[] | IPlaylist;
      let assets: IAsset[] = null;
      const currentAsset: IAsset = null;
      let filterValues: IFilterValue[] = cloneDeep(this.state.filterValues);
      let url: string = `${params.baseViewerUrl}?cdn=${this._uxService.CDN}`;
      let teamsContext: string[] = [];
      if (this.teamsContext) {
        //url is for teams context
        url = this.teamsContextUrl;
        teamsContext = ["", this._uxService.CDN, "", "", "", ""];
      }
      switch (template) {
        case Templates.Category:
          detail = filter(this._uxService.CacheConfig.Categories, { Id: templateId });
          if (this._uxService.History.find(o => { return o.Id === detail[0].Id }) == null) {
            this._uxService.History.push(new HistoryItem(detail[0].Id, detail[0].Name as string, template));
          }
          if (this._uxService.CustomSort)
            detail[0].SubCategories = this._applyCustomSort(detail[0].SubCategories) as ICategory[];
          if (detail.length === 1) {
            if (this.teamsContext) {
              teamsContext[2] = detail[0].Id;
            } else {
              url = `${url}&category=${detail[0].Id}`;
            }
          }
          break;
        case Templates.SubCategory:
        case Templates.Playlists:
          parent = this._findParentCategory(templateId, this._uxService.CacheConfig.Categories, [])[0];
          if (updateHistory) {
            this._uxService.History.push(new HistoryItem(parent.Id, parent.Name as string, template));
          }
          filterValues = this._getFilterValues(parent);
          if (parent.SubCategories.length > 0) {
            template = Templates.SubCategory;
            detail = parent.SubCategories;
            if (this._uxService.CustomSort)
              detail = this._applyCustomSort(detail) as ICategory[];
          } else {
            template = Templates.Playlists;
            detail = filter(this._uxService.CacheConfig.CachedPlaylists, { CatId: parent.Id });
            detail = this._filterPlaylists(detail, filterValue);
            if (this._uxService.CustomSort)
              detail = this._applyCustomSort(detail) as IPlaylist[];
          }
          if (this.teamsContext) {
            teamsContext[3] = parent.Id;
          } else {
            url = `${url}&subcategory=${parent.Id}`;
          }
          break;
        case Templates.Playlist:
          detail = find(this._uxService.CacheConfig.CachedPlaylists, { Id: templateId });
          this._uxService.History.push(new HistoryItem(detail.Id, (detail.Title instanceof Array) ? (detail.Title as IMultilingualString[])[0].Text : detail.Title as string, Templates.Playlist));
          if (this.teamsContext) {
            teamsContext[4] = detail.Id;
          } else {
            url = `${url}&playlist=${detail.Id}`;
          }
          assets = [];
          for (let i = 0; i < (detail as IPlaylist).Assets.length; i++) {
            const pa = find(this._uxService.CacheConfig.CachedAssets, { Id: (detail as IPlaylist).Assets[i] });
            if (pa)
              assets.push(pa);
          }
          openInDialog = this.props.openAssetsInDialog

          break;
        case Templates.Asset:
          assets = [];
          assets.push(find(this._uxService.CacheConfig.CachedAssets, { Id: templateId }));
          break;
        default:
          detail = this._uxService.CacheConfig.Categories;
          template = Templates.Category;
      }

      //If Teams context then generate subEntityId for url
      if (this.teamsContext) {
        const subEntityId = teamsContext.join(":");
        url = `${url}"${subEntityId}"}`;
        //encode teams subentity
        const encode = url.split("?");
        url = `${encode[0]}?${encodeURI(encode[1])}`;
      }

      this.setState({
        template: template,
        templateId: templateId,
        parent: parent,
        detail: detail,
        assets: assets,
        currentAsset: currentAsset,
        filterValues: filterValues,
        filterValue: filterValue,
        url: url,
        renderPanel: openInDialog
      }, () => {
        //For playlist, initialize the starting asset.
        if ((this.state.template === Templates.Playlist)) {
          if (this.state.assets.length > 0) {
            if (!assetId) {
              if (this._uxService.WebPartStartup.startingLocation === (this.state.detail as IPlaylist).Id && (this._uxService.WebPartStartup.startAsset && this._uxService.WebPartStartup.startAsset.length > 0)) {
                assetId = this._uxService.WebPartStartup.startAsset;
              } else {
                assetId = this.state.assets[0].Id;
              }
            }
            this._selectAsset(assetId);
          }
        } else if ((this.state.template === Templates.Asset) && (this.state.assets.length > 0)) {
          this._selectAsset(templateId);
        }
      });
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (loadDetail) - ${err}`, LogLevel.Error);
    }
  }

  private _showHistory = (idx: number, template: string, templateId: string, nav?: boolean): void => {
    try {
      if (nav) {
        //Update history to remove items
        if (templateId === "") {
          this._uxService.History = [new HistoryItem("", strings.NavigationHome, "")];
        } else {
          console.log(`🎓 M365LP:${this.LOG_SOURCE} Length before: ${this._uxService.History.length}`);
          this._uxService.History.splice(idx, (this._uxService.History.length - idx));
          console.log(`🎓 M365LP:${this.LOG_SOURCE} Length after: ${this._uxService.History.length}`);
        }
      }
      this._loadDetail(template, templateId);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (_showHistory) - ${err}`, LogLevel.Error);
    }
  }

  private _loadSearchResultAsset = (subcategoryId: string, playlistId: string, assetId: string): void => {
    try {
      if (this._uxService.History.length > 1)
        this._uxService.History.splice(1);
      if (playlistId) {
        this._loadDetail(Templates.Playlist, playlistId, undefined, assetId);
      } else if (subcategoryId) {
        this._loadDetail(Templates.SubCategory, subcategoryId);
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (_loadSearchResultAsset) - ${err}`, LogLevel.Error);
    }
  }

  private _selectAsset = (assetId: string): void => {
    try {
      const currentAsset = find(this.state.assets, { Id: assetId });
      if (!isEqual(currentAsset, this.state.currentAsset)) {
        let url: string = `${params.baseViewerUrl}?cdn=${this._uxService.CDN}`;
        if (this.teamsContext) {
          const teamsContext: string[] = ["", this._uxService.CDN, "", "", (this.state.detail != null) ? (this.state.detail as IPlaylist).Id : "", currentAsset.Id];
          const subEntityId = teamsContext.join(":");
          url = `${this.teamsContextUrl}"${subEntityId}"}`;
          //encode teams subentity
          const encode = url.split("?");
          url = `${encode[0]}?${encodeURI(encode[1])}`;
        } else {
          if (this.state.detail != null) {
            url = `${url}&playlist=${(this.state.detail as IPlaylist).Id}&asset=${currentAsset.Id}`;
          } else {
            url = `${url}&asset=${currentAsset.Id}`;
          }
        }
        this.setState({
          url: url,
          currentAsset: currentAsset,
          renderPanel: (this.state.renderPanel || this.props.openAssetsInDialog) ? true : false
        }, () => {
          document.body.scrollTop = 0;
          document.documentElement.scrollTop = 0;
        });
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (_selectAsset) - ${err}`, LogLevel.Error);
    }
  }

  private _setFilter = (newFilterValue: IFilterValue): void => {
    try {
      const filterValue: IFilter = cloneDeep(this.state.filterValue);
      let levelIdx = -1;
      let audIdx = -1;
      switch (newFilterValue.Type) {
        case "Level":
          levelIdx = indexOf(filterValue.Level, newFilterValue.Key);
          if (levelIdx > -1) {
            filterValue.Level.splice(levelIdx, 1)
          } else {
            filterValue.Level.push(newFilterValue.Key);
          }
          break;
        case "Audience":
          audIdx = indexOf(filterValue.Audience, newFilterValue.Key);
          if (audIdx > -1) {
            filterValue.Audience.splice(audIdx, 1)
          } else {
            filterValue.Audience.push(newFilterValue.Key);
          }
          break;
      }

      this._loadDetail(this.state.template, this.state.templateId, filterValue);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (_setFilter) - ${err}`, LogLevel.Error);
    }
  }

  private _onAdminPlaylists = (): void => {
    window.open(params.baseAdminUrl, '_blank');
  }

  private _doRenderPanel = (): void => {
    this.setState({ renderPanel: !this.state.renderPanel });
  }

  private _renderContainer(): (JSX.Element | null) {
    let element: (JSX.Element | null) = null;
    try {
      switch (this.state.template) {
        case Templates.Category:
          element = <Categories
            detail={this.state.detail as ICategory[]}
            selectItem={this._loadDetail}
          />;
          break;
        case Templates.SubCategory:
        case Templates.Playlists:
          element = <SubCategories
            parent={this.state.parent}
            template={this.state.template}
            detail={this.state.detail as ICategory[] | IPlaylist[]}
            filterValue={this.state.filterValue}
            filterValues={this.state.filterValues}
            //customSort={this.props.customSort && (this._uxService.History.length == 1)}
            selectItem={this._loadDetail}
            setFilter={this._setFilter}
          //updateCustomSort={this.props.updateCustomSort}
          />;
          break;
        case Templates.Playlist:
        case Templates.Asset:
          element = <AssetView
            playlistId={(this.state.detail) ? (this.state.detail as IPlaylist).Id : ""}
            playlistName={(this.state.detail) ? (this.state.detail as IPlaylist).Title as string : ""}
            asset={this.state.currentAsset}
            assets={this.state.assets}
            assetOrigins={this._uxService.CacheConfig.AssetOrigins}
            selectAsset={this._selectAsset}
            openAssetsInDialog={(this.props.openAssetsInDialog || this.state.renderPanel) ? true : false}
            defaultWebPartHeight={this.props.defaultWebPartHeight}
          />;
          break;
        default:
          element = <Categories
            detail={this.state.detail as ICategory[]}
            selectItem={this._loadDetail}
          />;
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (_renderContainer) - ${err}`, LogLevel.Error);
    }
    return element;
  }

  private _renderPanel = (inPanel: boolean): (JSX.Element | null)[] => {
    const element: (JSX.Element | null)[] = [];
    try {
      if (!inPanel && (this._uxService.WebPartMode === WebPartModeOptions.contentonly) && (this.props.webpartTitle && this.props.webpartTitle.length > 0)) {
        element.push(<h2 className={styles.title}>{this.props.webpartTitle}</h2>);
      }
      if (!inPanel) {
        element.push(<LearningHeader
          template={this.state.template}
          detail={((this.state.template === Templates.Playlist) ? this.state.detail : null) as IPlaylist}
          selectAsset={this._selectAsset}
          assets={this.state.assets}
          currentAsset={this.state.currentAsset}
          linkUrl={this.state.url}
          onAdminPlaylists={this._onAdminPlaylists}
          webpartTitle={this.props.webpartTitle}
          alwaysShowSearch={this.props.alwaysShowSearch}
        />);
      }
      if ((this.state.template === Templates.Playlist)) {
        element.push(<PlaylistControl
          currentAsset={this.state.currentAsset}
          assets={this.state.assets}
          selectAsset={this._selectAsset}
          renderPanel={this._doRenderPanel}
        />);
      }
      element.push(this._renderContainer());
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (_renderPanel) - ${err}`, LogLevel.Error);
    }
    return element;
  }

  public render(): React.ReactElement<ICustomLearningProps> {
    if (this._uxService === undefined) { this._uxService = this.context; }
    if (!this.state.template) return null;
    try {
      return (
        <div className={`${styles.customLearning} ${(params.appPartPage) ? styles.appPartPage : ""}`}>
          <>
            {this.state.renderPanel &&
              <HOODialog
                changeVisibility={() => { this.setState({ renderPanel: !this.state.renderPanel }); }}
                type={8}
                visible={this.state.renderPanel}
              >
                <HOODialogHeader
                  closeIconName="hoo-icon-close"
                  closeOnClick={() => { this.setState({ renderPanel: false }); }}
                  title={(this.state.detail) ? (this.state.detail as IPlaylist).Title as string : ""}
                  closeDisabled={false} />
                <HOODialogContent>
                  {this._renderPanel(true)}
                </HOODialogContent>
              </HOODialog>
            }
            {!this.state.renderPanel &&
              this._renderPanel(false)
            }
          </>
        </div>
      );

    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}