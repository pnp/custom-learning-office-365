import { Logger, LogLevel } from "@pnp/logging";
import * as React from "react";

import HOODialog from "@n8d/htwoo-react/HOODialog";
import HOODialogContent from "@n8d/htwoo-react/HOODialogContent";
import cloneDeep from "lodash-es/cloneDeep";
import find from "lodash-es/find";
import findIndex from "lodash-es/findIndex";
import isEqual from "lodash-es/isEqual";
import pull from "lodash-es/pull";
import remove from "lodash-es/remove";

import * as strings from "M365LPStrings";
import ShimmerViewer from "../../common/components/Atoms/ShimmerViewer";
import styles from "../../common/CustomLearningCommon.module.scss";
import { AdminNavigationType, ShimmerView } from "../../common/models/Enums";
import { IAsset, ICacheConfig, ICategory, ICDN, ICustomizations, IMetadataEntry, IPlaylist, ITechnology } from "../../common/models/Models";
import { params } from "../../common/services/Parameters";
import AdminMenu from "./Organizms/AdminMenu";
import Category from "./Templates/Category";
import Technology from "./Templates/Technology";


export interface ICustomLearningAdminProps {
  validConfig: boolean;
  currentWebpart: string;
  cacheConfig: ICacheConfig;
  customization: ICustomizations;
  categoriesAll: ICategory[];
  technologiesAll: ITechnology[];
  playlistsAll: IPlaylist[];
  assetsAll: IAsset[];
  levels: IMetadataEntry[];
  audiences: IMetadataEntry[];
  siteUrl: string;
  firstConfig: boolean;
  saveConfig: (newConfig: ICacheConfig) => Promise<void>;
  upsertCustomizations: (newSubCategories: ICustomizations) => Promise<void>;
  upsertPlaylist: (playlist: IPlaylist) => Promise<string>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  copyPlaylist: (playlist: IPlaylist) => Promise<string>;
  upsertAsset: (asset: IAsset) => Promise<string>;
  upsertCdn: (cdn: ICDN) => Promise<boolean>;
  selectCDN: (cdnId: string) => Promise<boolean>;
  removeCdn: (cdnId: string) => Promise<boolean>;
  translatePlaylist: (playlist: IPlaylist) => IPlaylist;
  translateAsset: (asset: IAsset) => IAsset;
}

export interface ICustomLearningAdminState {
  currentCDNId: string;
  tabSelected: string;
  loadingCdn: boolean;
  working: boolean;
}

export class CustomLearningAdminState implements ICustomLearningAdminState {
  constructor(
    public currentCDNId: string = "Default",
    public tabSelected: string = AdminNavigationType.Category,
    public loadingCdn: boolean = false,
    public working: boolean = false
  ) { }
}

export default class CustomLearningAdmin extends React.Component<ICustomLearningAdminProps, ICustomLearningAdminState> {
  private LOG_SOURCE: string = "CustomLearningAdmin";
  private _currentVersion: string;

  constructor(props: ICustomLearningAdminProps) {
    super(props);
    this._currentVersion = (params.latestWebPartVersion) ? params.latestWebPartVersion : "4.0.0";
    this.state = new CustomLearningAdminState();
  }

  public shouldComponentUpdate(nextProps: Readonly<ICustomLearningAdminProps>, nextState: Readonly<ICustomLearningAdminState>): boolean {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private selectTab = (tab: string): void => {
    if (tab != this.state.tabSelected) {
      this.setState({
        tabSelected: tab
      });
    }
  }

  private updateTechnologyVisibility = (techName: string, subTech: string, exists: boolean): void => {
    try {
      const hiddenTechnology: string[] = cloneDeep(this.props.customization.HiddenTechnology);
      const hiddenSubject: string[] = cloneDeep(this.props.customization.HiddenSubject);
      if (exists) {
        //Add to hidden list
        if (!subTech || subTech.length < 1) {
          hiddenTechnology.push(techName);
        } else {
          hiddenSubject.push(subTech);
        }
      } else {
        //Remove from hidden list
        if (!subTech || subTech.length < 1) {
          pull(hiddenTechnology, techName);
        } else {
          pull(hiddenSubject, subTech);
        }
      }
      //Save cacheConfig Changes
      const newConfig = cloneDeep(this.props.customization);
      newConfig.HiddenTechnology = hiddenTechnology;
      newConfig.HiddenSubject = hiddenSubject;
      this.setState({ working: true });
      this.props.upsertCustomizations(newConfig).then(() => { this.setState({ working: false }); });
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (updateTechnologyVisibility) - ${err}`, LogLevel.Error);
    }
  }

  private updateSubCategoryVisibility = (subCategory: string, exists: boolean): void => {
    try {
      const hiddenSubCategory: string[] = cloneDeep(this.props.customization.HiddenSubCategories);
      if (exists) {
        //Add to hidden list
        hiddenSubCategory.push(subCategory);
      } else {
        //Remove from hidden list
        pull(hiddenSubCategory, subCategory);
      }
      //Save cacheConfig Changes
      const newConfig = cloneDeep(this.props.customization);
      newConfig.HiddenSubCategories = hiddenSubCategory;
      this.setState({ working: true });
      this.props.upsertCustomizations(newConfig).then(() => { this.setState({ working: false }); });
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (updateSubCategoryVisibility) - ${err}`, LogLevel.Error);
    }
  }

  private updatePlaylistVisibility = (playlistId: string, exists: boolean): void => {
    try {
      const hiddenPlaylistsIds: string[] = cloneDeep(this.props.customization.HiddenPlaylistsIds);
      if (exists) {
        //Add to hidden list
        hiddenPlaylistsIds.push(playlistId);
      } else {
        //Remove from hidden list
        pull(hiddenPlaylistsIds, playlistId);
      }
      //Save cacheConfig Changes
      const newConfig = cloneDeep(this.props.customization);
      newConfig.HiddenPlaylistsIds = hiddenPlaylistsIds;
      this.setState({ working: true });
      this.props.upsertCustomizations(newConfig).then(() => { this.setState({ working: false }); });
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (updatePlaylistVisibility) - ${err}`, LogLevel.Error);
    }
  }

  private upsertSubCategory = (categoryId: string, heading: ICategory): void => {
    try {
      const customization = cloneDeep(this.props.customization);
      if (!customization.CustomSubcategories || customization.CustomSubcategories.length < 1) {
        customization.CustomSubcategories = [];
        for (let i = 0; i < this.props.cacheConfig.Categories.length; i++) {
          const category = cloneDeep(this.props.cacheConfig.Categories[i]);
          category.SubCategories = [];
          customization.CustomSubcategories.push(category);
        }
      }

      const foundCategory = find(customization.CustomSubcategories, { Id: categoryId });
      const subCategoryIndex = findIndex(foundCategory.SubCategories, { Id: heading.Id });
      if (subCategoryIndex > -1) {
        foundCategory.SubCategories[subCategoryIndex] = heading;
      } else {
        foundCategory.SubCategories.push(heading);
      }
      this.setState({ working: true });
      this.props.upsertCustomizations(customization).then(() => { this.setState({ working: false }); });
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (upsertSubCategory) - ${err}`, LogLevel.Error);
    }
  }

  private deleteSubCategory = (categoryId: string, subCategoryId: string): void => {
    try {
      const customization = cloneDeep(this.props.customization);
      const foundCategory = find(customization.CustomSubcategories, { Id: categoryId });
      remove(foundCategory.SubCategories, { Id: subCategoryId });
      this.setState({ working: true });
      this.props.upsertCustomizations(customization).then(() => { this.setState({ working: false }); });
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (deleteSubCategory) - ${err}`, LogLevel.Error);
    }
  }

  private getContainer(className: string): JSX.Element {
    let element: JSX.Element;
    try {
      switch (this.state.tabSelected) {
        case AdminNavigationType.Category:
          element = <Category
            className={className}
            customization={this.props.customization}
            technologies={this.props.technologiesAll}
            categories={this.props.categoriesAll}
            playlists={this.props.playlistsAll}
            assets={this.props.assetsAll}
            levels={this.props.levels}
            audiences={this.props.audiences}
            updatePlaylistVisibility={this.updatePlaylistVisibility}
            upsertSubCategory={this.upsertSubCategory}
            upsertPlaylist={this.props.upsertPlaylist}
            upsertAsset={this.props.upsertAsset}
            deletePlaylist={this.props.deletePlaylist}
            updateSubcategory={this.updateSubCategoryVisibility}
            deleteSubcategory={this.deleteSubCategory}
            copyPlaylist={this.props.copyPlaylist}
            translatePlaylist={this.props.translatePlaylist}
            translateAsset={this.props.translateAsset}
          />;
          break;
        default:
          element = <Technology
            className={className}
            technologies={this.props.technologiesAll}
            hiddenTech={this.props.customization.HiddenTechnology}
            hiddenSub={this.props.customization.HiddenSubject}
            updateTechnology={this.updateTechnologyVisibility}
          />;
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (getContainer) - ${err}`, LogLevel.Error);
    }
    return element;
  }

  private selectCDN = (cdnId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      try {
        this.setState({
          loadingCdn: true
        },
          async () => {
            const retVal = await this.props.selectCDN(cdnId);
            this.setState({
              currentCDNId: cdnId,
              loadingCdn: false
            }, () => {
              resolve(retVal);
            });
          });
      } catch (err) {
        resolve(false);
      }
    });
  }

  private upsertCdn = async (cdn: ICDN): Promise<boolean> => {
    let retVal: boolean = false;
    try {
      const upsertCdnResult = await this.props.upsertCdn(cdn);
      if (upsertCdnResult) {
        retVal = true;
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (upsertCdn) - ${err}`, LogLevel.Error);
    }
    return retVal;
  }

  public render(): React.ReactElement<ICustomLearningAdminProps> {
    try {
      let notice = `${strings.AdminVersionUpdateNotice}`;
      notice = notice.replace('%0%', this.props.currentWebpart).replace('%1%', this._currentVersion);
      const showMultilingualMsg: boolean = (this.props.firstConfig && params.multilingualEnabled && params.configuredLanguages.length > 1);
      const showUpgradeMsg: boolean = (this.props.cacheConfig && (this.props.currentWebpart < this._currentVersion));
      const className: string = (showMultilingualMsg || showUpgradeMsg) ? "" : "nomsg";
      return (
        <section data-component={this.LOG_SOURCE} className={`adm-wrapper ${styles.customLearning} ${(params.appPartPage) ? styles.appPartPage : ""}`}>
          <div className="adm-header-message">
            {showMultilingualMsg &&
              <HOODialog
                changeVisibility={function noRefCheck() { }}
                type={1}
                visible
                rootElementAttributes={{
                  className: "adm-content"
                }}
              >

                <HOODialogContent>
                  {strings.DataUpgradeMultilingual} <a href={`${this.props.siteUrl}/_layouts/15/muisetng.aspx`} target="_blank" rel="noreferrer">{strings.DataUpgradeReview}</a>
                </HOODialogContent>

              </HOODialog>

            }
            {showUpgradeMsg &&
              <HOODialog
                changeVisibility={function noRefCheck() { }}
                type={1}
                visible
                rootElementAttributes={{ className: "adm-content" }}
              >

                <HOODialogContent>
                  {notice} <a href={(params.updateInstructionUrl) ? params.updateInstructionUrl : "https://github.com/pnp/custom-learning-office-365#updating-the-solution"} rel="noreferrer" target="_blank">{strings.AdminVersionUpdateInstructions}</a>
                </HOODialogContent>

              </HOODialog>

            }
          </div>
          <AdminMenu
            loadingCdn={this.state.loadingCdn}
            placeholderUrl={`${params.baseCdnPath}${params.defaultLanguage}/images/categories/customfeatured.png`}
            currentCDNId={this.state.currentCDNId}
            selectCDN={this.selectCDN}
            selectTab={this.selectTab}
            upsertCdn={this.upsertCdn}
            removeCdn={this.props.removeCdn}
            working={this.state.working}
            tabSelected={this.state.tabSelected}
          />

          {
            this.props.validConfig && this.props.cacheConfig && !this.state.loadingCdn &&
            this.getContainer(className)
          }
          {
            !this.props.validConfig && !this.props.cacheConfig && !this.state.loadingCdn &&
            <HOODialog
              changeVisibility={function noRefCheck() { }}
              type={1}
              visible
              rootElementAttributes={{ className: "adm-content" }}
            >

              <HOODialogContent>
                {strings.AdminConfigIssueMessage}
              </HOODialogContent>

            </HOODialog>
          }
          {
            this.state.loadingCdn &&
            <ShimmerViewer shimmerView={ShimmerView.AdminCdn} />
          }
        </section >
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}
