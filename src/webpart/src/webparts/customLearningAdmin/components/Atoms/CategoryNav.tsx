import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash-es/isEqual";
import { IHOONavItem } from "@n8d/htwoo-react";
import HOOVerticalNav from "@n8d/htwoo-react/HOOVerticalNav";

import { ICategory, IMultilingualString } from "../../../common/models/Models";


export interface ICategoryNavProps {
  categories: ICategory[];
  selectedId: string;
  onClick: (selected: ICategory) => void;
}

export interface ICategoryNavState {
  collapsed: boolean;
}

export class CategoryNavState implements ICategoryNavState {
  constructor(
    public collapsed: boolean = window.matchMedia("(max-width: 480px)").matches
  ) { }
}

export default class CategoryNav extends React.Component<ICategoryNavProps, ICategoryNavState> {
  private LOG_SOURCE: string = "CategoryNav";

  constructor(props) {
    super(props);
    this.state = new CategoryNavState();
    if (!this.props.selectedId && this.props.categories.length > 0) {
      this.props.onClick(this.props.categories[0]);
    }
  }

  public shouldComponentUpdate(nextProps: Readonly<ICategoryNavProps>, nextState: Readonly<ICategoryNavState>): boolean {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private getNavItems = (): IHOONavItem[] => {
    const navItems: IHOONavItem[] = [];
    try {

      this.props.categories.forEach(element => {
        const navItem: IHOONavItem = {
          text: (element.Name instanceof Array) ? (element.Name as IMultilingualString[])[0].Text : element.Name,
          key: element.Id,
          onItemClick: (key) => { this.onNavClick(key, element) }
        };
        if (element.SubCategories && element.SubCategories.length > 0) {
          const subNavItems: IHOONavItem[] = [];
          element.SubCategories.forEach(subElement => {
            const subNavItem: IHOONavItem = {
              text: (subElement.Name instanceof Array) ? (subElement.Name as IMultilingualString[])[0].Text : subElement.Name,
              key: subElement.Id,
              onItemClick: (key) => { this.onNavClick(key, subElement) }
            };

            if (subNavItem) {
              subNavItems.push(subNavItem);
            }
          });

          if (subNavItems && subNavItems.length > 0) {
            navItem.childNavItems = subNavItems;
          }
        }

        if (navItem) {
          navItems.push(navItem);
        }

      });
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (getNavItems) - ${err}`, LogLevel.Error);
    }
    return navItems;
  }

  private onNavClick = (key: string | number, category?: ICategory): void => {
    this.props.onClick(category);
  }

  public render(): React.ReactElement<ICategoryNavProps> {
    try {
      return (
        <HOOVerticalNav
          navItems={this.getNavItems()}
          selectedKey={this.props.selectedId}
          defaultExpandedLevel={2}
        />
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}