import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash/isEqual";
import cloneDeep from "lodash/cloneDeep";
import forEach from "lodash/forEach";
import findIndex from "lodash/findIndex";
import find from "lodash/find";
import { IDropdownOption, Dropdown, TextField, IconButton, Icon } from "office-ui-fabric-react";

import * as strings from "M365LPStrings";
import { params } from "../../../common/services/Parameters";
import { ICategory, IMultilingualString, ILocale, MultilingualString } from "../../../common/models/Models";
import { CustomWebpartSource } from "../../../common/models/Enums";
import ImageSelector from "../Atoms/ImageSelector";

export interface ICategoryHeadingDetailProps {
  heading: ICategory;
  edit: boolean;
  updateHeading: (heading: ICategory) => void;
}

export interface ICategoryHeadingDetailState {
}

export class CategoryHeadingDetailState implements ICategoryHeadingDetailState {
  constructor() { }
}

export default class CategoryHeadingDetail extends React.Component<ICategoryHeadingDetailProps, ICategoryHeadingDetailState> {
  private LOG_SOURCE: string = "CategoryHeadingDetail";
  private _showMultilingual: boolean = params.multilingualEnabled && (this.props.heading.Source === CustomWebpartSource.Tenant);

  private _addLanguagePlaceholder: JSX.Element = <div className="dropdownExample-placeholder">
    <Icon style={{ marginRight: '8px' }} iconName={'MessageFill'} aria-hidden="true" />
    <span>{strings.AddLanguagePlaceholder}</span>
  </div>;

  constructor(props) {
    super(props);
    this.state = new CategoryHeadingDetailState();
  }

  public shouldComponentUpdate(nextProps: Readonly<ICategoryHeadingDetailProps>, nextState: Readonly<ICategoryHeadingDetailState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private setHeadingName = (name: string, index: number) => {
    try {
      let heading = cloneDeep(this.props.heading);
      (heading.Name as IMultilingualString[])[index].Text = name;
      this.props.updateHeading(heading);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (setHeadingName) - ${err}`, LogLevel.Error);
    }
  }

  private setImageSource = (imageSrc: string) => {
    try {
      let heading = cloneDeep(this.props.heading);
      forEach((heading.Image as IMultilingualString[]), (image) => {
        image.Text = imageSrc;
      });
      this.props.updateHeading(heading);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (setImageSource) - ${err}`, LogLevel.Error);
    }
  }

  private addLanguage = (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption, index?: number) => {
    try {
      let heading = cloneDeep(this.props.heading);
      (heading.Name as IMultilingualString[]).push(new MultilingualString(option.key as string, (heading.Name as IMultilingualString[])[0].Text));
      (heading.Image as IMultilingualString[]).push(new MultilingualString(option.key as string, (heading.Image as IMultilingualString[])[0].Text));
      this.props.updateHeading(heading);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (addLanguage) - ${err}`, LogLevel.Error);
    }
  }

  private deleteLanguage = (index: number) => {
    try {
      let heading = cloneDeep(this.props.heading);
      (heading.Name as IMultilingualString[]).splice(index, 1);
      this.props.updateHeading(heading);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (deleteLanguage) - ${err}`, LogLevel.Error);
    }
  }

  public render(): React.ReactElement<ICategoryHeadingDetailProps> {
    try {
      let addLanguageOptions: IDropdownOption[] = [];
      if (this._showMultilingual) {
        forEach(params.supportedLanguages, (language) => {
          let found = findIndex(this.props.heading.Name as IMultilingualString[], { LanguageCode: language });
          let locale: ILocale = find(params.configuredLanguages, { code: language });
          if (locale) {
            if (found < 0) {
              addLanguageOptions.push({ key: language, text: locale.description });
            }
          }
        });
      }

      return (
        <div data-component={this.LOG_SOURCE} className="adm-itemedit">
          <div className="adm-itemleft">
            <ImageSelector
              imageSource={(this.props.heading.Image instanceof Array) ? (this.props.heading.Image as IMultilingualString[])[0].Text : this.props.heading.Image as string}
              disabled={!this.props.edit}
              setImageSource={this.setImageSource}
            />
          </div>
          <div className="adm-itemright">
            {(this.props.heading.Name as IMultilingualString[]).map((name, idx) => {
              let locale: ILocale = find(params.configuredLanguages, { code: name.LanguageCode });
              return (
                <div className="adm-subcatheading">
                  <TextField
                    label={`${strings.SubcategoryHeadingLabel} - ${locale.description}`}
                    required={true}
                    value={name.Text}
                    onChange={(ev, newValue) => { this.setHeadingName(newValue, idx); }}
                    autoFocus={true}
                  />
                  {(locale.code !== params.defaultLanguage) &&
                    <IconButton
                      iconProps={{ iconName: 'Delete' }}
                      title={strings.DeleteButton}
                      ariaLabel={strings.DeleteButton}
                      onClick={() => { this.deleteLanguage(idx); }}
                      disabled={false}
                    />
                  }
                </div>
              );
            })}
            {params.multilingualEnabled && addLanguageOptions.length > 0 &&
              <Dropdown
                placeholder="Add language"
                ariaLabel="Add a translation language"
                onRenderPlaceholder={(): JSX.Element => {
                  return (this._addLanguagePlaceholder);
                }}
                options={addLanguageOptions}
                onChange={this.addLanguage}
              />
            }
          </div>
        </div>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}