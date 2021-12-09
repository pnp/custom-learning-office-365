import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash/isEqual";
import cloneDeep from "lodash/cloneDeep";
import find from "lodash/find";
import pull from "lodash/pull";
import remove from "lodash/remove";
import findIndex from "lodash/findIndex";
import { MessageBar, MessageBarType, Link } from "office-ui-fabric-react";

import { params } from "../../common/services/Parameters";
import * as strings from "M365LPStrings";
import styles from "../../common/CustomLearningCommon.module.scss";
import { ICacheConfig, IPlaylist, IAsset, ITechnology, ICategory, ICustomizations, ICDN, IMetadataEntry } from "../../common/models/Models";
import { AdminNavigationType, ShimmerView } from "../../common/models/Enums";
import Category from "./Templates/Category";
import Technology from "./Templates/Technology";
import AdminMenu from "./Organizms/AdminMenu";
import ShimmerViewer from "../../common/components/Atoms/ShimmerViewer";
import { reject } from "lodash";

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

  public shouldComponentUpdate(nextProps: Readonly<ICustomLearningAdminProps>, nextState: Readonly<ICustomLearningAdminState>) {
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
      let hiddenTechnology: string[] = cloneDeep(this.props.customization.HiddenTechnology);
      let hiddenSubject: string[] = cloneDeep(this.props.customization.HiddenSubject);
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
      let newConfig = cloneDeep(this.props.customization);
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
      let hiddenSubCategory: string[] = cloneDeep(this.props.customization.HiddenSubCategories);
      if (exists) {
        //Add to hidden list
        hiddenSubCategory.push(subCategory);
      } else {
        //Remove from hidden list
        pull(hiddenSubCategory, subCategory);
      }
      //Save cacheConfig Changes
      let newConfig = cloneDeep(this.props.customization);
      newConfig.HiddenSubCategories = hiddenSubCategory;
      this.setState({ working: true });
      this.props.upsertCustomizations(newConfig).then(() => { this.setState({ working: false }); });
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (updateSubCategoryVisibility) - ${err}`, LogLevel.Error);
    }
  }

  private updatePlaylistVisibility = (playlistId: string, exists: boolean): void => {
    try {
      let hiddenPlaylistsIds: string[] = cloneDeep(this.props.customization.HiddenPlaylistsIds);
      if (exists) {
        //Add to hidden list
        hiddenPlaylistsIds.push(playlistId);
      } else {
        //Remove from hidden list
        pull(hiddenPlaylistsIds, playlistId);
      }
      //Save cacheConfig Changes
      let newConfig = cloneDeep(this.props.customization);
      newConfig.HiddenPlaylistsIds = hiddenPlaylistsIds;
      this.setState({ working: true });
      this.props.upsertCustomizations(newConfig).then(() => { this.setState({ working: false }); });
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (updatePlaylistVisibility) - ${err}`, LogLevel.Error);
    }
  }

  private upsertSubCategory = (categoryId: string, heading: ICategory): void => {
    try {
      let customization = cloneDeep(this.props.customization);
      if (!customization.CustomSubcategories || customization.CustomSubcategories.length < 1) {
        customization.CustomSubcategories = [];
        for (let i = 0; i < this.props.cacheConfig.Categories.length; i++) {
          let category = cloneDeep(this.props.cacheConfig.Categories[i]);
          category.SubCategories = [];
          customization.CustomSubcategories.push(category);
        }
      }

      let foundCategory = find(customization.CustomSubcategories, { Id: categoryId });
      let subCategoryIndex = findIndex(foundCategory.SubCategories, { Id: heading.Id });
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
      let customization = cloneDeep(this.props.customization);
      let foundCategory = find(customization.CustomSubcategories, { Id: categoryId });
      remove(foundCategory.SubCategories, { Id: subCategoryId });
      this.setState({ working: true });
      this.props.upsertCustomizations(customization).then(() => { this.setState({ working: false }); });
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (deleteSubCategory) - ${err}`, LogLevel.Error);
    }
  }

  private getContainer(className: string): any {
    let element: any;
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
    return new Promise((response) => {
      try {
        this.setState({
          loadingCdn: true
        },
          async () => {
            let retVal = await this.props.selectCDN(cdnId);
            this.setState({
              currentCDNId: cdnId,
              loadingCdn: false
            }, () => {
              response(retVal);
            });
          });
      } catch (err) {
        response(false);
      }
    });
  }

  private upsertCdn = async (cdn: ICDN): Promise<boolean> => {
    let retVal: boolean = false;
    try {
      let upsertCdnResult = await this.props.upsertCdn(cdn);
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
      let showMultilingualMsg: boolean = (this.props.firstConfig && params.multilingualEnabled && params.configuredLanguages.length > 1);
      let showUpgradeMsg: boolean = (this.props.cacheConfig && (this.props.currentWebpart < this._currentVersion));
      let className: string = (showMultilingualMsg || showUpgradeMsg) ? "" : "nomsg";
      return (
        <div data-component={this.LOG_SOURCE} className={`${styles.customLearning} ${(params.appPartPage) ? styles.appPartPage : ""}`}>
          <AdminMenu
            loadingCdn={this.state.loadingCdn}
            placeholderUrl={`${params.baseCdnPath}${params.defaultLanguage}/images/categories/customfeatured.png`}
            currentCDNId={this.state.currentCDNId}
            selectCDN={this.selectCDN}
            selectTab={this.selectTab}
            upsertCdn={this.upsertCdn}
            removeCdn={this.props.removeCdn}
            working={this.state.working}
          />
          <div className="adm-header-message">
            {showMultilingualMsg &&
              <MessageBar
                messageBarType={MessageBarType.warning}
                isMultiline={true}
                dismissButtonAriaLabel={strings.CloseButton}
              >
                {strings.DataUpgradeMultilingual}
                <Link
                  href={`${this.props.siteUrl}/_layouts/15/muisetng.aspx`}
                  target="_blank">
                  {strings.DataUpgradeReview}
                </Link>
              </MessageBar>
            }
            {showUpgradeMsg &&
              <MessageBar>
                {notice}
                <Link
                  href={(params.updateInstructionUrl) ? params.updateInstructionUrl : "https://github.com/pnp/custom-learning-office-365#updating-the-solution"}
                  target="_blank">
                  {strings.AdminVersionUpdateInstructions}
                </Link>
              </MessageBar>
            }
          </div>
          {
            this.props.validConfig && this.props.cacheConfig && !this.state.loadingCdn &&
            this.getContainer(className)
          }
          {
            !this.props.validConfig && !this.props.cacheConfig && !this.state.loadingCdn &&
            <MessageBar messageBarType={MessageBarType.error} className="adm-content">
              {strings.AdminConfigIssueMessage}
            </MessageBar>
          }
          {
            this.state.loadingCdn &&
            <ShimmerViewer shimmerView={ShimmerView.AdminCdn} />
          }
        </div >
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}
