
import { Logger, LogLevel } from "@pnp/logging";
import findIndex from "lodash/findIndex";
import forEach from "lodash/forEach";
import find from "lodash/find";

import { sp } from '@pnp/sp';
import { Web, IWeb } from "@pnp/sp/webs";
import "@pnp/sp/site-users";
import "@pnp/sp/features";

import * as strings from "M365LPStrings";
import { Environment, EnvironmentType } from '@microsoft/sp-core-library';
import { ConfigService } from "./ConfigService";
import { Roles } from "../models/Enums";
import { params } from "./Parameters";
import { IManifest, ILocale, CDN, ICDN } from "../models/Models";
import { HttpClientResponse, HttpClient } from "@microsoft/sp-http";
import { CustomDataService } from "./CustomDataService";

export interface IInitService {
  assetOrigins: string[];
  telemetryKey: string;
  initialize(cdn: string): Promise<boolean>;
  validateLists(owner: boolean): Promise<boolean>;
  loadManifest(baseCdnPath: string): Promise<boolean>;
  loadConfiguredLanguages(): boolean;
}

export class InitService implements IInitService {
  private LOG_SOURCE: string = "InitService";
  private locals: ILocale[] = [];
  private _cdn: string;
  private _assetOrigins: string[];
  private _telemetryKey: string;

  constructor() { }

  public get telemetryKey(): string {
    return this._telemetryKey;
  }

  public get assetOrigins(): string[] {
    return this._assetOrigins;
  }

  public async initialize(cdn: string): Promise<boolean> {
    let retVal: boolean = false;
    try {
      this._cdn = cdn;
      let successLS = await this.loadLearningSite();
      if (successLS) {
        let successCDN = await this.loadCdnBase();
        if (successCDN) {
          let successManifest = await this.loadManifest(params.baseCdnPath);
          if (successManifest) {
            //Complete remaining init in parallel
            let initComplete: Promise<boolean>[] = [];
            initComplete.push(this.loadLanguage());
            initComplete.push(this.loadTelemetryOn());
            initComplete.push(this.loadUserRole());

            let successAll = await Promise.all(initComplete);
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
      let local: ILocale = find(this.locals, { localeId: localeId }) as ILocale;
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
      let multilingualOnCheck = await sp.web.features.getById('24611c05-ee19-45da-955f-6602264abaf8').get();
      params.multilingualEnabled = (multilingualOnCheck["odata.null"]) ? false : true;

      let web: IWeb = await sp.web();
      let languageId = web["Language"];
      try {
        this.locals = require(`../assets/locals-${languageId}.json`);
      } catch (err) {
        this.locals = require(`../assets/locals-1033.json`);
      }
      let webLanguage = this.convertLocal(languageId);
      params.webLanguage = webLanguage.code.toLowerCase();
      //Check if default web language is supported, otherwise fall back to English
      let checkWebLanguage = params.supportedLanguages.indexOf(webLanguage.code.toLowerCase()) > -1;
      let defaultLocale = checkWebLanguage ? webLanguage : this.convertLocal(1033);
      params.defaultLanguage = defaultLocale.code.toLowerCase();
      params.configuredLanguages = [defaultLocale];
      if (params.multilingualEnabled) {
        let defaultLanguageCheck = await sp.web.select("SupportedUILanguageIds").get();
        if (defaultLanguageCheck) {
          params.multilingualLanguages = defaultLanguageCheck["SupportedUILanguageIds"];
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
      let defaultLocale = find(this.locals, { code: params.defaultLanguage }) as ILocale;
      let mlLanguages: ILocale[] = [defaultLocale];
      forEach(params.multilingualLanguages, (localId: number) => {
        let mlLangCode = this.convertLocal(localId);
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
      let defaultCdn = await sp.web.getStorageEntity("MicrosoftCustomLearningCdn");
      if (defaultCdn.Value) {
        let v2Idx = defaultCdn.Value.indexOf("v2/");
        let defaultCdnBasePath = (v2Idx > -1) ? defaultCdn.Value.replace("v2", `learningpathways/`) : `${defaultCdn.Value}`;
        if (params.customCDN === null) {
          params.allCdn = [new CDN("Default", strings.M365Title, defaultCdnBasePath)];
          let customDataService = new CustomDataService(this._cdn);
          params.customCDN = await customDataService.getCustomCDN();
          if (params.customCDN && params.customCDN.CDNs.length > 0) {
            params.allCdn = params.allCdn.concat(params.customCDN.CDNs);
          }
        }

        params.baseCdnPath = defaultCdnBasePath;
        //Update base path for non-default CDN.
        if (this._cdn !== "Default") {
          let cdnCustom: ICDN = find(params.customCDN.CDNs, { Id: this._cdn });
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
      let telemetryOn = await sp.web.getStorageEntity("MicrosoftCustomLearningTelemetryOn");
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
      let learningSite = await sp.web.getStorageEntity("MicrosoftCustomLearningSite");
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

  //Only need manifest from Microsoft's endpoint -- will need to revist if Telemetry Key will be honored for partners
  public async loadManifest(baseCdnPath: string): Promise<boolean> {
    let retVal: boolean = false;
    try {
      let manifest: IManifest;

      if (baseCdnPath !== params.baseCdnPath)
        params.baseCdnPath = baseCdnPath;

      let results: HttpClientResponse = await params.httpClient.fetch(`${params.baseCdnPath}manifest.json`, HttpClient.configurations.v1, {
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
      let ownersGroup = await sp.web.associatedOwnerGroup();
      let membersGroup = await sp.web.associatedMemberGroup();
      let data = await sp.web.currentUser.expand("groups").get<{ IsSiteAdmin: boolean, Groups: { Id: string }[] }>();
      let ownerIndex: number = findIndex(data.Groups, o => (o["Id"].toString() === ownersGroup.Id.toString()));
      if (data.IsSiteAdmin) {
        ownerIndex = 0;
      }
      let membersIndex: number = findIndex(data.Groups, o => (o["Id"].toString() === membersGroup.Id.toString()));
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
      let configService = new ConfigService(Web(params.learningSiteUrl));

      let listsCheck: Promise<boolean>[] = [];
      listsCheck.push(configService.validateConfig(owner));
      listsCheck.push(configService.validatePlaylists(owner));
      listsCheck.push(configService.validateAssets(owner));

      let validateResults = await Promise.all(listsCheck);

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