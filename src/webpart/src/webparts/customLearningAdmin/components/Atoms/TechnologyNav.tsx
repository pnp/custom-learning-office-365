import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash-es/isEqual";
import { IHOONavItem } from "@n8d/htwoo-react";
import HOOVerticalNav from "@n8d/htwoo-react/HOOVerticalNav";

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

  public shouldComponentUpdate(nextProps: Readonly<ITechnologyNavProps>, nextState: Readonly<ITechnologyNavState>): boolean {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private getNavItems = (): IHOONavItem[] => {
    const navItems: IHOONavItem[] = [];
    try {
      this.props.technologies.forEach(t => {
        const navItem: IHOONavItem = {
          text: t.Name,
          key: t.Id,
          onItemClick: (key) => { this.onNavClick(key) }
        };

        if (navItem) {
          navItems.push(navItem);
        }

      });
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (getNavItems) - ${err}`, LogLevel.Error);
    }
    return navItems;
  }

  private onNavClick = (key: string | number, technology?: ITechnology): void => {
    this.props.onClick(technology);
  }

  public render(): React.ReactElement<ITechnologyNavProps> {
    try {
      return (
        < HOOVerticalNav
          navItems={this.getNavItems()}
          selectedKey={this.props.selectedId}
        />
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}