import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import HOOButton, { HOOButtonType } from "@n8d/htwoo-react/HOOButton";
import HOOBreadcrumb, { HOOBreadcrumbType, IHOOBreadcrumbItem } from "@n8d/htwoo-react/HOOBreadcrumb";

import { params } from "../../../common/services/Parameters";
import { Templates, Roles, WebPartModeOptions } from "../../../common/models/Enums";
import { UXServiceContext } from '../../../common/services/UXService';
import * as strings from "M365LPStrings";

export interface IHeaderToolbarProps {
  template: string;
  buttonClick: (buttonType: string) => void;
  panelOpen: string;
}

export default class HeaderToolbar extends React.PureComponent<IHeaderToolbarProps> {
  static contextType = UXServiceContext;

  private LOG_SOURCE: string = "HeaderToolbar";
  private _uxService: React.ContextType<typeof UXServiceContext>;
  private _HeaderToolbar;
  private _breadcrumbMax: boolean = false;

  constructor(props) {
    super(props);
    this._HeaderToolbar = React.createRef();
  }

  private _reInit = (): void => {
    this.render();
  }

  private onBreadcrumbItemClicked = (event: React.MouseEvent, key: string | number): void => {
    try {
      const historyIdx = this._uxService.History.findIndex((o) => { return o.Id === key; });
      if (historyIdx > -1) {
        this._uxService.LoadHistory(historyIdx, this._uxService.History[historyIdx].Template, this._uxService.History[historyIdx].Id, true);
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (onBreadcrumbItemClicked) - ${err}`, LogLevel.Error);
    }
  }

  public render(): React.ReactElement<IHeaderToolbarProps> {
    if (this._uxService == undefined) {
      this._uxService = this.context;
      const renderFunction = {};
      renderFunction[this.LOG_SOURCE] = this._reInit;
      this._uxService.FCLWPRender = renderFunction;
    }
    try {
      let sectionClass = false;

      try {
        if (this._HeaderToolbar.current) {
          const section = (this._HeaderToolbar.current as HTMLElement).closest('[data-automation-id="CanvasSection"]');
          sectionClass = (section) ? section.classList.contains("CanvasSection-xl4") : false;
        }
        this._breadcrumbMax = window.matchMedia("(max-width: 480px)").matches || sectionClass;
      } catch (err) {
        this._breadcrumbMax = false;
        Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err} -- media matching not supported in browser`, LogLevel.Error);
      }

      let breadcrumbItems: IHOOBreadcrumbItem[] = [];
      if (this._uxService.History && this._uxService.History.length > 0) {
        if (this._breadcrumbMax) {
          if (this._uxService.History.length > 1) {
            breadcrumbItems = [{ text: "...", key: this._uxService.History[this._uxService.History.length - 2].Id }]
          } else {
            breadcrumbItems = [{ text: this._uxService.History[0].Name, key: this._uxService.History[0].Id }]
          }
        } else {
          breadcrumbItems = this._uxService.History.map((history) => {
            return { text: history.Name, key: history.Id };
          });
        }
      }
      return (
        <div data-component={this.LOG_SOURCE} className="header-toolbar" ref={this._HeaderToolbar}>
          {((this._uxService.WebPartMode !== WebPartModeOptions.contentonly) || ((this._uxService.WebPartMode === WebPartModeOptions.contentonly) && (breadcrumbItems.length > 1))) &&
            <div className="header-breadcrumb">
              <HOOBreadcrumb
                breadcrumbItems={breadcrumbItems}
                onBreadcrumbClick={this.onBreadcrumbItemClicked}
                seperatorIconName="icon-chevron-right-filled"
                type={HOOBreadcrumbType.Button}
              />
            </div>
          }
          {(this._uxService.WebPartMode !== WebPartModeOptions.contentonly) &&
            <div className="header-actions">
              <menu className="header-toolbar">
                <li><HOOButton type={HOOButtonType.Icon} iconName="icon-search-regular"
                  rootElementAttributes={{ className: (this.props.panelOpen === "Search") ? "selected" : "", "aria-label": strings.SearchButton }}
                  onClick={() => { this.props.buttonClick("Search"); }} /></li>
                <li><HOOButton type={HOOButtonType.Icon} iconName="icon-link-regular"
                  rootElementAttributes={{ className: (this.props.panelOpen === "Link") ? "selected" : "", "aria-label": strings.LinkButton }}
                  onClick={() => { this.props.buttonClick("Link"); }} /></li>
                <li><HOOButton type={HOOButtonType.Icon} iconName="icon-settings-regular"
                  disabled={(this.props.template !== Templates.Playlist && params.userRole === Roles.Visitors)}
                  onClick={() => { this.props.buttonClick("Gear"); }}
                  rootElementAttributes={{ "aria-label": strings.AdministerPlaylist }} /></li>
              </menu>
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
