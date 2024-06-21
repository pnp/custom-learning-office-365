import * as React from 'react';

import countBy from "lodash-es/countBy";

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
  selectItem: (template: string, templateId: string) => void;
  setFilter: (filterValue: IFilterValue) => void;
}

export default class SubCategories extends React.PureComponent<ISubCategoriesProps> {
  constructor(props) {
    super(props);
  }

  public render(): React.ReactElement<ISubCategoriesProps> {
    const filterCounts = countBy(this.props.filterValues, "Type");
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
        />
      </>
    );
  }
}
