import { Logger, LogLevel } from "@pnp/logging";
import { InitService } from "./InitService";
import { Roles } from "../models/Enums";
import { CacheConfig, ICacheConfig, ICategory } from "../models/Models";
import { DataService } from "./DataService";
import { params } from "./Parameters";
import find from "lodash/find";
import { forEach } from "lodash";

export interface ICacheController {
  isValid: boolean;
  CDN: string;
  language: string;
  cacheConfig: ICacheConfig;
  flatCategory: ICategory[];
  isReady: () => Promise<boolean>;
  doInit(cdn: string, language: string): Promise<void>;
}

export default class CacheController implements ICacheController {
  private LOG_SOURCE: string = "CacheController";

  private _isValid: boolean = true;
  private _cdn: string;
  private _language: string;
  private _cacheConfig: ICacheConfig;

  private _ready: boolean = false;
  private _loading: boolean = false;
  private static _instance: { [cdn: string]: CacheController } = {};

  public constructor() { }

  public get isValid(): boolean {
    return this._isValid;
  }

  public get CDN(): string {
    return this._cdn;
  }

  public get language(): string {
    return this._language;
  }

  public get cacheConfig(): ICacheConfig {
    return this._cacheConfig;
  }

  public get flatCategory(): ICategory[] {
    return this.getFlatCategory(this._cacheConfig.Categories);
  }

  public static getInstance(cdn: string): CacheController {
    if (!CacheController._instance[cdn]) {
      CacheController._instance[cdn] = new CacheController();
    }
    return CacheController._instance[cdn];
  }

  private async delay(ms: number): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public async doInit(cdn: string, language: string): Promise<void> {
    try {
      if (!this._ready && !this._loading) {
        this._loading = true;
        this._cdn = cdn;
        let initService = new InitService();
        await initService.initialize(this._cdn);

        let supported = find(params.configuredLanguages, { code: language });
        if (supported)
          this._language = language;
        else
          this._language = params.defaultLanguage;

        let dataService = new DataService(this._cdn, this._language);
        this._cacheConfig = await dataService.getCacheConfig();
        if (!this._cacheConfig) {
          this._isValid = await initService.validateLists((params.userRole === Roles.Owners));
          if (this._isValid) {
            //retry getting previous custom config with language added
            this._cacheConfig = await dataService.getCacheConfig();
            if (!this._cacheConfig)
              this._cacheConfig = await dataService.refreshCache(new CacheConfig());
            if (!this._cacheConfig)
              this._isValid = false;
          }
        } else {
          //Check if upgrade is necessary
          let configManifest: string = this._cacheConfig.ManifestVersion || (this._cacheConfig.WebPartVersion) ? `v${this._cacheConfig.WebPartVersion.substring(0, 1)}` : null;
          if (!configManifest || configManifest >= params.manifestVersion) {
            //If upgrade isn't needed; Test if cache is out of date
            let yesterday: Date = new Date();
            yesterday.setDate(yesterday.getDate() + -1);
            if (!this._cacheConfig.LastUpdated || this._cacheConfig.LastUpdated < yesterday) {
              this._cacheConfig = await dataService.refreshCache(this._cacheConfig);
            }
          } else {
            this._isValid = false;
          }
        }
        if (this._isValid) {
          this._cacheConfig.AssetOrigins = initService.assetOrigins;
          this._cacheConfig.TelemetryKey = initService.telemetryKey;
        }
        this._loading = false;
        this._ready = true;
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (doInit) - ${err}`, LogLevel.Error);
    }
  }

  public async isReady(): Promise<boolean> {
    try {
      let startTime = new Date().getTime();
      while (!this._ready || new Date().getTime() - startTime > 120000) {
        await this.delay(500);
      }
      return this._ready;
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (isReady) - ${err}`, LogLevel.Error);
      return false;
    }
  }

  private getFlatCategory(categories: ICategory[]): ICategory[] {
    let flatCategory: ICategory[] = [];
    try {
      forEach(categories, (item: ICategory) => {
        if (isNaN(+item.Id)) {
          flatCategory.push(item);
          forEach(item.SubCategories, (sc: ICategory) => {
            if (sc.SubCategories.length > 0)
              flatCategory.concat(this.getFlatCategory([sc]));
            else
              flatCategory.push(sc);
          });
        }
      });
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (getFlatCategory) - ${err}`, LogLevel.Error);
    }
    return flatCategory;
  }

}