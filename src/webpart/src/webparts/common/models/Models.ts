import { getGUID } from "@pnp/common";
import { params } from "../services/Parameters";
import { CustomWebpartSource } from './Enums';

export interface IChoice {
  key: string;
  text: string;
}

export interface ISubject {
  Id: string;
  Name: string;
}

export interface ITechnology {
  Id: string;
  Name: string;
  Subjects: ISubject[];
}

export interface IMetadataEntry {
  Id: string;
  Name: string;
}

export interface IMultilingualString {
  LanguageCode: string;
  Text: string;
}

export class MultilingualString implements IMultilingualString {
  constructor(
    public LanguageCode: string = params.defaultLanguage,
    public Text: string = ""
  ) { }
}

//Additional Count parameter is used to manage category/subcategory visibility
export interface ICategory {
  Id: string;
  Name: string | IMultilingualString[];
  Image: string | IMultilingualString[];
  TechnologyId: string;
  SubjectId: string;
  Source: string;
  SubCategories: ICategory[];
  Path?: string[];
  Count?: number;
}

export class SubCat implements ICategory {
  constructor(
    public Id: string = getGUID(),
    public Name: string | IMultilingualString[] = [new MultilingualString()],
    public Image: string | IMultilingualString[] = [new MultilingualString(params.defaultLanguage, `${params.baseCdnPath}${params.defaultLanguage}/images/categories/customfeatured.png`)],
    public TechnologyId: string = "",
    public SubjectId: string = "",
    public Source: string = CustomWebpartSource.Tenant,
    public SubCategories: ICategory[] = [],
    public Path: string[] = [],
    public Count: number = 0
  ) { }
}

export interface IListing {
  heading: ICategory;
  playlists: IPlaylist[];
}

export interface IVersion {
  Manifest: string;
  ManifestMinWebPart: string;
  CurrentWebPart: string;
  RepoURL: string;
}

export interface IContentPack {
  Id: string;
  Name: string;
  Description: string;
  Image: string;
  ProvisionUrl: string;
  CdnBase: string;
}

export interface IManifest {
  Telemetry: { AppInsightKey: string; };
  Version: IVersion;
  ContentPacks: IContentPack[];
  AssetOrigins: string[];
  Languages: string[];
}

export interface IMetadata {
  Technologies: ITechnology[];
  Categories: ICategory[];
  Audiences: IMetadataEntry[];
  Sources: string[];
  Levels: IMetadataEntry[];
  StatusTags: IMetadataEntry[];
  Telemetry: { AppInsightKey: string; };
  Version: IVersion;
  ContentPacks: IContentPack[];
}

export interface ICustomizations {
  Id: number;
  eTag: string;
  CustomSubcategories: ICategory[];
  HiddenTechnology: string[];
  HiddenSubject: string[];
  HiddenPlaylistsIds: string[];
  HiddenSubCategories: string[];
}

export class Customizations implements ICustomizations {
  constructor(
    public Id: number = 0,
    public eTag: string = "",
    public CustomSubcategories: ICategory[] = [],
    public HiddenTechnology: string[] = [],
    public HiddenSubject: string[] = [],
    public HiddenPlaylistsIds: string[] = [],
    public HiddenSubCategories: string[] = [],
  ) { }
}

export interface ICacheConfig {
  Id: number;
  eTag: string;
  Categories: ICategory[];
  Technologies: ITechnology[];
  CachedPlaylists: IPlaylist[];
  CachedAssets: IAsset[];
  AssetOrigins: string[];
  TelemetryKey: string;
  LastUpdated: Date;
  ManifestVersion: string;
  WebPartVersion: string;
}

export class CacheConfig implements ICacheConfig {
  constructor(
    public Id: number = 0,
    public eTag: string = "",
    public Categories: ICategory[] = [],
    public Technologies: ITechnology[] = [],
    public CachedPlaylists: IPlaylist[] = [],
    public CachedAssets: IAsset[] = [],
    public AssetOrigins: string[] = [],
    public TelemetryKey: string = "",
    public LastUpdated: Date = null,
    public ManifestVersion: string = "",
    public WebPartVersion: string = "4.0.0"
  ) { }
}

export interface ICDN {
  Id: string;
  Name: string;
  Base: string;
}

export class CDN implements ICDN {
  constructor(
    public Id: string = getGUID(),
    public Name: string = "",
    public Base: string = ""
  ) { }
}

export interface ICustomCDN {
  Id: number;
  eTag: string;
  CDNs: ICDN[];
}

export class CustomCDN implements ICustomCDN {
  constructor(
    public Id: number = 0,
    public eTag: string = "",
    public CDNs: ICDN[] = []
  ) { }
}
export interface IPlaylist {
  ['@odata.etag']?: string;
  Id: string;
  Title: string | IMultilingualString[];
  Image: string | IMultilingualString[];
  LevelId: string;
  LevelValue: IMetadataEntry;
  AudienceId: string;
  AudienceValue: IMetadataEntry;
  TechnologyId: string;
  SubjectId: string;
  Source: string;
  CatId: string;
  Description: string | IMultilingualString[];
  StatusTagId: string;
  StatusNote: string;
  Assets: string[];
}

export class Playlist implements IPlaylist {
  constructor(
    public Id: string = "0",
    public Title: string | IMultilingualString[] = [new MultilingualString()],
    public Image: string | IMultilingualString[] = [new MultilingualString()],
    public LevelId: string = "",
    public LevelValue: IMetadataEntry = null,
    public AudienceId: string = "",
    public AudienceValue: IMetadataEntry = null,
    public TechnologyId: string = "",
    public SubjectId: string = "",
    public Source: string = CustomWebpartSource.Tenant,
    public CatId: string = "",
    public Description: string | IMultilingualString[] = [new MultilingualString()],
    public StatusTagId: string = "",
    public StatusNote: string = "",
    public Assets: string[] = []
  ) { }
}

export interface IPlaylistTranslation {
  LanguageCode: string;
  Title: string;
  Image: string;
  Description: string;
  Url: string;
}

export class PlaylistTranslation implements IPlaylistTranslation {
  constructor(
    public LanguageCode: string = "",
    public Title: string = "",
    public Image: string = "",
    public Description: string = "",
    public Url: string = ""
  ) { }
}

export interface IAsset {
  ['@odata.etag']?: string;
  Id: string;
  Title: string | IMultilingualString[];
  Url: string | IMultilingualString[];
  TechnologyId: string;
  SubjectId: string;
  Source: string;
  StatusTagId: string;
  StatusNote: string;
}

export class Asset implements IAsset {
  constructor(
    public Id: string = "0",
    public Title: string | IMultilingualString[] = [new MultilingualString()],
    public Url: string | IMultilingualString[] = [new MultilingualString()],
    public TechnologyId: string = "",
    public SubjectId: string = "",
    public Source: string = CustomWebpartSource.Tenant,
    public StatusTagId: string = "",
    public StatusNote: string = ""
  ) { }
}

export interface IFilter {
  Audience: string[];
  Level: string[];
}

export class Filter implements IFilter {
  constructor(
    public Audience: string[] = [],
    public Level: string[] = []
  ) { }
}

export interface IFilterValue {
  Type: string;
  Key: string;
  Value: string;
}

export class FilterValue implements IFilterValue {
  constructor(
    public Type: string = "",
    public Key: string = "",
    public Value: string = ""
  ) { }
}

export interface IHistoryItem {
  Id: string;
  Name: string;
  Template: string;
}

export class HistoryItem implements IHistoryItem {
  constructor(
    public Id: string = null,
    public Name: string = null,
    public Template: string = null
  ) { }
}

export interface IButtonType {
  Class: string;
  SVG: string;
}

export interface ISearchResult {
  Type: string;
  Parent: IPlaylist | ICategory;
  Result: IPlaylist | IAsset;
}

export interface ILocale {
  localeId: number;
  description: string;
  code: string;
}

