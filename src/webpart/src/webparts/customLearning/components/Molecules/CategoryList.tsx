import * as React from 'react';
import { Logger, LogLevel } from '@pnp/logging';

import isEqual from "lodash/isEqual";
import { ICategory } from '../../../common/models/Models';
import CategoryItem from "../Atoms/CategoryItem";
import map from 'lodash/map';
import filter from 'lodash/filter';

export interface ICategoryListProps {
  subcategories: ICategory[];
  editMode: boolean;
  customSort: boolean;
  selectItem: (template: string, templateId: string) => void;
  updateCustomSort: (customSortOrder: string[]) => void;
}

export interface ICategoryListState {
  subcategories: ICategory[];
}

export class CategoryListState implements ICategoryListState {
  constructor(
    public subcategories: ICategory[]
  ) { }
}

export default class CategoryList extends React.Component<ICategoryListProps, ICategoryListState> {
  private LOG_SOURCE: string = "CategoryList";
  private _updateState: boolean;
  private _dragResource: ICategory;

  constructor(props: ICategoryListProps) {
    super(props);
    this.state = new CategoryListState(props.subcategories);
  }

  public shouldComponentUpdate(nextProps: Readonly<ICategoryListProps>, nextState: Readonly<ICategoryListState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    if (!isEqual(nextProps.subcategories, this.props.subcategories))
      this._updateState = true;
    return true;
  }

  public componentDidUpdate() {
    if (this._updateState) {
      this._updateState = false;
      this.setState({ subcategories: this.props.subcategories });
    }
  }

  //Support drag and drop for custom sorting
  private startDrag = (event: React.DragEvent<HTMLDivElement>, index: number) => {
    if (!(this.props.customSort && this.props.editMode)) { return; }
    try {
      event.stopPropagation();
      this._dragResource = this.state.subcategories[index];
      event.dataTransfer.effectAllowed = "move";
      event.target[0].style.cursor = "move";
      event.dataTransfer.dropEffect = "move";
      event.dataTransfer.setData("text/html", event.currentTarget.nodeName);
      event.dataTransfer.setDragImage(event.currentTarget, 20, 20);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (startDrag) - ${err}`, LogLevel.Error);
    }
  }

  private endDrag = () => {
    if (!(this.props.customSort && this.props.editMode)) { return; }
    try {
      let customSortOrder: string[] = map(this.state.subcategories, (item: ICategory) => {
        return item.Id;
      });
      this._dragResource = null;
      if (!isEqual(this.state.subcategories, this.props.subcategories))
        this.props.updateCustomSort(customSortOrder);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (endDrag) - ${err}`, LogLevel.Error);
    }
  }

  private dragEnter = (index: number) => {
    if (!(this.props.customSort && this.props.editMode)) { return; }
    try {
      const draggedOverItem = this.state.subcategories[index];

      // if the item is dragged over itself, ignore
      if (this._dragResource === draggedOverItem) {
        return;
      }

      // filter out the currently dragged item
      let subcategories = filter(this.state.subcategories, (item: ICategory) => {
        return item !== this._dragResource;
      });

      // add the dragged item after the dragged over item
      subcategories.splice(index, 0, this._dragResource);
      this.setState({ subcategories: subcategories });
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (dragEnter) - ${err}`, LogLevel.Error);
    }
  }

  public render(): React.ReactElement<ICategoryListProps> {
    try {
      if (!this.state.subcategories || this.state.subcategories.length < 1) return null;
      let dragMode: boolean = (this.props.customSort && this.props.editMode);
      return (
        <div className={`category-overview ${(dragMode ? "editSort" : "")}`}>
          {this.state.subcategories.map((subcategory, idx) => {
            if (subcategory.Count && subcategory.Count > 0) {
              return (
                <CategoryItem
                  index={idx}
                  dragMode={dragMode}
                  subcategoryId={subcategory.Id}
                  subcategoryImage={subcategory.Image as string}
                  subcategoryName={subcategory.Name as string}
                  selectItem={this.props.selectItem}
                  onDragStart={this.startDrag}
                  onDragEnter={this.dragEnter}
                  onDragEnd={this.endDrag}
                />
              );
            }
          })}
        </div>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}
