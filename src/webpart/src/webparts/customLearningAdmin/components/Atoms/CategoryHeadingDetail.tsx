import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import cloneDeep from "lodash-es/cloneDeep";
import forEach from "lodash-es/forEach";
import findIndex from "lodash-es/findIndex";
import find from "lodash-es/find";
import HOOText from "@n8d/htwoo-react/HOOText";
import HOOLabel from "@n8d/htwoo-react/HOOLabel";
import HOOButton from "@n8d/htwoo-react/HOOButton";
import HOODropDown, { IHOODropDownItem } from "@n8d/htwoo-react/HOODropDown";

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

export default class CategoryHeadingDetail extends React.PureComponent<ICategoryHeadingDetailProps> {
  private LOG_SOURCE: string = "CategoryHeadingDetail";
  private _showMultilingual: boolean = params.multilingualEnabled && (this.props.heading.Source === CustomWebpartSource.Tenant);

  constructor(props) {
    super(props);
  }

  private setHeadingName = (name: string, index: number): void => {
    try {
      const heading = cloneDeep(this.props.heading);
      (heading.Name as IMultilingualString[])[index].Text = name;
      this.props.updateHeading(heading);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (setHeadingName) - ${err}`, LogLevel.Error);
    }
  }

  private setImageSource = (imageSrc: string): void => {
    try {
      const heading = cloneDeep(this.props.heading);
      forEach((heading.Image as IMultilingualString[]), (image) => {
        image.Text = imageSrc;
      });
      this.props.updateHeading(heading);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (setImageSource) - ${err}`, LogLevel.Error);
    }
  }

  private addLanguage = (fieldValue: string | number): void => {
    try {
      const heading = cloneDeep(this.props.heading);
      (heading.Name as IMultilingualString[]).push(new MultilingualString(fieldValue as string, (heading.Name as IMultilingualString[])[0].Text));
      (heading.Image as IMultilingualString[]).push(new MultilingualString(fieldValue as string, (heading.Image as IMultilingualString[])[0].Text));
      this.props.updateHeading(heading);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (addLanguage) - ${err}`, LogLevel.Error);
    }
  }

  private deleteLanguage = (index: number): void => {
    try {
      const heading = cloneDeep(this.props.heading);
      (heading.Name as IMultilingualString[]).splice(index, 1);
      this.props.updateHeading(heading);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (deleteLanguage) - ${err}`, LogLevel.Error);
    }
  }

  public render(): React.ReactElement<ICategoryHeadingDetailProps> {
    try {
      const addLanguageOptions: IHOODropDownItem[] = [];
      if (this._showMultilingual) {
        forEach(params.supportedLanguages, (language) => {
          const found = findIndex(this.props.heading.Name as IMultilingualString[], { LanguageCode: language });
          const locale: ILocale = find(params.configuredLanguages, { code: language });
          if (locale) {
            if (found < 0) {
              addLanguageOptions.push({
                key: language, text: locale.description,
                disabled: false
              });
            }
          }
        });
      }

      return (
        <div data-component={this.LOG_SOURCE}>
          <div className="adm-plitem-details">
            <div className="adm-plitem-preview">
              <ImageSelector
                imageSource={(this.props.heading.Image instanceof Array) ? (this.props.heading.Image as IMultilingualString[])[0].Text : this.props.heading.Image as string}
                disabled={!this.props.edit}
                setImageSource={this.setImageSource}
              />
            </div>
            <div className="adm-plitem-infodetails" aria-labelledby={`PlaylistDetail`}>
              {(this.props.heading.Name as IMultilingualString[]).map((name, idx) => {
                const locale: ILocale = find(params.configuredLanguages, { code: name.LanguageCode });
                return (
                  <div key={idx}>
                    <HOOLabel label={`${strings.SubcategoryHeadingLabel} - ${locale.description}`} for={`${strings.SubcategoryHeadingLabel}-${locale.description}`} required={true} />
                    <HOOText
                      forId={`${strings.SubcategoryHeadingLabel}-${locale.description}`}
                      onChange={(ev) => { this.setHeadingName(ev.currentTarget.value, idx); }}
                      value={name.Text}
                      inputElementAttributes={{
                        style: { width: '100%' }
                      }}
                    />
                    {(locale.code !== params.defaultLanguage) &&
                      <HOOButton
                        iconName="icon-delete-regular"
                        onClick={() => { this.deleteLanguage(idx); }}
                        type={0}
                      />
                    }
                  </div>
                );
              })}
              {params.multilingualEnabled && addLanguageOptions.length > 0 &&
                <HOODropDown
                  value={""}
                  options={addLanguageOptions}
                  placeholder="⚑ Add language"
                  containsTypeAhead={false}
                  onChange={this.addLanguage} />
              }
            </div>
          </div>
        </div>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}