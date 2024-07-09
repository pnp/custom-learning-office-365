import { Logger, LogLevel } from "@pnp/logging";
import * as React from "react";

import HOOButton from "@n8d/htwoo-react/HOOButton";
import HOODropDown, { IHOODropDownItem } from "@n8d/htwoo-react/HOODropDown";
import HOOPivotBar, { IHOOPivotItem } from "@n8d/htwoo-react/HOOPivotBar";
import cloneDeep from "lodash-es/cloneDeep";
import find from "lodash-es/find";
import findIndex from "lodash-es/findIndex";
import forEach from "lodash-es/forEach";
import isEqual from "lodash-es/isEqual";

import * as strings from "M365LPStrings";
import { CustomWebpartSource } from "../../../common/models/Enums";
import { ICategory, ILocale, IMetadataEntry, IMultilingualString, IPlaylist, ITechnology, MultilingualString } from "../../../common/models/Models";
import { params } from "../../../common/services/Parameters";
import ImageSelector from "../Atoms/ImageSelector";
import PlaylistDetail from "../Atoms/PlaylistDetail";


export interface IPlaylistDetailsProps {
  playlist: IPlaylist;
  editMode: boolean;
  dirty: boolean;
  valid: boolean;
  categories: ICategory[];
  technologies: ITechnology[];
  levels: IMetadataEntry[];
  audiences: IMetadataEntry[];
  updatePlaylist: (playlist: IPlaylist, save: boolean) => void;
  edit: () => void;
  cancel: () => void;
}

export interface IPlaylistDetailsState {
  currentLanguage: string;
}

export class PlaylistDetailsState implements IPlaylistDetailsState {
  constructor(
    public currentLanguage: string = ""
  ) { }
}

export default class PlaylistDetails extends React.Component<IPlaylistDetailsProps, IPlaylistDetailsState> {
  private LOG_SOURCE: string = "PlaylistDetails";
  private _showMultilingual: boolean = params.multilingualEnabled;
  private _currentLanguageOptions: ILocale[] = [];

  constructor(props) {
    super(props);

    this.state = new PlaylistDetailsState(params.defaultLanguage);
  }

  public shouldComponentUpdate(nextProps: Readonly<IPlaylistDetailsProps>, nextState: Readonly<IPlaylistDetailsState>): boolean {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private setImageSource = (imageSrc: string, currentIndex: number): void => {
    try {
      const playlist = cloneDeep(this.props.playlist);
      (playlist.Image as IMultilingualString[])[currentIndex].Text = imageSrc;
      this.props.updatePlaylist(playlist, false);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (setImageSource) - ${err}`, LogLevel.Error);
    }
  }

  private addLanguage = (fieldValue: string | number): void => {
    try {
      const playlist = cloneDeep(this.props.playlist);
      (playlist.Title as IMultilingualString[]).push(new MultilingualString(fieldValue as string, (playlist.Title as IMultilingualString[])[0].Text));
      (playlist.Description as IMultilingualString[]).push(new MultilingualString(fieldValue as string, (playlist.Description as IMultilingualString[])[0].Text));
      (playlist.Image as IMultilingualString[]).push(new MultilingualString(fieldValue as string, (playlist.Image as IMultilingualString[])[0].Text));
      this.setState({
        currentLanguage: fieldValue.toString()
      }, () => {
        this.props.updatePlaylist(playlist, false);
      });
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (addLanguage) - ${err}`, LogLevel.Error);
    }
  }

  private removeLanguage = (): void => {
    try {
      const playlist = cloneDeep(this.props.playlist);
      const languageIndex = findIndex(this._currentLanguageOptions, { code: this.state.currentLanguage });
      let newLanguage: number = 0;
      if (languageIndex > 0)
        newLanguage = languageIndex - 1;

      (playlist.Title as IMultilingualString[]).splice(languageIndex, 1);
      (playlist.Description as IMultilingualString[]).splice(languageIndex, 1);
      (playlist.Image as IMultilingualString[]).splice(languageIndex, 1);

      this.setState({
        currentLanguage: this._currentLanguageOptions[newLanguage].code
      }, () => {
        this.props.updatePlaylist(playlist, false);
      });
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (removeLanguage) - ${err}`, LogLevel.Error);
    }
  }

  private getPivotItems = (): IHOOPivotItem[] => {
    const pivotItems: IHOOPivotItem[] = [];
    try {
      this._currentLanguageOptions.forEach(cl => {
        const pivotItem: IHOOPivotItem = {
          text: cl.description,
          key: cl.code
        };

        if (pivotItem) {
          pivotItems.push(pivotItem);
        }

      });
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (getPivotItems) - ${err}`, LogLevel.Error);
    }
    return pivotItems;
  }

  public render(): React.ReactElement<IPlaylistDetailsProps> {
    try {
      let currentLangIndex: number = 0;
      let selectedLocale;
      this._currentLanguageOptions = [];
      const addLanguageOptions: IHOODropDownItem[] = [];
      if (this._showMultilingual) {
        currentLangIndex = findIndex((this.props.playlist.Title as IMultilingualString[]), { LanguageCode: this.state.currentLanguage });
        forEach(params.supportedLanguages, (language) => {
          const found = findIndex(this.props.playlist.Title as IMultilingualString[], { LanguageCode: language });
          const locale: ILocale = find(params.configuredLanguages, { code: language });
          if (locale) {
            if (this.state.currentLanguage === locale.code) {
              selectedLocale = locale;
            }
            if (found < 0) {
              addLanguageOptions.push({ key: language, text: locale.description, disabled: false });
            } else {
              this._currentLanguageOptions.push(locale);
            }
          }
        });
      }
      return (
        <div data-component={this.LOG_SOURCE}>

          {params.multilingualEnabled &&
            <div className="adm-curplasset-lang">
              <HOOPivotBar
                onClick={(ev, option) => { this.setState({ currentLanguage: option.toString() }); }}
                pivotItems={this.getPivotItems()}
                rootElementAttributes={{ className: "adm-header-nav" }}
                selectedKey={this.state.currentLanguage}
                hasOverflow={true}
              />
              {this.props.editMode && addLanguageOptions.length > 0 &&
                <div className="adm-pivotCombo">
                  <HOODropDown
                    value={""}
                    options={addLanguageOptions}
                    placeholder="⚑ Add language"
                    containsTypeAhead={false}
                    onChange={this.addLanguage} />
                </div>
              }
            </div>
          }

          <div className="adm-plitem-details">
            <div className="adm-plitem-preview">
              <ImageSelector
                imageSource={(this.props.playlist.Image instanceof Array) ? (this.props.playlist.Image as IMultilingualString[])[currentLangIndex].Text : this.props.playlist.Image as string}
                disabled={!this.props.editMode}
                setImageSource={(imageSource) => { this.setImageSource(imageSource, currentLangIndex); }}
              />
            </div>
            <div className="adm-plitem-infodetails" aria-labelledby={`PlaylistDetail_${this.state.currentLanguage}`}>
              <PlaylistDetail
                categories={this.props.categories}
                technologies={this.props.technologies}
                levels={this.props.levels}
                audiences={this.props.audiences}
                detail={this.props.playlist}
                updateDetail={this.props.updatePlaylist}
                currentLangIndex={currentLangIndex}
                edit={this.props.editMode}
                currentLocale={selectedLocale} />
            </div>
          </div>
          {(this.props.playlist.Source === CustomWebpartSource.Tenant) &&
            <div className="adm-plitem-tools edit-details">
              {this.props.editMode && this._currentLanguageOptions.length > 1 && this.state.currentLanguage !== this._currentLanguageOptions[0].code &&
                <HOOButton
                  label={strings.RemoveLanguageLabel}
                  onClick={this.removeLanguage}
                  type={1}
                />
              }
              {!this.props.editMode &&
                <HOOButton
                  label={strings.PlaylistEditEditLabel}
                  onClick={this.props.edit}
                  type={2}
                />
              }
              {this.props.editMode &&
                <>
                  <HOOButton
                    label={strings.PlaylistEditCancelLabel}
                    onClick={this.props.cancel}
                    type={2}
                  />
                  <HOOButton
                    label={strings.PlaylistEditSaveLabel}
                    onClick={() => this.props.updatePlaylist(this.props.playlist, true)}
                    disabled={!this.props.dirty || !this.props.valid}
                    type={1}
                  />
                </>
              }
            </div>
          }
        </div>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}