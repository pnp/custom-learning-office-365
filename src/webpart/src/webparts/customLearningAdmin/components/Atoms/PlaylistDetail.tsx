import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash/isEqual";
import forEach from "lodash/forEach";
import find from "lodash/find";
import cloneDeep from "lodash/cloneDeep";
import { Dropdown, IDropdownOption, Label, TextField, TooltipHost, ITooltipHostStyles } from 'office-ui-fabric-react';

import { IPlaylist, ICategory, ITechnology, IMetadataEntry, IMultilingualString } from "../../../common/models/Models";
import * as strings from 'M365LPStrings';
import styles from '../../../common/CustomLearningCommon.module.scss';
import { IRecursiveList, RecursiveList } from "../../../recusiveTree/RecursiveTree";
import RecursiveTree from "../../../recusiveTree/RecursiveTree";

export interface IPlaylistDetailProps {
  categories: ICategory[];
  technologies: ITechnology[];
  levels: IMetadataEntry[];
  audiences: IMetadataEntry[];
  detail: IPlaylist;
  edit: boolean;
  currentLangIndex: number;
  updateDetail: (detail: IPlaylist, save: boolean) => void;
}

export interface IPlaylistDetailState {
  recursiveCategories: IRecursiveList[];
  selectedCategory: ICategory;
  selectedTechnology: ITechnology;
  technologyDropdown: IDropdownOption[];
  levelDropdown: IDropdownOption[];
  audienceDropdown: IDropdownOption[];
}

export class DetailEditState implements IPlaylistDetailState {
  constructor(
    public recursiveCategories: IRecursiveList[] = null,
    public selectedCategory: ICategory = null,
    public selectedTechnology: ITechnology = null,
    public technologyDropdown: IDropdownOption[] = [],
    public levelDropdown: IDropdownOption[] = [],
    public audienceDropdown: IDropdownOption[] = []
  ) { }
}

export default class PlaylistDetail extends React.Component<IPlaylistDetailProps, IPlaylistDetailState> {
  private LOG_SOURCE: string = "PlaylistDetail";
  private _reinitState: boolean = false;

  constructor(props) {
    super(props);
    this.initState(props);
  }

  private initState(props: IPlaylistDetailProps) {
    try {
      let selectedCategory: ICategory = null;
      let selectedTechnology: ITechnology = null;
      let recursiveCategories: IRecursiveList[] = null;
      let levelDropdown: IDropdownOption[] = null;
      let audienceDropdown: IDropdownOption[] = null;

      recursiveCategories = [];
      forEach(props.categories, (c): void => {
        //
        function fixChildren(sc: ICategory[]): IRecursiveList[] {
          let retVal: IRecursiveList[] = [];
          for (let i = 0; i < sc.length; i++) {
            if (sc[i].Id === props.detail.CatId) {
              selectedCategory = sc[i];
            }
            let name = (sc[i].Name instanceof Array) ? (sc[i].Name as IMultilingualString[])[0].Text : sc[i].Name as string;
            let childItem = new RecursiveList(sc[i].Id, name);
            if (sc[i].SubCategories.length > 0)
              childItem.children = fixChildren(sc[i].SubCategories);
            retVal.push(childItem);
          }
          return retVal;
        }

        if (c.Id === props.detail.CatId)
          selectedCategory = cloneDeep(c);
        let nameCat = (c.Name instanceof Array) ? (c.Name as IMultilingualString[])[0].Text : c.Name as string;
        let newItem = new RecursiveList(c.Id, nameCat);
        if (c.SubCategories.length > 0)
          newItem.children = fixChildren(c.SubCategories);
        recursiveCategories.push(newItem);
      });

      levelDropdown = this.props.levels.map((level) => {
        return { key: level.Id, text: level.Name };
      });
      levelDropdown.unshift({ key: "", text: "" });

      audienceDropdown = this.props.audiences.map((aud) => {
        return { key: aud.Id, text: aud.Name };
      });
      audienceDropdown.unshift({ key: "", text: "" });

      let technologyDropdown: IDropdownOption[] = props.technologies.map((tech) => {
        return { key: tech.Id, text: tech.Name };
      });
      technologyDropdown.splice(0, 0, { key: "", text: "" });
      selectedTechnology = find(props.technologies, { Id: props.detail.TechnologyId });

      this.state = new DetailEditState(
        recursiveCategories,
        selectedCategory,
        selectedTechnology,
        technologyDropdown,
        levelDropdown,
        audienceDropdown);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (initState) - ${err}`, LogLevel.Error);
    }
  }

  public shouldComponentUpdate(nextProps: Readonly<IPlaylistDetailProps>, nextState: Readonly<IPlaylistDetailState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    if (!isEqual(nextProps.detail, this.props.detail))
      this._reinitState = true;
    return true;
  }

  public componentDidUpdate() {
    if (this._reinitState) {
      this._reinitState = false;
      this.initState(this.props);
    }
  }

  private multiFieldChanged = (newValue: string, fieldName: string) => {
    try {
      let editDetail: IPlaylist = cloneDeep(this.props.detail);
      (editDetail[fieldName] as IMultilingualString)[this.props.currentLangIndex].Text = newValue;
      this.props.updateDetail(editDetail, false);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (textFieldChanged) - ${err}`, LogLevel.Error);
    }
  }

  private dropdownChanged = (option: IDropdownOption, fieldName: string) => {
    try {
      let editDetail: IPlaylist = cloneDeep(this.props.detail);
      editDetail[fieldName] = option.key.toString();
      this.props.updateDetail(editDetail, false);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (dropdownChanged) - ${err}`, LogLevel.Error);
    }
  }

  private selectCatId = (itemKey: string) => {
    try {
      let editDetail: IPlaylist = cloneDeep(this.props.detail);
      editDetail.CatId = itemKey;
      this.props.updateDetail(editDetail, false);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (selectCatId) - ${err}`, LogLevel.Error);
    }
  }

  private getCategoryError = (): string => {
    let retVal = "";
    if (this.state.selectedCategory && this.state.selectedCategory.Name instanceof Array) {
      if (!(this.state.selectedCategory.Name[this.props.currentLangIndex])) {
        retVal = strings.CategoryTranslationNotAvailable;
      }
    }
    return retVal;
  }

  public render(): React.ReactElement<IPlaylistDetailProps> {
    let categoryError = this.getCategoryError();
    try {
      return (
        <div data-component={this.LOG_SOURCE}>
          {this.props.edit &&
            <>
              <TextField
                value={(this.props.detail.Title as IMultilingualString[])[this.props.currentLangIndex].Text}
                label={strings.DetailEditTitle}
                required={true}
                onChange={(ev, newValue) => { this.multiFieldChanged(newValue, "Title"); }}
                autoFocus={true}
              />
              <TextField
                value={(this.props.detail.Description as IMultilingualString[])[this.props.currentLangIndex].Text}
                label={strings.DetailEditDescription}
                required={true}
                multiline
                rows={3}
                onChange={(ev, newValue) => { this.multiFieldChanged(newValue, "Description"); }}
              />
              <Dropdown
                label={strings.DetailEditTechnology}
                options={this.state.technologyDropdown}
                selectedKey={[this.props.detail.TechnologyId]}
                onChange={(ev, option) => { this.dropdownChanged(option, "TechnologyId"); }}
                required={false}
                disabled={this.props.currentLangIndex > 0}
              />
              <RecursiveTree
                label={strings.DetailEditCategory}
                noDataMessage={strings.DetailEditCategoryNoData}
                autoExpandChildren={true}
                required={true}
                treeItems={this.state.recursiveCategories}
                selectedKeys={[this.props.detail.CatId]}
                selectItem={this.selectCatId}
                disabled={this.props.currentLangIndex > 0}
                errorMessage={this.getCategoryError()}
              />
              <Dropdown
                label={strings.DetailEditLevel}
                options={this.state.levelDropdown}
                selectedKey={this.props.detail.LevelId}
                onChange={(ev, option) => { this.dropdownChanged(option, "LevelId"); }}
                required={false}
                disabled={this.props.currentLangIndex > 0}
              />
              <Dropdown
                label={strings.DetailEditAudience}
                options={this.state.audienceDropdown}
                selectedKey={this.props.detail.AudienceId}
                onChange={(ev, option) => { this.dropdownChanged(option, "AudienceId"); }}
                required={false}
                disabled={this.props.currentLangIndex > 0}
              />
            </>
          }
          {!this.props.edit &&
            <>
              <Label className={styles.semiBold}>{strings.DetailEditTitle}</Label>
              {(this.props.detail.Title instanceof Array) &&
                <p className="adm-fieldvalue">{(this.props.detail.Title as IMultilingualString[])[this.props.currentLangIndex].Text}</p>
              }
              {!(this.props.detail.Title instanceof Array) &&
                <p className="adm-fieldvalue">{this.props.detail.Title as string}</p>
              }
              <Label className={styles.semiBold}>{strings.DetailEditDescription}</Label>
              {(this.props.detail.Description instanceof Array) &&
                <p className="adm-fieldvalue">{(this.props.detail.Description as IMultilingualString[])[this.props.currentLangIndex].Text}</p>
              }
              {!(this.props.detail.Description instanceof Array) &&
                <p className="adm-fieldvalue">{this.props.detail.Description as string}</p>
              }
              <Label className={styles.semiBold}>{strings.DetailEditTechnology}</Label>
              <p className="adm-fieldvalue">{(this.state.selectedTechnology) ? this.state.selectedTechnology.Name : ""}</p>
              {categoryError.length > 0 &&
                <TooltipHost
                  id="categoryTip"
                  content={this.getCategoryError()}
                  calloutProps={{ gapSpace: 0 }}>
                  <Label className={styles.semiBold} required={(categoryError.length > 0)} aria-describedby="categoryTip">{strings.DetailEditCategory}</Label>
                </TooltipHost>
              }
              {categoryError.length < 1 &&
                <Label className={styles.semiBold}>{strings.DetailEditCategory}</Label>
              }
              {(this.state.selectedCategory.Name instanceof Array) &&
                <p className="adm-fieldvalue">{(this.state.selectedCategory.Name as IMultilingualString[])[0].Text}</p>
              }
              {!(this.state.selectedCategory.Name instanceof Array) &&
                <p className="adm-fieldvalue">{(this.state.selectedCategory) ? this.state.selectedCategory.Name as string : ""}</p>
              }
              <Label className={styles.semiBold}>{strings.DetailEditLevel}</Label>
              <p className="adm-fieldvalue">{(this.props.detail.LevelValue) ? this.props.detail.LevelValue.Name : ""}</p>
              <Label className={styles.semiBold}>{strings.DetailEditAudience}</Label>
              <p className="adm-fieldvalue">{(this.props.detail.AudienceValue) ? this.props.detail.AudienceValue.Name : ""}</p>
            </>
          }
        </div >
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}
