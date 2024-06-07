import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import find from "lodash-es/find";
import HOOButton, { HOOButtonType } from "@n8d/htwoo-react/HOOButton";
import HOOPivotBar, { IHOOPivotItem } from "@n8d/htwoo-react/HOOPivotBar";
import HOOCommandBar, { IHOOCommandItem } from "@n8d/htwoo-react/HOOCommandBar";
import HOOLoading from "@n8d/htwoo-react/HOOLoading";
import HOOLabel from "@n8d/htwoo-react/HOOLabel";
import HOODropDown, { IHOODropDownItem } from "@n8d/htwoo-react/HOODropDown";

import { params } from "../../../common/services/Parameters";
import * as strings from "M365LPStrings";
import ContentPack from "../Molecules/ContentPack";
import { ICDN, CDN } from "../../../common/models/Models";
import CdnEdit from "../Atoms/CdnEdit";
import About from "../Atoms/About";

export interface IAdminMenuProps {
  loadingCdn: boolean;
  placeholderUrl: string;
  working: boolean;
  currentCDNId: string;
  selectCDN: (cdnId: string) => Promise<boolean>;
  selectTab: (tab: string) => void;
  upsertCdn: (cdn: ICDN) => Promise<boolean>;
  removeCdn: (cdnId: string) => Promise<boolean>;
}

export interface IAdminMenuState {
  editCDN: ICDN;
  showAddContentPack: boolean;
  showEditCDN: boolean;
  showAbout: boolean;
}

export class AdminMenuState implements IAdminMenuState {
  constructor(
    public editCDN: ICDN = null,
    public showAddContentPack: boolean = false,
    public showEditCDN: boolean = false,
    public showAbout: boolean = false
  ) { }
}

export default class AdminMenu extends React.PureComponent<IAdminMenuProps, IAdminMenuState> {
  private LOG_SOURCE: string = "AdminMenu";
  private _tabOptions: IHOODropDownItem[] = [
    { key: "Category", text: strings.AdminMenuCategoryLabel, disabled: false },
    { key: "Technology", text: strings.AdminMenuTechnologyLabel, disabled: false }
  ];

  constructor(props: IAdminMenuProps) {
    super(props);
    const currentCDN = params.allCdn[0];
    this.state = new AdminMenuState(currentCDN);
  }

  private selectCDN = async (key: string | number): Promise<void> => {
    if (this.props.loadingCdn) return;
    await this.props.selectCDN(key as string);
  }

  private editCdn = async (cdn: ICDN): Promise<void> => {
    const upsertCdnResult = await this.props.upsertCdn(cdn);
    if (upsertCdnResult) {
      const selectCdnResult = await this.props.selectCDN(cdn.Id);
      if (selectCdnResult) {
        this.setState({
          editCDN: cdn,
          showEditCDN: false
        });
      }
    }
  }

  private closeEditCdn = (): void => {
    this.setState({
      showEditCDN: false
    });
  }

  private closeAbout = (): void => {
    this.setState({
      showAbout: false
    });
  }

  private closeContentPack = (): void => {
    this.setState({
      showAddContentPack: false
    });
  }

  private toggleEdit = (): void => {
    if (this.state.showEditCDN) {
      this.setState({
        editCDN: null,
        showAbout: false,
        showEditCDN: false
      });
    } else {
      this.setState({
        editCDN: find(params.allCdn, { Id: this.props.currentCDNId }),
        showEditCDN: true,
        showAbout: false,
        showAddContentPack: false
      });
    }
  }

  private toggleAdd = (): void => {
    if (this.state.showAddContentPack) {
      this.setState({
        editCDN: null,
        showAbout: false,
        showAddContentPack: false
      });
    } else {
      this.setState({
        editCDN: (new CDN()),
        showAbout: false,
        showAddContentPack: true,
        showEditCDN: false
      });
    }
  }

  private toggleAbout = (): void => {
    if (this.state.showAbout) {
      this.setState({
        editCDN: null,
        showAddContentPack: false,
        showAbout: false
      });
    } else {
      this.setState({
        editCDN: (new CDN()),
        showAbout: true,
        showAddContentPack: false,
        showEditCDN: false
      });
    }
  }

  private addCdn = async (cdn: ICDN): Promise<void> => {
    const upsertResult = await this.props.upsertCdn(cdn);
    if (upsertResult) {
      const selectCdnResult = await this.props.selectCDN(cdn.Id);
      if (selectCdnResult) {
        this.setState({
          showAddContentPack: false
        });
      }
    }
  }

  private removeCdn = async (): Promise<void> => {
    if (window.confirm(strings.AdminRemoveCdn)) {
      const removeResult = await this.props.removeCdn(this.props.currentCDNId);
      if (removeResult) {
        await this.props.selectCDN(params.allCdn[0].Id);
      }
    }
  }

  private openDocumentation = (): void => {
    window.open(`https://docs.microsoft.com/${params.defaultLanguage}/office365/customlearning/custom_successcenter`, "_blank");
  }

  private getPivotItems = (): IHOOPivotItem[] => {
    const pivotItems: IHOOPivotItem[] = [];
    try {
      params.allCdn.forEach(c => {
        const pivotItem: IHOOPivotItem = {
          text: (c.Id === 'Default') ? strings.M365Title : c.Name,
          key: c.Id
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

  private handleToolClick = (toolId: string | number): IHOOPivotItem[] => {
    const pivotItems: IHOOPivotItem[] = [];
    try {
      if (toolId === 'addContentPack') {
        this.toggleAdd();
      } else if (toolId === 'about') {
        this.toggleAbout();
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (getPivotItems) - ${err}`, LogLevel.Error);
    }
    return pivotItems;
  }

  public render(): React.ReactElement<IAdminMenuProps> {
    const _overflowItems: IHOOCommandItem[] = [
      { key: 'addContentPack', text: strings.AdminAddCdnLabel, iconName: 'icon-cloud-add-regular', flyoutMenuItems: [] },
      { key: 'about', text: strings.AdminAbout, iconName: 'icon-info-regular', flyoutMenuItems: [] }
    ];

    // const overflowProps: IButtonProps = { styles: { root: "transparentButton" } };

    // const menuStyles: Partial<IContextualMenuStyles> = {
    //   root: "transparentButton"
    // };

    try {
      return (
        <>
          <div data-component={this.LOG_SOURCE} className="adm-header-nav-cont">
            {/* TODO confirm onclick works */}
            <HOOPivotBar
              pivotItems={this.getPivotItems()}
              rootElementAttributes={{ className: "adm-header-nav" }}
              selectedKey={this.props.currentCDNId === null ? null : this.props.currentCDNId}
              onClick={(ev, option) => this.selectCDN(option.toString())}
            />
            <HOOButton type={HOOButtonType.Icon}
              iconName="icon-delete-regular"
              iconTitle={strings.AdminDeleteCdnLabel}
              onClick={this.removeCdn}
              disabled={this.props.currentCDNId === "Default"}
              rootElementAttributes={{ className: (this.state.showEditCDN) ? "selected" : "" }} />
            <HOOButton type={HOOButtonType.Icon}
              iconName="icon-pen-regular"
              iconTitle={strings.AdminEditCdnLabel}
              onClick={this.toggleEdit}
              disabled={this.props.currentCDNId === "Default"}
              rootElementAttributes={{ className: (this.state.showEditCDN) ? "selected" : "" }} />
            {/* TODO confirm onclick works */}
            <HOOCommandBar
              commandItems={_overflowItems}
              onClick={(ev, option) => this.handleToolClick(option.toString())}/>

            <HOOButton type={HOOButtonType.Icon}
              iconName="icon-chat-help-regular"
              iconTitle={strings.DocumentationLinkLabel}
              onClick={this.openDocumentation} />
            <div className="adm-header-spin">
              {this.props.working &&
                <>
                  <HOOLabel label={strings.AdminSavingNotification} />
                  <HOOLoading
                    maxValue={100}
                    minValue={0}
                    value={0} /></>
              }
            </div>
            {/* TODO make sure this works */}
            <HOODropDown
              value={""}
              options={this._tabOptions}
              containsTypeAhead={false}
              onChange={(ev) => this.props.selectTab(ev as string)}
              rootElementAttributes={{ className: "adm-header-cat" }}/>
          </div>
          {this.state.showAddContentPack &&
            <div data-component={this.LOG_SOURCE} className="adm-header-edit">
              <ContentPack
                placeholderUrl={this.props.placeholderUrl}
                addCdn={this.addCdn}
                close={this.closeContentPack}
              />
            </div>
          }
          {this.state.showEditCDN &&
            <div data-component={this.LOG_SOURCE} className="adm-header-edit">
              <CdnEdit
                cdn={this.state.editCDN}
                closeForm={this.closeEditCdn}
                upsertCdn={this.editCdn}
              />
            </div>
          }
          {this.state.showAbout &&
            <div data-component={this.LOG_SOURCE} className="adm-header-edit">
              <About
                close={this.closeAbout}
              />
            </div>
          }
        </>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}
