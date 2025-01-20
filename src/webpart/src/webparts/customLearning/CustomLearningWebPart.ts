/* eslint-disable dot-notation */
import * as React from "react";
import * as ReactDom from "react-dom";
import { Version, DisplayMode } from "@microsoft/sp-core-library";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import {
  IPropertyPaneConfiguration,
  IPropertyPaneDropdownOption,
  PropertyPaneDropdown,
  PropertyPaneLabel,
  PropertyPaneTextField,
  PropertyPaneDropdownOptionType,
  PropertyPaneToggle,
  PropertyPaneButton,
  PropertyPaneButtonType,
  IPropertyPaneField,
  IPropertyPaneDropdownProps,
  IPropertyPaneLabelProps
} from "@microsoft/sp-property-pane";
import { ThemeProvider } from '@microsoft/sp-component-base';
import { app } from "@microsoft/teams-js-v2";

import sortBy from "lodash-es/sortBy";
import find from "lodash-es/find";
import cloneDeep from "lodash-es/cloneDeep";

import { Logger, LogLevel, ConsoleListener } from "@pnp/logging";

import { params } from "../common/services/Parameters";
import { AppInsightsService } from "../common/services/AppInsightsService";
import { WebhookService } from "../common/services/WebhookService";
import { UXService, UXServiceContext } from "../common/services/UXService";
import { symset } from '@n8d/htwoo-react/SymbolSet';
import { SPFxThemes, ISPFxThemes } from '@n8d/htwoo-react/SPFxThemes';
import mlpicons from "../../../../node_modules/learning-pathways-styleguide/source/images/mlp-icons.svg"

import * as strings from "M365LPStrings";
import ShimmerViewer from "../common/components/Atoms/ShimmerViewer";
import { ICategory, IPlaylist } from "../common/models/Models";
import { Templates, WebPartModeOptions, PropertyPaneFilters, ShimmerView } from "../common/models/Enums";
import CacheController, { ICacheController } from "../common/services/CacheController";
import Error from "../common/components/Atoms/Error";

import CustomLearning, { ICustomLearningProps } from "./components/CustomLearning";

export interface ICustomLearningWebPartProps {
  webpartMode: string;
  defaultFilter: string;
  defaultCategory: string;
  defaultSubCategory: string;
  defaultPlaylist: string;
  defaultAsset: string;
  title: string;
  defaultCDN: string;
  customSort: boolean;
  customSortOrder: string[];
  alwaysShowSearch: boolean;
  openAssetsInDialog: boolean;
  defaultWebPartHeight: string;
}

export default class CustomLearningWebPart extends BaseClientSideWebPart<ICustomLearningWebPartProps> {
  private LOG_SOURCE: string = "CustomLearningWebPart";
  private _isReady: boolean = false;
  private _isError: boolean = false;
  private _cacheController: ICacheController;
  private _uxService = new UXService();
  private _validSetup: boolean = false;
  private _validConfig: boolean = false;
  private _teamsContext: app.Context;

  // private _startType: string = "";
  // private _startLocation: string = "";
  // private _startAsset: string = "";

  private _ppDefaultCDN: IPropertyPaneDropdownOption[];
  private _ppWebpartMode: IPropertyPaneDropdownOption[];
  private _ppCategory: IPropertyPaneDropdownOption[];
  private _ppSubCategory: IPropertyPaneDropdownOption[];
  private _ppPlaylist: IPropertyPaneDropdownOption[];
  private _ppFilters: IPropertyPaneDropdownOption[];
  private _ppAssets: IPropertyPaneDropdownOption[];

  //Get the values from the query string if necessary
  private _queryParms: URLSearchParams = new URLSearchParams(window.location.search);
  private _urlWebpartMode = this._queryParms.get("webpartmode");
  private _urlCDN = this._queryParms.get("cdn");
  private _urlCategory = this._queryParms.get("category");
  private _urlSubCategory = this._queryParms.get("subcategory");
  private _urlPlaylist = this._queryParms.get("playlist");
  private _urlAsset = this._queryParms.get("asset");

  // Theming support for Section
  private _themeProvider: ThemeProvider;
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

      //Save context
      params.context = this.context;

      //Set HttpClient
      params.httpClient = this.context.httpClient;

      //Determine if on an app part page
      params.appPartPage = (document.getElementById("spPageCanvasContent") == null);

      //Set Web Part Version
      params.webPartVersion = this.context.manifest.version;

      //Set User Language
      params.userLanguage = this.context.pageContext.cultureInfo.currentUICultureName.toLowerCase();

      //If in Teams context get Query String Parameters from Teams Context
      if (this.context.sdks?.microsoftTeams) {
        this._getTeamsQueryString();
        this._teamsContext = await this.context.sdks.microsoftTeams?.teamsJs.app.getContext();
      }

      this._firstInit();
    } catch (err) {
      this._isReady = true;
      this._isError = true;
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (onInit) - ${err} -- Could not initialize web part.`, LogLevel.Error);
    }

    return super.onInit();

  }

  private _getTeamsQueryString(): void {
    try {
      // Get configuration from the Teams SDK
      if (this._teamsContext != null) {
        if (this._teamsContext.page?.subPageId != null && this._teamsContext.page.subPageId?.length > 0) {
          const queryString = this._teamsContext.page.subPageId?.split(":");
          this._urlWebpartMode = queryString[0];
          this._urlCDN = queryString[1];
          this._urlCategory = queryString[2];
          this._urlSubCategory = queryString[3];
          this._urlPlaylist = queryString[4];
          this._urlAsset = queryString[5];
        }
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (getTeamsQueryString) - ${err} -- Error loading query string parameters from teams context.`, LogLevel.Error);
    }
  }

  private _setStartingLocation = (skipRender: boolean = false): void => {
    try {
      let startChanged = false;
      const webPartStartup = cloneDeep(this._uxService.WebPartStartup);

      if (this.properties.webpartMode !== "" && this.properties.webpartMode !== this._uxService.WebPartMode) {
        this._uxService.WebPartMode = this.properties.webpartMode;
        startChanged = true;
      }

      //Update startType and startLocation if changed.
      if (this.properties.defaultCategory !== "" && this.properties.defaultCategory !== webPartStartup.startingLocation) {
        webPartStartup.startingType = Templates.Category;
        webPartStartup.startingLocation = this.properties.defaultCategory;
        startChanged = true;
      }
      if (this.properties.defaultSubCategory !== "" && this.properties.defaultSubCategory !== webPartStartup.startingLocation) {
        webPartStartup.startingType = Templates.SubCategory;
        webPartStartup.startingLocation = this.properties.defaultSubCategory;
        startChanged = true;
      }
      if (this.properties.defaultPlaylist !== "" && this.properties.defaultPlaylist !== webPartStartup.startingLocation) {
        webPartStartup.startingType = Templates.Playlist;
        webPartStartup.startingLocation = this.properties.defaultPlaylist;
        startChanged = true;
      }
      if (this.properties.defaultAsset !== "" && this.properties.defaultAsset !== webPartStartup.startAsset) {
        webPartStartup.startAsset = this.properties.defaultAsset;
        startChanged = true;
      }
      if (this.properties.defaultCategory === "" && this.properties.defaultSubCategory === "" && this.properties.defaultPlaylist === "") {
        webPartStartup.startingType = "";
        webPartStartup.startingLocation = "";
        startChanged = true;
      }

      this._uxService.WebPartStartup = webPartStartup;
      if (startChanged) {
        //Reset history
        this._uxService.History = [];
      }
      if (startChanged && !skipRender) {
        this._uxService.CLWPRender();
      }
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (_setStartingLocation) - ${err}`);
    }
  }

  private _setQueryStringParams(): void {
    try {
      //Override if the query string parameters are set. But we don't want to do this if we are in edit mode.
      if (this.displayMode != DisplayMode.Edit) {

        const webPartStartup = cloneDeep(this._uxService.WebPartStartup);

        //Set Webpart mode via query string
        if ((this._urlWebpartMode) && (this._urlWebpartMode !== "")) {
          this._uxService.WebPartMode = this._urlWebpartMode;
        }
        //If any of the categories are set in the Query String then we reset the web part here
        if (((this._urlCategory) && (this._urlCategory != "")) || ((this._urlSubCategory) && (this._urlSubCategory != "")) || ((this._urlPlaylist) && (this._urlPlaylist != "")) || ((this._urlAsset) && (this._urlAsset != ""))) {
          if ((this._urlCategory) && (this._urlCategory != "")) {
            webPartStartup.startingType = Templates.Category;
            webPartStartup.startingLocation = this._urlCategory;
          } else if ((this._urlSubCategory) && (this._urlSubCategory != "")) {
            webPartStartup.startingType = Templates.SubCategory;
            webPartStartup.startingLocation = this._urlSubCategory;
          } else if ((this._urlPlaylist) && (this._urlPlaylist != "")) {
            webPartStartup.startingType = Templates.Playlist;
            webPartStartup.startingLocation = this._urlPlaylist;
            webPartStartup.startAsset = this._urlAsset as string;
          } else if ((this._urlAsset) && (this._urlAsset != "")) {
            webPartStartup.startingType = Templates.Asset;
            webPartStartup.startingLocation = this._urlAsset;
          } else {
            webPartStartup.startingType = "";
            webPartStartup.startingLocation = "";
          }
        }

        this._uxService.WebPartStartup = webPartStartup;
      }
    } catch (err) {
      console.error(`${this.LOG_SOURCE} (_setQueryStringParams) - ${err}`);
    }
  }

  private async _firstInit(): Promise<void> {
    try {
      let currentCdn = this._urlCDN;
      if (!currentCdn || currentCdn.length < 1) {
        if (!this.properties.defaultCDN || this.properties.defaultCDN === "")
          this.properties.defaultCDN = "Default";
        currentCdn = this.properties.defaultCDN;
      }

      await this._configCDN(currentCdn);

      if (this.context.propertyPane.isPropertyPaneOpen()) {
        this.onPropertyPaneConfigurationStart();
        this.context.propertyPane.refresh();
      }

      // Initialize App Insights
      AppInsightsService.initialize(this._cacheController.CDN, this._cacheController.cacheConfig.TelemetryKey);
      AppInsightsService.trackEvent(this.LOG_SOURCE);

      //Initialize Webhook Service
      WebhookService.initialize();

      //Initialize UX Service
      this._uxService.Init(this._cacheController);
      this._uxService.WebPartMode = this.properties.webpartMode;
      this._uxService.CustomSort = this.properties.customSort ? this.properties.customSort : false;
      this._uxService.CustomSortOrder = this.properties.customSortOrder;
      this._uxService.FUpdateCustomSort = this._updateCustomSort;
      this._uxService.EditMode = (this.displayMode === DisplayMode.Edit);

      //Set starting location for web part in UX Service
      this._setStartingLocation(true);
      //Override starting location for web part if query string parameters were provided
      this._setQueryStringParams();

      Logger.write(`🎓Initialized Microsoft 365 learning pathways - Tenant: ${this.context.pageContext.aadInfo.tenantId}`, LogLevel.Info);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (firstInit) - ${err} -- Could not initialize web part.`, LogLevel.Error);
    }

    //Configuration complete, now render
    this._isReady = true;
    this.render();
  }

  private async _configCDN(cdnId: string): Promise<boolean> {
    let retVal = false;
    try {
      this._cacheController = CacheController.getInstance(cdnId);
      this._cacheController.doInit(cdnId, params.userLanguage);
      const ready = await this._cacheController.isReady();
      if (ready && this._cacheController.isValid) {
        this._validSetup = this._cacheController.isValid;
        if (this._cacheController.cacheConfig) {
          this._uxService.Init(this._cacheController);
          retVal = true;
          AppInsightsService.Technologies = this._cacheController.cacheConfig.Technologies;

          this._validConfig = true;
        } else {
          this._validConfig = false;
        }
      } else {
        this._validConfig = false;
        Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (configCDN) -- Could not get a valid configuration; Please contact your learning administrator.`, LogLevel.Error);
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (configCDN) - ${err} -- Could not get a valid configuration.`, LogLevel.Error);
    }

    return retVal;
  }

  private _updateCustomSort = (customSortOrder: string[]): void => {
    this.properties.customSortOrder = customSortOrder;
    this._uxService.CustomSortOrder = customSortOrder;
    this._uxService.CLWPRender();
  }

  private _resetCustomSortOrder = (): void => {
    this.properties.customSortOrder = [];
    this._uxService.CustomSortOrder = [];
    this._uxService.CLWPRender();
  }

  public async render(): Promise<void> {
    let element;

    let sv: string = ShimmerView.ViewerCategory;
    switch (this._uxService.WebPartStartup.startingType) {
      case Templates.Category:
        sv = ShimmerView.ViewerCategory;
        break;
      case Templates.SubCategory:
        sv = ShimmerView.ViewerSubCategory;
        break;
      case Templates.Playlist:
        sv = ShimmerView.ViewerPlaylist;
        break;
    }
    const shimmer = React.createElement(
      ShimmerViewer, { shimmerView: sv }
    );

    if (this._isError) {
      element = React.createElement(
        Error,
        {
          message: strings.AdminConfigIssueMessage
        }
      );
    }
    else if (!this._isReady) {
      //Render Shimmer indicating web part is loading
      element = shimmer;
    }
    else {
      //Render Webpart if no error condition
      if (this._validSetup && this._validConfig) {
        //Render web part 
        const props: ICustomLearningProps = {
          webpartTitle: this.properties.title,
          teamsEntityId: this._teamsContext?.page?.subPageId ?? '',
          alwaysShowSearch: this.properties.alwaysShowSearch || false,
          openAssetsInDialog: (this.properties.openAssetsInDialog && this.displayMode != DisplayMode.Edit) ? this.properties.openAssetsInDialog : false,
          defaultWebPartHeight: this.properties.defaultWebPartHeight
        };

        element = React.createElement(React.Suspense, { fallback: shimmer },
          React.createElement(CustomLearning, props)
        );
      } else {
        element = React.createElement(
          Error,
          {
            message: strings.AdminConfigIssueMessage
          }
        );
      }
    }
    if (this.domElement != null) {
      const provider = React.createElement(UXServiceContext.Provider, { value: this._uxService }, element);
      ReactDom.render(provider, this.domElement);
    }
    return;
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }

  protected get disableReactivePropertyChanges(): boolean {
    return true;
  }

  protected onPropertyPaneConfigurationStart(): void {
    if (this._ppCategory && this._ppSubCategory && this._ppPlaylist) {
      return;
    }

    this._getDefaultCDNPropertyPaneOptions();
    this._getWebpartModePropertyPaneOptions();
    this._getCategoryPropertyPaneOptions();
    this._getSubCategoryPropertyPaneOptions();
    this._getPlaylistPropertyPaneOptions();
    this._getDefaultFilterPropertyPaneOptions();
    this.context.propertyPane.refresh();
  }

  private _getDefaultCDNPropertyPaneOptions(): void {
    const options: IPropertyPaneDropdownOption[] = [];
    try {
      if (params.allCdn && params.allCdn.length > 0) {
        for (let i = 0; i < params.allCdn.length; i++) {
          options.push({ key: params.allCdn[i].Id, text: params.allCdn[i].Name });
        }
      } else {
        options.push({ key: "Default", text: strings.M365Title });
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (_getDefaultCDNPropertyPaneOptions) - ${err} -- Error loading CDN property pane options.`, LogLevel.Error);
    }
    this._ppDefaultCDN = options;
  }

  private _getWebpartModePropertyPaneOptions(): void {
    const options: IPropertyPaneDropdownOption[] = [];
    try {
      options.push({ key: WebPartModeOptions.full, text: strings.WebPartModeFull });
      options.push({ key: WebPartModeOptions.contentonly, text: strings.WebPartModeContentOnly });
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (_getWebpartModePropertyPaneOptions) -- ${err} -- Error loading webpart mode property pane options.`, LogLevel.Error);
    }
    this._ppWebpartMode = options;
  }

  private _getDefaultFilterPropertyPaneOptions(): void {
    const options: IPropertyPaneDropdownOption[] = [];
    try {
      options.push({ key: "", text: strings.PropertyPaneNone });
      options.push({ key: PropertyPaneFilters.category, text: strings.PropertyPaneFilterCategory });
      options.push({ key: PropertyPaneFilters.subcategory, text: strings.PropertyPaneFilterSubCategory });
      options.push({ key: PropertyPaneFilters.playlist, text: strings.PropertyPaneFilterPlaylist });
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (_getDefaultFilterPropertyPaneOptions) - ${err} -- Error loading filter property pane options.`, LogLevel.Error);
    }
    this._ppFilters = options;
  }

  private _getCategoryPropertyPaneOptions(): void {
    let options: IPropertyPaneDropdownOption[] = [];
    options.push({ key: "", text: strings.PropertyPaneNone });
    if (this._validConfig) {
      try {
        for (let i = 0; i < this._cacheController.cacheConfig.Categories.length; i++) {
          options.push({
            key: this._cacheController.cacheConfig.Categories[i].Id,
            text: this._cacheController.cacheConfig.Categories[i].Name as string,
          });
        }
        options = sortBy(options, ["text"]);
      } catch (err) {
        Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (_getCategoryPropertyPaneOptions) - ${err} -- Error loading category property pane options.`, LogLevel.Error);
      }
    }
    this._ppCategory = options;
  }

  private _getSubCategoryPropertyPaneOptions(): void {
    const options: IPropertyPaneDropdownOption[] = [];
    options.push({ key: "", text: strings.PropertyPaneNone });
    if (this._validConfig) {
      try {
        //Flatten the nested subcategory list    
        for (let i = 0; i < this._cacheController.cacheConfig.Categories.length; i++) {
          options.push({
            key: this._cacheController.cacheConfig.Categories[i].Id,
            text: this._cacheController.cacheConfig.Categories[i].Name as string,
            type: PropertyPaneDropdownOptionType.Header
          });
          for (let j = 0; j < this._cacheController.cacheConfig.Categories[i].SubCategories.length; j++) {
            options.push({
              key: this._cacheController.cacheConfig.Categories[i].SubCategories[j].Id,
              text: this._cacheController.cacheConfig.Categories[i].SubCategories[j].Name as string,
            });
          }
        }
      } catch (err) {
        Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (_getSubCategoryPropertyPaneOptions) - ${err} -- Error loading sub-category property pane options.`, LogLevel.Error);
      }
    }
    this._ppSubCategory = options;
  }

  private _getPlaylistPropertyPaneOptions(): void {
    let options: IPropertyPaneDropdownOption[] = [];
    options.push({ key: "", text: strings.PropertyPaneNone });
    if (this._validConfig) {
      const cp = cloneDeep(this._cacheController.cacheConfig.CachedPlaylists);
      const cachedPlaylists = sortBy(cp, "CatId");
      let catId: string = "";
      let categories: IPropertyPaneDropdownOption[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const plItems: any = {};
      try {
        for (let i = 0; i < cachedPlaylists.length; i++) {
          if (catId === "" || catId !== cachedPlaylists[i].CatId) {
            catId = cachedPlaylists[i].CatId;
            const category: ICategory | undefined = find(this._cacheController.flatCategory, { Id: catId });
            if (category) {
              categories.push({
                key: category.Id,
                text: category.Name as string,
                type: PropertyPaneDropdownOptionType.Header
              });
              plItems[catId] = [];
            }
          }            
          
          if (catId.length > 0) {
            plItems[catId].push({
              key: cachedPlaylists[i].Id,
              text: cachedPlaylists[i].Title as string,
            });
          }
            
          
        }
        categories = sortBy(categories, (o) => { return o.text.toLowerCase(); });
        for (let c = 0; c < categories.length; c++) {
          options.push(categories[c]);
          options = options.concat(plItems[categories[c].key]);
        }
      } catch (err) {
        Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (getPlaylistPropertyPaneOptions) - ${err} -- Error loading playlist property pane options.`, LogLevel.Error);
      }
    }
    this._ppPlaylist = options;
  }

  public _loadPlayListAssets = (templateId: string): void => {
    const options: IPropertyPaneDropdownOption[] = [];
    if (this._validConfig) {
      try {
        const detail: ICategory[] | IPlaylist[] | IPlaylist | undefined = find(this._cacheController.cacheConfig.CachedPlaylists, { Id: templateId });
        if (!detail) { return; }
        for (let i = 0; i < (detail as IPlaylist).Assets.length; i++) {
          const a = find(this._cacheController.cacheConfig.CachedAssets, { Id: (detail as IPlaylist).Assets[i] });
          if (a)
            options.push({
              key: a.Id,
              text: a.Title as string,
            });
        }
      } catch (err) {
        Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (_loadPlayListAssets) - ${err} -- Error loading playlist assets property pane options.`, LogLevel.Error);
      }
    }
    this._ppAssets = options;
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    const configuration: IPropertyPaneConfiguration = {
      pages: [
        {
          header: {
            description: strings.LPViewerPropertyDescription
          },
          groups: [
            {
              groupName: strings.LPViewerPropertyGroupName,
              groupFields: [
                PropertyPaneDropdown('defaultCDN', {
                  label: strings.DefaultCDNLabel,
                  options: this._ppDefaultCDN,
                  selectedKey: this.properties.defaultCDN
                }),
                PropertyPaneTextField('title', {
                  label: strings.WebpartTitleLabel,
                }),
                PropertyPaneDropdown('webpartMode', {
                  label: strings.WebpartModeLabel,
                  options: this._ppWebpartMode,
                  selectedKey: this.properties.webpartMode
                }),
                PropertyPaneTextField('defaultWebPartHeight', {
                  label: strings.DefaultWebPartHeightTitle
                }),
                PropertyPaneToggle('alwaysShowSearch', {
                  label: strings.AlwaysShowSearchLabel,
                }),
                PropertyPaneToggle('openAssetsInDialog', {
                  label: strings.AlwaysOpenAssetInDialog,
                })
              ]
            }
          ]
        }
      ]
    };

    try {
      const defaultFilter = PropertyPaneDropdown('defaultFilter', {
        label: strings.DefaultFilterLabel,
        options: this._ppFilters,
        selectedKey: this.properties.defaultFilter
      });

      let displayFilter: IPropertyPaneField<IPropertyPaneLabelProps> | IPropertyPaneField<IPropertyPaneDropdownProps>;
      let assetList: IPropertyPaneField<IPropertyPaneLabelProps> | IPropertyPaneField<IPropertyPaneDropdownProps> = PropertyPaneLabel('defaultAsset', { text: "" });

      switch (this.properties.defaultFilter) {
        case PropertyPaneFilters.category:
          displayFilter = PropertyPaneDropdown('defaultCategory', {
            label: strings.DefaultCategoryLabel,
            options: this._ppCategory,
            selectedKey: this.properties.defaultCategory
          });
          break;
        case PropertyPaneFilters.subcategory:
          displayFilter = PropertyPaneDropdown('defaultSubCategory', {
            label: strings.DefaultSubCategoryLabel,
            options: this._ppSubCategory,
            selectedKey: this.properties.defaultSubCategory
          });
          break;
        case PropertyPaneFilters.playlist:
          if (this.properties.defaultPlaylist && this.properties.defaultPlaylist != "") {
            this._loadPlayListAssets(this.properties.defaultPlaylist);
          }
          displayFilter = PropertyPaneDropdown('defaultPlaylist', {
            label: strings.DefaultPlaylistLabel,
            options: this._ppPlaylist,
            selectedKey: this.properties.defaultPlaylist
          });
          assetList = PropertyPaneDropdown('defaultAsset', {
            label: strings.DefaultAssetLabel,
            options: this._ppAssets,
            selectedKey: this.properties.defaultAsset
          });
          break;
        default:
          displayFilter = PropertyPaneLabel('defaultFilter', { text: "" });
      }

      configuration.pages[0].groups[0]["groupFields"].push(defaultFilter);
      configuration.pages[0].groups[0]["groupFields"].push(displayFilter);
      configuration.pages[0].groups[0]["groupFields"].push(assetList);
      if (this.properties.defaultFilter.length > 0 && (this.properties.defaultCategory.length > 0 || this.properties.defaultSubCategory.length > 0)) {
        configuration.pages[0].groups[0]["groupFields"].push(PropertyPaneToggle("customSort", {
          label: strings.CustomizeSort
        })
        );
      }
      if (this.properties.customSort && this.properties.customSortOrder && this.properties.customSortOrder.length > 0) {
        configuration.pages[0].groups[0]["groupFields"].push(PropertyPaneButton('resetSortOrder', {
          text: strings.ResetSort,
          buttonType: PropertyPaneButtonType.Primary,
          onClick: this._resetCustomSortOrder
        })
        );
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (getPropertyPaneConfiguration) - ${err} -- Error loading property pane configuration.`, LogLevel.Error);
    }
    return configuration;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected async onPropertyPaneFieldChanged(propertyPath: string, oldValue: any, newValue: any): Promise<void> {
    try {
      //The default filter drop down changed
      if (propertyPath === 'defaultFilter' || propertyPath === 'defaultCDN') {
        super.onPropertyPaneFieldChanged(propertyPath, oldValue, newValue);
        this.properties.defaultCategory = "";
        this.properties.defaultSubCategory = "";
        this.properties.defaultPlaylist = "";
        this.properties.defaultAsset = "";
        this.properties.customSort = false;
        this._uxService.CustomSort = false;
        this.properties.customSortOrder = [];
        this._uxService.CustomSortOrder = [];
        if (propertyPath === 'defaultCDN') {
          this._isReady = false;
          this._setStartingLocation();
          this.render();
          await this._configCDN(newValue);
          this._isReady = true;
          this.properties.defaultFilter = "";
          this._getCategoryPropertyPaneOptions();
          this._getSubCategoryPropertyPaneOptions();
          this._getPlaylistPropertyPaneOptions();
        }
        this._setStartingLocation(true);
        this._uxService.CLWPRender();
        this.context.propertyPane.refresh();
      } else if (propertyPath === 'defaultPlaylist') {
        super.onPropertyPaneFieldChanged(propertyPath, oldValue, newValue);
        this.properties.customSort = false;
        this._uxService.CustomSort = false;
        this.properties.customSortOrder = [];
        this._uxService.CustomSortOrder = [];
        this._loadPlayListAssets(newValue);
        this._setStartingLocation();
      } else if (propertyPath === 'customSort' || propertyPath === "defaultCategory" || propertyPath === "defaultSubCategory") {
        super.onPropertyPaneFieldChanged(propertyPath, oldValue, newValue);
        this._uxService.CustomSort = (propertyPath === 'customSort') ? newValue : this._uxService.CustomSort;
        this.properties.customSortOrder = [];
        this._uxService.CustomSortOrder = [];
        this._setStartingLocation(true);
        this._uxService.CLWPRender();
      } else {
        super.onPropertyPaneFieldChanged(propertyPath, oldValue, newValue);
        this._setStartingLocation();
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (onPropertyPaneFieldChanged) - ${err} -- Error processing property field changes.`, LogLevel.Error);
    }
  }
}
