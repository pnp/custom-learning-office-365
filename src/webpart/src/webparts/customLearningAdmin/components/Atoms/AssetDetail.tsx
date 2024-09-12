import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash-es/isEqual";
import find from "lodash-es/find";
import cloneDeep from "lodash-es/cloneDeep";
import { spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/clientside-pages/web";
import HOOText from "@n8d/htwoo-react/HOOText";
import HOOLabel from "@n8d/htwoo-react/HOOLabel";
import HOODropDown, { IHOODropDownItem } from "@n8d/htwoo-react/HOODropDown";
import HOOButton, { HOOButtonType } from "@n8d/htwoo-react/HOOButton";
import HOOLoading from "@n8d/htwoo-react/HOOLoading";

import * as strings from 'M365LPStrings';
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
  technologyDropdown: IHOODropDownItem[];
  selectedTechnology: ITechnology;
  enterUrl: boolean;
  startCreatePage: boolean;
  pageCreateError: string;
}

export class AssetDetailState implements IAssetDetailState {
  constructor(
    public technologyDropdown: IHOODropDownItem[] = [],
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

    const technologyDropdown: IHOODropDownItem[] = props.technologies.map((tech) => {
      return { key: tech.Id, text: tech.Name };
    });
    technologyDropdown.splice(0, 0, { key: "", text: "", disabled: true });

    let selectedTechnology: ITechnology = null;
    selectedTechnology = find((props as IAssetDetailProps).technologies, { Id: (props as IAssetDetailProps).asset.TechnologyId });

    this.state = new AssetDetailState(technologyDropdown, selectedTechnology);
  }

  public shouldComponentUpdate(nextProps: Readonly<IAssetDetailProps>, nextState: Readonly<IAssetDetailState>): boolean {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private multiLangFieldChanged = (newValue: string, fieldName: string): void => {
    try {
      const editAsset: IAsset = cloneDeep(this.props.asset);
      (editAsset[fieldName] as IMultilingualString[])[this.props.currentLangIndex].Text = newValue;
      this.props.updateDetail(editAsset);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (multiLangFieldChanged) - ${err}`, LogLevel.Error);
    }
  }

  private dropdownChanged = (fieldValue: string): void => {
    try {
      const editAsset: IAsset = cloneDeep(this.props.asset);
      editAsset.TechnologyId = fieldValue;
      this.props.updateDetail(editAsset);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (dropdownChanged) - ${err}`, LogLevel.Error);
    }
  }

  private openAsset = (): void => {
    window.open((this.props.asset.Url instanceof Array) ? (this.props.asset.Url as IMultilingualString[])[this.props.currentLangIndex].Text : this.props.asset.Url as string, '_blank');
  }

  private createPage = async (): Promise<void> => {
    const title = (this.props.asset.Title instanceof Array) ? (this.props.asset.Title as IMultilingualString[])[this.props.currentLangIndex].Text : this.props.asset.Title as string;
    if (title.length < 1) return;
    try {
      const sp = spfi().using(SPFx(params.context));
      const page = await sp.web.addClientsidePage(`${title}.aspx`);
      const pageItem = await page.getItem<{ Id: number, FileRef: string, PageLayoutType: string }>("Id", "FileRef", "PageLayoutType");
      this.setState({ startCreatePage: false });
      this.multiLangFieldChanged(`${document.location.origin}${pageItem.FileRef}`, "Url");
    } catch (err) {
      const errMsg = err.message;
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (createPage) - ${err}`, LogLevel.Error);
      this.setState({ startCreatePage: false, pageCreateError: `There was an error creating the page. '${errMsg}'` });
    }

  }

  private startCreatePage = (): void => {
    this.setState({ startCreatePage: true }, () => {
      this.createPage();
    });
  }

  private getAssetUrlFields(): JSX.Element[] {
    let retVal: JSX.Element[] = [];
    try {
      const title = (this.props.asset.Title instanceof Array) ? (this.props.asset.Title as IMultilingualString[])[this.props.currentLangIndex].Text : this.props.asset.Title as string;
      const url = (this.props.asset.Url instanceof Array) ? (this.props.asset.Url as IMultilingualString[])[this.props.currentLangIndex].Text : this.props.asset.Url as string;
      if (title.length < 1) {
        retVal = [<HOOLabel key={0} label={strings.AdminAwaitingUrlPrompt} for={strings.DetailEditUrl} required={true} />];
      } else if (url.length > 0 || this.state.enterUrl) {
        retVal = [
          <HOOLabel key={0} label={strings.DetailEditUrl} for={strings.DetailEditUrl} required={true} />,
          <HOOText key={1}
            forId={strings.DetailEditUrl}
            onChange={(ev) => { this.multiLangFieldChanged(ev.currentTarget.value, "Url"); }}
            value={url}
            inputElementAttributes={{ style: { width: "100%" }, autoFocus: true }}
          />,
          <HOOButton key={3}
            label={strings.AssetDetailsOpenPage}
            onClick={this.openAsset}
            type={1}
          />];
      } else if (url.length < 1 && this.state.pageCreateError === "") {
        retVal = [<div key={0}>
          <HOOLabel label={strings.DetailEditUrl} required={true} />
          <div>
            <HOOButton
              description={strings.DetailEditNewPageMessage}
              label={strings.DetailEditNewPageButton}
              onClick={this.startCreatePage}
              type={5}
            />
            <HOOButton
              description={strings.DetailEditExistingPageMessage}
              label={strings.DetailEditExistingPageButton}
              onClick={() => { this.setState({ enterUrl: true }); }}
              type={6}
            />
          </div>
        </div>];
      } else if (this.state.startCreatePage) {
        retVal = [<HOOLabel key={0} label={strings.CreatingPage} />,
        <HOOLoading key={1} value={0} minValue={0} maxValue={100} />];
      } else if (this.state.pageCreateError !== "") {
        retVal = [
          <HOOLabel key={0} label={strings.DetailEditUrl} required={true} />,
          <HOOLabel key={1} label={this.state.pageCreateError} required={true} rootElementAttributes={{ className: "ms-fontColor-redDark" }} />,
          <HOOButton key={2} type={HOOButtonType.Primary}
            onClick={() => { this.setState({ pageCreateError: "" }); }}
            label={strings.TryAgain} />];
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (getAssetUrlFields) - ${err}`, LogLevel.Error);
    }
    return retVal;
  }

  public render(): React.ReactElement<IAssetDetailProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE} className="adm-curplasset-details">
          {this.props.edit &&
            <>
              <HOOLabel label={strings.DetailEditTitle} for={strings.DetailEditTitle} required={true} />
              <HOOText
                forId={strings.DetailEditTitle}
                onChange={(ev) => { this.multiLangFieldChanged(ev.currentTarget.value, "Title"); }}
                inputElementAttributes={{ style: { width: "100%" } }}
                value={(this.props.asset.Title instanceof Array) ? (this.props.asset.Title as IMultilingualString[])[this.props.currentLangIndex].Text : this.props.asset.Title as string}
              />
              <HOOLabel label={strings.DetailEditTechnology} for={strings.DetailEditTechnology} required={false} />
              <HOODropDown
                value={this.props.asset.TechnologyId}
                forId={strings.DetailEditTechnology}
                options={this.state.technologyDropdown}
                containsTypeAhead={false}
                disabled={this.props.currentLangIndex > 0}
                onChange={this.dropdownChanged} />

              {(this.props.asset.Url as IMultilingualString[])[this.props.currentLangIndex].Text.length < 1 &&
                this.getAssetUrlFields()
              }
              {(this.props.asset.Url as IMultilingualString[])[this.props.currentLangIndex].Text.length > 0 &&
                <>
                  <HOOLabel label={strings.DetailEditUrl} for={strings.DetailEditUrl} required={true} />

                  <HOOText key={1}
                    forId={strings.DetailEditUrl}
                    onChange={(ev) => { this.multiLangFieldChanged(ev.currentTarget.value, "Url"); }}
                    value={(this.props.asset.Url instanceof Array) ? (this.props.asset.Url as IMultilingualString[])[this.props.currentLangIndex].Text : this.props.asset.Url as string}
                    inputElementAttributes={{ style: { width: "100%" }, autoFocus: true }}
                  />
                </>

              }
            </>
          }
          {!this.props.edit &&
            <>
              {params.multilingualEnabled &&
                <>
                  <HOOLabel label={strings.DetailEditTitle} />
                  {(this.props.asset.Title instanceof Array) &&
                    <p className="adm-fieldvalue">{(this.props.asset.Title as IMultilingualString[])[this.props.currentLangIndex].Text}</p>
                  }
                  {!(this.props.asset.Title instanceof Array) &&
                    <p className="adm-fieldvalue">{this.props.asset.Title as string}</p>
                  }
                </>
              }
              <HOOLabel label={strings.DetailEditTechnology} />
              <p className="adm-fieldvalue">{(this.state.selectedTechnology) ? this.state.selectedTechnology.Name : ""}</p>
              <HOOLabel label={strings.DetailEditUrl} />
              {(this.props.asset.Url instanceof Array) &&
                <p className="adm-fieldvalue">{(this.props.asset.Url as IMultilingualString[])[this.props.currentLangIndex].Text}</p>
              }
              {!(this.props.asset.Url instanceof Array) &&
                <p className="adm-fieldvalue">{this.props.asset.Url as string}</p>
              }
              {(this.props.asset.Source === CustomWebpartSource.Tenant) &&
                <HOOButton type={HOOButtonType.Primary}
                  onClick={this.openAsset}
                  label={strings.AssetDetailsOpenPage} />
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