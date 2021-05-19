import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import isEqual from "lodash/isEqual";
import Dotdotdot from "react-dotdotdot";

import { IMetadataEntry } from "../../../common/models/Models";
import * as strings from "M365LPStrings";
import { Icon } from "office-ui-fabric-react";

export interface ISubCategoryItemProps {
  index: number;
  dragMode: boolean;
  imageSource: string;
  title: string;
  description: string;
  audience: IMetadataEntry;
  onClick: () => void;
  onDragStart: (event: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDragEnter: (index: number) => void;
  onDragEnd: (event) => void;
}

export interface ISubCategoryItemState {
  mediaSize: number;
  clamp: number;
}

export class SubCategoryItemState implements ISubCategoryItemState {
  constructor(
    public mediaSize: number = 1024,
    public clamp: number = 4
  ) { }
}

declare module 'react' {
  interface HTMLAttributes<T> extends React.DOMAttributes<T> {
    // extends React's HTMLAttributes for lazy loading
    loading?: string;
  }
}

export default class SubCategoryItem extends React.Component<ISubCategoryItemProps, ISubCategoryItemState> {
  private LOG_SOURCE: string = "SubCategoryItem";

  constructor(props) {
    super(props);
    this.state = new SubCategoryItemState();
    try {
      window.matchMedia("screen and (min-width: 1025px)").addEventListener('change', (event) => {
        if (event.matches)
          this.onMediaQueryChange(9999);
      });
      window.matchMedia("screen and (max-width: 1024px)").addEventListener('change', (event) => {
        if (event.matches)
          this.onMediaQueryChange(1024);
      });
      window.matchMedia("screen and (max-width: 768px)").addEventListener('change', (event) => {
        if (event.matches)
          this.onMediaQueryChange(768);
      });
      window.matchMedia("screen and (max-width: 480px)").addEventListener('change', (event) => {
        if (event.matches)
          this.onMediaQueryChange(480);
      });
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (constructor) - ${err} -- media event listeners not supported in browser`, LogLevel.Error);
    }
  }

  private onMediaQueryChange = (size: number) => {
    if (size !== this.state.mediaSize) {
      let clamp: number = 4;
      if (size === 1024)
        clamp = 2;
      if (size === 768)
        clamp = 5;
      this.setState({
        mediaSize: size,
        clamp: clamp
      });
    }
  }

  public shouldComponentUpdate(nextProps: Readonly<ISubCategoryItemProps>, nextState: Readonly<ISubCategoryItemState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<ISubCategoryItemProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE}
          className="plov-item"
          onClick={this.props.onClick}
          key={`item-${this.props.index}`}
          role="link"
          draggable={this.props.dragMode}
          onDragStart={(event) => { this.props.onDragStart(event, this.props.index); }}
          onDragEnter={() => { this.props.onDragEnter(this.props.index); }}
          onDragEnd={this.props.onDragEnd}
          data-index={this.props.index}
        >
          <div className="plov-img">
            <img src={this.props.imageSource} width="278px" height="200px" loading="lazy" />
          </div>
          <div className="plov-desc">
            <h3 className="plov-title">{this.props.title}</h3>
            <p className="plov-short">
              <Dotdotdot clamp={this.state.clamp} tagName="span" useNativeClamp={true}>{this.props.description}</Dotdotdot>
            </p>
            <div className="plov-audience">{(this.props.audience.Name.length > 0) ? this.props.audience.Name : strings.FilterNotSet}</div>
          </div>
          {this.props.dragMode &&
            <div className="plov-handle">
              <Icon className="plov-handle-icon" iconName="GripperBarVertical" />
            </div>
          }
        </div>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}
