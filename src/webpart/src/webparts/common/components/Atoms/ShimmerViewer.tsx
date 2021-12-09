import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash/isEqual";
import { Fabric, Shimmer, ShimmerElementType, mergeStyles } from 'office-ui-fabric-react';

import { params } from "../../services/Parameters";
import { ShimmerView } from "../../models/Enums";
import styles from "../../CustomLearningCommon.module.scss";

export interface IShimmerViewerProps {
  shimmerView: string;
}

export interface IShimmerViewerState {
}

export class ShimmerViewerState implements IShimmerViewerState {
  constructor() { }
}

export default class ShimmerViewer extends React.Component<IShimmerViewerProps, IShimmerViewerState> {
  private LOG_SOURCE: string = "ShimmerViewer";

  private wrapperClass = mergeStyles({
    padding: 2,
    selectors: {
      '& > *': {
        margin: '10px 0 20px 0'
      }
    }
  });

  constructor(props) {
    super(props);
    this.state = new ShimmerViewerState();
  }

  public shouldComponentUpdate(nextProps: Readonly<IShimmerViewerProps>, nextState: Readonly<IShimmerViewerState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<IShimmerViewerProps> {
    try {
      return (
        <div className={`${styles.loadingShimmer} ${(params.appPartPage) ? styles.appPartPage : ""}`}>
          {(this.props.shimmerView === ShimmerView.ViewerCategory) &&
            <Fabric className={this.wrapperClass}>
              <Shimmer
                shimmerElements={[
                  { type: ShimmerElementType.line, height: 29, width: 100 },
                  { type: ShimmerElementType.gap, width: '90%' },
                  { type: ShimmerElementType.line, height: 40, width: 40 },
                  { type: ShimmerElementType.gap, width: 5 },
                  { type: ShimmerElementType.line, height: 40, width: 40 },
                  { type: ShimmerElementType.gap, width: 5 },
                  { type: ShimmerElementType.line, height: 40, width: 40 }
                ]}
              />
              <Shimmer
                shimmerElements={[
                  { type: ShimmerElementType.line, height: 29, width: 200 },
                  { type: ShimmerElementType.gap, width: '90%' }
                ]}
              />
              <Shimmer
                shimmerElements={[
                  { type: ShimmerElementType.gap, height: 160, width: 32 },
                  { type: ShimmerElementType.line, height: 160, width: 160 },
                  { type: ShimmerElementType.gap, height: 160, width: 32 },
                  { type: ShimmerElementType.line, height: 160, width: 160 },
                  { type: ShimmerElementType.gap, height: 160, width: 32 },
                  { type: ShimmerElementType.line, height: 160, width: 160 },
                  { type: ShimmerElementType.gap, height: 160, width: '90%' }
                ]}
              />
              <Shimmer
                shimmerElements={[
                  { type: ShimmerElementType.line, height: 29, width: 200 },
                  { type: ShimmerElementType.gap, width: '90%' }
                ]}
              />
              <Shimmer
                shimmerElements={[
                  { type: ShimmerElementType.gap, height: 160, width: 32 },
                  { type: ShimmerElementType.line, height: 160, width: 160 },
                  { type: ShimmerElementType.gap, height: 160, width: 32 },
                  { type: ShimmerElementType.line, height: 160, width: 160 },
                  { type: ShimmerElementType.gap, height: 160, width: 32 },
                  { type: ShimmerElementType.line, height: 160, width: 160 },
                  { type: ShimmerElementType.gap, height: 160, width: 32 },
                  { type: ShimmerElementType.line, height: 160, width: 160 },
                  { type: ShimmerElementType.gap, height: 160, width: 32 },
                  { type: ShimmerElementType.line, height: 160, width: 160 },
                  { type: ShimmerElementType.gap, height: 160, width: '90%' }
                ]}
              />
              <Shimmer
                shimmerElements={[
                  { type: ShimmerElementType.gap, height: 160, width: 32 },
                  { type: ShimmerElementType.line, height: 160, width: 160 },
                  { type: ShimmerElementType.gap, height: 160, width: 32 },
                  { type: ShimmerElementType.line, height: 160, width: 160 },
                  { type: ShimmerElementType.gap, height: 160, width: 32 },
                  { type: ShimmerElementType.line, height: 160, width: 160 },
                  { type: ShimmerElementType.gap, height: 160, width: 32 },
                  { type: ShimmerElementType.line, height: 160, width: 160 },
                  { type: ShimmerElementType.gap, height: 160, width: 32 },
                  { type: ShimmerElementType.line, height: 160, width: 160 },
                  { type: ShimmerElementType.gap, height: 160, width: '90%' }
                ]}
              />
            </Fabric>
          }
          {(this.props.shimmerView === ShimmerView.ViewerSubCategory) &&
            <Fabric className={this.wrapperClass}>
              <Shimmer
                shimmerElements={[
                  { type: ShimmerElementType.line, height: 29, width: 100 },
                  { type: ShimmerElementType.gap, width: '90%' },
                  { type: ShimmerElementType.line, height: 40, width: 40 },
                  { type: ShimmerElementType.gap, width: 5 },
                  { type: ShimmerElementType.line, height: 40, width: 40 },
                  { type: ShimmerElementType.gap, width: 5 },
                  { type: ShimmerElementType.line, height: 40, width: 40 }
                ]}
              />
            </Fabric>
          }
          {(this.props.shimmerView === ShimmerView.ViewerPlaylist) &&
            <Fabric className={this.wrapperClass}>
              <Shimmer
                shimmerElements={[
                  { type: ShimmerElementType.line, height: 29, width: 100 },
                  { type: ShimmerElementType.gap, width: '90%' },
                  { type: ShimmerElementType.line, height: 40, width: 40 },
                  { type: ShimmerElementType.gap, width: 5 },
                  { type: ShimmerElementType.line, height: 40, width: 40 },
                  { type: ShimmerElementType.gap, width: 5 },
                  { type: ShimmerElementType.line, height: 40, width: 40 }
                ]}
              />
            </Fabric>
          }
          {(this.props.shimmerView === ShimmerView.Admin) &&
            <Fabric className={this.wrapperClass}>
              <Shimmer
                shimmerElements={[
                  { type: ShimmerElementType.line, height: 29, width: 200 },
                  { type: ShimmerElementType.gap, width: '90%' },
                  { type: ShimmerElementType.line, height: 40, width: 40 },
                  { type: ShimmerElementType.gap, width: 32 },
                  { type: ShimmerElementType.line, height: 40, width: 200 }
                ]}
              />
            </Fabric>
          }
          {(this.props.shimmerView === ShimmerView.Admin || this.props.shimmerView === ShimmerView.AdminCdn) &&
            <Fabric className={this.wrapperClass}>
              <Shimmer
                shimmerElements={[
                  { type: ShimmerElementType.line, height: 400, width: 200 },
                  { type: ShimmerElementType.gap, height: 400, width: 20 },
                  { type: ShimmerElementType.line, height: 400, width: '90%' },
                ]}
              />
            </Fabric>
          }
        </div>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}