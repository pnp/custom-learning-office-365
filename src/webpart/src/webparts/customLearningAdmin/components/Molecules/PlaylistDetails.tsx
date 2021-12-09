import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash/isEqual";
import cloneDeep from "lodash/cloneDeep";
import findIndex from "lodash/findIndex";
import find from "lodash/find";
import forEach from "lodash/forEach";

import { Pivot, PivotItem, Dropdown, IDropdownOption, Icon, PrimaryButton, DefaultButton } from "office-ui-fabric-react";

import * as strings from "M365LPStrings";
import { params } from "../../../common/services/Parameters";
import { IPlaylist, IMultilingualString, ICategory, ITechnology, IMetadataEntry, MultilingualString, ILocale } from "../../../common/models/Models";
import ImageSelector from "../Atoms/ImageSelector";
import PlaylistDetail from "../Atoms/PlaylistDetail";
import { CustomWebpartSource } from "../../../common/models/Enums";

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

  private _addLanguagePlaceholder: JSX.Element = <div className="dropdownExample-placeholder">
    <Icon style={{ marginRight: '8px' }} iconName={'MessageFill'} aria-hidden="true" />
    <span>{strings.AddLanguagePlaceholder}</span>
  </div>;

  constructor(props) {
    super(props);

    this.state = new PlaylistDetailsState(params.defaultLanguage);
  }

  public shouldComponentUpdate(nextProps: Readonly<IPlaylistDetailsProps>, nextState: Readonly<IPlaylistDetailsState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private setImageSource = (imageSrc: string, currentIndex: number) => {
    try {
      let playlist = cloneDeep(this.props.playlist);
      (playlist.Image as IMultilingualString[])[currentIndex].Text = imageSrc;
      this.props.updatePlaylist(playlist, false);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (setImageSource) - ${err}`, LogLevel.Error);
    }
  }

  private addLanguage = (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption, index?: number) => {
    try {
      let playlist = cloneDeep(this.props.playlist);
      (playlist.Title as IMultilingualString[]).push(new MultilingualString(option.key as string, (playlist.Title as IMultilingualString[])[0].Text));
      (playlist.Description as IMultilingualString[]).push(new MultilingualString(option.key as string, (playlist.Description as IMultilingualString[])[0].Text));
      (playlist.Image as IMultilingualString[]).push(new MultilingualString(option.key as string, (playlist.Image as IMultilingualString[])[0].Text));
      this.setState({
        currentLanguage: option.key.toString()
      }, () => {
        this.props.updatePlaylist(playlist, false);
      });
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (addLanguage) - ${err}`, LogLevel.Error);
    }
  }

  private removeLanguage = (event: any) => {
    try {
      let playlist = cloneDeep(this.props.playlist);
      let languageIndex = findIndex(this._currentLanguageOptions, { code: this.state.currentLanguage });
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

  public render(): React.ReactElement<IPlaylistDetailsProps> {
    try {
      let currentLangIndex: number = 0;
      this._currentLanguageOptions = [];
      let addLanguageOptions: IDropdownOption[] = [];
      if (this._showMultilingual) {
        currentLangIndex = findIndex((this.props.playlist.Title as IMultilingualString[]), { LanguageCode: this.state.currentLanguage });
        forEach(params.supportedLanguages, (language) => {
          let found = findIndex(this.props.playlist.Title as IMultilingualString[], { LanguageCode: language });
          let locale: ILocale = find(params.configuredLanguages, { code: language });
          if (locale) {
            if (found < 0) {
              addLanguageOptions.push({ key: language, text: locale.description });
            } else {
              this._currentLanguageOptions.push(locale);
            }
          }
        });
      }
      return (
        <div data-component={this.LOG_SOURCE}>
          {params.multilingualEnabled &&
            <div className="adm-header-nav-subcont">
              <Pivot
                className="adm-header-nav"
                selectedKey={this.state.currentLanguage}
                onLinkClick={(i: PivotItem) => { this.setState({ currentLanguage: i.props.itemKey }); }}
                headersOnly={true}
                getTabId={(itemKey) => { return `PlaylistDetail_${itemKey}`; }}>
                {this._currentLanguageOptions.length > 0 && this._currentLanguageOptions.map((cl) => {
                  return (<PivotItem headerText={cl.description} itemKey={cl.code} />);
                })
                }
              </Pivot>
              {this.props.editMode && addLanguageOptions.length > 0 &&
                <div className="adm-pivotCombo">
                  <Dropdown
                    placeholder="Add language"
                    ariaLabel="Add a translation language"
                    onRenderPlaceholder={(): JSX.Element => {
                      return (this._addLanguagePlaceholder);
                    }}
                    options={addLanguageOptions}
                    onChange={this.addLanguage}
                  />
                </div>
              }
            </div>
          }

          <div className="adm-itemedit">
            <div className="adm-itemleft" aria-labelledby={`PlaylistDetail_${this.state.currentLanguage}`}>
              <ImageSelector
                imageSource={(this.props.playlist.Image instanceof Array) ? (this.props.playlist.Image as IMultilingualString[])[currentLangIndex].Text : this.props.playlist.Image as string}
                disabled={!this.props.editMode}
                setImageSource={(imageSource) => { this.setImageSource(imageSource, currentLangIndex); }}
              />
            </div>
            <div className="adm-itemright" aria-labelledby={`PlaylistDetail_${this.state.currentLanguage}`}>
              <PlaylistDetail
                categories={this.props.categories}
                technologies={this.props.technologies}
                levels={this.props.levels}
                audiences={this.props.audiences}
                detail={this.props.playlist}
                updateDetail={this.props.updatePlaylist}
                currentLangIndex={currentLangIndex}
                edit={this.props.editMode}
              />
            </div>
          </div>
          {(this.props.playlist.Source === CustomWebpartSource.Tenant) &&
            <div className="adm-itemaction">
              {this.props.editMode && this._currentLanguageOptions.length > 1 && this.state.currentLanguage !== this._currentLanguageOptions[0].code &&
                <PrimaryButton
                  text={strings.RemoveLanguageLabel}
                  onClick={this.removeLanguage}
                />
              }
              {!this.props.editMode &&
                <DefaultButton
                  text={strings.PlaylistEditEditLabel}
                  onClick={this.props.edit}
                />
              }
              {this.props.editMode &&
                <>
                  <DefaultButton
                    text={strings.PlaylistEditCancelLabel}
                    onClick={this.props.cancel}
                  />
                  <PrimaryButton
                    text={strings.PlaylistEditSaveLabel}
                    onClick={() => this.props.updatePlaylist(this.props.playlist, true)}
                    disabled={!this.props.dirty || !this.props.valid}
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