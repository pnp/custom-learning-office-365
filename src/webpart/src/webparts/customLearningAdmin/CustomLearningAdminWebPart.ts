import "core-js/stable/array/from";
import "core-js/stable/array/fill";
import "core-js/stable/array/iterator";
import "core-js/stable/promise";
import "core-js/stable/reflect";
import "es6-map/implement";
import "whatwg-fetch";

import * as React from 'react';
import * as ReactDom from 'react-dom';
import { sp } from '@pnp/sp';
import find from "lodash/find";
import cloneDeep from "lodash/cloneDeep";
import findIndex from "lodash/findIndex";
import remove from "lodash/remove";
import forEach from "lodash/forEach";
import { Version, UrlQueryParameterCollection } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import { Logger, ConsoleListener, LogLevel } from '@pnp/logging';
import { initializeIcons } from '@uifabric/icons';

import { params } from "../common/services/Parameters";
import * as strings from "M365LPStrings";
import { ICacheConfig, CacheConfig, IPlaylist, IAsset, ICustomizations, ICDN, IMultilingualString, MultilingualString, IPlaylistTranslation } from '../common/models/Models';
import { Roles, ShimmerView, CustomWebpartSource } from '../common/models/Enums';
import { AppInsightsService } from '../common/services/AppInsightsService';
import ShimmerViewer from "../common/components/Atoms/ShimmerViewer";
import Error from "../common/components/Atoms/Error";
import { InitService, IInitService } from '../common/services/InitService';
import LanguageController, { ILanguageController } from '../common/services/LanguageController';
import { ICustomDataService, CustomDataService } from '../common/services/CustomDataService';
import UpdateConfiguration from "./components/Atoms/UpdateConfiguration";
import CustomLearningAdmin, { ICustomLearningAdminProps } from "./components/CustomLearningAdmin";

export interface ICustomLearningAdminWebPartProps {
}


import {
  ThemeProvider,
  ThemeChangedEventArgs,
  IReadonlyTheme,
  ISemanticColors
} from '@microsoft/sp-component-base';

export default class CustomLearningAdminWebPart extends BaseClientSideWebPart<ICustomLearningAdminWebPartProps> {
  private LOG_SOURCE: string = "CustomLearningAdminWebPart";
  private _isReady: boolean = false;
  private _isError: boolean = false;
  private _initService: IInitService;
  private _firstConfig: boolean = false;
  private _validConfig: boolean = false;
  private _languageController: ILanguageController;
  private _cacheConfig: ICacheConfig = new CacheConfig();
  private _cdn: string = "";
  private _customService: ICustomDataService;
  private _webpartVersion: string;
  private _forceUpdate: string;
  private _upgradeNeeded: boolean = false;
  private _updateStartVersion: string;
  private _themeProvider: ThemeProvider;
  private _themeVariant: IReadonlyTheme | undefined;

  public async onInit(): Promise<void> {

    // Consume the new ThemeProvider service
    this._themeProvider = this.context.serviceScope.consume(ThemeProvider.serviceKey);

    // If it exists, get the theme variant
    this._themeVariant = this._themeProvider.tryGetTheme();

    // If there is a theme variant
    if (this._themeVariant) {
      // we set transfer semanticColors into CSS variables
      this.setCSSVariables(this._themeVariant.semanticColors);
      this.setCSSVariables(this._themeVariant.palette);
      this.setCSSVariables(this._themeVariant["effects"]);

    } else if (window["__themeState__"].theme) {
      // we set transfer semanticColors into CSS variables
      this.setCSSVariables(window["__themeState__"].theme);
    }

    try {
      //Initialize PnPLogger
      Logger.subscribe(new ConsoleListener());
      Logger.activeLogLevel = LogLevel.Info;

      //Initialize UI Fabric Icons
      initializeIcons();

      //Initialize PnPJs
      let ie11Mode: boolean = (!!window.MSInputMethodContext && !!document["documentMode"]);
      sp.setup({ ie11: ie11Mode, spfxContext: this.context });

      //Save context for PnPSPFxReactFilePicker
      params.context = this.context;

      //Set HttpClient
      params.httpClient = this.context.httpClient;

      //Determine if on an app part page
      params.appPartPage = (document.getElementById("spPageCanvasContent") == null);

      //Set Web Part Version
      params.webPartVersion = this.context.manifest.version;

      //Set User Language
      params.userLanguage = this.context.pageContext.cultureInfo.currentUICultureName;

      //Check for force update parameter
      let queryParms: UrlQueryParameterCollection = new UrlQueryParameterCollection(window.location.href);
      this._forceUpdate = queryParms.getValue("forceUpdate");

      this.render();
      this.firstInit();
    } catch (err) {
      this._isReady = true;
      this._isError = true;
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (onInit) - ${err} -- Could not start web part.`, LogLevel.Error);
    }
  }

  private async firstInit(): Promise<void> {
    try {
      this._cdn = "Default";
      this._webpartVersion = this.context.manifest.version;
      this._initService = new InitService();
      let successInit = await this._initService.initialize(this._cdn);
      if (successInit) {
        //Validate in custom learning site
        if (this.context.pageContext.web.absoluteUrl?.toLowerCase() != params.learningSiteUrl?.toLowerCase()) {
          Logger.write(`This site is not the Microsoft 365 learning pathways site as defined by the tenant property MicrosoftCustomLearningSite: '${params.learningSiteUrl}'. If the tenant property is correct than this web part cannot run in this web.`, LogLevel.Error);
          return;
        }
        this._validConfig = await this._initService.validateLists((params.userRole === Roles.Owners));
        this._languageController = new LanguageController(this._cdn);
        await this._languageController.init();
        if (this._validConfig) {
          this._cacheConfig = await this._languageController.getCacheConfig();
          if (!this._cacheConfig) {
            this._firstConfig = true;
            this._cacheConfig = new CacheConfig();
          } else {
            //Check if upgrade is necessary
            let configManifest: string = this._cacheConfig.ManifestVersion || (this._cacheConfig.WebPartVersion) ? `v${this._cacheConfig.WebPartVersion.substring(0, 1)}` : null;
            if ((configManifest && configManifest < params.manifestVersion) || (this._forceUpdate && this._forceUpdate < params.manifestVersion)) {
              let versions: string[] = [configManifest, this._forceUpdate].sort();
              this._updateStartVersion = versions[0];
              this._upgradeNeeded = true;
            }
          }
          if (!this._upgradeNeeded) {
            this._cacheConfig = await this._languageController.refreshCache(this._cacheConfig);
            if (!this._cacheConfig) {
              //Error refreshing custom config
              this._validConfig = false;
              this.telemetry("false", "Refreshing custom configuration failed.");
            } else {
              this._customService = new CustomDataService(this._cdn);
              if (this._firstConfig)
                this.telemetry("true");
              Logger.write(`Initialized Microsoft 365 learning pathways Admin - Tenant: ${this.context.pageContext.aadInfo.tenantId}`, LogLevel.Info);
            }
          }
        } else {
          this.telemetry("false", "Site Collection configuration failed.");
        }
      } else {
        this._isError = true;
      }
    } catch (err) {
      this.telemetry("false", err.message);
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (firstInit) - ${err} -- Could not start web part.`, LogLevel.Error);
    }

    //Configuration complete, now render
    if (!this._isError) {
      //let isDataServiceReady = await this._languageController.isReady();
      //this._isReady = isDataServiceReady;
      this._isReady = true;
    }
    this.render();
  }

  private telemetry(success: string, error?: string) {
    AppInsightsService.initialize(this._cdn, this._initService.telemetryKey);
    AppInsightsService.trackEvent(this.LOG_SOURCE, {
      success,
      error: error || ""
    });
  }

  public async render(): Promise<void> {
    let element;

    let shimmer = React.createElement(
      ShimmerViewer, { shimmerView: ShimmerView.Admin }
    );

    if (this._isError) {
      element = React.createElement(
        Error,
        {
          message: `${strings.AdminConfigIssueMessage} {${this.LOG_SOURCE}}`
        }
      );
    } else if (!this._isReady) {
      //Render Shimmer indicating web part is loading
      element = shimmer;
    } else {
      try {
        if (this._upgradeNeeded) {
          let dataService = find(this._languageController.dataServices, { code: params.defaultLanguage });
          if (dataService) {
            element = React.createElement(
              UpdateConfiguration, {
              cdn: this._cdn,
              startVersion: this._updateStartVersion,
              cache: this._cacheConfig,
              dataService: dataService.dataService
            });
          }
        } else {
          if (params.userRole !== Roles.Visitors) {
            //Render web part
            const props: ICustomLearningAdminProps = {
              validConfig: this._validConfig,
              currentWebpart: this._webpartVersion,
              cacheConfig: this._cacheConfig,
              customization: this._languageController.customization,
              categoriesAll: this._languageController.categoriesAll,
              technologiesAll: (this._languageController.metadata) ? this._languageController.metadata.Technologies : [],
              playlistsAll: this._languageController.playlistsAll,
              assetsAll: this._languageController.assetsAll,
              levels: (this._languageController.metadata) ? this._languageController.metadata.Levels : [],
              audiences: (this._languageController.metadata) ? this._languageController.metadata.Audiences : [],
              siteUrl: this.context.pageContext.site.absoluteUrl,
              firstConfig: this._firstConfig,
              saveConfig: this.saveConfig,
              upsertCustomizations: this.upsertCustomizations,
              upsertAsset: this.upsertAsset,
              upsertPlaylist: this.upsertPlaylist,
              deletePlaylist: this.deletePlaylist,
              copyPlaylist: this.copyPlaylist,
              upsertCdn: this.upsertCdn,
              selectCDN: this.selectCDN,
              removeCdn: this.removeCdn,
              translatePlaylist: this.translatePlaylist,
              translateAsset: this.translateAsset
            };
            element = React.createElement(React.Suspense, { fallback: shimmer },
              React.createElement(CustomLearningAdmin, props)
            );
          } else {
            //Render security message
            element = React.createElement(
              Error,
              {
                message: strings.AdminSecurityMessage
              }
            );
          }
        }
      } catch (err) {
        Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
        element = React.createElement(
          Error,
          {
            message: `${strings.AdminConfigIssueMessage} {${this.LOG_SOURCE} - ${err}}`
          }
        );
      }
    }
    ReactDom.render(element, this.domElement);
    return;
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  private saveConfig = async (newConfig: ICacheConfig): Promise<void> => {
    this._cacheConfig = await this._languageController.refreshCache(newConfig);
    this.render();
    return;
  }

  private selectCDN = async (cdnId: string): Promise<boolean> => {
    try {
      let cdn = find(params.allCdn, { Id: cdnId });
      if (cdn) {
        this._validConfig = false;
        this._cacheConfig = null;
        this._cdn = cdnId;
        //params.currentCdn = this._cdn;
        let successInit = await this._initService.loadManifest(cdn.Base);
        if (successInit) {
          this._initService.loadConfiguredLanguages();
          this._languageController = new LanguageController(this._cdn);
          await this._languageController.init();
          this._cacheConfig = await this._languageController.getCacheConfig();
          if (!this._cacheConfig) {
            this._cacheConfig = new CacheConfig();
          } else {
            //Check if upgrade is necessary
            let configManifest: string = this._cacheConfig.ManifestVersion || (this._cacheConfig.WebPartVersion) ? `v${this._cacheConfig.WebPartVersion.substring(0, 1)}` : null;
            if ((configManifest && configManifest < params.manifestVersion) || (this._forceUpdate && this._forceUpdate < params.manifestVersion)) {
              let versions: string[] = [configManifest, this._forceUpdate].sort();
              this._updateStartVersion = versions[0];
              this._upgradeNeeded = true;
              this.render();
              return true;
            }
          }
          this._cacheConfig = await this._languageController.refreshCache(this._cacheConfig);
          if (this._cacheConfig) {
            this._customService = new CustomDataService(this._cdn);
            this._validConfig = true;
            Logger.write(`Changed CDN to: ${cdn.Name} (${cdn.Id}) - BaseUrl: ${cdn.Base}`, LogLevel.Info);
            this.render();
            return true;
          } else {
            this.render();
            return false;
          }
        } else {
          this.render();
          return false;
        }
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (selectCDN) - ${err}`, LogLevel.Error);
    }
    return false;
  }

  private upsertCustomizations = async (newCustomizations: ICustomizations): Promise<void> => {
    try {
      let saveCustomization: string;
      if (newCustomizations.Id === 0) {
        let savePlaylistVal = await this._customService.createCustomization(newCustomizations);
        saveCustomization = savePlaylistVal.toString();
        newCustomizations.Id = +saveCustomization;
      } else {
        saveCustomization = await this._customService.modifyCustomization(newCustomizations);
      }
      if (saveCustomization !== "0") {
        this._languageController.customization = newCustomizations;
        //Reset config and render
        this._cacheConfig = await this._languageController.refreshCache(this._cacheConfig);
        this.render();
      }

      return;
    }
    catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (upsertCustomizations) - ${err}`, LogLevel.Error);
      return;
    }
  }

  private upsertPlaylist = async (playlist: IPlaylist): Promise<string> => {
    try {
      let savePlaylist: string;
      if (playlist.Id === "0") {
        let savePlaylistVal = await this._customService.createPlaylist(playlist);
        savePlaylist = savePlaylistVal.toString();
      } else {
        savePlaylist = await this._customService.modifyPlaylist(playlist);
      }
      if (savePlaylist !== "0") {
        //Refresh playlists
        await this._languageController.refreshPlaylistsAll(true);
        //Reset config and render
        this._cacheConfig = await this._languageController.getCacheConfig();
        this.render();
      }

      return savePlaylist;
    }
    catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (upsertPlaylist) - ${err}`, LogLevel.Error);
      return "0";
    }
  }

  private deletePlaylist = async (playlistId: string): Promise<void> => {
    try {
      let deleteResult = await this._customService.deletePlaylist(playlistId);
      if (deleteResult) {
        //Refresh playlists
        await this._languageController.refreshPlaylistsAll(true);
        //Reset config and render
        this._cacheConfig = await this._languageController.getCacheConfig();
        this.render();
      }
    }
    catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (deletePlaylist) - ${err}`, LogLevel.Error);
    }
    return;
  }

  private upsertAsset = async (asset: IAsset): Promise<string> => {
    try {
      let saveAsset: string;
      let newAsset: boolean = (asset.Id === "0") ? true : false;
      if (newAsset) {
        let saveAssetVal = await this._customService.createAsset(asset);
        saveAsset = saveAssetVal.toString();
      } else {
        saveAsset = await this._customService.modifyAsset(asset);
      }
      if (saveAsset !== "0") {
        //Refresh assets
        let assets = await this._languageController.refreshAssetsAll(true);
        //Reset config and render
        this._cacheConfig = await this._languageController.getCacheConfig();
        this.render();
      }
      return saveAsset;
    }
    catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (upsertPlaylist) - ${err}`, LogLevel.Error);
      return "0";
    }
  }

  private upsertCdn = async (cdn: ICDN): Promise<boolean> => {
    try {
      let customService = new CustomDataService(params.allCdn[0].Id);
      let customCdn = cloneDeep(params.customCDN);
      let cdnIndex = findIndex(customCdn.CDNs, { Id: cdn.Id });
      if (cdnIndex > -1) {
        customCdn.CDNs[cdnIndex] = cdn;
      } else {
        customCdn.CDNs.push(cdn);
      }

      let upsertResult = await customService.upsertCdn(customCdn);
      if (upsertResult) {
        if (cdnIndex > 1)
          customCdn.eTag = upsertResult;
        else
          customCdn.Id = +upsertResult;
        params.customCDN = customCdn;
        let allCDN: ICDN[] = [cloneDeep(params.allCdn[0])];
        allCDN = allCDN.concat(customCdn.CDNs);
        params.allCdn = allCDN;
        return true;
      } else {
        return false;
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (upsertCdn) - ${err}`, LogLevel.Error);
      return false;
    }
  }

  private removeCdn = async (cdnId: string): Promise<boolean> => {
    try {
      let customService = new CustomDataService(params.allCdn[0].Id);
      let customCdn = cloneDeep(params.customCDN);
      remove(customCdn.CDNs, { Id: cdnId });

      let upsertResult = await customService.upsertCdn(customCdn);
      if (upsertResult) {
        customCdn.eTag = upsertResult;
        params.customCDN = customCdn;
        let allCDN: ICDN[] = [cloneDeep(params.allCdn[0])];
        allCDN = allCDN.concat(customCdn.CDNs);
        params.allCdn = allCDN;
        return true;
      } else {
        return false;
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (removeCdn) - ${err}`, LogLevel.Error);
      return false;
    }
  }

  private translateAsset = (asset: IAsset): IAsset => {
    const translation: IPlaylistTranslation[] = this._languageController.getAssetTranslations(asset.Id);

    asset.Title = this.translateMLString(translation, (translation) ? "Title" : asset.Title, null);
    asset.Url = this.translateMLString(translation, (translation) ? "Url" : asset.Url, null);

    return asset;
  }

  private translatePlaylist = (playlist: IPlaylist): IPlaylist => {
    let translations: IPlaylistTranslation[] = this._languageController.getPlaylistTranslations(playlist.Id);

    playlist.Title = this.translateMLString(translations, (translations) ? "Title" : playlist.Title, null);
    playlist.Image = this.translateMLString(translations, (translations) ? "Image" : playlist.Image, null);
    playlist.Description = this.translateMLString(translations, (translations) ? "Description" : playlist.Description, null);

    return playlist;
  }

  private translateMLString(translations: IPlaylistTranslation[], source: string | IMultilingualString[], prefix: string): IMultilingualString[] {
    let retVal: IMultilingualString[] = [];
    try {
      if (translations) {
        forEach(translations, (t: IPlaylistTranslation) => {
          const ml = new MultilingualString(t.LanguageCode, `${(prefix) ? prefix : ""}${t[source as string]}`);
          retVal.push(ml);
        });
      } else {
        retVal = source as IMultilingualString[];
        if (prefix)
          forEach(retVal, (val) => { val.Text = `${prefix}${val.Text}`; });
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (translateMLString) - ${err}`, LogLevel.Error);
    }
    return retVal;
  }

  private setCSSVariables(theming: any) {

    // request all key defined in theming
    let themingKeys = Object.keys(theming);
    // if we have the key
    if (themingKeys !== null) {
      // loop over it
      themingKeys.forEach(key => {
        // add CSS variable to style property of the web part
        this.domElement.style.setProperty(`--${key}`, theming[key]);

      });

    }

  }

  private copyPlaylist = async (playlist: IPlaylist): Promise<string> => {
    try {
      let newPlaylist = cloneDeep(playlist);
      if (playlist.Source !== CustomWebpartSource.Tenant) {
        newPlaylist = this.translatePlaylist(newPlaylist);
      }
      newPlaylist.Id = "0";
      forEach(newPlaylist.Title as IMultilingualString[], (t) => {
        t.Text = `${strings.LinkPanelCopyLabel.toUpperCase()} - ${t.Text}`;
      });
      newPlaylist.Source = CustomWebpartSource.Tenant;
      let savePlaylist: string;
      let savePlaylistVal = await this._customService.createPlaylist(newPlaylist);
      savePlaylist = savePlaylistVal.toString();

      if (savePlaylist !== "0") {
        //Refresh playlists
        await this._languageController.refreshPlaylistsAll(true);
        //Reset config and render
        this._cacheConfig = await this._languageController.getCacheConfig();
        this.render();
      }

      return savePlaylist;
    }
    catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (clonePlaylist) - ${err}`, LogLevel.Error);
      return "0";
    }
  }
}
