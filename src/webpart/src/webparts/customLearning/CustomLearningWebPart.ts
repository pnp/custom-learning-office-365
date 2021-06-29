import "core-js/stable/array/from";
import "core-js/stable/array/fill";
import "core-js/stable/array/iterator";
import "core-js/stable/promise";
import "core-js/stable/reflect";
import "es6-map/implement";
import "whatwg-fetch";

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
  PropertyPaneButtonType
} from "@microsoft/sp-property-pane";
import { sp } from '@pnp/sp';

import sortBy from "lodash/sortBy";
import find from "lodash/find";
import cloneDeep from "lodash/cloneDeep";

import { Logger, LogLevel, ConsoleListener } from "@pnp/logging";
import { UrlQueryParameterCollection } from '@microsoft/sp-core-library';

import { params } from "../common/services/Parameters";
import { AppInsightsService } from "../common/services/AppInsightsService";
import { initializeIcons } from '@uifabric/icons';

import * as strings from "M365LPStrings";
import ShimmerViewer from "../common/components/Atoms/ShimmerViewer";
import { ICategory, IPlaylist } from "../common/models/Models";
import { Templates, WebpartMode, PropertyPaneFilters, ShimmerView } from "../common/models/Enums";
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
}

import {
  ThemeProvider,
  IReadonlyTheme,
  ThemeChangedEventArgs,
  ISemanticColors
} from '@microsoft/sp-component-base';


export default class CustomLearningWebPart extends BaseClientSideWebPart<ICustomLearningWebPartProps> {
  private LOG_SOURCE: string = "CustomLearningWebPart";
  private _isReady: boolean = false;
  private _isError: boolean = false;
  private _cacheController: ICacheController;
  private _validSetup: boolean = false;
  private _validConfig: boolean = false;

  private _webpartMode: string = "";
  private _startType: string = "";
  private _startLocation: string = "";
  private _startAsset: string = "";

  private _ppDefaultCDN: IPropertyPaneDropdownOption[];
  private _ppWebpartMode: IPropertyPaneDropdownOption[];
  private _ppCategory: IPropertyPaneDropdownOption[];
  private _ppSubCategory: IPropertyPaneDropdownOption[];
  private _ppPlaylist: IPropertyPaneDropdownOption[];
  private _ppFilters: IPropertyPaneDropdownOption[];
  private _ppAssets: IPropertyPaneDropdownOption[];

  //Get the values from the query string if necessary
  private _queryParms: UrlQueryParameterCollection = new UrlQueryParameterCollection(window.location.href);
  private _urlWebpartMode: string = this._queryParms.getValue("webpartmode");
  private _urlCDN: string = this._queryParms.getValue("cdn");
  private _urlCategory: string = this._queryParms.getValue("category");
  private _urlSubCategory: string = this._queryParms.getValue("subcategory");
  private _urlPlaylist: string = this._queryParms.getValue("playlist");
  private _urlAsset: string = this._queryParms.getValue("asset");

  // Theming support for Section
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

    // Handle theme changes
    this._themeProvider.themeChangedEvent.add(this, this._handleThemeChangedEvent);

    try {
      //Initialize PnPLogger
      Logger.subscribe(new ConsoleListener());
      Logger.activeLogLevel = LogLevel.Info;

      //Initialize UI Fabric Icons
      initializeIcons();

      //Save context
      params.context = this.context;

      //Initialize PnPJs
      let ie11Mode: boolean = (!!window.MSInputMethodContext && !!document["documentMode"]);
      sp.setup({ ie11: ie11Mode, spfxContext: this.context });

      //Set HttpClient
      params.httpClient = this.context.httpClient;

      //Determine if on an app part page
      params.appPartPage = (document.getElementById("spPageCanvasContent") == null);

      //Set Web Part Version
      params.webPartVersion = this.context.manifest.version;

      //Set User Language
      params.userLanguage = this.context.pageContext.cultureInfo.currentUICultureName.toLowerCase();

      //If in Teams context get Query String Parameters from Teams Context
      if (this.context.sdks?.microsoftTeams)
        this.getTeamsQueryString();

      this.firstInit();
    } catch (err) {
      this._isReady = true;
      this._isError = true;
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (onInit) - ${err} -- Could not initialize web part.`, LogLevel.Error);
    }

    return super.onInit();

  }

  private getTeamsQueryString(): void {
    try {
      // Get configuration from the Teams SDK
      if (this.context.sdks.microsoftTeams.context) {
        if (this.context.sdks.microsoftTeams.context?.subEntityId?.length > 0) {
          let queryString = this.context.sdks.microsoftTeams.context.subEntityId.split(":");
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


  private _handleThemeChangedEvent(args: ThemeChangedEventArgs): void {

    this._themeVariant = args.theme;

    this.setCSSVariables(this._themeVariant.semanticColors);
    this.setCSSVariables(this._themeVariant.palette);
    this.setCSSVariables(this._themeVariant["effects"]);

  }
  
  private async firstInit(): Promise<void> {
    try {
      let currentCdn = this._urlCDN;
      if (!currentCdn || currentCdn.length < 1) {
        if (!this.properties.defaultCDN || this.properties.defaultCDN === "")
          this.properties.defaultCDN = "Default";
        currentCdn = this.properties.defaultCDN;
      }

      await this.configCDN(currentCdn);

      if (this.context.propertyPane.isPropertyPaneOpen)
        this.context.propertyPane.refresh();

      // Initialize App Insights
      AppInsightsService.initialize(this._cacheController.CDN, this._cacheController.cacheConfig.TelemetryKey);
      AppInsightsService.trackEvent(this.LOG_SOURCE);

      Logger.write(`🎓Initialized Microsoft 365 learning pathways - Tenant: ${this.context.pageContext.aadInfo.tenantId}`, LogLevel.Info);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (firstInit) - ${err} -- Could not initialize web part.`, LogLevel.Error);
    }

    //Configuration complete, now render
    this._isReady = true;
    this.render();
  }

  private async configCDN(cdnId: string): Promise<boolean> {
    let retVal = false;
    try {
      this._cacheController = CacheController.getInstance(cdnId);
      this._cacheController.doInit(cdnId, params.userLanguage);
      let ready = await this._cacheController.isReady();
      if (ready && this._cacheController.isValid) {
        this._validSetup = this._cacheController.isValid;
        if (this._cacheController.cacheConfig) {
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

  public async render(): Promise<void> {
    let element;

    //Update startType and startLocation if changed.
    if (this.properties.webpartMode !== "" && this.properties.webpartMode !== this._webpartMode) {
      this._webpartMode = this.properties.webpartMode;
    }

    if (this.properties.defaultCategory !== "" && this.properties.defaultCategory !== this._startLocation) {
      this._startType = Templates.Category;
      this._startLocation = this.properties.defaultCategory;
    }

    if (this.properties.defaultSubCategory !== "" && this.properties.defaultSubCategory !== this._startLocation) {
      this._startType = Templates.SubCategory;
      this._startLocation = this.properties.defaultSubCategory;
    }
    if (this.properties.defaultPlaylist !== "" && this.properties.defaultPlaylist !== this._startLocation) {
      this._startType = Templates.Playlist;
      this._startLocation = this.properties.defaultPlaylist;
    }
    if (this.properties.defaultAsset !== "" && this.properties.defaultAsset !== this._startAsset) {
      this._startAsset = this.properties.defaultAsset;
    }
    if (this.properties.defaultCategory === "" && this.properties.defaultSubCategory === "" && this.properties.defaultPlaylist === "") {
      this._startType = "";
      this._startLocation = "";
    }

    //Override if the query string parameters are set. But we don't want to do this if we are in edit mode.
    if (this.displayMode != DisplayMode.Edit) {
      //Set Webpart mode via query string
      if ((this._urlWebpartMode) && (this._urlWebpartMode !== "")) {
        this._webpartMode = this._urlWebpartMode;
      }

      //If any of the categories are set in the Query String then we reset the web part here
      if (((this._urlCategory) && (this._urlCategory != "")) || ((this._urlSubCategory) && (this._urlSubCategory != "")) || ((this._urlPlaylist) && (this._urlPlaylist != "")) || ((this._urlAsset) && (this._urlAsset != ""))) {
        if ((this._urlCategory) && (this._urlCategory != "")) {
          this._startType = Templates.Category;
          this._startLocation = this._urlCategory;
        } else if ((this._urlSubCategory) && (this._urlSubCategory != "")) {
          this._startType = Templates.SubCategory;
          this._startLocation = this._urlSubCategory;
        } else if ((this._urlPlaylist) && (this._urlPlaylist != "")) {
          this._startType = Templates.Playlist;
          this._startLocation = this._urlPlaylist;
          this._startAsset = this._urlAsset;
        } else if ((this._urlAsset) && (this._urlAsset != "")) {
          this._startType = Templates.Asset;
          this._startLocation = this._urlAsset;
        } else {
          this._startType = "";
          this._startLocation = "";
        }
      }
    }

    let sv: string = ShimmerView.ViewerCategory;
    switch (this._startType) {
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
    let shimmer = React.createElement(
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
          editMode: (this.displayMode === DisplayMode.Edit),
          webpartMode: this.properties.webpartMode,
          startType: this._startType,
          startLocation: this._startLocation,
          startAsset: this._startAsset,
          webpartTitle: this.properties.title,
          customSort: this.properties.customSort ? this.properties.customSort : false,
          customSortOrder: this.properties.customSortOrder,
          teamsEntityId: this.context.sdks.microsoftTeams?.context?.entityId,
          cacheController: this._cacheController,
          updateCustomSort: this.updateCustomSort
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
    ReactDom.render(element, this.domElement);
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

    this.getDefaultCDNPropertyPaneOptions();
    this.getWebpartModePropertyPaneOptions();
    this.getCategoryPropertyPaneOptions();
    this.getSubCategoryPropertyPaneOptions();
    this.getPlaylistPropertyPaneOptions();
    this.getDefaultFilterPropertyPaneOptions();
    this.context.propertyPane.refresh();
  }

  private getDefaultCDNPropertyPaneOptions(): void {
    let options: IPropertyPaneDropdownOption[] = [];
    try {
      if (params.allCdn && params.allCdn.length > 0) {
        for (let i = 0; i < params.allCdn.length; i++) {
          options.push({ key: params.allCdn[i].Id, text: params.allCdn[i].Name });
        }
      } else {
        options.push({ key: "Default", text: strings.M365Title });
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (getDefaultCDNPropertyPaneOptions) - ${err} -- Error loading CDN property pane options.`, LogLevel.Error);
    }
    this._ppDefaultCDN = options;
  }

  private getWebpartModePropertyPaneOptions(): void {
    let options: IPropertyPaneDropdownOption[] = [];
    try {
      options.push({ key: WebpartMode.full, text: strings.WebPartModeFull });
      options.push({ key: WebpartMode.contentonly, text: strings.WebPartModeContentOnly });
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (getWebpartModePropertyPaneOptions) -- ${err} -- Error loading webpart mode property pane options.`, LogLevel.Error);
    }
    this._ppWebpartMode = options;
  }

  private getDefaultFilterPropertyPaneOptions(): void {
    let options: IPropertyPaneDropdownOption[] = [];
    try {
      options.push({ key: "", text: strings.PropertyPaneNone });
      options.push({ key: PropertyPaneFilters.category, text: strings.PropertyPaneFilterCategory });
      options.push({ key: PropertyPaneFilters.subcategory, text: strings.PropertyPaneFilterSubCategory });
      options.push({ key: PropertyPaneFilters.playlist, text: strings.PropertyPaneFilterPlaylist });
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (getDefaultFilterPropertyPaneOptions) - ${err} -- Error loading filter property pane options.`, LogLevel.Error);
    }
    this._ppFilters = options;
  }

  private getCategoryPropertyPaneOptions(): void {
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
        Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (getCategoryPropertyPaneOptions) - ${err} -- Error loading category property pane options.`, LogLevel.Error);
      }
    }
    this._ppCategory = options;
  }

  private getSubCategoryPropertyPaneOptions(): void {
    let options: IPropertyPaneDropdownOption[] = [];
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
        Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (getSubCategoryPropertyPaneOptions) - ${err} -- Error loading sub-category property pane options.`, LogLevel.Error);
      }
    }
    this._ppSubCategory = options;
  }

  private getPlaylistPropertyPaneOptions(): void {
    let options: IPropertyPaneDropdownOption[] = [];
    options.push({ key: "", text: strings.PropertyPaneNone });
    if (this._validConfig) {
      let cp = cloneDeep(this._cacheController.cacheConfig.CachedPlaylists);
      let cachedPlaylists = sortBy(cp, "CatId");
      let catId: string = "";
      let categories: IPropertyPaneDropdownOption[] = [];
      let plItems: any = {};
      try {
        for (let i = 0; i < cachedPlaylists.length; i++) {
          if (catId === "" || catId !== cachedPlaylists[i].CatId) {
            catId = cachedPlaylists[i].CatId;
            let category: ICategory = find(this._cacheController.flatCategory, { Id: catId });
            if (category) {
              categories.push({
                key: category.Id,
                text: category.Name as string,
                type: PropertyPaneDropdownOptionType.Header
              });
              plItems[catId] = [];
            } else {
              catId = "";
              Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (getPlaylistPropertyPaneOptions) -- Could not find category id: ${catId}.`, LogLevel.Error);
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

  public loadPlayListAssets = (templateId: string): void => {
    let options: IPropertyPaneDropdownOption[] = [];
    if (this._validConfig) {
      try {
        let detail: ICategory[] | IPlaylist[] | IPlaylist;
        detail = find(this._cacheController.cacheConfig.CachedPlaylists, { Id: templateId });
        if (!detail) { return null; }
        for (let i = 0; i < (detail as IPlaylist).Assets.length; i++) {
          let a = find(this._cacheController.cacheConfig.CachedAssets, { Id: (detail as IPlaylist).Assets[i] });
          if (a)
            options.push({
              key: a.Id,
              text: a.Title as string,
            });
        }
      } catch (err) {
        Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (loadPlayListAssets) - ${err} -- Error loading playlist assets property pane options.`, LogLevel.Error);
      }
    }
    this._ppAssets = options;
  }

  private updateCustomSort = (customSortOrder: string[]) => {
    this.properties.customSortOrder = customSortOrder;
    this.render();
  }

  private resetCustomSortOrder = () => {
    this.properties.customSortOrder = [];
    this.render();
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

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    try {
      let displayFilter: any;
      let assetList: any;
      let defaultFilter: any;
      let customSort: any;
      let configuration: IPropertyPaneConfiguration = {
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
                  })
                ]
              }
            ]
          }
        ]
      };

      defaultFilter = PropertyPaneDropdown('defaultFilter', {
        label: strings.DefaultFilterLabel,
        options: this._ppFilters,
        selectedKey: this.properties.defaultFilter
      });
      assetList = PropertyPaneLabel('defaultAsset', { text: "" });

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
            this.loadPlayListAssets(this.properties.defaultPlaylist);
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
          onClick: this.resetCustomSortOrder
        })
        );
      }

      return configuration;
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (getPropertyPaneConfiguration) - ${err} -- Error loading property pane configuration.`, LogLevel.Error);
      return null;
    }
  }

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
        this.properties.customSortOrder = [];
        if (propertyPath === 'defaultCDN') {
          this._isReady = false;
          this.render();
          await this.configCDN(newValue);
          this._isReady = true;
          this.properties.defaultFilter = "";
          this.getCategoryPropertyPaneOptions();
          this.getSubCategoryPropertyPaneOptions();
          this.getPlaylistPropertyPaneOptions();
          this.render();
        }
        this.context.propertyPane.refresh();
      } else if (propertyPath === 'defaultPlaylist') {
        super.onPropertyPaneFieldChanged(propertyPath, oldValue, newValue);
        this.properties.customSort = false;
        this.properties.customSortOrder = [];
        this.loadPlayListAssets(newValue);
      } else if (propertyPath === 'customSort' || propertyPath === "defaultCategory" || propertyPath === "defaultSubCategory") {
        super.onPropertyPaneFieldChanged(propertyPath, oldValue, newValue);
        this.properties.customSortOrder = [];
        this.render();
      } else {
        super.onPropertyPaneFieldChanged(propertyPath, oldValue, newValue);
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (onPropertyPaneFieldChanged) - ${err} -- Error processing property field changes.`, LogLevel.Error);
    }
  }
}
