import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash/isEqual";

export interface IContentPackItemProps {
  imageSource: string;
  title: string;
  description: string;
  onClick: () => void;
}

export interface IContentPackItemState {
}

export class ContentPackItemState implements IContentPackItemState {
  constructor() { }
}

export default class ContentPackItem extends React.Component<IContentPackItemProps, IContentPackItemState> {
  private LOG_SOURCE: string = "ContentPackItem";

  constructor(props) {
    super(props);
    this.state = new ContentPackItemState();
  }

  public shouldComponentUpdate(nextProps: Readonly<IContentPackItemProps>, nextState: Readonly<IContentPackItemState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<IContentPackItemProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE} className="plov-item" onClick={this.props.onClick}>
          <div className="plov-img">
            <img src={this.props.imageSource} width="278px" height="200px" loading="lazy" />
          </div>
          <div className="plov-desc">
            <h3 className="plov-title">{this.props.title}</h3>
            <p className="plov-short-overflow">{this.props.description}</p>
          </div>
        </div>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}