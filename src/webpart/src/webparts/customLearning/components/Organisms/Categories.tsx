import * as React from 'react';
import { Logger, LogLevel } from '@pnp/logging';

import isEqual from "lodash/isEqual";
import { ICategory } from '../../../common/models/Models';
import CategoryList from "../Molecules/CategoryList";

export interface ICategoriesProps {
  detail: ICategory[];
  editMode: boolean;
  customSort: boolean;
  selectItem: (template: string, templateId: string) => void;
  updateCustomSort: (customSortOrder: string[]) => void;
}

export interface ICategoriesState {
}

export class CategoriesState implements ICategoriesState {
  constructor() { }
}

export default class Categories extends React.Component<ICategoriesProps, ICategoriesState> {
  private LOG_SOURCE: string = "Categories";

  constructor(props) {
    super(props);
    this.state = new CategoriesState();
  }

  public shouldComponentUpdate(nextProps: Readonly<ICategoriesProps>, nextState: Readonly<ICategoriesState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<ICategoriesProps> {
    try {
      if (!this.props.detail || this.props.detail.length < 1) return null;
      return (
        <>
          {this.props.detail.map((category) => {
            return (
              <div data-component={this.LOG_SOURCE}>
                <h2>{category.Name}</h2>
                <CategoryList
                  subcategories={category.SubCategories}
                  customSort={this.props.customSort}
                  editMode={this.props.editMode}
                  selectItem={this.props.selectItem}
                  updateCustomSort={this.props.updateCustomSort}
                />
              </div>
            );
          })
          }
        </>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}
