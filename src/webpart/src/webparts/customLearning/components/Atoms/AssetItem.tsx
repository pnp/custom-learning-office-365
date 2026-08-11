import * as React from "react";

import { Logger, LogLevel } from '@pnp/logging';

import { handleActivationKey } from '../../../common/Utilities';

export interface IAssetItemProps {
  assetTitle: string;
  onClick: () => void;
}

export default class AssetItem extends React.PureComponent<IAssetItemProps> {
  private LOG_SOURCE: string = "AssetItem";

  constructor(props) {
    super(props);
  }

  public render(): React.ReactElement<IAssetItemProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE} className="plov-item plov-noimg"
          role="button"
          tabIndex={0}
          onClick={this.props.onClick}
          onKeyDown={(e) => handleActivationKey(e, this.props.onClick)}>
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
