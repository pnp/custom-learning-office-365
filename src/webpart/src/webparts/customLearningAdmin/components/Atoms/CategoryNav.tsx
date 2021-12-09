import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash/isEqual";
import { ICategory, IMultilingualString } from "../../../common/models/Models";
import { Nav, INavLinkGroup, INavLink } from 'office-ui-fabric-react';

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

  public shouldComponentUpdate(nextProps: Readonly<ICategoryNavProps>, nextState: Readonly<ICategoryNavState>) {
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
      this.props.categories.forEach(element => {
        let navItem: INavLink = {
          name: (element.Name instanceof Array) ? (element.Name as IMultilingualString[])[0].Text : element.Name,
          key: element.Id,
          url: '',
          category: element,
          isExpanded: !this.state.collapsed
        };
        if (element.SubCategories && element.SubCategories.length > 0) {
          let subNavItems: INavLink[] = [];
          element.SubCategories.forEach(subElement => {
            let subNavItem: INavLink = {
              name: (subElement.Name instanceof Array) ? (subElement.Name as IMultilingualString[])[0].Text : subElement.Name,
              key: subElement.Id,
              url: '',
              category: subElement,
              isExpanded: !this.state.collapsed
            };

            if (subNavItem) {
              subNavItems.push(subNavItem);
            }

          });

          if (subNavItems && subNavItems.length > 0) {
            navItem.links = subNavItems;
          }
        }

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
    this.props.onClick(item.category);
  }

  public render(): React.ReactElement<ICategoryNavProps> {
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