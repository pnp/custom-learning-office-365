import { Logger, LogLevel } from "@pnp/logging";
import * as React from "react";

import HOODropDown, { IHOODropDownGroup, IHOODropDownItem } from "@n8d/htwoo-react/HOODropDown";
import HOOLabel from "@n8d/htwoo-react/HOOLabel";
import HOOText from "@n8d/htwoo-react/HOOText";
import cloneDeep from "lodash-es/cloneDeep";
import find from "lodash-es/find";
import forEach from "lodash-es/forEach";
import isEqual from "lodash-es/isEqual";

import * as strings from 'M365LPStrings';
import { ICategory, ILocale, IMetadataEntry, IMultilingualString, IPlaylist, ITechnology } from "../../../common/models/Models";
import HOONotifyLabel from "@n8d/htwoo-react/HOONotifyLabel";

export interface IPlaylistDetailProps {
  categories: ICategory[];
  technologies: ITechnology[];
  levels: IMetadataEntry[];
  audiences: IMetadataEntry[];
  detail: IPlaylist;
  edit: boolean;
  currentLangIndex: number;
  currentLocale: ILocale;
  updateDetail: (detail: IPlaylist, save: boolean) => void;
}

export interface IPlaylistDetailState {
  recursiveCategories: IHOODropDownGroup[];
  selectedCategory: ICategory;
  selectedTechnology: ITechnology;
  technologyDropdown: IHOODropDownItem[];
  levelDropdown: IHOODropDownItem[];
  audienceDropdown: IHOODropDownItem[];
}

export class DetailEditState implements IPlaylistDetailState {
  constructor(
    public recursiveCategories: IHOODropDownGroup[] = [],
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
    this.state = this.initState(props);
  }

  private initState(props: IPlaylistDetailProps): IPlaylistDetailState {
    try {
      let selectedCategory: ICategory = null;
      let selectedTechnology: ITechnology = null;
      const recursiveCategories: IHOODropDownGroup[] = [];
      let levelDropdown: IHOODropDownItem[] = null;
      let audienceDropdown: IHOODropDownItem[] = null;

      forEach(this.props.categories, (c): void => {
        const name = (c.Name instanceof Array) ? (c.Name as IMultilingualString[])[0].Text : c.Name as string;
        const group: IHOODropDownGroup = { groupName: name, groupItems: [] }
        if (c.SubCategories.length > 0) {
          const subCategories: IHOODropDownItem[] = [];
          for (let i = 0; i < c.SubCategories.length; i++) {
            if (c.SubCategories[i].Id === this.props.detail.CatId) {
              selectedCategory = c.SubCategories[i];
            }
            const subCat: IHOODropDownItem = {
              key: c.SubCategories[i].Id,
              text: (c.SubCategories[i].Name instanceof Array) ? (c.SubCategories[i].Name as IMultilingualString[])[0].Text : c.SubCategories[i].Name as string,
              disabled: false
            }
            subCategories.push(subCat)
          }
          if (subCategories.length > 0) {
            group.groupItems = subCategories;
          }
        }

        if (group.groupItems.length > 0) {
          recursiveCategories.push(group);
        }
      });

      levelDropdown = this.props.levels.map((level) => {
        return { key: level.Id, text: level.Name, disabled: false };
      });
      levelDropdown.unshift({ key: "", text: "", disabled: false });

      audienceDropdown = this.props.audiences.map((aud) => {
        return { key: aud.Id, text: aud.Name, disabled: false };
      });
      audienceDropdown.unshift({ key: "", text: "", disabled: false });

      const technologyDropdown: IHOODropDownItem[] = props.technologies.map((tech) => {
        return { key: tech.Id, text: tech.Name, disabled: false };
      });
      technologyDropdown.splice(0, 0, { key: "", text: "", disabled: false });
      selectedTechnology = find(props.technologies, { Id: props.detail.TechnologyId });

      return new DetailEditState(
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

  public shouldComponentUpdate(nextProps: Readonly<IPlaylistDetailProps>, nextState: Readonly<IPlaylistDetailState>): boolean {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    if (!isEqual(nextProps.detail, this.props.detail))
      this._reinitState = true;
    return true;
  }

  public componentDidUpdate(): void {
    if (this._reinitState) {
      this._reinitState = false;
      this.initState(this.props);
    }
  }

  private multiFieldChanged = (newValue: string, fieldName: string): void => {
    try {
      const editDetail: IPlaylist = cloneDeep(this.props.detail);
      (editDetail[fieldName] as IMultilingualString)[this.props.currentLangIndex].Text = newValue;
      this.props.updateDetail(editDetail, false);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (textFieldChanged) - ${err}`, LogLevel.Error);
    }
  }

  private dropdownChanged = (option: string | number, fieldName: string): void => {
    try {
      const editDetail: IPlaylist = cloneDeep(this.props.detail);
      editDetail[fieldName] = option.toString();
      this.props.updateDetail(editDetail, false);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (dropdownChanged) - ${err}`, LogLevel.Error);
    }
  }

  private selectCatId = (itemKey: string): void => {
    try {
      const editDetail: IPlaylist = cloneDeep(this.props.detail);
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
    const categoryError = this.getCategoryError();
    try {
      return (
        <div className="adm-plitem-form" data-component={this.LOG_SOURCE}>
          {this.props.edit &&
            <>
              <HOOLabel label={strings.DetailEditTitle} for={strings.DetailEditTitle} required={true} />
              <HOOText
                forId={strings.DetailEditTitle}
                onChange={(ev) => { this.multiFieldChanged(ev.currentTarget.value, "Title"); }}
                value={(this.props.detail.Title as IMultilingualString[])[this.props.currentLangIndex].Text}
                inputElementAttributes={{
                  autoFocus: true,
                  style: {
                    width: '100%'
                  }
                }}
              />

              <HOOLabel label={strings.DetailEditDescription} for={strings.DetailEditDescription} required={true} />
              <HOOText
                forId={strings.DetailEditDescription}
                onChange={(ev) => { this.multiFieldChanged(ev.currentTarget.value, "Description"); }}
                value={(this.props.detail.Description as IMultilingualString[])[this.props.currentLangIndex].Text}
                multiline={3}
                inputElementAttributes={{
                  style: {
                    width: '100%'
                  }
                }}

              />
              <HOOLabel label={strings.DetailEditTechnology} for={strings.DetailEditTechnology} required={false} />
              <HOODropDown
                value={this.props.detail.TechnologyId}
                options={this.state.technologyDropdown}
                containsTypeAhead={false}
                forId={strings.DetailEditTechnology}
                disabled={this.props.currentLangIndex > 0}
                onChange={(ev) => { this.dropdownChanged(ev, "TechnologyId"); }}
                inputElementAttributes={{
                  style: {
                    width: '100%'
                  }
                }} />
              <HOOLabel label={strings.DetailEditCategory} for={strings.DetailEditCategory} required={true} />
              <HOODropDown
                value={this.props.detail.CatId}
                options={this.state.recursiveCategories}
                onChange={this.selectCatId}
                containsTypeAhead={false}
                disabled={this.props.currentLangIndex > 0}
                forId={strings.DetailEditCategory} />
              {categoryError.length > 0 &&
                <HOONotifyLabel
                  message={`${categoryError} ${this.props.currentLocale.description}`}
                  type={1}
                  rootElementAttributes={{
                    style: {
                      color: 'red'
                    }
                  }}
                />
              }

              <HOOLabel label={strings.DetailEditLevel} for={strings.DetailEditLevel} required={false} />
              <HOODropDown
                value={this.props.detail.LevelId}
                options={this.state.levelDropdown}
                containsTypeAhead={false}
                forId={strings.DetailEditLevel}
                disabled={this.props.currentLangIndex > 0}
                onChange={(ev) => { this.dropdownChanged(ev, "LevelId"); }}
                inputElementAttributes={{
                  style: {
                    width: '100%'
                  }
                }} />

              <HOOLabel label={strings.DetailEditAudience} for={strings.DetailEditAudience} required={false} />
              <HOODropDown
                value={this.props.detail.AudienceId}
                options={this.state.audienceDropdown}
                containsTypeAhead={false}
                forId={strings.DetailEditAudience}
                disabled={this.props.currentLangIndex > 0}
                onChange={(ev) => { this.dropdownChanged(ev, "AudienceId"); }}
                inputElementAttributes={{
                  style: {
                    width: '100%'
                  }
                }} />
            </>
          }
          {!this.props.edit &&
            <>
              <HOOLabel label={strings.DetailEditTitle} />

              {(this.props.detail.Title instanceof Array) &&
                <p className="adm-fieldvalue">{(this.props.detail.Title as IMultilingualString[])[this.props.currentLangIndex].Text}</p>
              }
              {!(this.props.detail.Title instanceof Array) &&
                <p className="adm-fieldvalue">{this.props.detail.Title as string}</p>
              }
              <HOOLabel label={strings.DetailEditDescription} />

              {(this.props.detail.Description instanceof Array) &&
                <p className="adm-fieldvalue">{(this.props.detail.Description as IMultilingualString[])[this.props.currentLangIndex].Text}</p>
              }
              {!(this.props.detail.Description instanceof Array) &&
                <p className="adm-fieldvalue">{this.props.detail.Description as string}</p>
              }
              <HOOLabel label={strings.DetailEditTechnology} />
              <p className="adm-fieldvalue">{(this.state.selectedTechnology) ? this.state.selectedTechnology.Name : ""}</p>


              <HOOLabel label={strings.DetailEditCategory} />
              {(this.state.selectedCategory.Name instanceof Array) &&
                <p className="adm-fieldvalue">{(this.state.selectedCategory.Name as IMultilingualString[])[0].Text}</p>
              }
              {!(this.state.selectedCategory.Name instanceof Array) &&
                <p className="adm-fieldvalue">{(this.state.selectedCategory) ? this.state.selectedCategory.Name as string : ""}</p>
              }
              <HOOLabel label={strings.DetailEditLevel} />

              <p className="adm-fieldvalue">{(this.props.detail.LevelValue) ? this.props.detail.LevelValue.Name : ""}</p>
              <HOOLabel label={strings.DetailEditAudience} />
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
