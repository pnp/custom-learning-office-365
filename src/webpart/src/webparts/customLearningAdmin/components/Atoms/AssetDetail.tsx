import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash/isEqual";
import find from "lodash/find";
import cloneDeep from "lodash/cloneDeep";
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/clientside-pages";
import { Dropdown, IDropdownOption, Label, TextField, CompoundButton, PrimaryButton, Spinner, SpinnerSize } from 'office-ui-fabric-react';

import * as strings from 'M365LPStrings';
import styles from '../../../common/CustomLearningCommon.module.scss';
import { IAsset, ITechnology, IMultilingualString } from "../../../common/models/Models";
import { CustomWebpartSource } from "../../../common/models/Enums";
import { params } from "../../../common/services/Parameters";


export interface IAssetDetailProps {
  technologies: ITechnology[];
  asset: IAsset;
  currentLangIndex: number;
  edit: boolean;
  updateDetail: (detail: IAsset) => void;
}

export interface IAssetDetailState {
  technologyDropdown: IDropdownOption[];
  selectedTechnology: ITechnology;
  enterUrl: boolean;
  startCreatePage: boolean;
  pageCreateError: string;
}

export class AssetDetailState implements IAssetDetailState {
  constructor(
    public technologyDropdown: IDropdownOption[] = [],
    public selectedTechnology: ITechnology = null,
    public enterUrl: boolean = false,
    public startCreatePage: boolean = false,
    public pageCreateError: string = ""
  ) { }
}

export default class AssetDetail extends React.Component<IAssetDetailProps, IAssetDetailState> {
  private LOG_SOURCE: string = "AssetDetail";

  constructor(props) {
    super(props);

    let technologyDropdown: IDropdownOption[] = props.technologies.map((tech) => {
      return { key: tech.Id, text: tech.Name };
    });
    technologyDropdown.splice(0, 0, { key: "", text: "" });

    let selectedTechnology: ITechnology = null;
    selectedTechnology = find((props as IAssetDetailProps).technologies, { Id: (props as IAssetDetailProps).asset.TechnologyId });

    this.state = new AssetDetailState(technologyDropdown, selectedTechnology);
  }

  public shouldComponentUpdate(nextProps: Readonly<IAssetDetailProps>, nextState: Readonly<IAssetDetailState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private multiLangFieldChanged = (newValue: string, fieldName: string) => {
    try {
      let editAsset: IAsset = cloneDeep(this.props.asset);
      (editAsset[fieldName] as IMultilingualString[])[this.props.currentLangIndex].Text = newValue;
      this.props.updateDetail(editAsset);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (multiLangFieldChanged) - ${err}`, LogLevel.Error);
    }
  }

  private dropdownChanged = (option: IDropdownOption, fieldName: string) => {
    try {
      let editAsset: IAsset = cloneDeep(this.props.asset);
      editAsset[fieldName] = option.key.toString();
      this.props.updateDetail(editAsset);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (dropdownChanged) - ${err}`, LogLevel.Error);
    }
  }

  private openAsset = () => {
    window.open((this.props.asset.Url instanceof Array) ? (this.props.asset.Url as IMultilingualString[])[this.props.currentLangIndex].Text : this.props.asset.Url as string, '_blank');
  }

  private createPage = async () => {
    let title = (this.props.asset.Title instanceof Array) ? (this.props.asset.Title as IMultilingualString[])[this.props.currentLangIndex].Text : this.props.asset.Title as string;
    if (title.length < 1) return;
    try {
      let page = await sp.web.addClientsidePage(`${title}.aspx`);
      // @ts-ignore
      let pageItem = await page.getItem<{ Id: number, FileRef: string, PageLayoutType: string }>("Id", "FileRef", "PageLayoutType");
      this.setState({ startCreatePage: false });
      this.multiLangFieldChanged(`${document.location.origin}${pageItem.FileRef}`, "Url");
    } catch (err) {
      let errMsg = err.message;
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (createPage) - ${err}`, LogLevel.Error);
      this.setState({ startCreatePage: false, pageCreateError: `There was an error creating the page. '${errMsg}'` });
    }
  }

  private startCreatePage = () => {
    this.setState({ startCreatePage: true }, () => {
      this.createPage();
    });
  }

  private getAssetUrlFields(): Array<JSX.Element> {
    let retVal: Array<JSX.Element>;
    try {
      let title = (this.props.asset.Title instanceof Array) ? (this.props.asset.Title as IMultilingualString[])[this.props.currentLangIndex].Text : this.props.asset.Title as string;
      let url = (this.props.asset.Url instanceof Array) ? (this.props.asset.Url as IMultilingualString[])[this.props.currentLangIndex].Text : this.props.asset.Url as string;
      if (title.length < 1) {
        retVal = [<Label required={true}>{strings.AdminAwaitingUrlPrompt}</Label>];
      } else if (url.length > 0 || this.state.enterUrl) {
        retVal = [
          <TextField
            value={url}
            label={strings.DetailEditUrl}
            required={true}
            multiline
            rows={2}
            onChange={(ev, newValue) => { this.multiLangFieldChanged(newValue, "Url"); }}
          />,
          <PrimaryButton text={strings.AssetDetailsOpenPage} onClick={this.openAsset} />];
      } else if (url.length < 1 && this.state.pageCreateError === "") {
        retVal = [<div>
          <Label required={true}>{strings.DetailEditUrl}</Label>
          <div>
            <CompoundButton primary={true} secondaryText={strings.DetailEditNewPageMessage} onClick={this.startCreatePage}>
              {strings.DetailEditNewPageButton}
            </CompoundButton>
            <CompoundButton primary={false} secondaryText={strings.DetailEditExistingPageMessage} onClick={() => { this.setState({ enterUrl: true }); }}>
              {strings.DetailEditExistingPageButton}
            </CompoundButton>
          </div>
        </div>];
      } else if (this.state.startCreatePage) {
        retVal = [<span>{strings.CreatingPage} </span>,
        <Spinner size={SpinnerSize.medium} />];
      } else if (this.state.pageCreateError !== "") {
        retVal = [<Label required={true}>{strings.DetailEditUrl}</Label>,
        <Label className="ms-fontColor-redDark">{this.state.pageCreateError}</Label>,
        <PrimaryButton onClick={() => { this.setState({ pageCreateError: "" }); }}>{strings.TryAgain}</PrimaryButton>];
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (getAssetUrlFields) - ${err}`, LogLevel.Error);
    }
    return retVal;
  }

  public render(): React.ReactElement<IAssetDetailProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE}>
          {this.props.edit &&
            <>
              <TextField
                value={(this.props.asset.Title instanceof Array) ? (this.props.asset.Title as IMultilingualString[])[this.props.currentLangIndex].Text : this.props.asset.Title as string}
                label={strings.DetailEditTitle}
                required={true}
                onChange={(ev, newValue) => { this.multiLangFieldChanged(newValue, "Title"); }}
                autoFocus={true}
              />
              <Dropdown
                label={strings.DetailEditTechnology}
                options={this.state.technologyDropdown}
                selectedKey={[this.props.asset.TechnologyId]}
                onChange={(ev, option) => { this.dropdownChanged(option, "TechnologyId"); }}
                required={false}
                disabled={this.props.currentLangIndex > 0}
              />
              {(this.props.asset.Url as IMultilingualString[])[this.props.currentLangIndex].Text.length < 1 &&
                this.getAssetUrlFields()
              }
              {(this.props.asset.Url as IMultilingualString[])[this.props.currentLangIndex].Text.length > 0 &&
                <TextField
                  value={(this.props.asset.Url instanceof Array) ? (this.props.asset.Url as IMultilingualString[])[this.props.currentLangIndex].Text : this.props.asset.Url as string}
                  label={strings.DetailEditUrl}
                  required={true}
                  onChange={(ev, newValue) => { this.multiLangFieldChanged(newValue, "Url"); }}
                  autoFocus={true}
                />
              }
            </>
          }
          {!this.props.edit &&
            <>
              {params.multilingualEnabled &&
                <>
                  <Label className={styles.semiBold}>{strings.DetailEditTitle}</Label>
                  {(this.props.asset.Title instanceof Array) &&
                    <p className="adm-fieldvalue">{(this.props.asset.Title as IMultilingualString[])[this.props.currentLangIndex].Text}</p>
                  }
                  {!(this.props.asset.Title instanceof Array) &&
                    <p className="adm-fieldvalue">{this.props.asset.Title as string}</p>
                  }
                </>
              }
              <Label className={styles.semiBold}>{strings.DetailEditTechnology}</Label>
              <p className="adm-fieldvalue">{(this.state.selectedTechnology) ? this.state.selectedTechnology.Name : ""}</p>
              <Label className={styles.semiBold}>{strings.DetailEditUrl}</Label>
              {(this.props.asset.Url instanceof Array) &&
                <p className="adm-fieldvalue">{(this.props.asset.Url as IMultilingualString[])[this.props.currentLangIndex].Text}</p>
              }
              {!(this.props.asset.Url instanceof Array) &&
                <p className="adm-fieldvalue">{this.props.asset.Url as string}</p>
              }
              {(this.props.asset.Source === CustomWebpartSource.Tenant) &&
                <PrimaryButton text={strings.AssetDetailsOpenPage} onClick={this.openAsset} />
              }
            </>
          }
        </div>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}