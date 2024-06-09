
import { Logger, LogLevel } from "@pnp/logging";
import findIndex from "lodash-es/findIndex";
import forEach from "lodash-es/forEach";
import find from "lodash-es/find";

import { spfi, SPFI, SPFx } from "@pnp/sp";
import "@pnp/sp/site-users";
import "@pnp/sp/features";
import "@pnp/sp/webs";

import * as strings from "M365LPStrings";
import { ConfigService } from "./ConfigService";
import { Roles } from "../models/Enums";
import { params } from "./Parameters";
import { IManifest, ILocale, CDN, ICDN, IWebhookConfig } from "../models/Models";
import { HttpClientResponse, HttpClient } from "@microsoft/sp-http";
import { CustomDataService } from "./CustomDataService";

export interface IInitService {
  assetOrigins: string[];
  telemetryKey: string;
  initialize(cdn: string): Promise<boolean>;
  validateLists(owner: boolean): Promise<boolean>;
  loadManifest(baseCdnPath: string): Promise<boolean>;
  loadConfiguredLanguages(): boolean;
  webhookConfig: IWebhookConfig;
}

export class InitService implements IInitService {
  private LOG_SOURCE: string = "InitService";
  private locals: ILocale[] = [];
  private _cdn: string;
  private _sp: SPFI;
  private _assetOrigins: string[];
  private _telemetryKey: string;
  private _webhookConfig: IWebhookConfig;

  constructor() { }

  public get telemetryKey(): string {
    return this._telemetryKey;
  }

  public get assetOrigins(): string[] {
    return this._assetOrigins;
  }

  public get webhookConfig(): IWebhookConfig {
    return this._webhookConfig;
  }

  public async initialize(cdn: string): Promise<boolean> {
    let retVal: boolean = false;
    try {
      this._cdn = cdn;
      this._sp = spfi().using(SPFx(params.context));
      const successLS = await this.loadLearningSite();
      if (successLS) {
        const successCDN = await this.loadCdnBase();
        if (successCDN) {
          const successManifest = await this.loadManifest(params.baseCdnPath);
          if (successManifest) {
            //Complete remaining init in parallel
            const initComplete: Promise<boolean>[] = [];
            initComplete.push(this.loadLanguage());
            initComplete.push(this.loadTelemetryOn());
            initComplete.push(this.loadUserRole());
            initComplete.push(this.loadWebhookConfig());

            const successAll = await Promise.all(initComplete);
            if (successAll.indexOf(false) === -1)
              retVal = true;
          }
        }
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (initialize) - ${err}`, LogLevel.Error);
    }
    return retVal;
  }

  private convertLocal(localeId: number): ILocale {
    try {
      const local: ILocale = find(this.locals, { localeId: localeId }) as ILocale;
      if (local) {
        local.code = local.code.toLowerCase();
        return local;
      } else {
        return {
          "localeId": 1033,
          "description": "English - United States",
          "code": "en-us"
        };
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (convertLocal) - ${err}`, LogLevel.Error);
    }
  }

  private async loadLanguage(): Promise<boolean> {
    let retVal: boolean = false;
    try {
      const multilingualOnCheck = await this._sp.web.features.getById('24611c05-ee19-45da-955f-6602264abaf8')();
      params.multilingualEnabled = (multilingualOnCheck["odata.null"]) ? false : true;

      const web = await this._sp.web();
      const languageId = web.Language;
      try {
        this.locals = require(`../assets/locals-${languageId}.json`);
      } catch (err) {
        this.locals = require(`../assets/locals-1033.json`);
      }
      const webLanguage = this.convertLocal(languageId);
      params.webLanguage = webLanguage.code.toLowerCase();
      //Check if default web language is supported, otherwise fall back to English
      const checkWebLanguage = params.supportedLanguages.indexOf(webLanguage.code.toLowerCase()) > -1;
      const defaultLocale = checkWebLanguage ? webLanguage : this.convertLocal(1033);
      params.defaultLanguage = defaultLocale.code.toLowerCase();
      params.configuredLanguages = [defaultLocale];
      if (params.multilingualEnabled) {
        const defaultLanguageCheck: {SupportedUILanguageIds: number[]} = await this._sp.web.select("SupportedUILanguageIds")();
        if (defaultLanguageCheck) {
          // eslint-disable-next-line require-atomic-updates
          params.multilingualLanguages = defaultLanguageCheck.SupportedUILanguageIds;
          retVal = this.loadConfiguredLanguages();
        }
      } else {
        retVal = true;
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (loadLanguage) - ${err}`, LogLevel.Error);
    }
    return retVal;
  }

  public loadConfiguredLanguages(): boolean {
    let retVal: boolean = false;
    try {
      const defaultLocale = find(this.locals, { code: params.defaultLanguage }) as ILocale;
      const mlLanguages: ILocale[] = [defaultLocale];
      forEach(params.multilingualLanguages, (localId: number) => {
        const mlLangCode = this.convertLocal(localId);
        if (params.supportedLanguages.indexOf(mlLangCode.code) > -1 && mlLangCode.code !== params.defaultLanguage)
          mlLanguages.push(mlLangCode);
      });
      params.configuredLanguages = mlLanguages;
      retVal = true;
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (loadConfiguredLanguages) - ${err}`, LogLevel.Error);
    }
    return retVal;
  }

  //Read value of MicrosoftCustomLearningSite from Tenant Properties
  private async loadCdnBase(): Promise<boolean> {
    let retVal: boolean = false;
    try {
      const defaultCdn = await this._sp.web.getStorageEntity("MicrosoftCustomLearningCdn");
      if (defaultCdn.Value) {
        const v2Idx = defaultCdn.Value.indexOf("v2/");
        const defaultCdnBasePath = (v2Idx > -1) ? defaultCdn.Value.replace("v2", `learningpathways/`) : `${defaultCdn.Value}`;
        if (params.customCDN === null) {
          params.allCdn = [new CDN("Default", strings.M365Title, defaultCdnBasePath)];
          const customDataService = new CustomDataService(this._cdn);
          // eslint-disable-next-line require-atomic-updates
          params.customCDN = await customDataService.getCustomCDN();
          if (params.customCDN && params.customCDN.CDNs.length > 0) {
            params.allCdn = params.allCdn.concat(params.customCDN.CDNs);
          }
        }

        params.baseCdnPath = defaultCdnBasePath;
        //Update base path for non-default CDN.
        if (this._cdn !== "Default") {
          const cdnCustom: ICDN = find(params.customCDN.CDNs, { Id: this._cdn });
          if (cdnCustom) {
            params.baseCdnPath = cdnCustom.Base;
          } else {
            Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (loadCdnBase) -- Could not find alternate CDN: ${this._cdn}.`, LogLevel.Error);
            return;
          }
        }
        retVal = true;
      } else {
        Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (loadCdnBase) -- Tenant property 'MicrosoftCustomLearningCdn' has not been set.`, LogLevel.Error);
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (loadCdnBase) - ${err} - `, LogLevel.Error);
    }
    return retVal;
  }

  //Read value of MicrosoftCustomLearningSite from Tenant Properties
  private async loadTelemetryOn(): Promise<boolean> {
    let retVal: boolean = false;
    try {
      const telemetryOn = await this._sp.web.getStorageEntity("MicrosoftCustomLearningTelemetryOn");
      if (telemetryOn.Value) {
        params.telemetryOn = (telemetryOn.Value.toLowerCase() == "true");
        retVal = true;
      } else {
        Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (setLearningSite) -- Tenant property 'MicrosoftCustomLearningTelemetryOn' has not been set.`, LogLevel.Error);
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (loadLearningSite) - ${err}`, LogLevel.Error);
    }
    return retVal;
  }

  //Read value of MicrosoftCustomLearningSite from Tenant Properties
  private async loadLearningSite(): Promise<boolean> {
    let retVal: boolean = false;
    try {
      const learningSite = await this._sp.web.getStorageEntity("MicrosoftCustomLearningSite");
      if (learningSite.Value) {
        if (learningSite.Value.indexOf("http") === 0) {
          params.learningSiteUrl = learningSite.Value;
        } else {
          params.learningSiteUrl = `${document.location.origin}${learningSite.Value}`;
        }
        retVal = true;
      } else {
        Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (setLearningSite) -- Tenant property 'MicrosoftCustomLearningSite' has not been set.`, LogLevel.Error);
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (loadLearningSite) - ${err}`, LogLevel.Error);
    }
    return retVal;
  }

  //Read value of MicrosoftCustomLearningWebhookConfig from Tenant Properties
  private async loadWebhookConfig(): Promise<boolean> {
    let retVal: boolean = false;
    try {
      const webhookConfig = await this._sp.web.getStorageEntity("MicrosoftCustomLearningWebhookConfig");
      if (webhookConfig.Value) {
        params.webhookConfig = (webhookConfig.Value?.length > 0) ? JSON.parse(webhookConfig.Value) : { Url: null, AnonymizeUser: true };
      } else {
        Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (setWebhookConfig) -- Tenant property 'MicrosoftCustomLearningWebhookConfig' has not been set.`, LogLevel.Info);
      }
      retVal = true;
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (loadWebhookConfig) - ${err}`, LogLevel.Error);
    }
    return retVal;
  }

  //Only need manifest from Microsoft's endpoint -- will need to revist if Telemetry Key will be honored for partners
  public async loadManifest(baseCdnPath: string): Promise<boolean> {
    let retVal: boolean = false;
    try {
      let manifest: IManifest;

      if (baseCdnPath !== params.baseCdnPath)
        params.baseCdnPath = baseCdnPath;

      const results: HttpClientResponse = await params.httpClient.fetch(`${params.baseCdnPath}manifest.json`, HttpClient.configurations.v1, {
        headers: { Accept: "application/json;odata.metadata=none" }
      });
      if (results.ok) {
        manifest = await results.json();
        this._assetOrigins = manifest.AssetOrigins;
        this._telemetryKey = manifest.Telemetry.AppInsightKey;
      } else {
        Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (getManifest) Fetch Error: ${results.statusText}`, LogLevel.Error);
        return retVal;
      }

      //Update params with manifest
      // eslint-disable-next-line require-atomic-updates
      params.manifest = manifest;
      retVal = true;
    }
    catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (getManifest) - ${err}`, LogLevel.Error);
    }
    return retVal;
  }

  //Calls SharePoint REST Api to determine if user is in Owners, Members, or Visitors group
  //Used to filter categories in metadata.json by the Security property
  private async loadUserRole(): Promise<boolean> {
    let retVal: boolean = false;
    try {
      const ownersGroup = await this._sp.web.associatedOwnerGroup();
      const membersGroup = await this._sp.web.associatedMemberGroup();
      const data = await this._sp.web.currentUser.expand("groups")<{ IsSiteAdmin: boolean, Groups: { Id: string }[] }>();
      let ownerIndex: number = findIndex(data.Groups, o => (o.Id.toString() === ownersGroup.Id.toString()));
      if (data.IsSiteAdmin) {
        ownerIndex = 0;
      }
      const membersIndex: number = findIndex(data.Groups, o => (o.Id.toString() === membersGroup.Id.toString()));
      if (ownerIndex > -1)
        params.userRole = Roles.Owners;
      else if (membersIndex > -1)
        params.userRole = Roles.Members;
      else
        params.userRole = Roles.Visitors;
      retVal = true;
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (loadUserRole) - ${err}`, LogLevel.Error);
    }
    return retVal;
  }

  //Validate that custom playlist and assets SharePoint lists exist based on web part properties
  public async validateLists(owner: boolean): Promise<boolean> {
    try {
      const configService = new ConfigService(this._sp);

      const listsCheck: Promise<boolean>[] = [];
      listsCheck.push(configService.validateConfig(owner));
      listsCheck.push(configService.validatePlaylists(owner));
      listsCheck.push(configService.validateAssets(owner));

      const validateResults = await Promise.all(listsCheck);

      for (let i = 0; i < validateResults.length; i++) {
        if (!validateResults[i]) {
          return false;
        }
      }
      return true;
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (validateLists) - ${err}`, LogLevel.Error);
      return false;
    }
  }
}