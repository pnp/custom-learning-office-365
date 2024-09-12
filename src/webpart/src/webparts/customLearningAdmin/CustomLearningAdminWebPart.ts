import * as React from 'react';
import * as ReactDom from 'react-dom';
import find from "lodash-es/find";
import cloneDeep from "lodash-es/cloneDeep";
import findIndex from "lodash-es/findIndex";
import remove from "lodash-es/remove";
import forEach from "lodash-es/forEach";
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import { ThemeProvider } from '@microsoft/sp-component-base';
import { Logger, ConsoleListener, LogLevel } from '@pnp/logging';
import { symset } from '@n8d/htwoo-react/SymbolSet';
import { SPFxThemes, ISPFxThemes } from '@n8d/htwoo-react/SPFxThemes';
import mlpicons from "../../../../node_modules/learning-pathways-styleguide/source/images/mlp-icons.svg"

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

export default class CustomLearningAdminWebPart extends BaseClientSideWebPart<ICustomLearningAdminWebPartProps> {
  private LOG_SOURCE: string = "CustomLearningAdminWebPart";
  private _isReady: boolean = false;
  private _isError: boolean = false;
  private _initService: IInitService;
  private _firstConfig: boolean = false;
  private _validConfig: boolean = false;
  private _languageController: ILanguageController;
  private _cacheConfig: ICacheConfig | null = new CacheConfig();
  private _cdn: string = "";
  private _customService: ICustomDataService;
  private _webpartVersion: string;
  private _upgradeNeeded: boolean = false;
  private _updateStartVersion: string;
  private _themeProvider: ThemeProvider;
  private _queryParms: URLSearchParams = new URLSearchParams(window.location.search);
  private _forceUpdate = this._queryParms.get("forceUpdate");
  private _spfxThemes: ISPFxThemes = new SPFxThemes();

  public async onInit(): Promise<void> {

    // Consume the new ThemeProvider service
    this._themeProvider = this.context.serviceScope.consume(ThemeProvider.serviceKey);

    this._spfxThemes.initThemeHandler(this.domElement, this._themeProvider, this.context.sdks?.microsoftTeams);

    try {
      //Initialize PnPLogger
      Logger.subscribe(ConsoleListener());
      Logger.activeLogLevel = LogLevel.Info;

      //Initialize hTWOo Icons
      await symset.initSymbols(mlpicons);

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
      const successInit = await this._initService.initialize(this._cdn);
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
            const configManifest = this._cacheConfig.ManifestVersion || (this._cacheConfig.WebPartVersion) ? `v${this._cacheConfig.WebPartVersion.substring(0, 1)}` : null;
            if ((configManifest && configManifest < params.manifestVersion) || (this._forceUpdate && this._forceUpdate < params.manifestVersion)) {
              const versions: (string | null)[] = [configManifest, this._forceUpdate].sort();
              this._updateStartVersion = versions[0] as string;
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

  private telemetry(success: string, error?: string): void {
    AppInsightsService.initialize(this._cdn, this._initService.telemetryKey);
    AppInsightsService.trackEvent(this.LOG_SOURCE, {
      success,
      error: error || ""
    });
  }

  public async render(): Promise<void> {
    let element;

    const shimmer = React.createElement(
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
          const dataService = find(this._languageController.dataServices, { code: params.defaultLanguage });
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
              cacheConfig: this._cacheConfig as ICacheConfig,
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
      const cdn = find(params.allCdn, { Id: cdnId });
      if (cdn) {
        this._validConfig = false;
        this._cacheConfig = null;
        this._cdn = cdnId;
        //params.currentCdn = this._cdn;
        const successInit = await this._initService.loadManifest(cdn.Base);
        if (successInit) {
          this._initService.loadConfiguredLanguages();
          this._languageController = new LanguageController(this._cdn);
          await this._languageController.init();
          this._cacheConfig = await this._languageController.getCacheConfig();
          if (!this._cacheConfig) {
            this._cacheConfig = new CacheConfig();
          } else {
            //Check if upgrade is necessary
            const configManifest = this._cacheConfig.ManifestVersion || (this._cacheConfig.WebPartVersion) ? `v${this._cacheConfig.WebPartVersion.substring(0, 1)}` : null;
            if ((configManifest && configManifest < params.manifestVersion) || (this._forceUpdate && this._forceUpdate < params.manifestVersion)) {
              const versions: (string | null)[] = [configManifest, this._forceUpdate].sort();
              this._updateStartVersion = versions[0] as string;
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
      const nc = cloneDeep(newCustomizations);
      let saveCustomization: string;
      if (nc.Id === 0) {
        const savePlaylistVal = await this._customService.createCustomization(nc);
        nc.Id = savePlaylistVal as number;
      } else {
        saveCustomization = await this._customService.modifyCustomization(nc);
      }
      if (saveCustomization !== "0") {
        this._languageController.customization = nc;
        //Reset config and render
        this._cacheConfig = await this._languageController.refreshCache(this._cacheConfig as ICacheConfig);
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
        const savePlaylistVal = await this._customService.createPlaylist(playlist);
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
      const deleteResult = await this._customService.deletePlaylist(playlistId);
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
      const newAsset: boolean = (asset.Id === "0") ? true : false;
      if (newAsset) {
        const saveAssetVal = await this._customService.createAsset(asset);
        saveAsset = saveAssetVal.toString();
      } else {
        saveAsset = await this._customService.modifyAsset(asset);
      }
      if (saveAsset !== "0") {
        //Refresh assets
        await this._languageController.refreshAssetsAll(true);
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
      const customService = new CustomDataService(params.allCdn[0].Id);
      const customCdn = cloneDeep(params.customCDN);
      const cdnIndex = findIndex(customCdn.CDNs, { Id: cdn.Id });
      if (cdnIndex > -1) {
        customCdn.CDNs[cdnIndex] = cdn;
      } else {
        customCdn.CDNs.push(cdn);
      }

      const upsertResult = await customService.upsertCdn(customCdn);
      if (upsertResult) {
        if (cdnIndex > 1)
          customCdn.eTag = upsertResult;
        else
          customCdn.Id = +upsertResult;
          // eslint-disable-next-line require-atomic-updates
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
      const customService = new CustomDataService(params.allCdn[0].Id);
      const customCdn = cloneDeep(params.customCDN);
      remove(customCdn.CDNs, { Id: cdnId });

      const upsertResult = await customService.upsertCdn(customCdn);
      if (upsertResult) {
        customCdn.eTag = upsertResult;
        // eslint-disable-next-line require-atomic-updates
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
    const translations: IPlaylistTranslation[] = this._languageController.getPlaylistTranslations(playlist.Id);

    playlist.Title = this.translateMLString(translations, (translations) ? "Title" : playlist.Title, null);
    playlist.Image = this.translateMLString(translations, (translations) ? "Image" : playlist.Image, null);
    playlist.Description = this.translateMLString(translations, (translations) ? "Description" : playlist.Description, null);

    return playlist;
  }

  private translateMLString(translations: IPlaylistTranslation[], source: string | IMultilingualString[], prefix: string | null): IMultilingualString[] {
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
      const savePlaylistVal = await this._customService.createPlaylist(newPlaylist);
      const savePlaylist = savePlaylistVal.toString();

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
