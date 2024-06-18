import * as React from 'react';
import { Logger, LogLevel } from '@pnp/logging';

import { ICategory } from '../../../common/models/Models';
import CategoryList from "../Molecules/CategoryList";

export interface ICategoriesProps {
  detail: ICategory[];
  selectItem: (template: string, templateId: string) => void;
}

export default class Categories extends React.PureComponent<ICategoriesProps> {
  private LOG_SOURCE: string = "Categories";

  constructor(props) {
    super(props);
  }

  public render(): React.ReactElement<ICategoriesProps> {
    try {
      if (!this.props.detail || this.props.detail.length < 1) return null;
      return (
        <>
          {this.props.detail.map((category, idx) => {
            return (
              <div data-component={this.LOG_SOURCE} key={idx} className="category-section">
                <h2>{category.Name}</h2>
                <CategoryList
                  subcategories={category.SubCategories}
                  selectItem={this.props.selectItem}
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
