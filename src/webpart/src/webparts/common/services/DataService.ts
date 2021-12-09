import { Logger, LogLevel } from "@pnp/logging";
import find from 'lodash/find';
import findIndex from 'lodash/findIndex';
import cloneDeep from 'lodash/cloneDeep';
import forEach from 'lodash/forEach';
import filter from 'lodash/filter';
import remove from 'lodash/remove';
import includes from 'lodash/includes';
import countBy from 'lodash/countBy';
import flatMapDeep from 'lodash/flatMapDeep';


import * as strings from "M365LPStrings";
import { ICacheConfig, IPlaylist, IAsset, IMetadata, ITechnology, ICustomizations, ICategory, SubCat, ICDN, CDN, IMultilingualString, CacheConfig } from "../models/Models";
import { HttpClientResponse, HttpClient } from "@microsoft/sp-http";
import { CustomDataService, ICustomDataService } from "./CustomDataService";
import { params } from "./Parameters";
import { CustomWebpartSource } from "../models/Enums";

export interface IDataService {
  metadata: IMetadata;
  customization: ICustomizations;
  categoriesAll: ICategory[];
  playlistsAll: IPlaylist[];
  assetsAll: IAsset[];
  init(): Promise<void>;
  getCacheConfig(): Promise<ICacheConfig>;
  getMetadata(): Promise<IMetadata>;
  refreshCache(cache: ICacheConfig): Promise<ICacheConfig>;
  refreshCacheCustomOnly(cache: ICacheConfig, playlists: IPlaylist[], assets: IAsset[]): Promise<ICacheConfig>;
  refreshPlaylistsAll(customOnly: boolean): Promise<IPlaylist[]>;
  refreshAssetsAll(customOnly: boolean): Promise<IAsset[]>;
}

export class DataService implements IDataService {
  private LOG_SOURCE: string = "DataService";

  public metadata: IMetadata;
  public customization: ICustomizations;
  public categoriesAll: ICategory[];
  public playlistsAll: IPlaylist[];
  public assetsAll: IAsset[];
  private _cdnBase: string;
  private _language: string;
  private _downloadedPlaylists: IPlaylist[];
  private _downloadedAssets: IAsset[];
  private _customDataService: ICustomDataService;

  private fieldOptions = {
    headers: { Accept: "application/json;odata.metadata=none" }
  };

  constructor(cdn: string, language: string, customization?: ICustomizations) {
    try {
      this._language = language;
      if (customization)
        this.customization = customization;
      this._customDataService = new CustomDataService(cdn);
      this._cdnBase = params.baseCdnPath;
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (constructor) - ${err}`, LogLevel.Error);
    }
  }

  public async init(): Promise<void> {
    if (!this.customization)
      this.customization = await this._customDataService.getCustomization();
  }

  public async getCacheConfig(): Promise<ICacheConfig> {
    let retVal = await this._customDataService.getCacheConfig(this._language);
    return retVal;
  }

  //Loads Metadata.json file from Microsoft CDN
  public async getMetadata(): Promise<IMetadata> {
    try {
      let results: HttpClientResponse = await params.httpClient.fetch(`${this._cdnBase}${this._language}/metadata.json`, HttpClient.configurations.v1, this.fieldOptions);
      if (results.ok) {
        let resultsJson: IMetadata = await results.json();
        for (let c = 0; c < resultsJson.Categories.length; c++) {
          for (let sc = 0; sc < resultsJson.Categories[c].SubCategories.length; sc++) {

            if (resultsJson.Categories[c].SubCategories[sc].Image.length > 1)
              resultsJson.Categories[c].SubCategories[sc].Image = `${this._cdnBase}${this._language}/${resultsJson.Categories[c].SubCategories[sc].Image}`;
          }
        }
        return resultsJson;
      } else {
        Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (getMetadata) Fetch Error: ${results.statusText}`, LogLevel.Error);
        return null;
      }
      return null;
    }
    catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (getMetadata) - ${err}`, LogLevel.Error);
      return null;
    }
  }

  //Loads playlists.json file from Microsoft CDN
  private async getPlaylists(): Promise<IPlaylist[]> {
    try {
      let results: HttpClientResponse = await params.httpClient.fetch(`${this._cdnBase}${this._language}/playlists.json`, HttpClient.configurations.v1, this.fieldOptions);
      if (results.ok) {
        let resultsJson: IPlaylist[] = await results.json();
        for (let i = 0; i < resultsJson.length; i++) {
          if ((resultsJson[i].Image as string).length > 1)
            resultsJson[i].Image = `${this._cdnBase}${this._language}/${resultsJson[i].Image}`;
        }
        return resultsJson;
      } else {
        Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (getPlaylists) Fetch Error: ${results.statusText}`, LogLevel.Error);
        return null;
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (getPlaylists) - ${err}`, LogLevel.Error);
      return null;
    }
  }

  //Loads assets.json file from Microsoft CDN
  private async getAssets(): Promise<IAsset[]> {
    try {
      let results: HttpClientResponse = await params.httpClient.fetch(`${this._cdnBase}${this._language}/assets.json`, HttpClient.configurations.v1, this.fieldOptions);
      if (results.ok) {
        let resultsJson: IAsset[] = await results.json();
        return resultsJson;
      } else {
        return null;
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (getAssets) - ${err}`, LogLevel.Error);
      return null;
    }
  }

  public async refreshPlaylistsAll(customOnly: boolean = false): Promise<IPlaylist[]> {
    let playlists = this._downloadedPlaylists ? cloneDeep(this._downloadedPlaylists) : [];
    try {
      if (!customOnly || playlists.length < 1) {
        playlists = await this.getPlaylists();
        this._downloadedPlaylists = cloneDeep(playlists);
      }
      let customPlaylists = await this._customDataService.getCustomPlaylists();
      if (customPlaylists) {
        playlists = playlists.concat(customPlaylists);
      }
      forEach(playlists, (p) => {
        p.LevelValue = find(this.metadata.Levels, { Id: p.LevelId });
        if (!p.LevelValue)
          p.LevelValue = { Id: "", Name: "" };
        p.AudienceValue = find(this.metadata.Audiences, { Id: p.AudienceId });
        if (!p.AudienceValue)
          p.AudienceValue = { Id: "", Name: "" };
      });

      //Put full playlists details on property
      this.playlistsAll = cloneDeep(playlists);

      //Remove custom playlists without translation for current language
      playlists = remove(playlists, (p) => {
        if (p.Source !== CustomWebpartSource.Tenant) return true;
        let foundTranslation = find((p.Title as IMultilingualString[]), { LanguageCode: this._language });
        return (foundTranslation) ? true : false;
      });

      //Flatten custom playlists for current language
      forEach(playlists, (p) => {
        if (p.Source === CustomWebpartSource.Tenant) {
          let title = find((p.Title as IMultilingualString[]), { LanguageCode: this._language }).Text;
          p.Title = title;
          let description = find((p.Description as IMultilingualString[]), { LanguageCode: this._language }).Text;
          p.Description = description;
          let image = find((p.Image as IMultilingualString[]), { LanguageCode: this._language }).Text;
          p.Image = image;
        }
      });
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (refreshPlaylistsAll) - ${err}`, LogLevel.Error);
    }

    return playlists;
  }

  public async refreshAssetsAll(customOnly: boolean = false): Promise<IAsset[]> {
    let assets = this._downloadedAssets ? cloneDeep(this._downloadedAssets) : [];
    try {
      if (!customOnly || this._downloadedAssets.length < 1) {
        assets = await this.getAssets();
        this._downloadedAssets = cloneDeep(assets);
      }
      let customAssets = await this._customDataService.getCustomAssets();
      if (customAssets) {
        assets = assets.concat(customAssets);
      }
      this.assetsAll = cloneDeep(assets);

      //Remove custom assets without translation for current language
      assets = remove(assets, (a) => {
        if (a.Source !== CustomWebpartSource.Tenant) return true;
        let foundTranslation = find((a.Title as IMultilingualString[]), { LanguageCode: this._language });
        return (foundTranslation) ? true : false;
      });

      //Flatten custom assets for language
      forEach(assets, (a) => {
        if (a.Source === CustomWebpartSource.Tenant) {
          let title = find((a.Title as IMultilingualString[]), { LanguageCode: this._language }).Text;
          a.Title = title;
          let url = find((a.Url as IMultilingualString[]), { LanguageCode: this._language }).Text;
          a.Url = url;
        }
      });
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (refreshAssetsAll) - ${err}`, LogLevel.Error);
    }
    return assets;
  }

  public filterPlaylists(playlists: IPlaylist[], hiddenPlaylistsIds: string[], technologies: ITechnology[]): IPlaylist[] {
    try {
      let p = cloneDeep(playlists);
      //Merge customer hidden playlists
      if (hiddenPlaylistsIds.length > 0) {
        p = remove(p, (item) => {
          return !includes(hiddenPlaylistsIds, item.Id);
        });
      }

      //Remove Playlists where Technologies are hidden
      if (technologies && technologies.length > 0) {
        let filteredPlaylists = [];
        //Add all blank technologies
        filteredPlaylists = filter(p, { TechnologyId: "" });

        //Filter for only visible technologies
        for (let i = 0; i < technologies.length; i++) {
          let pl = filter(p, { TechnologyId: technologies[i].Id });
          if (pl && technologies[i].Subjects.length > 0) {
            //validate subject
            pl = filter(pl, (item) => {
              if (item.SubjectId === "") return true;
              return (findIndex(technologies[i].Subjects, { Id: item.SubjectId }) > -1);
            });
          }
          if (pl && pl.length > 0) {
            filteredPlaylists = filteredPlaylists.concat(pl);
          }
        }
        if (filteredPlaylists.length > 0)
          p = filteredPlaylists;
      }

      return p;
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (filterPlaylists) - ${err}`, LogLevel.Error);
    }
  }

  private calculateCategoryCount(categories: ICategory[], playlists: IPlaylist[]): void {
    try {
      for (let countC = 0; countC < categories.length; countC++) {
        if (categories[countC].SubCategories.length > 0) {

          categories[countC].SubCategories = remove(categories[countC].SubCategories, (sc) => {
            if (sc.Source !== CustomWebpartSource.Tenant) return true;
            let foundTranslation = find((sc.Name as IMultilingualString[]), { LanguageCode: this._language });
            return (foundTranslation) ? true : false;
          });

          //Flatten custom assets for language
          forEach(categories[countC].SubCategories, (sc) => {
            if (sc.Source === CustomWebpartSource.Tenant) {
              let name = find((sc.Name as IMultilingualString[]), { LanguageCode: this._language }).Text;
              sc.Name = name;
              let image = find((sc.Image as IMultilingualString[]), { LanguageCode: this._language }).Text;
              sc.Image = image;
            }
            let selectedPlaylist = countBy(playlists, { 'CatId': sc.Id });
            sc.Count = selectedPlaylist.true ? selectedPlaylist.true : 0;
          });
        }
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (calculateCategoryCount) - ${err}`, LogLevel.Error);
    }
  }

  private loadChildrenPath(categories: ICategory[]) {
    function getPath(category: ICategory, parentPath: string[]): void {
      if (!category.Path)
        category.Path = parentPath.concat([category.Id]);
      if (category.SubCategories.length > 0) {
        for (let child = 0; child < category.SubCategories.length; child++) {
          getPath(category.SubCategories[child], category.Path);
        }
      }
    }

    try {
      for (let i = 0; i < categories.length; i++) {
        getPath(categories[i], []);
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (loadChildrenPath) - ${err}`, LogLevel.Error);
    }
  }

  //Gets cdn config and merges with custom configuration and updates cache
  public async refreshCache(cache: ICacheConfig): Promise<ICacheConfig> {
    try {
      Logger.write(`Refresh Manifest Config - ${this.LOG_SOURCE} (refreshCache)`, LogLevel.Info);
      if (!cache)
        cache = new CacheConfig();

      this.metadata = await this.getMetadata();
      let m = cloneDeep(this.metadata);

      if (m) {
        if (!this.customization)
          this.customization = await this._customDataService.getCustomization();

        //Create Children and Path on Categories
        this.loadChildrenPath(m.Categories);

        //Merge custom created subcategories
        if (this.customization.CustomSubcategories.length > 0) {
          this.customization.CustomSubcategories.forEach((catItem) => {
            if (catItem.SubCategories.length > 0) {
              let cat = find(m.Categories, { Id: catItem.Id });
              let customSC = cloneDeep(catItem.SubCategories);
              cat.SubCategories = cat.SubCategories.concat(customSC);
            }
          });
        }

        //Make a copy for public property (includes custom sub categories)
        this.categoriesAll = cloneDeep(m.Categories);

        //Get a list of all categories, for finding abandoned playlists
        let categoryIds = flatMapDeep(m.Categories, (n) => {
          let ids: string[] = [];
          ids.push(n.Id);
          let subIds = flatMapDeep(n.SubCategories, "Id");
          ids = ids.concat(subIds);
          return ids;
        });

        //Merge customer hidden technology
        if (this.customization.HiddenTechnology.length > 0 || this.customization.HiddenSubject.length > 0) {
          m.Technologies = remove(m.Technologies, (item) => {
            if (item.Subjects.length > 0) {
              item.Subjects = remove(item.Subjects, (subject) => {
                return (this.customization.HiddenSubject.indexOf(subject.Id) < 0);
              });
            }
            return (this.customization.HiddenTechnology.indexOf(item.Id) < 0);
          });
        }

        //Merge customer hidden subcategories
        if (this.customization.HiddenSubCategories.length > 0) {
          m.Categories = remove(m.Categories, (item) => {
            if (item.SubCategories.length > 0) {
              item.SubCategories = remove(item.SubCategories, (sub) => {
                return (this.customization.HiddenSubCategories.indexOf(sub.Id) < 0);
              });
            }
            return (item.SubCategories.length > 0);
          });
        }

        //Get playlists and custom playlists
        let playlists = await this.refreshPlaylistsAll();

        //Note abandoned playlists
        let abandonedCount: number = 0;
        forEach(this.playlistsAll, (pl) => {
          if (!includes(categoryIds, pl.CatId)) {
            abandonedCount++;
            pl.CatId = "-1";
          }
        });
        if (abandonedCount > 0) {
          let abandonedSubCat = new SubCat("-1", strings.AbandonedPlaylist, "", "", "", "Microsoft", [], [], 0);
          let abandonedCat = new SubCat("0", strings.Abandoned, "", "", "", "Microsoft", [abandonedSubCat], [], 0);
          this.categoriesAll.unshift(abandonedCat);
          m.Categories.unshift(abandonedCat);
        }

        //Get assets and custom assets
        let assets = await this.refreshAssetsAll();

        //Filter playlists for cache
        playlists = this.filterPlaylists(playlists, this.customization.HiddenPlaylistsIds, m.Technologies);

        //Calculate the number of playlists for each subcategory and filter and flatten for language
        this.calculateCategoryCount(m.Categories, playlists);

        //Update config cache
        cache.Categories = m.Categories;
        cache.Technologies = m.Technologies;
        cache.ManifestVersion = params.manifestVersion;
        cache.CachedPlaylists = playlists;
        cache.CachedAssets = assets;
        cache.AssetOrigins = params.assetOrigins;
        cache.LastUpdated = new Date();
        params.lastUpdatedCache = cache.LastUpdated;
        cache.WebPartVersion = params.webPartVersion;

        //Save config to list
        let c = cloneDeep(cache);
        if (cache.Id > 0) {
          let updateConfig = await this._customDataService.modifyCache(c);
          cache.eTag = updateConfig;
        } else {
          //Create first config
          let addConfig = await this._customDataService.createCache(c, this._language);
          cache.Id = addConfig;
        }
      } else {
        cache = null;
        Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (refreshCache) Could not retrieve metadata from CDN source: ${this._cdnBase}`, LogLevel.Error);
      }
    } catch (err) {
      cache = null;
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (refreshCache) - ${err}`, LogLevel.Error);
    }

    return cache;
  }

  //Update cached config for custom sub-categories, playlists and assets only
  public async refreshCacheCustomOnly(cache: ICacheConfig, playlists: IPlaylist[], assets: IAsset[]): Promise<ICacheConfig> {
    try {
      //Filter playlists for cache
      if (playlists) {
        let p = this.filterPlaylists(playlists, this.customization.HiddenPlaylistsIds, cache.Technologies);
        cache.CachedPlaylists = p;
      }
      if (assets)
        cache.CachedAssets = assets;
      cache.LastUpdated = new Date();

      //Merge custom created subcategories, if exist
      if (this.customization.CustomSubcategories.length > 0) {
        cache.Categories = cloneDeep(this.metadata.Categories);
        this.customization.CustomSubcategories.forEach((catItem) => {
          if (catItem.SubCategories.length > 0) {
            let cat = find(cache.Categories, { Id: catItem.Id });
            let customSC = cloneDeep(catItem.SubCategories);
            cat.SubCategories = cat.SubCategories.concat(customSC);
          }
        });
      }

      //Make a copy for public property (includes custom sub categories)
      this.categoriesAll = cloneDeep(cache.Categories);

      //recalculate category counts
      this.calculateCategoryCount(cache.Categories, cache.CachedPlaylists);

      let c = cloneDeep(cache);
      let updateConfig = await this._customDataService.modifyCache(c);
      cache.eTag = updateConfig;
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (refreshCacheCustomOnly) - ${err}`, LogLevel.Error);
    }
    return cache;
  }
}