import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash/isEqual";
import find from "lodash/find";
import cloneDeep from "lodash/cloneDeep";
import findIndex from "lodash/findIndex";
import forEach from "lodash/forEach";
import { PrimaryButton, DefaultButton, IDropdownOption, Dropdown, Pivot, PivotItem, Icon } from "office-ui-fabric-react";

import * as strings from "M365LPStrings";
import { params } from "../../../common/services/Parameters";
import AssetDetail from "../Atoms/AssetDetail";
import { IAsset, ITechnology, IMultilingualString, ILocale, MultilingualString } from "../../../common/models/Models";

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

  private _addLanguagePlaceholder: JSX.Element = <div className="dropdownExample-placeholder">
    <Icon style={{ marginRight: '8px' }} iconName={'MessageFill'} aria-hidden="true" />
    <span>{strings.AddLanguagePlaceholder}</span>
  </div>;

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

  public shouldComponentUpdate(nextProps: Readonly<IAssetDetailsProps>, nextState: Readonly<IAssetDetailsState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    if (nextProps.asset.Id !== this.props.asset.Id)
      this._reInit = true;
    return true;
  }

  public componentDidUpdate() {
    if (this._reInit) {
      this._reInit = false;
      this.init();
    }
  }

  private updateAsset = (newAsset: IAsset) => {
    this.setState({
      editAsset: newAsset,
      assetChanged: true
    });
  }

  private saveAsset = async () => {
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

  private addLanguage = (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption, index?: number) => {
    try {
      let asset = cloneDeep(this.state.editAsset);
      (asset.Title as IMultilingualString[]).push(new MultilingualString(option.key as string, (asset.Title as IMultilingualString[])[0].Text));
      (asset.Url as IMultilingualString[]).push(new MultilingualString(option.key as string, (asset.Url as IMultilingualString[])[0].Text));
      this.setState({
        currentLanguage: option.key.toString(),
        editAsset: asset,
        assetChanged: true
      });
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (addLanguage) - ${err}`, LogLevel.Error);
    }
  }

  private removeLanguage = (event: any) => {
    try {
      let asset = cloneDeep(this.state.editAsset);
      let languageIndex = findIndex(this._currentLanguageOptions, { code: this.state.currentLanguage });
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

  public render(): React.ReactElement<IAssetDetailsProps> {
    try {
      let currentLangIndex: number = 0;
      this._currentLanguageOptions = [];
      let addLanguageOptions: IDropdownOption[] = [];
      if (params.multilingualEnabled) {
        currentLangIndex = findIndex((this.state.editAsset.Title as IMultilingualString[]), { LanguageCode: this.state.currentLanguage });
        forEach(params.supportedLanguages, (language) => {
          let found = findIndex(this.state.editAsset.Title as IMultilingualString[], { LanguageCode: language });
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
        <div data-component={this.LOG_SOURCE} className="assetdetails">
          {params.multilingualEnabled &&
            <div className="adm-header-nav-subcont">
              <Pivot
                className="adm-header-nav"
                selectedKey={this.state.currentLanguage}
                onLinkClick={(i: PivotItem) => { this.setState({ currentLanguage: i.props.itemKey }); }}
                headersOnly={true}
                getTabId={(itemKey) => { return `AssetDetail_${itemKey}`; }}>
                {this._currentLanguageOptions.length > 0 && this._currentLanguageOptions.map((cl) => {
                  return (<PivotItem headerText={cl.description} itemKey={cl.code} />);
                })
                }
              </Pivot>
              {this.props.edit && addLanguageOptions.length > 0 &&
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
          <AssetDetail
            technologies={this.props.technologies}
            asset={this.state.editAsset}
            currentLangIndex={currentLangIndex}
            updateDetail={this.updateAsset}
            edit={this.props.edit}
          />
          <div className="adm-itemaction">
            {this.props.edit && this._currentLanguageOptions.length > 1 && this.state.currentLanguage !== this._currentLanguageOptions[0].code &&
              <PrimaryButton
                text={strings.RemoveLanguageLabel}
                onClick={this.removeLanguage}
              />
            }
            <DefaultButton
              text={(this.props.edit) ? strings.AssetDetailsCancelLabel : strings.AssetDetailsCloseLabel}
              onClick={this.props.cancel}
            />
            {this.props.edit &&
              <PrimaryButton
                text={strings.AssetDetailsSaveLabel}
                onClick={this.saveAsset}
                disabled={!this.state.assetChanged || !this.assetValid()}
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
