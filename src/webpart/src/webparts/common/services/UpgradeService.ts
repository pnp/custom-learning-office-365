import { Logger, LogLevel } from "@pnp/logging";
import cloneDeep from "lodash-es/cloneDeep";
import find from "lodash-es/find";
import map from "lodash-es/map";
import forEach from "lodash-es/forEach";
import { params } from "../services/Parameters";
import { ICacheConfig, 
  IMetadata, 
  IPlaylist, 
  IAsset, 
  IMetadataEntry, 
  Playlist, 
  Asset, 
  ICustomizations, 
  ICategory, 
  SubCat, 
  CacheConfig, 
  IMultilingualString, 
  MultilingualString, 
  ISubject } from "../models/Models";
import { IUpdateFunctions } from "./CustomDataService";

export interface IUpgradeService {
  doUpgradeCacheConfig: (currentConfig: ICacheConfig) => Promise<ICacheConfig>;
  doUpgradeCustomization: (currentCustomization: ICustomizations, config: v3_ICustomConfig) => Promise<ICustomizations>;
  doUpgradePlaylists: (currentPlaylists: IPlaylist[]) => Promise<IPlaylist[]>;
  doUpgradeAssets: (currentAssets: IAsset[]) => Promise<IAsset[]>;
}

export class UpgradeService implements IUpgradeService {
  private LOG_SOURCE: string = "UpgradeService";
  private _updateFunctions: IUpdateFunctions;
  private _metadata: IMetadata;
  private _startVersion: number;
  private _endVersion: number;

  constructor(updateFunctions: IUpdateFunctions, startVersion: number, endVersion: number, metadata: IMetadata) {
    this._updateFunctions = updateFunctions;
    this._startVersion = startVersion;
    this._endVersion = endVersion;
    this._metadata = metadata;
  }

  public async doUpgradeCacheConfig(currentConfig: ICacheConfig): Promise<ICacheConfig> {
    let cacheConfig: ICacheConfig;
    Logger.write(`Start Upgrading Cache Config - ${this.LOG_SOURCE} (doUpgradeCacheConfig)`, LogLevel.Warning);
    for (let v = this._startVersion; v < this._endVersion; v++) {
      const functionName = `uCacheConfigV${v}V${v + 1}`;
      if (this[functionName]) {
        cacheConfig = await this[functionName](currentConfig, this._metadata);
      } else {
        cacheConfig = currentConfig;
      }
    }
    Logger.write(`Complete Upgrading Cache Config - ${this.LOG_SOURCE} (doUpgradeCacheConfig)`, LogLevel.Warning);
    return cacheConfig;
  }

  public async doUpgradeCustomization(currentCustomization: ICustomizations, config: v3_ICustomConfig): Promise<ICustomizations> {
    let customConfig: ICustomizations;
    if (currentCustomization.Id === 0) {
      Logger.write(`No Customizations to Upgrade - ${this.LOG_SOURCE} (doUpgradeCustomization)`, LogLevel.Warning);
    } else {
      Logger.write(`Start Upgrading Customizations - ${this.LOG_SOURCE} (doUpgradeCustomization)`, LogLevel.Warning);
      for (let v = this._startVersion; v < this._endVersion; v++) {
        const functionName = `uCustomizationsV${v}V${v + 1}`;
        if (this[functionName]) {
          customConfig = await this[functionName](currentCustomization, config);
        } else {
          customConfig = currentCustomization;
        }
      }
      Logger.write(`Complete Upgrading Customizations - ${this.LOG_SOURCE} (doUpgradeCustomization)`, LogLevel.Warning);
    }
    return customConfig;
  }

  public async doUpgradePlaylists(currentPlaylists: IPlaylist[]): Promise<IPlaylist[]> {
    let playlists: IPlaylist[];

    Logger.write(`Start Upgrading Playlists - ${this.LOG_SOURCE} (doUpgradePlaylists)`, LogLevel.Warning);
    for (let v = this._startVersion; v < this._endVersion; v++) {
      const functionName = `uPlaylistsV${v}V${v + 1}`;
      if (this[functionName]) {
        playlists = await this[functionName](currentPlaylists, this._metadata);
      } else {
        playlists = currentPlaylists;
      }
    }
    Logger.write(`Complete Upgrading Playlists - ${this.LOG_SOURCE} (doUpgradePlaylists)`, LogLevel.Warning);
    return playlists;
  }

  public async doUpgradeAssets(currentAssets: IAsset[]): Promise<IAsset[]> {
    let assets: IAsset[];
    Logger.write(`Start Upgrading Assets - ${this.LOG_SOURCE} (doUpgradeAssets)`, LogLevel.Warning);
    for (let v = this._startVersion; v < this._endVersion; v++) {
      const functionName = `uAssetsV${v}V${v + 1}`;

      if (this[functionName]) {
        assets = await this[functionName](currentAssets, this._metadata);
      } else {
        assets = currentAssets;
      }
    }
    Logger.write(`Complete Upgrading Assets - ${this.LOG_SOURCE} (doUpgradeAssets)`, LogLevel.Warning);
    return assets;
  }

  // We don't have models for old config
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private fixCacheConfigModel(c: any): ICacheConfig {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let item: any = undefined;
    try {
      const tmpItem: ICacheConfig = new CacheConfig();
      item = {};
      for (const key in tmpItem) {
        if (Object.prototype.hasOwnProperty.call(tmpItem, key)) {
          item[key] = (c[key]) ? c[key] : "";
        }
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (fixCacheConfigModel) - ${err}`, LogLevel.Error);
    }
    return item;
  }

  // Ignoring this error because calling these functions ad-hoc depending on upgrade path
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private async uCacheConfigV2V3(currentConfig: v3_ICustomConfig): Promise<v3_ICustomConfig> {
    const workingConfig: v3_ICustomConfig = cloneDeep(currentConfig);

    try {
      //Fix hidden technologies
      if (currentConfig.HiddenTechnology && currentConfig.HiddenTechnology.length > 0) {
        workingConfig.HiddenTechnology = map(currentConfig.HiddenTechnology, (ht) => {
          const newValue = find(this._metadata.Technologies, { Name: ht });
          if (newValue)
            return newValue.Id;
          else
            return ht;
        });
      }

      //Fix hidden subjects
      Logger.write(`Fix hidden subjects - ${this.LOG_SOURCE} (uCacheConfigV2V3)`, LogLevel.Warning);
      if (currentConfig.HiddenSubject && currentConfig.HiddenSubject.length > 0) {
        let subjects: ISubject[] = [];
        forEach(this._metadata.Technologies, (tech) => {
          subjects = subjects.concat(tech.Subjects);
        });
        workingConfig.HiddenSubject = map(currentConfig.HiddenSubject, (hs) => {
          const newValue = find(subjects, { Name: hs });
          if (newValue)
            return newValue.Id;
          else
            return hs;
        });
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (uCacheConfigV2V3) - ${err}`, LogLevel.Error);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    workingConfig['@odata.etag'] = await this._updateFunctions.modifyCache((workingConfig as any), "Default");
    return workingConfig;
  }

  // Ignoring this error because calling these functions ad-hoc depending on upgrade path
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private async uCacheConfigV3V4(currentConfig: v3_ICustomConfig): Promise<ICacheConfig> {
    const workingConfig: v3_ICustomConfig = cloneDeep(currentConfig);
    let returnConfig: ICacheConfig;

    try {
      Logger.write(`Remove Custom Values and Manifest - ${this.LOG_SOURCE} (uCacheConfigV3V4)`, LogLevel.Warning);
      returnConfig = this.fixCacheConfigModel(workingConfig);
      returnConfig.WebPartVersion = params.webPartVersion;
      returnConfig.ManifestVersion = params.manifestVersion;
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (uCacheConfigV3V4) - ${err}`, LogLevel.Error);
    }

    returnConfig['@odata.etag'] = await this._updateFunctions.modifyCache(returnConfig, "Default");
    return returnConfig;
  }

  // Ignoring this error because calling these functions ad-hoc depending on upgrade path
  // We don't have models for old categories
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private fixCategoryModel(c: any): ICategory {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let item: any = undefined;
    try {
      const tmpItem: ICategory = new SubCat();
      item = {};
      for (const key in tmpItem) {
        if (Object.prototype.hasOwnProperty.call(tmpItem, key)) {
          item[key] = (c[key]) ? c[key] : "";
        }
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (fixCategoryModel) - ${err}`, LogLevel.Error);
    }
    return item;
  }

  // Ignoring this error because calling these functions ad-hoc depending on upgrade path
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private  uCustomizationsV2V3 = async(currentSubCat: v3_ICustomSubCategories): Promise<v3_ICustomSubCategories> => {
    let workingSubCat: v3_ICustomSubCategories = cloneDeep(currentSubCat);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function fixTechnology(parent: any, category: any): ICategory {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newTechnology: any = find(this._metadata.Technologies, { Name: (category.Technology as string) });
      if (newTechnology)
        category.TechnologyId = newTechnology.Id;
      category = parent.fixCategoryModel(category);
      if (category.SubCategories.length > 0) {
        for (let child = 0; child < category.SubCategories.length; child++) {
          category.SubCategories[child] = fixTechnology(parent, category.SubCategories[child]);
        }
      }
      return category;
    }

    try {
      Logger.write(`Fix sub category - ${this.LOG_SOURCE} (uCustomizationsV2V3)`, LogLevel.Warning);
      for (let i = 0; i < workingSubCat.CustomSubcategories.length; i++) {
        workingSubCat.CustomSubcategories[i] = fixTechnology(self, workingSubCat.CustomSubcategories[i]);
      }
      workingSubCat['@odata.etag'] = await this._updateFunctions.modifyCustomization(workingSubCat as ICustomizations, "Default");
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (uCustomizationsV2V3) - ${err}`, LogLevel.Error);
      workingSubCat = cloneDeep(currentSubCat);
    }
    return workingSubCat;
  }

  // Ignoring this error because calling these functions ad-hoc depending on upgrade path
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private async uCustomizationsV3V4(currentSubCat: v3_ICustomSubCategories, config: v3_ICustomConfig): Promise<ICustomizations> {
    let workingSubCat: ICustomizations = cloneDeep(currentSubCat) as ICustomizations;

    function fixMultilingual(category: ICategory): void {
      if (category.Source === "Tenant" && !(category.Name instanceof Array)) {
        category.Name = [new MultilingualString(params.defaultLanguage, category.Name as string)];
        category.Image = [new MultilingualString(params.defaultLanguage, category.Image as string)];
      }
      if (category.SubCategories.length > 0) {
        for (let child = 0; child < category.SubCategories.length; child++) {
          fixMultilingual(category.SubCategories[child]);
        }
      }
    }

    try {
      Logger.write(`Fix sub category - ${this.LOG_SOURCE} (uCustomizationsV3V4)`, LogLevel.Warning);
      if (config.HiddenPlaylistsIds)
        workingSubCat.HiddenPlaylistsIds = config.HiddenPlaylistsIds;
      if (config.HiddenSubCategories)
        workingSubCat.HiddenSubCategories = config.HiddenSubCategories;
      if (config.HiddenSubject)
        workingSubCat.HiddenSubject = config.HiddenSubject;
      if (config.HiddenTechnology)
        workingSubCat.HiddenTechnology = config.HiddenTechnology;

      if (workingSubCat.CustomSubcategories) {
        for (let i = 0; i < workingSubCat.CustomSubcategories.length; i++) {
          fixMultilingual(workingSubCat.CustomSubcategories[i]);
        }
      }

      workingSubCat['@odata.etag'] = await this._updateFunctions.modifyCustomization(workingSubCat, "Default");
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (uCustomizationsV3V4) - ${err}`, LogLevel.Error);
      workingSubCat = cloneDeep(currentSubCat) as ICustomizations;
    }
    return workingSubCat;
  }

  // We don't have models for old playlists
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private fixPlaylistModel(p: any): IPlaylist {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let item: any = undefined;
    try {
      const tmpItem: IPlaylist = new Playlist();
      item = {};
      for (const key in tmpItem) {
        if (Object.prototype.hasOwnProperty.call(tmpItem, key)) {
          item[key] = (p[key]) ? p[key] : "";
        }
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (fixPlaylistModel) - ${err}`, LogLevel.Error);
    }
    return item;
  }

  // Ignoring this error because calling these functions ad-hoc depending on upgrade path
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private async uPlaylistsV2V3(currentPlaylists: IPlaylist[], newMetadata: IMetadata): Promise<IPlaylist[]> {
    let workingPlaylists: IPlaylist[] = [];
    try {
      Logger.write(`Fix playlists - ${this.LOG_SOURCE} (uPlaylistsV2V3)`, LogLevel.Warning);
      for (let i = 0; i < currentPlaylists.length; i++) {
        //We don't have typings for V2 playlists
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let p: any = cloneDeep(currentPlaylists[i]);
        if (p.Source !== 'Tenant') {
          workingPlaylists.push(p);
        } else {
          if (newMetadata.Levels) {
            const newLevel: IMetadataEntry = find(newMetadata.Levels, { Name: (p.Level as string) });
            if (newLevel)
              p.LevelId = newLevel.Id;
          }
          if (newMetadata.Audiences) {
            const newAudience: IMetadataEntry = find(newMetadata.Audiences, { Name: (p.Audience as string) });
            if (newAudience)
              p.AudienceId = newAudience.Id;
          }
          //Validate technology
          const technology = find(newMetadata.Technologies, { Id: p.TechnologyId });
          if (!technology)
            p.TechnologyId = "";
          p = this.fixPlaylistModel(p);
          if (p) {
            p['@odata.etag'] = await this._updateFunctions.modifyPlaylist(p, "Default");
            workingPlaylists.push(p);
          }
        }
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (uPlaylistsV2V3) - ${err}`, LogLevel.Error);
      workingPlaylists = cloneDeep(currentPlaylists);
    }
    return workingPlaylists;
  }

  // Ignoring this error because calling these functions ad-hoc depending on upgrade path
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private async uPlaylistsV3V4(currentPlaylists: IPlaylist[], newMetadata: IMetadata): Promise<IPlaylist[]> {
    let workingPlaylists: IPlaylist[] = [];
    try {
      Logger.write(`Fix playlists - ${this.LOG_SOURCE} (uPlaylistsV3V4)`, LogLevel.Warning);
      for (let i = 0; i < currentPlaylists.length; i++) {
        const p = cloneDeep(currentPlaylists[i]);
        if (p.Source !== 'Tenant') {
          workingPlaylists.push(p);
        } else {
          if (!(p.Title instanceof Array)) {
            const title: IMultilingualString[] = [new MultilingualString(params.defaultLanguage, p.Title as string)];
            p.Title = title;
            const description: IMultilingualString[] = [new MultilingualString(params.defaultLanguage, p.Description as string)];
            p.Description = description;
            const image: IMultilingualString[] = [new MultilingualString(params.defaultLanguage, p.Image as string)];
            p.Image = image;
            //Validate technology
            const technology = find(newMetadata.Technologies, { Id: p.TechnologyId });
            if (!technology)
              p.TechnologyId = "";
            if (p) {
              p['@odata.etag'] = await this._updateFunctions.modifyPlaylist(p);
              workingPlaylists.push(p);
            }
          } else {
            workingPlaylists.push(p);
          }
        }
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (uPlaylistsV3V4) - ${err}`, LogLevel.Error);
      workingPlaylists = cloneDeep(currentPlaylists);
    }
    return workingPlaylists;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private fixAssetModel(a: any): IAsset {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let item: any = undefined;
    try {
      const tmpItem: IAsset = new Asset();
      item = {};
      for (const key in tmpItem) {
        if (Object.prototype.hasOwnProperty.call(tmpItem, key)) {
          item[key] = (a[key]) ? a[key] : "";
        }
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (fixAssetModel) - ${err}`, LogLevel.Error);
    }

    return item;
  }

  // Ignoring this error because calling these functions ad-hoc depending on upgrade path
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private async uAssetsV2V3(currentAssets: IAsset[], newMetadata: IMetadata): Promise<IAsset[]> {
    let workingAssets: IAsset[] = [];
    try {
      Logger.write(`Fix assets - ${this.LOG_SOURCE} (uAssetsV2V3)`, LogLevel.Warning);
      for (let i = 0; i < currentAssets.length; i++) {
        let a = cloneDeep(currentAssets[i]);
        if (a.Source !== 'Tenant') {
          workingAssets.push(a);
        } else {
          //Validate technology
          const technology = find(newMetadata.Technologies, { Id: a.TechnologyId });
          if (!technology)
            a.TechnologyId = "";
          a = this.fixAssetModel(a);
          if (a) {
            a['@odata.etag'] = await this._updateFunctions.modifyAsset(a, "Default");
            workingAssets.push(a);
          }
        }
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (uAssetsV2V3) - ${err}`, LogLevel.Error);
      workingAssets = cloneDeep(currentAssets);
    }
    return workingAssets;
  }

  // Ignoring this error because calling these functions ad-hoc depending on upgrade path
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private async uAssetsV3V4(currentAssets: IAsset[], newMetadata: IMetadata): Promise<IAsset[]> {
    let workingAssets: IAsset[] = [];
    try {
      Logger.write(`Fix assets - ${this.LOG_SOURCE} (uAssetsV3V4)`, LogLevel.Warning);
      for (let i = 0; i < currentAssets.length; i++) {
        let a = cloneDeep(currentAssets[i]);
        if (a.Source !== 'Tenant') {
          workingAssets.push(a);
        } else {
          a = this.fixAssetModel(a);
          if (!(a.Title instanceof Array)) {
            const title: IMultilingualString[] = [new MultilingualString(params.defaultLanguage, a.Title as string)];
            a.Title = title;
            const url: IMultilingualString[] = [new MultilingualString(params.defaultLanguage, a.Url as string)];
            a.Url = url;
            //Validate technology
            const technology = find(newMetadata.Technologies, { Id: a.TechnologyId });
            if (!technology)
              a.TechnologyId = "";
            if (a) {
              a['@odata.etag'] = await this._updateFunctions.modifyAsset(a, "Default");
              workingAssets.push(a);
            }
          } else {
            workingAssets.push(a);
          }
        }
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (uAssetsV3V4) - ${err}`, LogLevel.Error);
      workingAssets = cloneDeep(currentAssets);
    }
    return workingAssets;
  }

}

export interface v3_ICustomConfig {
  Id: number;
  eTag: string;
  HiddenTechnology: string[];
  HiddenSubject: string[];
  HiddenPlaylistsIds: string[];
  HiddenSubCategories: string[];
  CachedMetadata: IMetadata;
  CachedPlaylists: IPlaylist[];
  CachedAssets: IAsset[];
  LastUpdated: Date;
  WebPartVersion: string;
}

export interface v3_ICustomSubCategories {
  Id: number;
  eTag: string;
  CustomSubcategories: ICategory[];
}