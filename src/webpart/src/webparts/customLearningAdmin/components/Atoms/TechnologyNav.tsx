import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash/isEqual";
import { Nav, INavLinkGroup, INavLink } from 'office-ui-fabric-react';

import { ITechnology } from "../../../common/models/Models";

export interface ITechnologyNavProps {
  technologies: ITechnology[];
  selectedId: string;
  onClick: (selected: ITechnology) => void;
}

export interface ITechnologyNavState {
  collapsed: boolean;
}

export class TechnologyNavState implements ITechnologyNavState {
  constructor(
    public collapsed: boolean = window.matchMedia("(max-width: 480px)").matches
  ) { }
}

export default class TechnologyNav extends React.Component<ITechnologyNavProps, ITechnologyNavState> {
  private LOG_SOURCE: string = "TechnologyNav";

  constructor(props) {
    super(props);
    this.state = new TechnologyNavState();
    if (!this.props.selectedId && this.props.technologies.length > 0) {
      this.props.onClick(this.props.technologies[0]);
    }
  }

  public shouldComponentUpdate(nextProps: Readonly<ITechnologyNavProps>, nextState: Readonly<ITechnologyNavState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private getNavItems = (): INavLinkGroup[] => {
    let navGroups: INavLinkGroup[] = [];
    try {
      let navItems: INavLink[] = [];
      let navGroup: INavLinkGroup = {
        collapseByDefault: this.state.collapsed,
        links: navItems
      };
      this.props.technologies.forEach(t => {
        let navItem: INavLink = {
          name: t.Name,
          key: t.Id,
          url: '',
          technology: t
        };

        if (navItem) {
          navItems.push(navItem);
        }

      });
      if (navItems && navItems.length > 0) {
        navGroup.links = navItems;
        navGroups.push(navGroup);
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (getNavItems) - ${err}`, LogLevel.Error);
    }
    return navGroups;
  }

  private onNavClick = (e: React.MouseEvent<HTMLElement>, item: INavLink): void => {
    this.props.onClick(item.technology);
  }

  public render(): React.ReactElement<ITechnologyNavProps> {
    try {
      return (
        <Nav
          groups={
            this.getNavItems()
          }
          selectedKey={this.props.selectedId}
          onLinkClick={this.onNavClick}
        />
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}