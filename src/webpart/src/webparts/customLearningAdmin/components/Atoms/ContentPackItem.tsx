import { Logger, LogLevel } from "@pnp/logging";
import * as React from "react";

export interface IContentPackItemProps {
  imageSource: string;
  title: string;
  description: string;
  onClick: () => void;
}

export default class ContentPackItem extends React.PureComponent<IContentPackItemProps> {
  private LOG_SOURCE: string = "ContentPackItem";

  constructor(props) {
    super(props);
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