import { Logger, LogLevel } from "@pnp/logging";
import * as React from "react";

import filter from "lodash-es/filter";
import isEqual from "lodash-es/isEqual";
import map from "lodash-es/map";

import { Templates } from "../../../common/models/Enums";
import { ICategory, IPlaylist } from '../../../common/models/Models';
import { UXServiceContext } from '../../../common/services/UXService';
import SubCategoryItem from "../Molecules/SubcategoryItem";

export interface ISubCategoryListProps {
  detail: ICategory[] | IPlaylist[];
  template: string;
  // customSort: boolean;
  selectItem: (template: string, templateId: string) => void;
  // updateCustomSort: (customSortOrder: string[]) => void;
}

export interface ISubCategoryListState {
  detail: ICategory[] | IPlaylist[];
  customSortOrder: string[];
}

export class SubCategoryListState implements ISubCategoryListState {
  constructor(
    public detail: ICategory[] | IPlaylist[],
    public customSortOrder: string[] = []
  ) { }
}

export default class SubCategoryList extends React.Component<ISubCategoryListProps, ISubCategoryListState> {
  static contextType = UXServiceContext;

  private LOG_SOURCE: string = "SubCategoryList";
  private _uxService: React.ContextType<typeof UXServiceContext>;
  private _updateState: boolean;
  private _dragResource: ICategory | IPlaylist;

  constructor(props) {
    super(props);
    this.state = new SubCategoryListState(props.detail);
  }

  private _reInit = (): void => {
    this.render();
  }

  public shouldComponentUpdate(nextProps: Readonly<ISubCategoryListProps>, nextState: Readonly<ISubCategoryListState>): boolean {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    if (!isEqual(nextProps.detail, this.props.detail))
      this._updateState = true;
    return true;
  }

  public componentDidUpdate(): void {
    if (this._updateState) {
      this._updateState = false;
      this.setState({ detail: this.props.detail });
    }
  }

  //Support drag and drop for custom sorting
  private _startDrag = (event: React.DragEvent<HTMLDivElement>, index: number): void => {
    if (!(this._uxService.CustomSort && this._uxService.EditMode)) { return; }
    try {
      event.stopPropagation();
      this._dragResource = this.state.detail[index];
      event.dataTransfer.effectAllowed = "move";
      (event.target as HTMLElement).style.cursor = "move";
      event.dataTransfer.setData("text/html", event.currentTarget.nodeName);
      event.dataTransfer.setDragImage(event.currentTarget, 20, 20);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (startDrag) - ${err}`, LogLevel.Error);
    }
  }

  private _endDrag = (): void => {
    if (!(this._uxService.CustomSort && this._uxService.EditMode)) { return; }
    try {
      const customSortOrder: string[] = map(this.state.detail, (item: ICategory | IPlaylist) => {
        return item.Id;
      });
      this._dragResource = null;
      if (!isEqual(this.state.detail, this.props.detail))
        this._uxService.UpdateCustomSort(customSortOrder);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (endDrag) - ${err}`, LogLevel.Error);
    }
  }

  private _dragEnter = (index: number): void => {
    if (!(this._uxService.CustomSort && this._uxService.EditMode)) { return; }
    try {
      const draggedOverItem = this.state.detail[index];

      // if the item is dragged over itself, ignore
      if (this._dragResource === draggedOverItem) {
        return;
      }

      // filter out the currently dragged item
      const detail = filter(this.state.detail, (item: ICategory | IPlaylist) => {
        return item !== this._dragResource;
      });

      // add the dragged item after the dragged over item
      detail.splice(index, 0, this._dragResource);
      this.setState({ detail: detail as ICategory[] | IPlaylist[] });
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (dragEnter) - ${err}`, LogLevel.Error);
    }
  }

  public render(): React.ReactElement<ISubCategoryListProps> {
    if (this._uxService == undefined) {
      this._uxService = this.context;
      const renderFunction = {};
      renderFunction[this.LOG_SOURCE] = this._reInit;
      this._uxService.FCLWPRender = renderFunction;
    }
    const dragMode: boolean = (this._uxService.CustomSort && this._uxService.EditMode);
    try {
      return (
        <menu data-component={this.LOG_SOURCE} className={`plov ${(dragMode ? "editSort" : "")}`}>
          {this.state.detail && this.state.detail.length > 0 && (this.props.template == Templates.SubCategory) && (this.state.detail as ICategory[]).map((subcategory, idx) => {
            return (
              <li key={idx}>
                <SubCategoryItem
                  key={idx}
                  index={idx}
                  dragMode={dragMode}
                  imageSource={((subcategory.Image as string).length > 0) ? (subcategory.Image as string) : null}
                  title={subcategory.Name as string}
                  description=""
                  audience={null}
                  onClick={() => { if (!dragMode) { this.props.selectItem(Templates.SubCategory, subcategory.Id); } }}
                  onDragStart={this._startDrag}
                  onDragEnter={this._dragEnter}
                  onDragEnd={this._endDrag}
                />
              </li>
            );
          })
          }
          {this.state.detail && this.state.detail.length > 0 && (this.props.template == Templates.Playlists) && (this.state.detail as IPlaylist[]).map((playlist, idx) => {
            return (
              <li key={idx}>
                <SubCategoryItem
                  key={idx}
                  index={idx}
                  dragMode={dragMode}
                  imageSource={((playlist.Image as string).length > 0) ? playlist.Image as string : null}
                  title={playlist.Title as string}
                  description={playlist.Description as string}
                  audience={playlist.AudienceValue}
                  onClick={() => { if (!dragMode) { this.props.selectItem(Templates.Playlist, playlist.Id); } }}
                  onDragStart={this._startDrag}
                  onDragEnter={this._dragEnter}
                  onDragEnd={this._endDrag}
                />
              </li>
            );
          })
          }
        </menu>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}
