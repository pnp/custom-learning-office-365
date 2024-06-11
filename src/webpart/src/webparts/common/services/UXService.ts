import * as React from 'react';
import { Logger, LogLevel } from '@pnp/logging';
import includes from "lodash-es/includes";
import uniqBy from "lodash-es/uniqBy";
import { IAsset, ICacheConfig, ICategory, IHistoryItem, IPlaylist, ISearchResult, IWebPartStartup, Playlist } from "../models/Models";
import { SearchFields, Templates, WebPartModeOptions } from "../models/Enums";
import * as strings from 'M365LPStrings';
import sortBy from 'lodash-es/sortBy';
import find from 'lodash-es/find';
import cloneDeep from 'lodash-es/cloneDeep';
import { ICacheController } from './CacheController';

export interface IUXService {
  readonly ready: boolean;
  readonly CacheConfig: ICacheConfig;
  readonly CDN: string;
  WebPartStartup: IWebPartStartup;
  EditMode: boolean;
  History: IHistoryItem[];
  WebPartMode: string;
  CustomSort: boolean;
  CustomSortOrder: string[];
  FUpdateCustomSort:(customSortOrder: string[]) => void;
  FShowSearchResults: (subcategoryId: string, playlistId: string, assetId: string) => void;
  FShowHistory: (idx: number, template: string, templateId: string, nav?: boolean) => void;
  FCLWPRender: {[key: string]: () => void};
  Init: (cacheController: ICacheController) => Promise<void>;
  DoSearch: (searchValue: string) => ISearchResult[];
  LoadSearchResultAsset: (subcategoryId: string, playlistId: string, assetId: string) => void;
  LoadHistory: (idx: number, template: string, templateId: string, nav?: boolean) => void;
  UpdateCustomSort: (customSortOrder: string[]) => void;
  CLWPRender: () => void;
}

export class UXService implements IUXService {
  private LOG_SOURCE = "🟢UXService";
  private _ready: boolean = false;
  private _cacheController: ICacheController;
  private _webPartMode: string = WebPartModeOptions.full;
  private _webPartStartup: IWebPartStartup = {startingType: "", startingLocation: "", startAsset: ""};
  private _editMode: boolean;
  private _history: IHistoryItem[] = [];
  private _customSort: boolean = false;
  private _customSortOrder: string[] = [];
  private _funcShowSearchResults: (subcategoryId: string, playlistId: string, assetId: string) => void = null;
  private _funcShowHistory: (idx: number, template: string, templateId: string, nav?: boolean) => void = null;
  private _funcUpdateCustomSort: (customSortOrder: string[]) => void = null;
  private _funcCLWebPartRender: {[key: string]: () => void} = {};

  public constructor() { }

  public async Init(cacheController: ICacheController): Promise<void> {
    this._cacheController = cacheController;
    this._ready = true;
  }

  public get ready(): boolean {
    return this._ready;
  }

  public get CacheConfig(): ICacheConfig {
    return this._cacheController.cacheConfig;
  }

  public get CDN(): string {
    return this._cacheController.CDN;
  }

  public get WebPartStartup(): IWebPartStartup {
    return this._webPartStartup;
  }

  public set WebPartStartup(value: IWebPartStartup) {
    this._webPartStartup = value;
  }

  public get WebPartMode(): string {
    return this._webPartMode;
  }

  public set WebPartMode(value: string) {
    this._webPartMode = value;
  }

  public get EditMode(): boolean {
    return this._editMode;
  }

  public set EditMode(value: boolean) {
    this._editMode = value;
  }

  public get History(): IHistoryItem[] {
    return this._history;
  }

  public set History(value: IHistoryItem[]) {
    this._history = value;
  }

  public get CustomSort(): boolean {
    return this._customSort && (this._history.length == 1)
  }

  public set CustomSort(value: boolean) {
    this._customSort = value;
  }

  public get CustomSortOrder(): string[] {
    return this._customSortOrder;
  }

  public set CustomSortOrder(value: string[]) {
    this._customSortOrder = value;
  }

  public set FShowSearchResults(value: (subcategoryId: string, playlistId: string, assetId: string) => void) {
    this._funcShowSearchResults = value;
  }

  public set FShowHistory(value: (idx: number, template: string, templateId: string, nav?: boolean) => void) {
    this._funcShowHistory = value;
  }

  public set FUpdateCustomSort(value: (customSortOrder: string[]) => void) {
    this._funcUpdateCustomSort = value;
  }

  public set FCLWPRender(value: {[key: string]: () => void}) {
    const key = Object.keys(value)[0];
    this._funcCLWebPartRender[key] = value[key];
  }

  private _flattenCategory(category: ICategory[], array: ICategory[] = []): ICategory[] | ICategory[] {
    let retArray: ICategory[] = array;
    try {
      category.forEach((c) => {
        const item = cloneDeep(c);
        item.SubCategories = [];
        retArray.push(item);
        if (c.SubCategories && c.SubCategories.length > 0) {
          const sub = this._flattenCategory(c.SubCategories, retArray);
          retArray = retArray.concat(sub);
        }
      });
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (flattenCategory) - ${err}`, LogLevel.Error);
    }
    return retArray;
  }

  public DoSearch(searchValue: string): ISearchResult[] {
    let retVal: ISearchResult[] = [];
    try {
      if (searchValue.length > 0) {
        //Matching technologies and subjects
        const technologies: string[] = [];
        const subjects: string[] = [];
        this._cacheController.cacheConfig.Technologies.forEach((t) => {
          if (t.Name.toLowerCase().indexOf(searchValue.toLowerCase()) > -1) {
            technologies.push(t.Id);
          }
          if (t.Subjects.length > 0) {
            t.Subjects.forEach((s) => {
              if (s.Name.toLowerCase().indexOf(searchValue.toLowerCase()) > -1) {
                subjects.push(s.Id);
              }
            });
          }
        });

        //Search Assets
        //Filter Assets by matching technologies and subjects
        let spAsset: IAsset[] = [];
        const spAssetTech = this._cacheController.cacheConfig.CachedAssets.filter(o => {
          return (includes(technologies, o.TechnologyId));
        });
        spAsset = spAsset.concat(spAssetTech);

        const spAssetSub = this._cacheController.cacheConfig.CachedAssets.filter(o => {
          return (includes(subjects, o.SubjectId));
        });
        spAsset = spAsset.concat(spAssetSub);
        //Filter Assets by search fields
        for (let i = 0; i < SearchFields.length; i++) {
          const spField = this._cacheController.cacheConfig.CachedAssets.filter(o => {
            if (o[SearchFields[i]] == undefined) return false;
            return (o[SearchFields[i]].toLowerCase().indexOf(searchValue.toLowerCase()) > -1);
          });
          spAsset = spAsset.concat(spField);
          const spAssetResults: ISearchResult[] = [];
          spAsset.forEach((a) => {
            const parent: IPlaylist[] = this._cacheController.cacheConfig.CachedPlaylists.filter(o => (o.Assets.indexOf(a.Id) > -1));
            parent.forEach((pl) => {
              const result: ISearchResult = { Result: a, Parent: pl, Type: Templates.Asset };
              spAssetResults.push(result);
            });
          });
          retVal = retVal.concat(spAssetResults);
        }

        //Search Playlists
        let spPlay: IPlaylist[] = [];
        const spPlayTech = this._cacheController.cacheConfig.CachedPlaylists.filter(o => {
          return (includes(technologies, o.TechnologyId));
        });
        spPlay = spPlay.concat(spPlayTech);

        const spPlaySub = this._cacheController.cacheConfig.CachedPlaylists.filter(o => {
          return (includes(subjects, o.SubjectId));
        });
        spPlay = spPlay.concat(spPlaySub);
        const flatSubCategories: ICategory[] = this._flattenCategory(this._cacheController.cacheConfig.Categories);
        for (let i = 0; i < SearchFields.length; i++) {
          const spField = this._cacheController.cacheConfig.CachedPlaylists.filter(o => {
            if (o[SearchFields[i]] == undefined) return false;
            return (o[SearchFields[i]].toLowerCase().indexOf(searchValue.toLowerCase()) > -1);
          });
          spPlay = spPlay.concat(spField);
          const spPlayResults: ISearchResult[] = [];
          spPlay.forEach((pl) => {
            const parent: ICategory = find(flatSubCategories, { Id: pl.CatId });
            if (parent) {
              const result: ISearchResult = { Result: pl, Parent: parent, Type: Templates.Playlist };
              spPlayResults.push(result);
            }
          });

          retVal = retVal.concat(spPlayResults);
        }
        retVal = uniqBy(retVal, "Result.Id");
        retVal = sortBy(retVal, "Result.Title");
        if (retVal.length === 0)
          retVal.push({ Result: new Playlist("0", strings.NoSearchResults), Parent: null, Type: null });
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (doSearch) - ${err}`, LogLevel.Error);
    }
    return retVal;
  }

  public LoadSearchResultAsset = (subcategoryId: string, playlistId: string, assetId: string): void => {
    try {
      if (typeof this._funcShowSearchResults === "function") {
        this._funcShowSearchResults(subcategoryId, playlistId, assetId);
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (LoadSearchResult) - ${err}`, LogLevel.Error);
    }
  }

  public LoadHistory = (idx: number, template: string, templateId: string, nav?: boolean): void => {
    try {
      if (typeof this._funcShowHistory === "function") {
        this._funcShowHistory(idx, template, templateId, nav);
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (LoadSearchResult) - ${err}`, LogLevel.Error);
    }
  }

  public UpdateCustomSort = (customSortOrder: string[]): void => {
    try {
      if (typeof this._funcUpdateCustomSort === "function") {
        this._funcUpdateCustomSort(customSortOrder);
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (UpdateCustomSort) - ${err}`, LogLevel.Error);
    }
  }

  public CLWPRender = (): void => {
    try {
      const keys = Object.keys(this._funcCLWebPartRender);
      keys.forEach(key => {
        if (typeof this._funcCLWebPartRender[key] === "function") {
          this._funcCLWebPartRender[key]();
        }
      });
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (CLWPRender) - ${err}`, LogLevel.Error);
    }
  }
}

export const UXServiceContext = React.createContext(new UXService());
