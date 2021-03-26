
import cloneDeep from "lodash/cloneDeep";
import { Logger, LogLevel } from "@pnp/logging";


import { Web, IWeb } from "@pnp/sp/webs";
import { IItemUpdateResult, IItemAddResult } from "@pnp/sp/items/types";
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
  _web: IWeb;
  modifyPlaylist(editPlaylist: IPlaylist, cdn?: string): Promise<string>;
  modifyAsset(editAsset: IAsset, cdn?: string): Promise<string>;
  modifyCache(editConfig: ICacheConfig, cdn?: string): Promise<string>;
  modifyCustomization(editCustomization: ICustomizations, cdn?: string): Promise<string>;
}

export class CustomDataService implements ICustomDataService {
  private LOG_SOURCE: string = "CustomDataService";
  private _web: IWeb;
  private _cdn: string;

  constructor(currentCDN: string) {
    try {
      this._web = Web(params.learningSiteUrl);
      this._cdn = currentCDN;
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (constructor) - ${err}`, LogLevel.Error);
    }
  }

  //Optional formatter for dates using JSON.parse
  private dateTimeReviver(key, value) {
    const dateFormat: RegExp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
    if (typeof value === "string" && dateFormat.test(value)) {
      return new Date(value);
    }

    return value;
  }

  public async doDataUpgrade(dataService: IDataService, configManifest: string, config: any, metadata: IMetadata, callBack?: () => void): Promise<void> {
    try {
      let workingConfig = cloneDeep(config);
      let upgradeFunctions: IUpdateFunctions = {
        _web: this._web,
        modifyCache: this.modifyCache,
        modifyCustomization: this.modifyCustomization,
        modifyPlaylist: this.modifyPlaylist,
        modifyAsset: this.modifyAsset
      };

      let startVersion = +configManifest.substr(1, 1);
      let endVersion = +params.manifestVersion.substr(1, 1);

      if (startVersion < endVersion) {
        let us = new UpgradeService(upgradeFunctions, startVersion, endVersion, metadata);
        Logger.write(`Upgrade Custom Config from ${configManifest} to ${params.manifestVersion} - ${this.LOG_SOURCE} (doDataUpgrade)`, LogLevel.Warning);

        let customization = await this.getCustomization();
        customization = await us.doUpgradeCustomization(customization, config);
        dataService.customization = customization;
        Logger.write(`Upgrade Playlists and Assets from ${configManifest} to ${params.manifestVersion} - ${this.LOG_SOURCE} (doDataUpgrade)`, LogLevel.Info);

        let cp = await this.getCustomPlaylists();
        cp = await us.doUpgradePlaylists(cp);
        let ca = await this.getCustomAssets();
        ca = await us.doUpgradeAssets(ca);

        Logger.write(`Upgrade Cache Config from ${configManifest} to ${params.manifestVersion} - ${this.LOG_SOURCE} (doDataUpgrade)`, LogLevel.Warning);
        workingConfig = await us.doUpgradeCacheConfig(workingConfig);
      }
      if (callBack)
        callBack();
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (doDataUpgrade) - ${err}`, LogLevel.Error);
    }
  }

  //Gets custom configuration stored in local SharePoint list
  public async getCacheConfig(language: string): Promise<ICacheConfig> {
    let config: ICacheConfig = new CacheConfig();

    if (!language)
      language = params.defaultLanguage;

    try {
      let configResponse = await this._web.lists.getByTitle(CustomListNames.customConfigName).items
        .select("Id", "Title", "JSONData")
        .orderBy("Id", false)
        .filter(`(Title eq 'CustomConfig') and (CDN eq '${this._cdn}') and (Language eq '${language}')`)
        .top(1)
        .get<{ Id: string, Title: string, JSONData: string }[]>();
      if (configResponse.length === 1) {
        if (configResponse[0].JSONData.length > 0) {
          config.Id = +configResponse[0].Id;
          config.eTag = JSON.parse(configResponse[0]["odata.etag"]);
          try {
            config = JSON.parse(configResponse[0].JSONData, this.dateTimeReviver);
          } catch (errJSON) {
            //If JSON data can't be parsed, remove item as it will be regenerated.
            this._web.lists.getByTitle(CustomListNames.customConfigName).items.getById(config.Id).delete();
            config = null;
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

    return config;
  }

  //Gets custom configuration stored in local SharePoint list
  public async getCustomization(): Promise<ICustomizations> {
    let config: ICustomizations = new Customizations();

    try {
      let configResponse = await this._web.lists.getByTitle(CustomListNames.customConfigName).items
        .select("Id", "Title", "JSONData")
        .filter(`(Title eq 'CustomSubCategories') and (CDN eq '${this._cdn}')`)
        .top(1)
        .get<{ Id: string, Title: string, JSONData: string }[]>();
      if (configResponse.length == 1) {
        if (configResponse[0].JSONData.length > 0) {
          config = JSON.parse(configResponse[0].JSONData);
          config.Id = +configResponse[0].Id;
          config.eTag = JSON.parse(configResponse[0]["odata.etag"]);
        }
      } else {
        config = new Customizations();
      }
    } catch (err) {
      config = null;
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (getCustomization) - ${err}`, LogLevel.Error);
    }

    return config;
  }

  //Gets custom configuration stored in local SharePoint list
  public async getCustomCDN(): Promise<ICustomCDN> {
    let cdn: ICustomCDN = new CustomCDN();

    try {
      let cdnResponse = await this._web.lists.getByTitle(CustomListNames.customConfigName).items
        .select("Id", "Title", "JSONData")
        .filter(`Title eq 'CustomCDN'`)
        .top(1)
        .get<{ Id: string, Title: string, JSONData: string }[]>();
      if (cdnResponse.length == 1) {
        if (cdnResponse[0].JSONData.length > 0) {
          cdn = JSON.parse(cdnResponse[0].JSONData);
          cdn.Id = +cdnResponse[0].Id;
          cdn.eTag = JSON.parse(cdnResponse[0]["odata.etag"]);
        }
      }
    } catch (err) {
      cdn = null;
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (getCustomCDN) - ${err}`, LogLevel.Error);
    }

    return cdn;
  }

  //Gets custom playlists stored in local SharePoint list (this code assumes the same site collection)
  public async getCustomPlaylists(): Promise<IPlaylist[]> {
    let customPlaylists: IPlaylist[] = [];

    try {
      let playlists = await this._web.lists.getByTitle(CustomListNames.customPlaylistsName).items
        .top(5000)
        .select("Id", "Title", "JSONData")
        .filter(`CDN eq '${this._cdn}'`)
        .get<{ Id: string, Title: string, JSONData: string }[]>();
      for (let i = 0; i < playlists.length; i++) {
        try {
          let playlist: IPlaylist = JSON.parse(playlists[i].JSONData);
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
    let customAssets: IAsset[] = [];
    let assets = await this._web.lists.getByTitle(CustomListNames.customAssetsName).items
      .top(5000)
      .select("Id", "Title", "JSONData")
      .filter(`CDN eq '${this._cdn}'`)
      .get<{ Id: string, Title: string, JSONData: string }[]>();
    for (let i = 0; i < assets.length; i++) {
      try {
        let asset: IAsset = JSON.parse(assets[i].JSONData);
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
      let title = (newPlaylist.Title instanceof Array) ? (newPlaylist.Title as IMultilingualString[])[0].Text : newPlaylist.Title as string;
      let item = { Title: title, CDN: this._cdn, JSONData: JSON.stringify(newPlaylist) };
      let newPlaylistResponse = await this._web.lists.getByTitle(CustomListNames.customPlaylistsName).items.add(item);
      newPlaylist.Id = newPlaylistResponse.data.Id;
      item.JSONData = JSON.stringify(newPlaylist);
      let updatedPlaylistResponse = await this._web.lists.getByTitle(CustomListNames.customPlaylistsName).items.getById(+newPlaylistResponse.data.Id).update(item);
      return newPlaylistResponse.data.Id;
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
      let title = (editPlaylist.Title instanceof Array) ? (editPlaylist.Title as IMultilingualString[])[0].Text : editPlaylist.Title as string;
      let item = { Title: title, JSONData: JSON.stringify(editPlaylist) };
      if (cdn)
        item["CDN"] = cdn;
      let updatedPlaylistResponse = await this._web.lists.getByTitle(CustomListNames.customPlaylistsName).items.getById(+editPlaylist.Id).update(item);

      return updatedPlaylistResponse.data["odata.etag"].split('\"')[1].toString();
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (modifyPlaylist) - ${err}`, LogLevel.Error);
      return "0";
    }
  }

  //Deletes a custom playlist stored in local SharePoint list (this code assumes the same site collection)
  //Does not remove associated assets, could be updated to look for orphaned assets and act accordingly
  public async deletePlaylist(playlistId: string): Promise<boolean> {
    try {
      await this._web.lists.getByTitle(CustomListNames.customPlaylistsName).items.getById(+playlistId).recycle();

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
      let title = (newAsset.Title instanceof Array) ? (newAsset.Title as IMultilingualString[])[0].Text : newAsset.Title as string;
      let item = { Title: title, CDN: this._cdn, JSONData: JSON.stringify(newAsset) };
      let newAssetResponse = await this._web.lists.getByTitle(CustomListNames.customAssetsName).items.add(item);
      newAsset.Id = newAssetResponse.data.Id;
      item.JSONData = JSON.stringify(newAsset);
      let updatedAssetResponse = await this._web.lists.getByTitle(CustomListNames.customAssetsName).items.getById(+newAssetResponse.data.Id).update(item);
      return newAssetResponse.data.Id;
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (createAsset) - ${err}`, LogLevel.Error);
      return 0;
    }
  }

  //Updates a custom playlist asset stored in local SharePoint list (this code assumes the same site collection)
  public async modifyAsset(editAsset: IAsset, cdn?: string): Promise<string> {
    try {
      delete editAsset['@odata.etag'];
      let title = (editAsset.Title instanceof Array) ? (editAsset.Title as IMultilingualString[])[0].Text : editAsset.Title as string;
      let item = { Title: title, JSONData: JSON.stringify(editAsset) };
      if (cdn)
        item["CDN"] = cdn;
      let updatedAssetResponse = await this._web.lists.getByTitle(CustomListNames.customAssetsName).items.getById(+editAsset.Id).update(item);

      return updatedAssetResponse.data["odata.etag"].split('\"')[1].toString();
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
      let newConfigResponse = await this._web.lists.getByTitle(CustomListNames.customConfigName).items
        .add({ Title: "CustomConfig", CDN: this._cdn, Language: language, JSONData: JSON.stringify(newConfig) });

      return newConfigResponse.data.Id;
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (createConfig) - ${err}`, LogLevel.Error);
      return 0;
    }
  }

  //Updates a custom config stored in local SharePoint list 
  public async modifyCache(editConfig: ICacheConfig, cdn?: string): Promise<string> {
    try {
      delete editConfig['@odata.etag'];
      let item = { JSONData: JSON.stringify(editConfig) };
      if (cdn)
        item["CDN"] = cdn;
      let updatedConfigResponse = await this._web.lists.getByTitle(CustomListNames.customConfigName).items
        .getById(editConfig.Id).update(item);

      return updatedConfigResponse.data["odata.etag"].split('\"')[1].toString();
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (modifyConfig) - ${err}`, LogLevel.Error);
      return "0";
    }
  }

  //Creates a custom sub category array stored in local SharePoint list;
  public async createCustomization(newCustomization: ICustomizations): Promise<number> {
    try {
      delete newCustomization['@odata.etag'];
      let newConfigResponse = await this._web.lists.getByTitle(CustomListNames.customConfigName).items.add({ Title: "CustomSubCategories", CDN: this._cdn, JSONData: JSON.stringify(newCustomization) });

      return newConfigResponse.data.Id;
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (createCustomization) - ${err}`, LogLevel.Error);
      return 0;
    }
  }

  //Updates a custom sub category array stored in local SharePoint list 
  public async modifyCustomization(editCustomization: ICustomizations, cdn?: string): Promise<string> {
    try {
      delete editCustomization['@odata.etag'];
      let item = { JSONData: JSON.stringify(editCustomization) };
      if (cdn)
        item["CDN"] = cdn;
      let updatedConfigResponse = await this._web.lists.getByTitle(CustomListNames.customConfigName).items.getById(+editCustomization.Id).update(item);

      return updatedConfigResponse.data["odata.etag"].split('\"')[1].toString();
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (modifyCustomization) - ${err}`, LogLevel.Error);
      return "0";
    }
  }

  public async upsertCdn(cdn: ICustomCDN): Promise<string> {
    try {
      delete cdn['@odata.etag'];
      let cdnResponse: IItemAddResult | IItemUpdateResult;
      if (cdn.Id === 0) {
        cdnResponse = await this._web.lists.getByTitle(CustomListNames.customConfigName).items.add({ Title: "CustomCDN", JSONData: JSON.stringify(cdn) });
      } else {
        cdnResponse = await this._web.lists.getByTitle(CustomListNames.customConfigName).items.getById(cdn.Id).update({ JSONData: JSON.stringify(cdn) });
      }

      return (cdn.Id === 0) ? cdnResponse.data.Id.toString() : cdnResponse.data["odata.etag"].split('\"')[1].toString();
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (createSubCategories) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}