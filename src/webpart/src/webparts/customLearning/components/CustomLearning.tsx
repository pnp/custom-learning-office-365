import * as React from 'react';
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash/isEqual";
import find from "lodash/find";
import findIndex from "lodash/findIndex";
import includes from "lodash/includes";
import cloneDeep from "lodash/cloneDeep";
import filter from "lodash/filter";
import indexOf from "lodash/indexOf";
import concat from "lodash/concat";
import forEach from "lodash/forEach";
import uniqBy from "lodash/uniqBy";
import sortBy from "lodash/sortBy";
import { PanelType, Panel } from 'office-ui-fabric-react';

import styles from "../../common/CustomLearningCommon.module.scss";
import * as strings from "M365LPStrings";
import { params } from "../../common/services/Parameters";
import { IPlaylist, ICategory, IHistoryItem, HistoryItem, IAsset, IFilterValue, IFilter, FilterValue, Filter, ISearchResult, Playlist, IMultilingualString, ICacheConfig } from '../../common/models/Models';
import { Templates, FilterTypes, WebpartMode, SearchFields } from '../../common/models/Enums';
import Categories from './Organisms/Categories';
import SubCategories from './Templates/SubCategories';
import LearningHeader from './Templates/LearningHeader';
import AssetView from './Atoms/AssetView';
import PlaylistControl from "./Molecules/PlaylistControl";
import { ICacheController } from '../../common/services/CacheController';


export interface ICustomLearningProps {
  editMode: boolean;
  webpartMode: string;
  startType: string;
  startLocation: string;
  startAsset: string;
  webpartTitle: string;
  customSort: boolean;
  customSortOrder: string[];
  teamsEntityId: string;
  cacheController: ICacheController;
  updateCustomSort: (customSortOrder: string[]) => void;
  getCSSVariablesOnElement: () => any;
}

export interface ICustomLearningState {
  template: string;
  templateId: string;
  parent: ICategory;
  detail: ICategory[] | IPlaylist[] | IPlaylist;
  assets: IAsset[];
  currentAsset: IAsset;
  history: IHistoryItem[];
  filterValue: IFilter;
  filterValues: IFilterValue[];
  url: string;
  searchValue: string;
  searchResults: ISearchResult[];
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
    public searchValue: string = "",
    public searchResults: ISearchResult[] = [],
    public renderPanel: boolean = false,
    public fullSizeAsset: boolean = false
  ) { }
}

export default class CustomLearning extends React.Component<ICustomLearningProps, ICustomLearningState> {
  private LOG_SOURCE: string = "CustomLearning";
  private _reInit: boolean = false;

  private teamsContext: boolean = false;
  private teamsContextUrl: string = "";

  constructor(props) {
    super(props);
    this.state = new CustomLearningState();
    this.teamsContext = props.teamsEntityId && props.teamsEntityId.length > 0;
    if (this.teamsContext)
      this.teamsContextUrl = `https://teams.microsoft.com/l/entity/141d4ab7-b6ca-4bf4-ac59-25b7bf93642d/${props.teamsEntityId}?context={"subEntityId":`;

    this.init();
  }

  private findParentCategory(id: string, categories: ICategory[], lastParent: ICategory[]): ICategory[] {
    let parent: ICategory[] = lastParent;
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
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (findParentCategory) - ${err}`, LogLevel.Error);
    }
    return parent;
  }

  private init() {
    if (this.props.webpartMode === WebpartMode.contentonly) { return; }
    try {
      //If startLocation is specified then pin starting location as root menu item
      //else, pin 'Home' as root menu location
      if (this.props.startLocation.length < 1) {
        //During constructor, update state directly.
        this.state.history.push(new HistoryItem("", strings.NavigationHome, ""));
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (init) - ${err}`, LogLevel.Error);
    }
  }

  public componentDidUpdate() {
    if (this._reInit) {
      this._reInit = false;
      this.loadDetail(this.props.startType, this.props.startLocation, []);
    }
  }

  public shouldComponentUpdate(nextProps: Readonly<ICustomLearningProps>, nextState: Readonly<ICustomLearningState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    if (this.props.startType != nextProps.startType ||
      this.props.startLocation != nextProps.startLocation ||
      this.props.customSort != nextProps.customSort ||
      !isEqual(nextProps.customSortOrder, this.props.customSortOrder))
      this._reInit = true;
    return true;
  }

  public componentDidMount() {
    this.loadDetail(this.props.startType, this.props.startLocation, this.state.history);
  }

  private getFilterValues(subcategory: ICategory): IFilterValue[] {
    let filterValues: IFilterValue[] = [];
    try {
      let checkPlaylists = (playlists: IPlaylist[]): void => {
        for (let i = 0; i < playlists.length; i++) {
          if (playlists[i].AudienceId && playlists[i].AudienceId.length > 0) {
            let foundAudience = findIndex(filterValues, { Type: FilterTypes.Audience, Key: playlists[i].AudienceId });
            if (foundAudience < 0)
              filterValues.push(new FilterValue(FilterTypes.Audience, playlists[i].AudienceId, playlists[i].AudienceValue.Name));
          } else {
            let foundAudience = findIndex(filterValues, { Type: FilterTypes.Audience, Key: "" });
            if (foundAudience < 0)
              filterValues.push(new FilterValue(FilterTypes.Audience, "", strings.FilterNotSet));
          }
          if (playlists[i].LevelId.length > 0) {
            let foundLevel = findIndex(filterValues, { Type: FilterTypes.Level, Key: playlists[i].LevelId });
            if (foundLevel < 0)
              filterValues.push(new FilterValue(FilterTypes.Level, playlists[i].LevelId, playlists[i].LevelValue.Name));
          } else {
            let foundLevel = findIndex(filterValues, { Type: FilterTypes.Level, Key: "" });
            if (foundLevel < 0)
              filterValues.push(new FilterValue(FilterTypes.Level, "", strings.FilterNotSet));
          }
        }
      };

      let subs: ICategory[] = (subcategory.SubCategories.length == 0) ? [subcategory] : subcategory.SubCategories;
      for (let i = 0; i < subs.length; i++) {
        let pl = filter(this.props.cacheController.cacheConfig.CachedPlaylists, { CatId: subs[i].Id });
        if (pl.length > 0)
          checkPlaylists(pl);
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (getFilterValues) - ${err}`, LogLevel.Error);
    }

    return filterValues;
  }

  private filterPlaylists = (playlists: IPlaylist[], filterValue: IFilter): IPlaylist[] => {
    try {
      let filtered: IPlaylist[] = playlists.filter((pl) => {
        let retVal = true;
        if (filterValue.Level.length > 0)
          retVal = includes(filterValue.Level, pl.LevelId);
        if (filterValue.Audience.length > 0 && retVal)
          retVal = includes(filterValue.Audience, pl.AudienceId);
        return retVal;
      });
      return filtered;
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (filterPlaylists) - ${err}`, LogLevel.Error);
      return [];
    }
  }

  private applyCustomSort = (array: (ICategory[] | IPlaylist[])): (ICategory[] | IPlaylist[]) => {
    let newArray: any = [];
    try {
      if (!this.props.customSortOrder || this.props.customSortOrder.length < 1) { return array; }
      let copyArray = cloneDeep(array);
      forEach(this.props.customSortOrder, (sortId) => {
        let idx: number = -1;
        forEach(copyArray, (value: (ICategory | IPlaylist), index: number) => {
          if (value.Id === sortId) {
            idx = index;
            return false;
          }
        });
        if (idx > -1) {
          let detailItem = cloneDeep(copyArray[idx]);
          newArray.push(detailItem);
          copyArray.splice(idx, 1);
        }
      });
      forEach(copyArray, (item) => {
        newArray.push(item);
      });
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (applyCustomSort) - ${err}`, LogLevel.Error);
      return array;
    }
    return newArray;
  }

  public loadDetail = (template: string, templateId: string, history?: IHistoryItem[], filterValue?: IFilter, assetId?: string): void => {
    try {
      if (!history) {
        history = cloneDeep(this.state.history);
      }
      let updateHistory: boolean = true;
      if (!filterValue) {
        filterValue = new Filter();
      } else {
        updateHistory = false;
      }

      //Continue loading
      let parent: ICategory;
      let detail: ICategory[] | IPlaylist[] | IPlaylist;
      let assets: IAsset[] = null;
      let currentAsset: IAsset = null;
      let filterValues: IFilterValue[] = cloneDeep(this.state.filterValues);
      let url: string = `${params.baseViewerUrl}?cdn=${this.props.cacheController.CDN}`;
      let teamsContext: string[] = [];
      if (this.teamsContext) {
        //url is for teams context
        url = this.teamsContextUrl;
        teamsContext = ["", this.props.cacheController.CDN, "", "", "", ""];
      }
      switch (template) {
        case Templates.Category:
          detail = filter(this.props.cacheController.cacheConfig.Categories, { Id: templateId });
          if (this.props.customSort)
            detail[0].SubCategories = this.applyCustomSort(detail[0].SubCategories) as ICategory[];
          history.push(new HistoryItem(detail[0].Id, detail[0].Name as string, template));
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
          let subCategory = this.findParentCategory(templateId, this.props.cacheController.cacheConfig.Categories, []);
          parent = subCategory[0];
          filterValues = this.getFilterValues(subCategory[0]);
          if (subCategory[0].SubCategories.length > 0) {
            template = Templates.SubCategory;
            detail = subCategory[0].SubCategories;
            if (this.props.customSort)
              detail = this.applyCustomSort(detail) as ICategory[];
          } else {
            template = Templates.Playlists;
            detail = filter(this.props.cacheController.cacheConfig.CachedPlaylists, { CatId: subCategory[0].Id });
            detail = this.filterPlaylists(detail, filterValue);
            if (this.props.customSort)
              detail = this.applyCustomSort(detail) as IPlaylist[];
          }
          if (updateHistory) {
            history.push(new HistoryItem(subCategory[0].Id, subCategory[0].Name as string, template));
          }
          if (this.teamsContext) {
            teamsContext[3] = subCategory[0].Id;
          } else {
            url = `${url}&subcategory=${subCategory[0].Id}`;
          }
          break;
        case Templates.Playlist:
          detail = find(this.props.cacheController.cacheConfig.CachedPlaylists, { Id: templateId });
          history.push(new HistoryItem(detail.Id, (detail.Title instanceof Array) ? (detail.Title as IMultilingualString[])[0].Text : detail.Title as string, Templates.Playlist));
          if (this.teamsContext) {
            teamsContext[4] = detail.Id;
          } else {
            url = `${url}&playlist=${detail.Id}`;
          }
          assets = [];
          for (let i = 0; i < (detail as IPlaylist).Assets.length; i++) {
            let pa = find(this.props.cacheController.cacheConfig.CachedAssets, { Id: (detail as IPlaylist).Assets[i] });
            if (pa)
              assets.push(pa);
          }
          break;
        case Templates.Asset:
          assets = [];
          let a = find(this.props.cacheController.cacheConfig.CachedAssets, { Id: templateId });
          assets.push(a);
          break;
        default:
          detail = this.props.cacheController.cacheConfig.Categories;
          template = Templates.Category;
      }

      //If Teams context then generate subEntityId for url
      if (this.teamsContext) {
        let subEntityId = teamsContext.join(":");
        url = `${url}"${subEntityId}"}`;
        //encode teams subentity
        let encode = url.split("?");
        url = `${encode[0]}?${encodeURI(encode[1])}`;
      }

      this.setState({
        template: template,
        templateId: templateId,
        parent: parent,
        detail: detail,
        assets: assets,
        currentAsset: currentAsset,
        history: history,
        filterValues: filterValues,
        filterValue: filterValue,
        url: url
      }, () => {
        //For playlist, initialize the starting asset.
        if ((this.state.template === Templates.Playlist)) {
          if (this.state.assets.length > 0) {
            if (!assetId) {
              if (this.props.startLocation === (this.state.detail as IPlaylist).Id && (this.props.startAsset && this.props.startAsset.length > 0)) {
                assetId = this.props.startAsset;
              } else {
                assetId = this.state.assets[0].Id;
              }
            }
            this.selectAsset(assetId);
          }
        } else if ((this.state.template === Templates.Asset) && (this.state.assets.length > 0)) {
          this.selectAsset(templateId);
        }
      });
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (loadDetail) - ${err}`, LogLevel.Error);
    }
  }

  private historyClick = (template: string, templateId: string, nav?: boolean): void => {
    try {
      let history = cloneDeep(this.state.history);
      if (nav) {
        //Update history to remove items
        if (templateId === "") {
          history = [new HistoryItem("", strings.NavigationHome, "")];
        } else {
          let idx = findIndex(history, { Id: templateId });
          history.splice(idx, (history.length - idx));
        }
      }
      this.loadDetail(template, templateId, history);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (historyClick) - ${err}`, LogLevel.Error);
    }
  }

  private selectAsset = (assetId: string): void => {
    try {
      let currentAsset = find(this.state.assets, { Id: assetId });
      if (!isEqual(currentAsset, this.state.currentAsset)) {
        let url: string = `${params.baseViewerUrl}?cdn=${this.props.cacheController.CDN}`;
        if (this.teamsContext) {
          let teamsContext: string[] = ["", this.props.cacheController.CDN, "", "", (this.state.detail != null) ? (this.state.detail as IPlaylist).Id : "", currentAsset.Id];
          let subEntityId = teamsContext.join(":");
          url = `${this.teamsContextUrl}"${subEntityId}"}`;
          //encode teams subentity
          let encode = url.split("?");
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
          currentAsset: currentAsset
        }, () => {
          document.body.scrollTop = 0;
          document.documentElement.scrollTop = 0;
        });
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (selectAsset) - ${err}`, LogLevel.Error);
    }
  }

  private setFilter = (newFilterValue: IFilterValue): void => {
    try {
      let filterValue: IFilter = cloneDeep(this.state.filterValue);
      switch (newFilterValue.Type) {
        case "Level":
          let levelIdx = indexOf(filterValue.Level, newFilterValue.Key);
          (levelIdx > -1) ?
            filterValue.Level.splice(levelIdx, 1) :
            filterValue.Level.push(newFilterValue.Key);
          break;
        case "Audience":
          let audIdx = indexOf(filterValue.Audience, newFilterValue.Key);
          (audIdx > -1) ?
            filterValue.Audience.splice(audIdx, 1) :
            filterValue.Audience.push(newFilterValue.Key);
          break;
      }

      this.loadDetail(this.state.template, this.state.templateId, this.state.history, filterValue);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (setFilter) - ${err}`, LogLevel.Error);
    }
  }

  private onAdminPlaylists = (): void => {
    window.open(params.baseAdminUrl, '_blank');
  }

  private flattenCategory(category: ICategory[], array: ICategory[] = []): ICategory[] | ICategory[] {
    let retArray: ICategory[] = array;
    try {
      category.forEach((c) => {
        let item = cloneDeep(c);
        item.SubCategories = [];
        retArray.push(item);
        if (c.SubCategories && c.SubCategories.length > 0) {
          let sub = this.flattenCategory(c.SubCategories, retArray);
          retArray = concat(retArray, sub);
        }
      });
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (flattenCategory) - ${err}`, LogLevel.Error);
    }
    return retArray;
  }

  private doSearch = (searchValue: string): void => {
    try {
      let searchResults: ISearchResult[] = [];
      if (searchValue.length > 0) {
        //Matching technologies and subjects
        let technologies: string[] = [];
        let subjects: string[] = [];
        forEach(this.props.cacheController.cacheConfig.Technologies, (t) => {
          if (t.Name.toLowerCase().indexOf(searchValue.toLowerCase()) > -1) {
            technologies.push(t.Id);
          }
          if (t.Subjects.length > 0) {
            forEach(t.Subjects, (s) => {
              if (s.Name.toLowerCase().indexOf(searchValue.toLowerCase()) > -1) {
                subjects.push(s.Id);
              }
            });
          }
        });

        //Search Assets
        //Filter Assets by matching technologies and subjects
        let spAsset: IAsset[] = [];
        let spAssetTech = filter(this.props.cacheController.cacheConfig.CachedAssets, o => {
          return (includes(technologies, o.TechnologyId));
        });
        spAsset = concat(spAsset, spAssetTech);

        let spAssetSub = filter(this.props.cacheController.cacheConfig.CachedAssets, o => {
          return (includes(subjects, o.SubjectId));
        });
        spAsset = concat(spAsset, spAssetSub);
        //Filter Assets by search fields
        for (let i = 0; i < SearchFields.length; i++) {
          let spField = filter(this.props.cacheController.cacheConfig.CachedAssets, o => {
            if (o[SearchFields[i]] == undefined) return false;
            return (o[SearchFields[i]].toLowerCase().indexOf(searchValue.toLowerCase()) > -1);
          });
          spAsset = concat(spAsset, spField);
          let spAssetResults: ISearchResult[] = [];
          spAsset.forEach((a) => {
            let parent: IPlaylist[] = filter(this.props.cacheController.cacheConfig.CachedPlaylists, o => (o.Assets.indexOf(a.Id) > -1));
            parent.forEach((pl) => {
              let result: ISearchResult = { Result: a, Parent: pl, Type: Templates.Asset };
              spAssetResults.push(result);
            });
          });
          searchResults = concat(searchResults, spAssetResults);
        }

        //Search Playlists
        let spPlay: IPlaylist[] = [];
        let spPlayTech = filter(this.props.cacheController.cacheConfig.CachedPlaylists, o => {
          return (includes(technologies, o.TechnologyId));
        });
        spPlay = concat(spPlay, spPlayTech);

        let spPlaySub = filter(this.props.cacheController.cacheConfig.CachedPlaylists, o => {
          return (includes(subjects, o.SubjectId));
        });
        spPlay = concat(spPlay, spPlaySub);
        let flatSubCategories: ICategory[] = this.flattenCategory(this.props.cacheController.cacheConfig.Categories);
        for (let i = 0; i < SearchFields.length; i++) {
          let spField = filter(this.props.cacheController.cacheConfig.CachedPlaylists, o => {
            if (o[SearchFields[i]] == undefined) return false;
            return (o[SearchFields[i]].toLowerCase().indexOf(searchValue.toLowerCase()) > -1);
          });
          spPlay = concat(spPlay, spField);
          let spPlayResults: ISearchResult[] = [];
          spPlay.forEach((pl) => {
            let parent: ICategory = find(flatSubCategories, { Id: pl.CatId });
            if (parent) {
              let result: ISearchResult = { Result: pl, Parent: parent, Type: Templates.Playlist };
              spPlayResults.push(result);
            }
          });

          searchResults = concat(searchResults, spPlayResults);
        }
        searchResults = uniqBy(searchResults, "Result.Id");
        searchResults = sortBy(searchResults, "Result.Title");
        if (searchResults.length === 0)
          searchResults.push({ Result: new Playlist("0", strings.NoSearchResults), Parent: null, Type: null });
      }
      this.setState({
        searchValue: searchValue,
        searchResults: searchResults
      });
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (doSearch) - ${err}`, LogLevel.Error);
    }
  }

  private loadSearchResult = (subcategoryId: string, playlistId: string, assetId: string): void => {
    try {
      let history = cloneDeep(this.state.history);
      if (history.length > 1)
        history.splice(1);
      if (playlistId) {
        this.loadDetail(Templates.Playlist, playlistId, history, undefined, assetId);
      } else if (subcategoryId) {
        this.loadDetail(Templates.SubCategory, subcategoryId, history);
      }
      this.setState({
        searchValue: "",
        searchResults: []
      });
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (loadSearchResult) - ${err}`, LogLevel.Error);
    }
  }

  private doRenderPanel = () => {
    this.setState({ renderPanel: !this.state.renderPanel });
  }

  private renderContainer(): any {
    let element: any;
    try {
      switch (this.state.template) {
        case Templates.Category:
          element = <Categories
            detail={this.state.detail as ICategory[]}
            editMode={this.props.editMode}
            customSort={this.props.customSort && (this.state.history.length == 1)}
            selectItem={this.loadDetail}
            updateCustomSort={this.props.updateCustomSort}
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
            editMode={this.props.editMode}
            customSort={this.props.customSort && (this.state.history.length == 1)}
            selectItem={this.loadDetail}
            setFilter={this.setFilter}
            updateCustomSort={this.props.updateCustomSort}
          />;
          break;
        case Templates.Playlist:
        case Templates.Asset:
          element = <AssetView
            playlistId={(this.state.detail) ? (this.state.detail as IPlaylist).Id : ""}
            playlistName={(this.state.detail) ? (this.state.detail as IPlaylist).Title as string : ""}
            asset={this.state.currentAsset}
            assets={this.state.assets}
            assetOrigins={this.props.cacheController.cacheConfig.AssetOrigins}
            selectAsset={this.selectAsset}
          />;
          break;
        default:
          element = <Categories
            detail={this.state.detail as ICategory[]}
            editMode={this.props.editMode}
            customSort={this.props.customSort}
            selectItem={this.loadDetail}
            updateCustomSort={this.props.updateCustomSort}
          />;
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (renderContainer) - ${err}`, LogLevel.Error);
    }
    return element;
  }

  private renderPanel = (inPanel: boolean): any => {
    let element: any[] = [];
    try {
      if (!inPanel && (this.props.webpartMode === WebpartMode.contentonly) && (this.props.webpartTitle && this.props.webpartTitle.length > 0)) {
        element.push(<h2 className={styles.title}>{this.props.webpartTitle}</h2>);
      }
      if (!inPanel) {
        element.push(<LearningHeader
          template={this.state.template}
          detail={((this.state.template === Templates.Playlist) ? this.state.detail : null) as IPlaylist}
          history={this.state.history}
          historyClick={this.historyClick}
          selectAsset={this.selectAsset}
          assets={this.state.assets}
          currentAsset={this.state.currentAsset}
          linkUrl={this.state.url}
          onAdminPlaylists={this.onAdminPlaylists}
          doSearch={this.doSearch}
          searchResults={this.state.searchResults}
          loadSearchResult={this.loadSearchResult}
          webpartMode={this.props.webpartMode}
          webpartTitle={this.props.webpartTitle}
        />);
      }
      if ((this.state.template === Templates.Playlist)) {
        element.push(<PlaylistControl
          currentAsset={this.state.currentAsset}
          assets={this.state.assets}
          selectAsset={this.selectAsset}
          renderPanel={this.doRenderPanel}
        />);
      }
      element.push(this.renderContainer());

    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (renderPanel) - ${err}`, LogLevel.Error);
    }

    let mainElement = <div className={`${styles.customLearning} ${(params.appPartPage) ? styles.appPartPage : ""}`}>{element}</div>;

    return mainElement;
  }

  public render(): React.ReactElement<ICustomLearningProps> {
    console.debug('Windows', window);
    if (!this.state.template) return null;
    try {
      return (
        <>
          {this.state.renderPanel &&
            <Panel
              isOpen={this.state.renderPanel}
              onDismiss={() => { this.setState({ renderPanel: false }); }}
              type={PanelType.custom}
              customWidth="100%"
              styles={{
                root: this.props.getCSSVariablesOnElement()
              }}
              headerText={(this.state.detail) ? (this.state.detail as IPlaylist).Title as string : ""}
            >
              {this.renderPanel(true)}


            </Panel>
          }
          {!this.state.renderPanel &&
            this.renderPanel(false)
          }


        </>
      );

    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}