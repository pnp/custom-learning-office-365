import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash-es/isEqual";
import forEach from "lodash-es/forEach";
import find from "lodash-es/find";
import cloneDeep from "lodash-es/cloneDeep";
import HOOLabel from "@n8d/htwoo-react/HOOLabel";
import HOOText from "@n8d/htwoo-react/HOOText";
import HOODropDown, { IHOODropDownItem } from "@n8d/htwoo-react/HOODropDown";
import HOODialog from "@n8d/htwoo-react/HOODialog";
import HOODialogContent from "@n8d/htwoo-react/HOODialogContent";


import { IPlaylist, ICategory, ITechnology, IMetadataEntry, IMultilingualString } from "../../../common/models/Models";
import * as strings from 'M365LPStrings';
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
  technologyDropdown: IHOODropDownItem[];
  levelDropdown: IHOODropDownItem[];
  audienceDropdown: IHOODropDownItem[];
}

export class DetailEditState implements IPlaylistDetailState {
  constructor(
    public recursiveCategories: IRecursiveList[] = null,
    public selectedCategory: ICategory = null,
    public selectedTechnology: ITechnology = null,
    public technologyDropdown: IHOODropDownItem[] = [],
    public levelDropdown: IHOODropDownItem[] = [],
    public audienceDropdown: IHOODropDownItem[] = []
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
      let levelDropdown: IHOODropDownItem[] = null;
      let audienceDropdown: IHOODropDownItem[] = null;

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
        return { key: level.Id, text: level.Name, disabled: false };
      });
      levelDropdown.unshift({ key: "", text: "", disabled: false });

      audienceDropdown = this.props.audiences.map((aud) => {
        return { key: aud.Id, text: aud.Name, disabled: false };
      });
      audienceDropdown.unshift({ key: "", text: "", disabled: false });

      let technologyDropdown: IHOODropDownItem[] = props.technologies.map((tech) => {
        return { key: tech.Id, text: tech.Name, disabled: false };
      });
      technologyDropdown.splice(0, 0, { key: "", text: "", disabled: false });
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

  private dropdownChanged = (option: string | number, fieldName: string) => {
    try {
      let editDetail: IPlaylist = cloneDeep(this.props.detail);
      editDetail[fieldName] = option.toString();
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
              <HOOLabel label={strings.DetailEditTitle} for={strings.DetailEditTitle} required={true}></HOOLabel>
              <HOOText
                forId={strings.DetailEditTitle}
                onChange={(ev) => { this.multiFieldChanged(ev.currentTarget.value, "Title"); }}
                value={(this.props.detail.Title as IMultilingualString[])[this.props.currentLangIndex].Text}
                inputElementAttributes={{
                  autoFocus: true
                }}
              />

              <HOOLabel label={strings.DetailEditDescription} for={strings.DetailEditDescription} required={true}></HOOLabel>
              <HOOText
                forId={strings.DetailEditDescription}
                onChange={(ev) => { this.multiFieldChanged(ev.currentTarget.value, "Description"); }}
                value={(this.props.detail.Description as IMultilingualString[])[this.props.currentLangIndex].Text}
                multiline={3}

              />
              <HOOLabel label={strings.DetailEditTechnology} for={strings.DetailEditTechnology} required={false}></HOOLabel>
              <HOODropDown
                value={this.props.detail.TechnologyId}
                options={this.state.technologyDropdown}
                containsTypeAhead={false}
                forId={strings.DetailEditTechnology}
                disabled={this.props.currentLangIndex > 0}
                onChange={(ev) => { this.dropdownChanged(ev, "TechnologyId"); }}
              ></HOODropDown>

              {/* TODO check and see if we should convert this to grouped Drop down */}
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

              <HOOLabel label={strings.DetailEditLevel} for={strings.DetailEditLevel} required={false}></HOOLabel>
              <HOODropDown
                value={this.props.detail.LevelId}
                options={this.state.levelDropdown}
                containsTypeAhead={false}
                forId={strings.DetailEditLevel}
                disabled={this.props.currentLangIndex > 0}
                onChange={(ev) => { this.dropdownChanged(ev, "LevelId"); }}
              ></HOODropDown>

              <HOOLabel label={strings.DetailEditAudience} for={strings.DetailEditAudience} required={false}></HOOLabel>
              <HOODropDown
                value={this.props.detail.AudienceId}
                options={this.state.audienceDropdown}
                containsTypeAhead={false}
                forId={strings.DetailEditAudience}
                disabled={this.props.currentLangIndex > 0}
                onChange={(ev) => { this.dropdownChanged(ev, "AudienceId"); }}
              ></HOODropDown>
            </>
          }
          {!this.props.edit &&
            <>
              <HOOLabel
                label={strings.DetailEditTitle}
              ></HOOLabel>

              {(this.props.detail.Title instanceof Array) &&
                <p className="adm-fieldvalue">{(this.props.detail.Title as IMultilingualString[])[this.props.currentLangIndex].Text}</p>
              }
              {!(this.props.detail.Title instanceof Array) &&
                <p className="adm-fieldvalue">{this.props.detail.Title as string}</p>
              }
              <HOOLabel
                label={strings.DetailEditDescription}
              ></HOOLabel>

              {(this.props.detail.Description instanceof Array) &&
                <p className="adm-fieldvalue">{(this.props.detail.Description as IMultilingualString[])[this.props.currentLangIndex].Text}</p>
              }
              {!(this.props.detail.Description instanceof Array) &&
                <p className="adm-fieldvalue">{this.props.detail.Description as string}</p>
              }
              <HOOLabel label={strings.DetailEditTechnology} ></HOOLabel>

              <p className="adm-fieldvalue">{(this.state.selectedTechnology) ? this.state.selectedTechnology.Name : ""}</p>
              {categoryError.length > 0 &&
                // TODO add the check visibility function  
                <HOODialog
                  changeVisibility={function noRefCheck() { }}
                  type={1}
                  visible
                >
                  <HOODialogContent>
                    {this.getCategoryError()}
                    <HOOLabel
                      label={strings.DetailEditCategory}
                      required={(categoryError.length > 0)}
                    ></HOOLabel>
                  </HOODialogContent>

                </HOODialog>

              }
              {categoryError.length < 1 &&
                <HOOLabel label={strings.DetailEditCategory} ></HOOLabel>
              }
              {(this.state.selectedCategory.Name instanceof Array) &&
                <p className="adm-fieldvalue">{(this.state.selectedCategory.Name as IMultilingualString[])[0].Text}</p>
              }
              {!(this.state.selectedCategory.Name instanceof Array) &&
                <p className="adm-fieldvalue">{(this.state.selectedCategory) ? this.state.selectedCategory.Name as string : ""}</p>
              }
              <HOOLabel label={strings.DetailEditLevel}></HOOLabel>

              <p className="adm-fieldvalue">{(this.props.detail.LevelValue) ? this.props.detail.LevelValue.Name : ""}</p>
              <HOOLabel label={strings.DetailEditAudience}></HOOLabel>
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
