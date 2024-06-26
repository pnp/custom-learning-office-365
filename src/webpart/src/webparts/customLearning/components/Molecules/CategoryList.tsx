import * as React from 'react';
import { Logger, LogLevel } from '@pnp/logging';

import isEqual from "lodash-es/isEqual";
import map from 'lodash-es/map';
import filter from 'lodash-es/filter';

import { ICategory } from '../../../common/models/Models';
import { UXServiceContext } from '../../../common/services/UXService';
import CategoryItem from "../Atoms/CategoryItem";


export interface ICategoryListProps {
  subcategories: ICategory[];
  selectItem: (template: string, templateId: string) => void;
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
  static contextType = UXServiceContext;

  private LOG_SOURCE: string = "CategoryList";
  private _uxService: React.ContextType<typeof UXServiceContext>;
  private _updateState: boolean;
  private _dragResource: ICategory;

  constructor(props: ICategoryListProps) {
    super(props);
    this.state = new CategoryListState(props.subcategories);
  }

  private _reInit = (): void => {
    this.render();
  }

  public shouldComponentUpdate(nextProps: Readonly<ICategoryListProps>, nextState: Readonly<ICategoryListState>): boolean {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    if (!isEqual(nextProps.subcategories, this.props.subcategories))
      this._updateState = true;
    return true;
  }

  public componentDidUpdate(): void {
    if (this._updateState) {
      this._updateState = false;
      this.setState({ subcategories: this.props.subcategories });
    }
  }

  //Support drag and drop for custom sorting
  private _startDrag = (event: React.DragEvent<HTMLElement>, index: number): void => {
    if (!(this._uxService.CustomSort && this._uxService.EditMode)) { return; }
    try {
      event.stopPropagation();
      this._dragResource = this.state.subcategories[index];
      event.dataTransfer.effectAllowed = "move";
      (event.target as HTMLElement).style.cursor = "move";
      event.dataTransfer.dropEffect = "move";
      event.dataTransfer.setData("text/html", event.currentTarget.nodeName);
      event.dataTransfer.setDragImage(event.currentTarget, 20, 20);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (startDrag) - ${err}`, LogLevel.Error);
    }
  }

  private _endDrag = (): void => {
    if (!(this._uxService.CustomSort && this._uxService.EditMode)) { return; }
    try {
      const customSortOrder: string[] = map(this.state.subcategories, (item: ICategory) => {
        return item.Id;
      });
      this._dragResource = null;
      if (!isEqual(this.state.subcategories, this.props.subcategories))
        this._uxService.UpdateCustomSort(customSortOrder);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (endDrag) - ${err}`, LogLevel.Error);
    }
  }

  private _dragEnter = (index: number): void => {
    if (!(this._uxService.CustomSort && this._uxService.EditMode)) { return; }
    try {
      const draggedOverItem = this.state.subcategories[index];

      // if the item is dragged over itself, ignore
      if (this._dragResource === draggedOverItem) {
        return;
      }

      // filter out the currently dragged item
      const subcategories = filter(this.state.subcategories, (item: ICategory) => {
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
    if (this._uxService == undefined) {
      this._uxService = this.context;
      const renderFunction = {};
      renderFunction[this.LOG_SOURCE] = this._reInit;
      this._uxService.FCLWPRender = renderFunction;
    }
    try {
      if (!this.state.subcategories || this.state.subcategories.length < 1) return null;
      const dragMode: boolean = (this._uxService.CustomSort && this._uxService.EditMode);
      return (
        <menu className={`category-overview ${(dragMode ? "editSort" : "")}`} tabIndex={-1}>
          {this.state.subcategories.map((subcategory, idx) => {
            if (subcategory.Count && subcategory.Count > 0) {
              return (
                <li>
                  <CategoryItem
                    index={idx}
                    dragMode={dragMode}
                    subcategoryId={subcategory.Id}
                    subcategoryImage={subcategory.Image as string}
                    subcategoryName={subcategory.Name as string}
                    selectItem={this.props.selectItem}
                    onDragStart={this._startDrag}
                    onDragEnter={this._dragEnter}
                    onDragEnd={this._endDrag}
                  />
                </li>
              );
            }
          })}
        </menu>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}
