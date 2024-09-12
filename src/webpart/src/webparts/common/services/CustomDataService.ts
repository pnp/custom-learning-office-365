
import cloneDeep from "lodash-es/cloneDeep";
import { Logger, LogLevel } from "@pnp/logging";


import { spfi, SPFI, SPFx } from "@pnp/sp";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { params } from "../services/Parameters";
import { IPlaylist, IAsset, ICacheConfig, ICustomizations, ICustomCDN, IMetadata, CacheConfig, Customizations, CustomCDN, IMultilingualString } from '../models/Models';
import { CustomListNames } from "../models/Enums";
import { UpgradeService } from "./UpgradeService";
import { IDataService } from "./DataService";

export interface ICustomDataService {
  doDataUpgrade(dataService: IDataService, configManifest: string, config: ICacheConfig, metadata: IMetadata, callBack?: () => void): Promise<void>;
  getCacheConfig(language: string): Promise<ICacheConfig>;
  getCustomCDN(): Promise<ICustomCDN>;
  getCustomization(): Promise<ICustomizations>;
  getCustomPlaylists(): Promise<IPlaylist[]>;
  getCustomAssets(): Promise<IAsset[]>;
  createPlaylist(newPlaylist: IPlaylist): Promise<number>;
  modifyPlaylist(editPlaylist: IPlaylist, cdn?: string): Promise<string>;
  deletePlaylist(playlistId: string): Promise<boolean>;
  createAsset(newAsset: IAsset): Promise<number>;
  modifyAsset(editAsset: IAsset, cdn?: string): Promise<string>;
  createCache(newConfig: ICacheConfig, language: string): Promise<number>;
  modifyCache(editConfig: ICacheConfig, cdn?: string): Promise<string>;
  createCustomization(newCustomization: ICustomizations): Promise<number>;
  modifyCustomization(editCustomization: ICustomizations, cdn?: string): Promise<string>;
  upsertCdn(cdn: ICustomCDN): Promise<string>;
}

export interface IUpdateFunctions {
  _sp: SPFI;
  modifyPlaylist(editPlaylist: IPlaylist, cdn?: string): Promise<string>;
  modifyAsset(editAsset: IAsset, cdn?: string): Promise<string>;
  modifyCache(editConfig: ICacheConfig, cdn?: string): Promise<string>;
  modifyCustomization(editCustomization: ICustomizations, cdn?: string): Promise<string>;
}

export class CustomDataService implements ICustomDataService {
  private LOG_SOURCE: string = "CustomDataService";
  private _sp: SPFI;
  private _cdn: string;

  constructor(currentCDN: string) {
    try {
      this._sp = spfi(params.learningSiteUrl).using(SPFx(params.context));
      this._cdn = currentCDN;
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (constructor) - ${err}`, LogLevel.Error);
    }
  }

  //Optional formatter for dates using JSON.parse
  private dateTimeReviver(key, value): Date {
    const dateFormat: RegExp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
    if (typeof value === "string" && dateFormat.test(value)) {
      return new Date(value);
    }
    return value;
  }

  // During upgrade we don't have a specific type for config
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async doDataUpgrade(dataService: IDataService, configManifest: string, config: any, metadata: IMetadata, callBack?: () => void): Promise<void> {
    try {
      const workingConfig = cloneDeep(config);
      const upgradeFunctions: IUpdateFunctions = {
        _sp: this._sp,
        modifyCache: this.modifyCache,
        modifyCustomization: this.modifyCustomization,
        modifyPlaylist: this.modifyPlaylist,
        modifyAsset: this.modifyAsset
      };

      const startVersion = +configManifest.substring(1, 2);
      const endVersion = +params.manifestVersion.substring(1, 2);

      if (startVersion < endVersion) {
        const us = new UpgradeService(upgradeFunctions, startVersion, endVersion, metadata);
        Logger.write(`Upgrade Custom Config from ${configManifest} to ${params.manifestVersion} - ${this.LOG_SOURCE} (doDataUpgrade)`, LogLevel.Warning);

        let customization = await this.getCustomization();
        // During upgrade we don't have a specific type for config
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        customization = await us.doUpgradeCustomization(customization, config as any);
        dataService.customization = customization;
        Logger.write(`Upgrade Playlists and Assets from ${configManifest} to ${params.manifestVersion} - ${this.LOG_SOURCE} (doDataUpgrade)`, LogLevel.Info);

        const cp = await this.getCustomPlaylists();
        await us.doUpgradePlaylists(cp);
        const ca = await this.getCustomAssets();
        await us.doUpgradeAssets(ca);

        Logger.write(`Upgrade Cache Config from ${configManifest} to ${params.manifestVersion} - ${this.LOG_SOURCE} (doDataUpgrade)`, LogLevel.Warning);
        await us.doUpgradeCacheConfig(workingConfig);
      }
      if (callBack)
        callBack();
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (doDataUpgrade) - ${err}`, LogLevel.Error);
    }
  }

  //Gets custom configuration stored in local SharePoint list
  public async getCacheConfig(language: string): Promise<ICacheConfig> {
    let config: ICacheConfig | null = new CacheConfig();

    if (!language)
      language = params.defaultLanguage;

    try {
      const configResponse = await this._sp.web.lists.getByTitle(CustomListNames.customConfigName).items
        .select("Id", "Title", "JSONData")
        .orderBy("Id", false)
        .filter(`(Title eq 'CustomConfig') and (CDN eq '${this._cdn}') and (Language eq '${language}')`)
        .top(1)<{ Id: string, Title: string, JSONData: string }[]>();
      if (configResponse.length === 1) {
        if (configResponse[0].JSONData.length > 0) {
          config.Id = +configResponse[0].Id;
          config.eTag = JSON.parse(configResponse[0]["odata.etag"]);
          try {
            config = JSON.parse(configResponse[0].JSONData, this.dateTimeReviver);
          } catch (errJSON) {
            //If JSON data can't be parsed, remove item as it will be regenerated.
            if (config != null) {
              this._sp.web.lists.getByTitle(CustomListNames.customConfigName).items.getById(config.Id).delete();
              config = null;
            }
          }
        }
      } else {
        Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (getCustomConfig) No configuration was found for CDN ${this._cdn} and Language ${language}`, LogLevel.Error);
        config = null;
      }
    } catch (err) {
      config = null;
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (getCustomConfig) - ${err}`, LogLevel.Error);
    }

    return config as ICacheConfig;
  }

  //Gets custom configuration stored in local SharePoint list
  public async getCustomization(): Promise<ICustomizations> {
    let config: ICustomizations | null = new Customizations();

    try {
      const configResponse = await this._sp.web.lists.getByTitle(CustomListNames.customConfigName).items
        .select("Id", "Title", "JSONData")
        .filter(`(Title eq 'CustomSubCategories') and (CDN eq '${this._cdn}')`)
        .top(1)<{ Id: string, Title: string, JSONData: string }[]>();
      if (configResponse.length == 1) {
        if (configResponse[0].JSONData.length > 0) {
          config = JSON.parse(configResponse[0].JSONData);
          if (config != null) {
            config.Id = +configResponse[0].Id;
            config.eTag = JSON.parse(configResponse[0]["odata.etag"]);
          }
        }
      } else {
        config = new Customizations();
      }
    } catch (err) {
      config = null;
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (getCustomization) - ${err}`, LogLevel.Error);
    }

    return config as ICustomizations;
  }

  //Gets custom configuration stored in local SharePoint list
  public async getCustomCDN(): Promise<ICustomCDN> {
    let cdn: ICustomCDN | null = new CustomCDN();

    try {
      const cdnResponse = await this._sp.web.lists.getByTitle(CustomListNames.customConfigName).items
        .select("Id", "Title", "JSONData")
        .filter(`Title eq 'CustomCDN'`)
        .top(1)<{ Id: string, Title: string, JSONData: string }[]>();
      if (cdnResponse.length == 1) {
        if (cdnResponse[0].JSONData.length > 0) {
          cdn = JSON.parse(cdnResponse[0].JSONData);
          if (cdn != null) {
            cdn.Id = +cdnResponse[0].Id;
            cdn.eTag = JSON.parse(cdnResponse[0]["odata.etag"]);
          }
        }
      }
    } catch (err) {
      cdn = null;
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (getCustomCDN) - ${err}`, LogLevel.Error);
    }

    return cdn as ICustomCDN;
  }

  //Gets custom playlists stored in local SharePoint list (this code assumes the same site collection)
  public async getCustomPlaylists(): Promise<IPlaylist[]> {
    const customPlaylists: IPlaylist[] = [];

    try {
      const playlists = await this._sp.web.lists.getByTitle(CustomListNames.customPlaylistsName).items
        .top(5000)
        .select("Id", "Title", "JSONData")
        .filter(`CDN eq '${this._cdn}'`)<{ Id: string, Title: string, JSONData: string }[]>();
      for (let i = 0; i < playlists.length; i++) {
        try {
          const playlist: IPlaylist = JSON.parse(playlists[i].JSONData);
          playlist["@odata.etag"] = playlists[i]["@odata.etag"];
          playlist.Id = `${playlists[i].Id}`;
          customPlaylists.push(playlist);
        } catch (err) {
          Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (getCustomPlaylists) - ${err}`, LogLevel.Error);
        }
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (getCustomPlaylists) - ${err}`, LogLevel.Error);
    }

    return customPlaylists;
  }

  //Gets custom playlist assets stored in local SharePoint list (this code assumes the same site collection)
  public async getCustomAssets(): Promise<IAsset[]> {
    const customAssets: IAsset[] = [];
    const assets = await this._sp.web.lists.getByTitle(CustomListNames.customAssetsName).items
      .top(5000)
      .select("Id", "Title", "JSONData")
      .filter(`CDN eq '${this._cdn}'`)<{ Id: string, Title: string, JSONData: string }[]>();
    for (let i = 0; i < assets.length; i++) {
      try {
        const asset: IAsset = JSON.parse(assets[i].JSONData);
        asset["@odata.etag"] = assets[i]["@odata.etag"];
        asset.Id = `${assets[i].Id}`;
        customAssets.push(asset);
      } catch (err) {
        Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (getCustomAssets) - ${err}`, LogLevel.Error);
      }
    }
    return customAssets;
  }

  //Creates a custom playlist stored in local SharePoint list (this code assumes the same site collection)
  public async createPlaylist(newPlaylist: IPlaylist): Promise<number> {
    try {
      delete newPlaylist['@odata.etag'];
      delete newPlaylist.LevelValue;
      delete newPlaylist.AudienceValue;
      const title = (newPlaylist.Title instanceof Array) ? (newPlaylist.Title as IMultilingualString[])[0].Text : newPlaylist.Title as string;
      const item = { Title: title, CDN: this._cdn, JSONData: JSON.stringify(newPlaylist) };
      const newPlaylistResponse: {Id: number} = await this._sp.web.lists.getByTitle(CustomListNames.customPlaylistsName).items.add(item);
      // The response for the add item is the correct Id, so this is a false error
      // eslint-disable-next-line require-atomic-updates
      newPlaylist.Id = newPlaylistResponse.Id.toString();
      item.JSONData = JSON.stringify(newPlaylist);
      await this._sp.web.lists.getByTitle(CustomListNames.customPlaylistsName).items.getById(+newPlaylistResponse.Id).update(item);
      return newPlaylistResponse.Id;
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (createPlaylist) - ${err}`, LogLevel.Error);
      return 0;
    }
  }

  //Updates a custom playlist stored in local SharePoint list (this code assumes the same site collection)
  public async modifyPlaylist(editPlaylist: IPlaylist, cdn?: string): Promise<string> {
    try {
      delete editPlaylist['@odata.etag'];
      delete editPlaylist.LevelValue;
      delete editPlaylist.AudienceValue;
      const title = (editPlaylist.Title instanceof Array) ? (editPlaylist.Title as IMultilingualString[])[0].Text : editPlaylist.Title as string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const item: any = { Title: title, JSONData: JSON.stringify(editPlaylist) };
      if (cdn)
        item.CDN = cdn;
      const updatedPlaylistResponse = await this._sp.web.lists.getByTitle(CustomListNames.customPlaylistsName).items.getById(+editPlaylist.Id).update(item);

      return updatedPlaylistResponse.etag.split('"')[1].toString();
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (modifyPlaylist) - ${err}`, LogLevel.Error);
      return "0";
    }
  }

  //Deletes a custom playlist stored in local SharePoint list (this code assumes the same site collection)
  //Does not remove associated assets, could be updated to look for orphaned assets and act accordingly
  public async deletePlaylist(playlistId: string): Promise<boolean> {
    try {
      await this._sp.web.lists.getByTitle(CustomListNames.customPlaylistsName).items.getById(+playlistId).recycle();
      return true;
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (deletePlaylist) - ${err}`, LogLevel.Error);
      return false;
    }
  }

  //Creates a custom playlist asset stored in local SharePoint list (this code assumes the same site collection)
  public async createAsset(newAsset: IAsset): Promise<number> {
    try {
      delete newAsset['@odata.etag'];
      const title = (newAsset.Title instanceof Array) ? (newAsset.Title as IMultilingualString[])[0].Text : newAsset.Title as string;
      const item = { Title: title, CDN: this._cdn, JSONData: JSON.stringify(newAsset) };
      const newAssetResponse: {Id: number}= await this._sp.web.lists.getByTitle(CustomListNames.customAssetsName).items.add(item);
      // The response for the add item is the correct Id, so this is a false error
      // eslint-disable-next-line require-atomic-updates
      newAsset.Id = newAssetResponse.Id.toString();
      item.JSONData = JSON.stringify(newAsset);
      await this._sp.web.lists.getByTitle(CustomListNames.customAssetsName).items.getById(+newAssetResponse.Id).update(item);
      return newAssetResponse.Id;
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (createAsset) - ${err}`, LogLevel.Error);
      return 0;
    }
  }

  //Updates a custom playlist asset stored in local SharePoint list (this code assumes the same site collection)
  public async modifyAsset(editAsset: IAsset, cdn?: string): Promise<string> {
    try {
      delete editAsset['@odata.etag'];
      const title = (editAsset.Title instanceof Array) ? (editAsset.Title as IMultilingualString[])[0].Text : editAsset.Title as string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const item:any = { Title: title, JSONData: JSON.stringify(editAsset) };
      if (cdn)
        item.CDN = cdn;
      const updatedAssetResponse = await this._sp.web.lists.getByTitle(CustomListNames.customAssetsName).items.getById(+editAsset.Id).update(item);
      return updatedAssetResponse.etag.split('"')[1].toString();
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (modifyAsset) - ${err}`, LogLevel.Error);
      return "0";
    }
  }

  //Creates a custom config stored in local SharePoint list
  public async createCache(newConfig: ICacheConfig, language: string): Promise<number> {
    try {
      if (!language)
        language = params.defaultLanguage;

      delete newConfig['@odata.etag'];
      const newConfigResponse = await this._sp.web.lists.getByTitle(CustomListNames.customConfigName).items
        .add({ Title: "CustomConfig", CDN: this._cdn, Language: language, JSONData: JSON.stringify(newConfig) });

      return newConfigResponse.Id;
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (createConfig) - ${err}`, LogLevel.Error);
      return 0;
    }
  }

  //Updates a custom config stored in local SharePoint list 
  public async modifyCache(editConfig: ICacheConfig, cdn?: string): Promise<string> {
    try {
      delete editConfig['@odata.etag'];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const item: any = { JSONData: JSON.stringify(editConfig) };
      if (cdn)
        item.CDN = cdn;
      const updatedConfigResponse = await this._sp.web.lists.getByTitle(CustomListNames.customConfigName).items
        .getById(editConfig.Id).update(item);

      return updatedConfigResponse.etag.split('"')[1].toString();
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (modifyConfig) - ${err}`, LogLevel.Error);
      return "0";
    }
  }

  //Creates a custom sub category array stored in local SharePoint list;
  public async createCustomization(newCustomization: ICustomizations): Promise<number> {
    try {
      delete newCustomization['@odata.etag'];
      const newConfigResponse = await this._sp.web.lists.getByTitle(CustomListNames.customConfigName).items.add({ Title: "CustomSubCategories", CDN: this._cdn, JSONData: JSON.stringify(newCustomization) });

      return newConfigResponse.Id;
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (createCustomization) - ${err}`, LogLevel.Error);
      return 0;
    }
  }

  //Updates a custom sub category array stored in local SharePoint list 
  public async modifyCustomization(editCustomization: ICustomizations, cdn?: string): Promise<string> {
    try {
      delete editCustomization['@odata.etag'];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const item: any = { JSONData: JSON.stringify(editCustomization) };
      if (cdn)
        item.CDN = cdn;
      const updatedConfigResponse = await this._sp.web.lists.getByTitle(CustomListNames.customConfigName).items.getById(+editCustomization.Id).update(item);

      return updatedConfigResponse.etag.split('"')[1].toString();
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (modifyCustomization) - ${err}`, LogLevel.Error);
      return "0";
    }
  }

  public async upsertCdn(cdn: ICustomCDN): Promise<string> {
    try {
      delete cdn['@odata.etag'];
      let cdnResponse;
      if (cdn.Id === 0) {
        cdnResponse = await this._sp.web.lists.getByTitle(CustomListNames.customConfigName).items.add({ Title: "CustomCDN", JSONData: JSON.stringify(cdn) });
      } else {
        cdnResponse = await this._sp.web.lists.getByTitle(CustomListNames.customConfigName).items.getById(cdn.Id).update({ JSONData: JSON.stringify(cdn) });
      }

      return (cdn.Id === 0) ? cdnResponse.Id.toString() : cdnResponse.etag.split('"')[1].toString();
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (createSubCategories) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}