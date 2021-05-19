import { Logger, LogLevel } from "@pnp/logging";
import { HttpClient } from "@microsoft/sp-http";
import { IContentPack, IManifest, ICacheConfig, ICDN, ILocale, ICustomCDN, ICategory } from "../models/Models";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import forEach from "lodash/forEach";

export class Parameters {
  private LOG_SOURCE: string = "Parameters";
  private _context: WebPartContext;
  private _httpClient: HttpClient;
  private _userRole: string;
  private _userLanguage: string;

  private _learningSiteUrl: string = null;
  private _baseAdminUrl: string;
  private _baseViewerUrl: string;
  private _baseCdnPath: string = null;
  private _baseCdnPlaylistImage: string = null;
  private _telemetryOn: boolean = true;
  private _webPartVersion: string = null;
  private _manifestVersion: string = "v4";
  private _appPartPage: boolean = false;
  private _defaultLanguage: string = "";
  private _webLanguage: string = "";
  private _multilingualEnabled: boolean = false;
  private _multilingualLanguages: number[] = null;
  private _configuredLanguages: ILocale[] = null;

  //From Manifest
  private _telemetryKey: string = "089e14f6-1341-44b8-9135-71b3e326e914";
  private _latestWebPartVersion: string = null;
  private _updateInstructionUrl: string = null;
  private _contentPacks: IContentPack[];
  private _assetOrigins: string[] = null;
  private _supportedLanguages: string[] = null;

  //Configuration
  private _allCdn: ICDN[] = [];
  private _customCDN: ICustomCDN = null;
  private _lastUpdatedCache: Date = null;

  constructor() { }

  /**	
  * The webpart's context.
  */
  get context(): WebPartContext {
    return this._context;
  }

  set context(value: WebPartContext) {
    this._context = value;
  }

  /**	
    * The version of the manifest supported by the codebase.
    */
  get manifestVersion(): string {
    return this._manifestVersion;
  }

  set learningSiteUrl(value: string) {
    this._learningSiteUrl = value;
    this._baseAdminUrl = `${value}/SitePages/CustomLearningAdmin.aspx`;
    this._baseViewerUrl = `${value}/SitePages/CustomLearningViewer.aspx`;
  }

  /**	
    * The URL of the M365LP communication site.
    */
  get learningSiteUrl(): string {
    return this._learningSiteUrl;
  }

  /**	
    * The URL of the admin web part page in the M365LP communication site.
    */
  get baseAdminUrl(): string {
    return this._baseAdminUrl;
  }

  /**	
    * The URL of the viewer web part page in the M365LP communication site.
    */
  get baseViewerUrl(): string {
    return this._baseViewerUrl;
  }

  //Set from Tenant App Properties
  set baseCdnPath(value: string) {
    if (value.indexOf(this._manifestVersion) > -1) {
      value = value.substr(0, value.indexOf(this._manifestVersion));
    }
    this._baseCdnPath = value;
    this._baseCdnPlaylistImage = `${value}${this._manifestVersion}/${this._defaultLanguage}/images/playlists/playlist_bw.png`;
  }

  /**	
    * The base of the CDN path for M365LP.
    */
  get baseCdnPath(): string {
    return `${this._baseCdnPath}${params.manifestVersion}/`;
  }

  /**	
    * The placeholder url for a custom playlist image.
    */
  get baseCdnPlaylistImage(): string {
    return this._baseCdnPlaylistImage;
  }

  set webPartVersion(value: string) {
    this._webPartVersion = value;
  }

  /**	
      * The build version number of the app.
      */
  get webPartVersion(): string {
    return this._webPartVersion;
  }

  set telemetryOn(value: boolean) {
    this._telemetryOn = value;
  }

  /**	
    * Is telemetry enabled in the tenant.
    */
  get telemetryOn(): boolean {
    return this._telemetryOn;
  }

  set telemetryKey(value: string) {
    this._telemetryKey = value;
  }

  /**	
    * M365LP App Insights API Key
    */
  get telemetryKey(): string {
    return this._telemetryKey;
  }

  //Load from manifest.json
  set manifest(value: IManifest) {
    try {
      this._telemetryKey = (value.Telemetry.AppInsightKey) ? value.Telemetry.AppInsightKey : this._telemetryKey;
      this._latestWebPartVersion = (value.Version.CurrentWebPart) ? value.Version.CurrentWebPart : this._latestWebPartVersion;
      this._updateInstructionUrl = (value.Version.RepoURL) ? value.Version.RepoURL : this._updateInstructionUrl;
      this._contentPacks = value.ContentPacks;
      this._assetOrigins = value.AssetOrigins;
      let supportedLanguages: string[] = [];
      forEach(value.Languages, (lang) => {
        supportedLanguages.push(lang.toLowerCase());
      });
      this._supportedLanguages = supportedLanguages;
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (set:manifest) - ${err}`, LogLevel.Error);
    }
  }

  /**	
    * URL for the instructions to update the app package
    */
  get updateInstructionUrl(): string {
    return this._updateInstructionUrl;
  }

  /**	
    * Content Packs registered in the manfiest
    */
  get contentPacks(): IContentPack[] {
    return this._contentPacks;
  }

  set assetOrigins(value: string[]) {
    this._assetOrigins = value;
  }

  /**	
    * Origin URL's for assets in the assets.json file of the content pack.
    */
  get assetOrigins(): string[] {
    return this._assetOrigins;
  }

  /**	
    * List of languages supported by the content pack.
    */
  get supportedLanguages(): string[] {
    return this._supportedLanguages;
  }

  /**	
    * Current published version of the app package.
    */
  get latestWebPartVersion(): string {
    return this._latestWebPartVersion;
  }

  //Set during load
  set appPartPage(value: boolean) {
    this._appPartPage = value;
  }

  /**	
    * Flag if web part is running on an single app part page.
    */
  get appPartPage(): boolean {
    return this._appPartPage;
  }

  set httpClient(value: HttpClient) {
    this._httpClient = value;
  }

  /**	
    * A pointer to the httpClient as exposed by the SPFx
    */
  get httpClient(): HttpClient {
    return this._httpClient;
  }

  set userRole(value: string) {
    this._userRole = value;
  }

  /**	
    * The current role of the user as exposed by Role enum: Owners, Memebers, Visitors
    */
  get userRole(): string {
    return this._userRole;
  }


  set customCacheConfig(value: ICacheConfig) {
    try {
      //this._currentCacheConfig = value;
      if (value) {
        this._assetOrigins = value.AssetOrigins;
        this._webPartVersion = value.WebPartVersion;
        this._lastUpdatedCache = value.LastUpdated;
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (set:customCacheConfig) - ${err}`, LogLevel.Error);
    }
  }

  set allCdn(value: ICDN[]) {
    this._allCdn = value;
  }

  /**	
    * List of all available CDN's registered in the tenant.
    */
  get allCdn(): ICDN[] {
    return this._allCdn;
  }

  set customCDN(value: ICustomCDN) {
    this._customCDN = value;
  }

  /**	
    * List of all custom CDN's registered in the tenant.
    */
  get customCDN(): ICustomCDN {
    return this._customCDN;
  }

  set lastUpdatedCache(value: Date) {
    this._lastUpdatedCache = value;
  }

  /**	
    * Date/Time the cache was last updated.
    */
  get lastUpdatedCache(): Date {
    return this._lastUpdatedCache;
  }

  //Multilingual
  set userLanguage(value: string) {
    this._userLanguage = value.toLowerCase();
  }

  /**	
    * The user's MUI, if supported, defaults to en-US
    */
  get userLanguage(): string {
    return this._userLanguage;
  }

  set defaultLanguage(value: string) {
    this._defaultLanguage = value;
    this._baseCdnPlaylistImage = `${this._baseCdnPath}${this._manifestVersion}/${value}/images/playlists/playlist_bw.png`;
  }

  /**	
    * The site's default language, if not supported by M365LP, defaults to en-US
    */
  get defaultLanguage(): string {
    return this._defaultLanguage;
  }

  set webLanguage(value: string) {
    this._webLanguage = value;
  }

  get webLanguage(): string {
    return this._webLanguage;
  }

  set multilingualEnabled(value: boolean) {
    this._multilingualEnabled = value;
  }

  /**	
    * Check if multilingual pages feature is enabled for site.
    */
  get multilingualEnabled(): boolean {
    return this._multilingualEnabled;
  }

  set multilingualLanguages(value: number[]) {
    this._multilingualLanguages = value;
  }

  /**	
    * Multilingual pages translation languages enabled for site.
    */
  get multilingualLanguages(): number[] {
    return this._multilingualLanguages;
  }

  set configuredLanguages(value: ILocale[]) {
    this._configuredLanguages = value;
  }

  /**	
    * Multilingual pages feature configured languages that are supported by M365LP.
    */
  get configuredLanguages(): ILocale[] {
    return this._configuredLanguages;
  }
}

export const params = new Parameters();