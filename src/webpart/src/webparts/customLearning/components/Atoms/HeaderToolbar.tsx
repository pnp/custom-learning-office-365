import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash/isEqual";
import find from "lodash/find";
import { Breadcrumb, IBreadcrumbItem } from 'office-ui-fabric-react';

import { params } from "../../../common/services/Parameters";
import { IHistoryItem } from "../../../common/models/Models";
import Button from "../../../common/components/Atoms/Button";
import { ButtonTypes, Templates, Roles, WebpartMode } from "../../../common/models/Enums";

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

  private onBreadcrumbItemClicked = (event, item: IBreadcrumbItem): void => {
    try {
      let history = find(this.props.history, { Id: item.key });
      this.props.historyClick(history.Template, history.Id, true);
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

      let breadcrumbItems: IBreadcrumbItem[] = [];
      if (this.props.history && this.props.history.length > 0) {
        if (this._breadcrumbMax) {
          if (this.props.history.length > 1) {
            breadcrumbItems = [{ text: "...", key: this.props.history[this.props.history.length - 2].Id, onClick: this.onBreadcrumbItemClicked }];
            breadcrumbItems.push({ text: this.props.history[this.props.history.length - 1].Name, key: this.props.history[this.props.history.length - 1].Id, onClick: this.onBreadcrumbItemClicked });
          } else {
            breadcrumbItems = [{ text: this.props.history[0].Name, key: this.props.history[0].Id, onClick: this.onBreadcrumbItemClicked }];
          }
        } else {
          breadcrumbItems = this.props.history.map((history) => {
            return { text: history.Name, key: history.Id, onClick: this.onBreadcrumbItemClicked };
          });
        }
      }
      return (
        <div data-component={this.LOG_SOURCE} className="header-toolbar" ref={this._HeaderToolbar}>
          {((this.props.webpartMode !== WebpartMode.contentonly) || ((this.props.webpartMode === WebpartMode.contentonly) && (breadcrumbItems.length > 1))) &&
            <div className="header-breadcrumb">
              <Breadcrumb
                onReduceData={() => { return undefined; }}
                maxDisplayedItems={4}
                items={breadcrumbItems}
              />
            </div>
          }
          {(this.props.webpartMode !== WebpartMode.contentonly) &&
            <div className="header-actions">
              <Button buttonType={ButtonTypes.Search} onClick={() => { this.props.buttonClick("Search"); }} disabled={false} selected={this.props.panelOpen === "Search"} />
              <Button buttonType={ButtonTypes.Link} onClick={() => { this.props.buttonClick("Link"); }} disabled={false} selected={this.props.panelOpen === "Link"} />
              <Button buttonType={ButtonTypes.Gear} onClick={() => { this.props.buttonClick("Gear"); }} disabled={(this.props.template !== Templates.Playlist && params.userRole === Roles.Visitors)} />
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
