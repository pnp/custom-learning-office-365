import * as React from 'react';

import isEqual from "lodash/isEqual";
import countBy from "lodash/countBy";
import { ICategory, IPlaylist, IFilter, IFilterValue } from '../../../common/models/Models';
import FilterPanel from "../Atoms/FilterPanel";
import SubCategoryList from '../Organisms/SubCategoryList';
import { FilterTypes } from '../../../common/models/Enums';

export interface ISubCategoriesProps {
  parent: ICategory;
  template: string;
  detail: ICategory[] | IPlaylist[];
  filterValue: IFilter;
  filterValues: IFilterValue[];
  editMode: boolean;
  customSort: boolean;
  selectItem: (template: string, templateId: string) => void;
  setFilter: (filterValue: IFilterValue) => void;
  updateCustomSort: (customSortOrder: string[]) => void;
}

export interface ISubCategoriesState {
}

export class SubCategoriesState implements ISubCategoriesState {
  constructor() { }
}

export default class SubCategories extends React.Component<ISubCategoriesProps, ISubCategoriesState> {
  constructor(props) {
    super(props);
    this.state = new SubCategoriesState();
  }

  public shouldComponentUpdate(nextProps: Readonly<ISubCategoriesProps>, nextState: Readonly<ISubCategoriesState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<ISubCategoriesProps> {
    let filterCounts = countBy(this.props.filterValues, "Type");
    return (
      <>
        {(filterCounts[FilterTypes.Audience] > 1 || filterCounts[FilterTypes.Level] > 1) &&
          <FilterPanel
            filter={this.props.filterValue}
            filterValues={this.props.filterValues}
            setFilter={this.props.setFilter}
          />
        }
        <SubCategoryList
          detail={this.props.detail}
          template={this.props.template}
          selectItem={this.props.selectItem}
          editMode={this.props.editMode}
          customSort={this.props.customSort}
          updateCustomSort={this.props.updateCustomSort}
        />
      </>
    );
  }
}
