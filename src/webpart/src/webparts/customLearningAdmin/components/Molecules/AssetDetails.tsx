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
import { IAsset, ILocale, IMultilingualString, ITechnology, MultilingualString } from "../../../common/models/Models";
import { params } from "../../../common/services/Parameters";
import AssetDetail from "../Atoms/AssetDetail";


export interface IAssetDetailsProps {
  technologies: ITechnology[];
  asset: IAsset;
  edit: boolean;
  cancel: () => void;
  save: (asset: IAsset) => Promise<boolean>;
}

export interface IAssetDetailsState {
  currentLanguage: string;
  editAsset: IAsset;
  assetChanged: boolean;
}

export class AssetDetailsState implements IAssetDetailsState {
  constructor(
    public editAsset: IAsset = null,
    public assetChanged: boolean = false,
    public currentLanguage: string = ""
  ) { }
}

export default class AssetDetails extends React.Component<IAssetDetailsProps, IAssetDetailsState> {
  private LOG_SOURCE: string = "AssetDetails";
  private _reInit: boolean = false;
  private _currentLanguageOptions: ILocale[] = [];

  constructor(props) {
    super(props);
    this.state = new AssetDetailsState(props.asset, (props.asset.Id === "0" ? true : false), params.defaultLanguage);
  }

  public init(): void {
    this.setState({
      editAsset: this.props.asset,
      assetChanged: (this.props.asset.Id === "0" ? true : false)
    });
  }

  public shouldComponentUpdate(nextProps: Readonly<IAssetDetailsProps>, nextState: Readonly<IAssetDetailsState>): boolean {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    if (nextProps.asset.Id !== this.props.asset.Id)
      this._reInit = true;
    return true;
  }

  public componentDidUpdate(): void {
    if (this._reInit) {
      this._reInit = false;
      this.init();
    }
  }

  private updateAsset = (newAsset: IAsset): void => {
    this.setState({
      editAsset: newAsset,
      assetChanged: true
    });
  }

  private saveAsset = async (): Promise<void> => {
    if (this.props.save(this.state.editAsset)) {
      this.props.cancel();
    }
  }

  private assetValid(): boolean {
    let valid = true;
    if (this.state.editAsset.Title instanceof Array) {
      if (((this.state.editAsset.Title as IMultilingualString[])[0].Text.length < 1) ||
        ((this.state.editAsset.Url as IMultilingualString[])[0].Text.length < 1)
      )
        valid = false;
    } else {
      if (((this.state.editAsset.Title as string).length < 1) ||
        ((this.state.editAsset.Url as string).length < 1)
      )
        valid = false;
    }

    return valid;
  }

  private addLanguage = (fieldValue: string | number): void => {
    try {
      const asset = cloneDeep(this.state.editAsset);
      (asset.Title as IMultilingualString[]).push(new MultilingualString(fieldValue as string, (asset.Title as IMultilingualString[])[0].Text));
      (asset.Url as IMultilingualString[]).push(new MultilingualString(fieldValue as string, (asset.Url as IMultilingualString[])[0].Text));
      this.setState({
        currentLanguage: fieldValue.toString(),
        editAsset: asset,
        assetChanged: true
      });
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (addLanguage) - ${err}`, LogLevel.Error);
    }
  }

  private removeLanguage = (): void => {
    try {
      const asset = cloneDeep(this.state.editAsset);
      const languageIndex = findIndex(this._currentLanguageOptions, { code: this.state.currentLanguage });
      let newLanguage: number = 0;
      if (languageIndex > 0)
        newLanguage = languageIndex - 1;

      (asset.Title as IMultilingualString[]).splice(languageIndex, 1);
      (asset.Url as IMultilingualString[]).splice(languageIndex, 1);

      this.setState({
        currentLanguage: this._currentLanguageOptions[newLanguage].code,
        editAsset: asset,
        assetChanged: true
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

  public render(): React.ReactElement<IAssetDetailsProps> {
    try {
      let currentLangIndex: number = 0;
      this._currentLanguageOptions = [];
      const addLanguageOptions: IHOODropDownItem[] = [];
      if (params.multilingualEnabled) {
        currentLangIndex = findIndex((this.state.editAsset.Title as IMultilingualString[]), { LanguageCode: this.state.currentLanguage });
        forEach(params.supportedLanguages, (language) => {
          const found = findIndex(this.state.editAsset.Title as IMultilingualString[], { LanguageCode: language });
          const locale: ILocale = find(params.configuredLanguages, { code: language });
          if (locale) {
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
            <>
              <HOOPivotBar
                onClick={(ev, option) => this.setState({ currentLanguage: option.toString() })}
                pivotItems={this.getPivotItems()}
                rootElementAttributes={{ className: "adm-header-nav" }}
                selectedKey={this.state.currentLanguage}
                hasOverflow={true}
              />

              {this.props.edit && this._currentLanguageOptions.length > 0 &&

                <HOODropDown
                  value={""}
                  options={addLanguageOptions}
                  placeholder="⚑ Add language"
                  containsTypeAhead={false}
                  onChange={this.addLanguage} />

              }
            </>
          }
          <AssetDetail
            technologies={this.props.technologies}
            asset={this.state.editAsset}
            currentLangIndex={currentLangIndex}
            updateDetail={this.updateAsset}
            edit={this.props.edit}
          />
          <div className="adm-curplasset-action">
            {this.props.edit && this._currentLanguageOptions.length > 1 && this.state.currentLanguage !== this._currentLanguageOptions[0].code &&
              <HOOButton
                label={strings.RemoveLanguageLabel}
                onClick={this.removeLanguage}
                type={1}
              />
            }
            <HOOButton
              label={(this.props.edit) ? strings.AssetDetailsCancelLabel : strings.AssetDetailsCloseLabel}
              onClick={this.props.cancel}
              type={2}
            />

            {this.props.edit &&
              <HOOButton
                label={strings.AssetDetailsSaveLabel}
                onClick={this.saveAsset}
                disabled={!this.state.assetChanged || !this.assetValid()}
                type={1}
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
