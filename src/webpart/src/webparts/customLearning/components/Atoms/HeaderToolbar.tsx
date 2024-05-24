import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash-es/isEqual";
import find from "lodash-es/find";
import HOOButton, { HOOButtonType } from "@n8d/htwoo-react/HOOButton";
import HOOBreadcrumb, { IHOOBreadcrumbItem } from "@n8d/htwoo-react/HOOBreadcrumb";


import { params } from "../../../common/services/Parameters";
import { IHistoryItem } from "../../../common/models/Models";
import { Templates, Roles, WebpartMode } from "../../../common/models/Enums";



export interface IHeaderToolbarProps {
  template: string;
  history: IHistoryItem[];
  historyClick: (template: string, templateId: string, nav: boolean) => void;
  buttonClick: (buttonType: string) => void;
  panelOpen: string;
  webpartMode: string;
}

export interface IHeaderToolbarState {
}

export class HeaderToolbarState implements IHeaderToolbarState {
  constructor() { }
}

export default class HeaderToolbar extends React.Component<IHeaderToolbarProps, IHeaderToolbarState> {
  private LOG_SOURCE: string = "HeaderToolbar";
  private _HeaderToolbar;
  private _breadcrumbMax: boolean = false;

  constructor(props) {
    super(props);

    if (!Element.prototype.matches) {
      Element.prototype.matches = Element.prototype["msMatchesSelector"] ||
        Element.prototype.webkitMatchesSelector;
    }

    if (!Element.prototype.closest) {
      Element.prototype.closest = function (s) {
        var el = this;

        do {
          if (Element.prototype.matches.call(el, s)) return el;
          el = el.parentElement || el.parentNode;
        } while (el !== null && el.nodeType === 1);
        return null;
      };
    }

    this._HeaderToolbar = React.createRef();
    this.state = new HeaderToolbarState();
  }

  public shouldComponentUpdate(nextProps: Readonly<IHeaderToolbarProps>, nextState: Readonly<IHeaderToolbarState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private onBreadcrumbItemClicked = (event: React.MouseEvent, key: string | number): void => {
    try {
      let history = find(this.props.history, { Id: key });
      console.log(history);
      //TODO fix this
      //this.props.historyClick(history.Template, history.Id, true);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (onBreadcrumbItemClicked) - ${err}`, LogLevel.Error);
    }
  }

  public render(): React.ReactElement<IHeaderToolbarProps> {
    try {
      let sectionClass = false;

      try {
        if (this._HeaderToolbar.current) {
          let section = (this._HeaderToolbar.current as HTMLElement).closest('[data-automation-id="CanvasSection"]');
          sectionClass = (section) ? section.classList.contains("CanvasSection-xl4") : false;
        }
        this._breadcrumbMax = window.matchMedia("(max-width: 480px)").matches || sectionClass;
      } catch (err) {
        this._breadcrumbMax = false;
        Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err} -- media matching not supported in browser`, LogLevel.Error);
      }

      let breadcrumbItems: IHOOBreadcrumbItem[] = [];
      if (this.props.history && this.props.history.length > 0) {
        if (this._breadcrumbMax) {
          if (this.props.history.length > 1) {
            //breadcrumbItems = [{ text: "...", key: this.props.history[this.props.history.length - 2].Id, onClick: this.onBreadcrumbItemClicked }];
            breadcrumbItems = [{ text: "...", key: this.props.history[this.props.history.length - 2].Id }]
            //breadcrumbItems.push({ text: this.props.history[this.props.history.length - 1].Name, key: this.props.history[this.props.history.length - 1].Id, onClick: this.onBreadcrumbItemClicked });
          } else {
            //breadcrumbItems = [{ text: this.props.history[0].Name, key: this.props.history[0].Id, onClick: this.onBreadcrumbItemClicked }];
            breadcrumbItems = [{ text: this.props.history[0].Name, key: this.props.history[0].Id }]
          }
        } else {
          breadcrumbItems = this.props.history.map((history) => {
            return { text: history.Name, key: history.Id };
          });
        }
      }
      return (
        <div data-component={this.LOG_SOURCE} className="header-toolbar" ref={this._HeaderToolbar}>
          {((this.props.webpartMode !== WebpartMode.contentonly) || ((this.props.webpartMode === WebpartMode.contentonly) && (breadcrumbItems.length > 1))) &&
            <div className="header-breadcrumb">
              <HOOBreadcrumb
                breadcrumbItems={breadcrumbItems}
                onBreadcrumbClick={this.onBreadcrumbItemClicked}
                seperatorIconName="icon-chevron-right-filled"
                type={1}
              />
            </div>
          }
          {(this.props.webpartMode !== WebpartMode.contentonly) &&
            <div className="header-actions">
              <HOOButton type={HOOButtonType.Icon} iconName="icon-search-regular"
                rootElementAttributes={{ className: (this.props.panelOpen === "Search") ? "selected" : "" }}
                onClick={() => { this.props.buttonClick("Search"); }} />
              <HOOButton type={HOOButtonType.Icon} iconName="icon-link-regular"
                rootElementAttributes={{ className: (this.props.panelOpen === "Link") ? "selected" : "" }}
                onClick={() => { this.props.buttonClick("Link"); }} />
              <HOOButton type={HOOButtonType.Icon} iconName="icon-settings-regular"
                disabled={(this.props.template !== Templates.Playlist && params.userRole === Roles.Visitors)}
                onClick={() => { this.props.buttonClick("Gear"); }} />
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
