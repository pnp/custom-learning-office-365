import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import map from "lodash/map";
import filter from "lodash/filter";
import isEqual from "lodash/isEqual";

import { ICategory, IPlaylist } from '../../../common/models/Models';
import { Templates } from "../../../common/models/Enums";
import SubCategoryItem from "../Molecules/SubcategoryItem";

export interface ISubCategoryListProps {
  detail: ICategory[] | IPlaylist[];
  template: string;
  editMode: boolean;
  customSort: boolean;
  selectItem: (template: string, templateId: string) => void;
  updateCustomSort: (customSortOrder: string[]) => void;
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
  private LOG_SOURCE: string = "SubCategoryList";
  private _updateState: boolean;
  private _dragResource: ICategory | IPlaylist;

  constructor(props) {
    super(props);
    this.state = new SubCategoryListState(props.detail);
  }

  public shouldComponentUpdate(nextProps: Readonly<ISubCategoryListProps>, nextState: Readonly<ISubCategoryListState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    if (!isEqual(nextProps.detail, this.props.detail))
      this._updateState = true;
    return true;
  }

  public componentDidUpdate() {
    if (this._updateState) {
      this._updateState = false;
      this.setState({ detail: this.props.detail });
    }
  }

  //Support drag and drop for custom sorting
  private startDrag = (event: React.DragEvent<HTMLDivElement>, index: number) => {
    if (!(this.props.customSort && this.props.editMode)) { return; }
    try {
      event.stopPropagation();
      this._dragResource = this.state.detail[index];
      event.dataTransfer.effectAllowed = "move";
      event.target[0].style.cursor = "move";
      event.dataTransfer.setData("text/html", event.currentTarget.nodeName);
      event.dataTransfer.setDragImage(event.currentTarget, 20, 20);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (startDrag) - ${err}`, LogLevel.Error);
    }
  }

  private endDrag = () => {
    if (!(this.props.customSort && this.props.editMode)) { return; }
    try {
      let customSortOrder: string[] = map(this.state.detail, (item: ICategory | IPlaylist) => {
        return item.Id;
      });
      this._dragResource = null;
      if (!isEqual(this.state.detail, this.props.detail))
        this.props.updateCustomSort(customSortOrder);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (endDrag) - ${err}`, LogLevel.Error);
    }
  }

  private dragEnter = (index: number) => {
    if (!(this.props.customSort && this.props.editMode)) { return; }
    try {
      const draggedOverItem = this.state.detail[index];

      // if the item is dragged over itself, ignore
      if (this._dragResource === draggedOverItem) {
        return;
      }

      // filter out the currently dragged item
      let detail = filter(this.state.detail, (item: ICategory | IPlaylist) => {
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
    let dragMode: boolean = (this.props.customSort && this.props.editMode);
    try {
      return (
        <div data-component={this.LOG_SOURCE} className={`plov ${(dragMode ? "editSort" : "")}`}>
          {this.state.detail && this.state.detail.length > 0 && (this.props.template == Templates.SubCategory) && (this.state.detail as ICategory[]).map((subcategory, idx) => {
            return (
              <SubCategoryItem
                index={idx}
                dragMode={dragMode}
                imageSource={((subcategory.Image as string).length > 0) ? (subcategory.Image as string) : null}
                title={subcategory.Name as string}
                description=""
                audience={null}
                onClick={() => { if (!dragMode) { this.props.selectItem(Templates.SubCategory, subcategory.Id); } }}
                onDragStart={this.startDrag}
                onDragEnter={this.dragEnter}
                onDragEnd={this.endDrag}
              />
            );
          })
          }
          {this.state.detail && this.state.detail.length > 0 && (this.props.template == Templates.Playlists) && (this.state.detail as IPlaylist[]).map((playlist, idx) => {
            return (
              <SubCategoryItem
                index={idx}
                dragMode={dragMode}
                imageSource={((playlist.Image as string).length > 0) ? playlist.Image as string : null}
                title={playlist.Title as string}
                description={playlist.Description as string}
                audience={playlist.AudienceValue}
                onClick={() => { if (!dragMode) { this.props.selectItem(Templates.Playlist, playlist.Id); } }}
                onDragStart={this.startDrag}
                onDragEnter={this.dragEnter}
                onDragEnd={this.endDrag}
              />
            );
          })
          }
        </div>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}
