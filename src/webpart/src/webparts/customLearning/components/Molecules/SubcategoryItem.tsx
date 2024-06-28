import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash-es/isEqual";

import { IMetadataEntry } from "../../../common/models/Models";
import * as strings from "M365LPStrings";
import HOOIcon from "@n8d/htwoo-react/HOOIcon";

export interface ISubCategoryItemProps {
  index: number;
  dragMode: boolean;
  imageSource: string;
  title: string;
  description: string;
  audience: IMetadataEntry;
  onClick: () => void;
  onDragStart: (event: React.DragEvent<HTMLElement>, index: number) => void;
  onDragEnter: (index: number) => void;
  onDragEnd: (event) => void;
}

export interface ISubCategoryItemState {
  mediaSize: number;
  clamp: number;
  expanded: boolean;
  truncated: boolean;
}

export class SubCategoryItemState implements ISubCategoryItemState {
  constructor(
    public mediaSize: number = 1024,
    public clamp: number = 4,
    public expanded: boolean = false,
    public truncated: boolean = false
  ) { }
}

export default class SubCategoryItem extends React.Component<ISubCategoryItemProps, ISubCategoryItemState> {
  private LOG_SOURCE: string = "SubCategoryItem";

  constructor(props) {
    super(props);
    this.state = new SubCategoryItemState();
  }

  public shouldComponentUpdate(nextProps: Readonly<ISubCategoryItemProps>, nextState: Readonly<ISubCategoryItemState>): boolean {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private handleKeyPress(event): void {
    // Handles both mouse clicks and keyboard
    // activate with Enter or Space

    // Keypresses other then Enter and Space should not trigger a command
    if (event instanceof KeyboardEvent && event.key !== "Enter" && event.key !== " ") {
      return;
    }
    this.props.onClick();
  }

  public render(): React.ReactElement<ISubCategoryItemProps> {
    try {
      return (
        <article data-component={this.LOG_SOURCE}
          tabIndex={0}
          className="plov-item"
          onClick={this.props.onClick}
          onKeyDown={(e) => this.handleKeyPress(e)}
          key={`item-${this.props.index}`}
          role="link"
          draggable={this.props.dragMode}
          onDragStart={(event) => { this.props.onDragStart(event, this.props.index); }}
          onDragEnter={() => { this.props.onDragEnter(this.props.index); }}
          onDragEnd={this.props.onDragEnd}
          data-index={this.props.index}
        >
          <div className="plov-img">
            <img src={this.props.imageSource} loading="lazy" alt="" role="presentation" />
          </div>
          <div className="plov-desc">
            <h3 className="plov-title">{this.props.title}</h3>
            <p className="plov-short">{this.props.description}</p>
            <div className="plov-audience">{(this.props.audience.Name.length > 0) ? this.props.audience.Name : strings.FilterNotSet}</div>
          </div>
          {this.props.dragMode &&
            <div className="plov-handle">
              <HOOIcon
                iconName="icon-re-order-dots-vertical-regular"
              />
            </div>
          }
        </article>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}
