import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash/isEqual";
import find from "lodash/find";
import { Pivot, PivotItem, Dropdown, IDropdownOption, CommandBar, ICommandBarItemProps, IButtonProps, IContextualMenuStyles, Spinner } from 'office-ui-fabric-react';

import { params } from "../../../common/services/Parameters";
import * as strings from "M365LPStrings";
import ContentPack from "../Molecules/ContentPack";
import { ICDN, CDN } from "../../../common/models/Models";
import Button from "../../../common/components/Atoms/Button";
import { ButtonTypes } from "../../../common/models/Enums";
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

export default class AdminMenu extends React.Component<IAdminMenuProps, IAdminMenuState> {
  private LOG_SOURCE: string = "AdminMenu";
  private _tabOptions: IDropdownOption[] = [
    { key: "Category", text: strings.AdminMenuCategoryLabel },
    { key: "Technology", text: strings.AdminMenuTechnologyLabel }
  ];

  constructor(props: IAdminMenuProps) {
    super(props);
    let currentCDN = params.allCdn[0];
    this.state = new AdminMenuState(currentCDN);
  }

  public shouldComponentUpdate(nextProps: Readonly<IAdminMenuProps>, nextState: Readonly<IAdminMenuState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private selectCDN = async (item: PivotItem): Promise<void> => {
    if (this.props.loadingCdn) return;
    let retVal = await this.props.selectCDN(item.props.itemKey);
  }

  private editCdn = async (cdn: ICDN): Promise<void> => {
    let upsertCdnResult = await this.props.upsertCdn(cdn);
    if (upsertCdnResult) {
      let selectCdnResult = await this.props.selectCDN(cdn.Id);
      if (selectCdnResult) {
        this.setState({
          editCDN: cdn,
          showEditCDN: false
        });
      }
    }
  }

  private closeEditCdn = () => {
    this.setState({
      showEditCDN: false
    });
  }

  private closeAbout = () => {
    this.setState({
      showAbout: false
    });
  }

  private closeContentPack = () => {
    this.setState({
      showAddContentPack: false
    });
  }

  private toggleEdit = () => {
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

  private toggleAdd = () => {
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

  private toggleAbout = () => {
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

  private addCdn = async (cdn: ICDN) => {
    let upsertResult = await this.props.upsertCdn(cdn);
    if (upsertResult) {
      let selectCdnResult = await this.props.selectCDN(cdn.Id);
      if (selectCdnResult) {
        this.setState({
          showAddContentPack: false
        });
      }
    }
  }

  private removeCdn = async () => {
    if (window.confirm(strings.AdminRemoveCdn)) {
      let removeResult = await this.props.removeCdn(this.props.currentCDNId);
      if (removeResult) {
        await this.props.selectCDN(params.allCdn[0].Id);
      }
    }
  }

  private openDocumentation = () => {
    window.open(`https://docs.microsoft.com/${params.defaultLanguage}/office365/customlearning/custom_successcenter`, "_blank");
  }

  public render(): React.ReactElement<IAdminMenuProps> {
    const _overflowItems: ICommandBarItemProps[] = [
      { key: 'addContentPack', text: strings.AdminAddCdnLabel, onClick: this.toggleAdd, iconProps: { iconName: 'CloudAdd' } },
      { key: 'about', text: strings.AdminAbout, onClick: this.toggleAbout, iconProps: { iconName: 'Info' } }
    ];

    const overflowProps: IButtonProps = { styles: { root: "transparentButton" } };

    const menuStyles: Partial<IContextualMenuStyles> = {
      root: "transparentButton"
    };

    try {
      return (
        <>
          <div data-component={this.LOG_SOURCE} className="adm-header-nav-cont">
            <Pivot
              className="adm-header-nav"
              onLinkClick={this.selectCDN}
              headersOnly={true}
              selectedKey={this.props.currentCDNId === null ? null : this.props.currentCDNId}
            >
              {params.allCdn && params.allCdn.length > 0 && params.allCdn.map((cdn) => {
                return (
                  <PivotItem
                    itemKey={cdn.Id}
                    headerText={(cdn.Id === 'Default') ? strings.M365Title : cdn.Name} />
                );
              })}
            </Pivot>
            <Button buttonType={ButtonTypes.Delete}
              onClick={this.removeCdn}
              disabled={this.props.currentCDNId === "Default"}
              selected={this.state.showEditCDN}
              title={strings.AdminDeleteCdnLabel}
            />
            <Button buttonType={ButtonTypes.Edit}
              onClick={this.toggleEdit}
              disabled={this.props.currentCDNId === "Default"}
              selected={this.state.showEditCDN}
              title={strings.AdminEditCdnLabel}
            />
            <CommandBar
              items={[]}
              overflowItems={_overflowItems}
              overflowButtonProps={overflowProps}
              styles={menuStyles}
            />
            <Button buttonType={ButtonTypes.Question}
              onClick={this.openDocumentation}
              disabled={false}
              selected={false}
              title={strings.DocumentationLinkLabel}
            />
            <div className="adm-header-spin">
              {this.props.working &&
                <Spinner label={strings.AdminSavingNotification} labelPosition="right" />
              }
            </div>
            <Dropdown
              className="adm-header-cat"
              defaultSelectedKey="Category"
              options={this._tabOptions}
              onChange={(ev, option) => this.props.selectTab(option.key as string)}
            />
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
