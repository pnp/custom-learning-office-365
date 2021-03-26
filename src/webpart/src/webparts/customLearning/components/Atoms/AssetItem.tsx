import * as React from "react";

import { Logger, LogLevel } from '@pnp/logging';
import isEqual from "lodash/isEqual";

export interface IAssetItemProps {
  assetTitle: string;
  onClick: () => void;
}

export interface IAssetItemState {
}

export class AssetItemState implements IAssetItemState {
  constructor() { }
}

export default class AssetItem extends React.Component<IAssetItemProps, IAssetItemState> {
  private LOG_SOURCE: string = "AssetItem";

  constructor(props) {
    super(props);
    this.state = new AssetItemState();
  }

  public shouldComponentUpdate(nextProps: Readonly<IAssetItemProps>, nextState: Readonly<IAssetItemState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<IAssetItemProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE} className="plov-item plov-noimg" onClick={this.props.onClick}>
          <div className="plov-desc">
            <h3 className="plov-title">{this.props.assetTitle}</h3>
          </div>
        </div>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}
