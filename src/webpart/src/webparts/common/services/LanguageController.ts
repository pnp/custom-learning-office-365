import { Logger, LogLevel } from "@pnp/logging";
import forEach from 'lodash-es/forEach';
import find from "lodash-es/find";

import { params } from "./Parameters";
import { IDataService, DataService } from "./DataService";
import { IMetadata, ICustomizations, IPlaylist, IAsset, ICacheConfig, ICategory, PlaylistTranslation, IPlaylistTranslation } from "../models/Models";


export interface ILanguageController extends IDataService {
  dataServices: { code: string, dataService: IDataService, cacheConfig: ICacheConfig }[];
  init(): Promise<void>;
  getPlaylistTranslations(playlistId: string): IPlaylistTranslation[];
  getAssetTranslations(assetId: string): IPlaylistTranslation[];
}

export default class LanguageController implements ILanguageController {
  private LOG_SOURCE: string = "LanguageController";
  private _ready: boolean = true;

  public dataServices: { code: string, dataService: IDataService, cacheConfig: ICacheConfig }[] = [];
  private _cdn: string;

  constructor(cdn: string) {
    this._cdn = cdn;
  }

  public async init(): Promise<void> {
    try {
      this.dataServices.push({ code: params.defaultLanguage, dataService: new DataService(this._cdn, params.defaultLanguage), cacheConfig: null });
      await this.dataServices[0].dataService.init();
      if (params.multilingualEnabled) {
        forEach(params.configuredLanguages, (language, idx) => {
          if (idx > 0)
            this.dataServices.push({ code: language.code, dataService: new DataService(this._cdn, language.code, this.dataServices[0].dataService.customization), cacheConfig: null });
        });
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (init) - ${err}`, LogLevel.Error);
    }
  }

  private async delay(ms: number): Promise<unknown> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async languageControllerReady(): Promise<boolean> {
    const startTime = new Date().getTime();
    while (!this._ready || new Date().getTime() - startTime > 60000) {
      await this.delay(200);
    }
    return this._ready;
  }

  get cdn(): string {
    return this._cdn;
  }

  get metadata(): IMetadata {
    return this.dataServices[0].dataService.metadata;
  }

  get customization(): ICustomizations {
    return this.dataServices[0].dataService.customization;
  }

  set customization(value: ICustomizations) {
    forEach(this.dataServices, (ds) => {
      ds.dataService.customization = value;
    });
  }

  get categoriesAll(): ICategory[] {
    return this.dataServices[0].dataService.categoriesAll;
  }

  get playlistsAll(): IPlaylist[] {
    return this.dataServices[0].dataService.playlistsAll;
  }

  get assetsAll(): IAsset[] {
    return this.dataServices[0].dataService.assetsAll;
  }

  public async getCacheConfig(): Promise<ICacheConfig> {
    if (!this.dataServices[0].cacheConfig)
      this.dataServices[0].cacheConfig = await this.dataServices[0].dataService.getCacheConfig();
    return this.dataServices[0].cacheConfig;
  }

  public async getMetadata(): Promise<IMetadata> {
    return await this.dataServices[0].dataService.getMetadata();
  }

  public async refreshCache(cacheConfig: ICacheConfig): Promise<ICacheConfig> {
    const ready = await this.languageControllerReady();
    if (ready) {
      this.dataServices[0].cacheConfig = await this.dataServices[0].dataService.refreshCache(cacheConfig);
      if (this.dataServices.length > 1) {
        this._ready = false;
        this.refreshCacheAltLangs();
      }
    }
    return this.dataServices[0].cacheConfig;
  }

  private async refreshCacheAltLangs(): Promise<void> {
    for (let i = 1; i < this.dataServices.length; i++) {
      let cc = this.dataServices[i].cacheConfig;
      if (!cc) {
        cc = await this.dataServices[i].dataService.getCacheConfig();
      }
      this.dataServices[i].cacheConfig = await this.dataServices[i].dataService.refreshCache(cc);
    }
    this._ready = true;
  }

  public async refreshCacheCustomOnly(cacheConfig: ICacheConfig): Promise<ICacheConfig> {
    const ready = await this.languageControllerReady();
    if (ready) {
      this.dataServices[0].cacheConfig = await this.dataServices[0].dataService.refreshCacheCustomOnly(cacheConfig, null, null);
      if (this.dataServices.length > 1) {
        this._ready = false;
        this.refreshCacheCustomOnlyAltLangs();
      }
    }
    return this.dataServices[0].cacheConfig;
  }

  private async refreshCacheCustomOnlyAltLangs(): Promise<void> {
    for (let i = 1; i < this.dataServices.length; i++) {
      this.dataServices[i].cacheConfig = await this.dataServices[i].dataService.refreshCacheCustomOnly(this.dataServices[i].cacheConfig, null, null);
    }
    this._ready = true;
  }

  public async refreshPlaylistsAll(customOnly: boolean): Promise<IPlaylist[]> {
    const ready = await this.languageControllerReady();
    if (ready) {
      const playlists = await this.dataServices[0].dataService.refreshPlaylistsAll(customOnly);
      this.dataServices[0].cacheConfig = await this.dataServices[0].dataService.refreshCacheCustomOnly(this.dataServices[0].cacheConfig, playlists, null);
      if (this.dataServices.length > 1) {
        this._ready = false;
        this.refreshPlaylistsAllAltLangs(customOnly);
      }
    }
    return;
  }

  private async refreshPlaylistsAllAltLangs(customOnly: boolean): Promise<void> {
    for (let i = 1; i < this.dataServices.length; i++) {
      const playlists = await this.dataServices[i].dataService.refreshPlaylistsAll(customOnly);
      this.dataServices[i].cacheConfig = await this.dataServices[i].dataService.refreshCacheCustomOnly(this.dataServices[i].cacheConfig, playlists, null);
    }
    this._ready = true;
    return;
  }

  public async refreshAssetsAll(customOnly: boolean): Promise<IAsset[]> {
    const ready = await this.languageControllerReady();
    if (ready) {
      const assets = await this.dataServices[0].dataService.refreshAssetsAll(customOnly);
      this.dataServices[0].cacheConfig = await this.dataServices[0].dataService.refreshCacheCustomOnly(this.dataServices[0].cacheConfig, null, assets);
      if (this.dataServices.length > 1) {
        this._ready = false;
        this.refreshAssetsAllAltLangs(customOnly);
      }
    }
    return;
  }

  private async refreshAssetsAllAltLangs(customOnly: boolean): Promise<void> {
    for (let i = 1; i < this.dataServices.length; i++) {
      const assets = await this.dataServices[i].dataService.refreshAssetsAll(customOnly);
      this.dataServices[i].cacheConfig = await this.dataServices[i].dataService.refreshCacheCustomOnly(this.dataServices[i].cacheConfig, null, assets);
    }
    this._ready = true;
    return;
  }

  public getPlaylistTranslations(playlistId: string): IPlaylistTranslation[] {
    const retVal: IPlaylistTranslation[] = [];
    try {
      forEach(this.dataServices, (ds) => {
        const pl = find(ds.dataService.playlistsAll, { Id: playlistId });
        if (pl) {
          const plt = new PlaylistTranslation(ds.code, pl.Title as string, pl.Image as string, pl.Description as string, null);
          retVal.push(plt);
        }
      });
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (getPlaylistTranslations) - ${err}`, LogLevel.Error);
    }
    return retVal;
  }

  public getAssetTranslations(assetId: string): IPlaylistTranslation[] {
    const retVal: IPlaylistTranslation[] = [];
    try {
      forEach(this.dataServices, (ds) => {
        const a = find(ds.dataService.assetsAll, { Id: assetId });
        if (a) {
          const at = new PlaylistTranslation(ds.code, a.Title as string, null, null, a.Url as string);
          retVal.push(at);
        }
      });
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (getAssetTranslations) - ${err}`, LogLevel.Error);
    }
    return retVal;
  }
}