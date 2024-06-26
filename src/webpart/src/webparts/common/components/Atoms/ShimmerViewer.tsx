import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import HOOShimmer, { HOOShimmerShape, HOOShimmerTheme } from "@n8d/htwoo-react/HOOShimmer";

import { params } from "../../services/Parameters";
import { ShimmerView } from "../../models/Enums";
import styles from "../../CustomLearningCommon.module.scss";


export interface IShimmerViewerProps {
  shimmerView: string;
}

export default class ShimmerViewer extends React.PureComponent<IShimmerViewerProps> {
  private LOG_SOURCE: string = "ShimmerViewer";

  constructor(props) {
    super(props);
  }

  public render(): React.ReactElement<IShimmerViewerProps> {
    try {
      return (
        <div className={`${styles.loadingShimmer} ${(params.appPartPage) ? styles.appPartPage : ""}`}>
          {(this.props.shimmerView === ShimmerView.ViewerCategory) &&
            <>
              <HOOShimmer shape={HOOShimmerShape.Container} theme={HOOShimmerTheme.Neutral} rootElementAttributes={{ style: { display: 'flex', marginBottom: '3em' } }} >
                <HOOShimmer shape={HOOShimmerShape.Square} theme={HOOShimmerTheme.Neutral} rootElementAttributes={{ style: { width: '100px', height: '40px', marginRight: '900px' } }} />
                <HOOShimmer shape={HOOShimmerShape.Square} theme={HOOShimmerTheme.Neutral} rootElementAttributes={{ style: { width: '40px', height: '40px', marginRight: '10px' } }} />
                <HOOShimmer shape={HOOShimmerShape.Square} theme={HOOShimmerTheme.Neutral} rootElementAttributes={{ style: { width: '40px', height: '40px', marginRight: '10px' } }} />
                <HOOShimmer shape={HOOShimmerShape.Square} theme={HOOShimmerTheme.Neutral} rootElementAttributes={{ style: { width: '40px', height: '40px', marginRight: '10px' } }} />
              </HOOShimmer>
              <HOOShimmer shape={HOOShimmerShape.Container} theme={HOOShimmerTheme.Neutral} rootElementAttributes={{ style: { display: 'flex', marginBottom: '3em' } }} >
                <HOOShimmer shape={HOOShimmerShape.Square} theme={HOOShimmerTheme.Neutral} rootElementAttributes={{ style: { width: '200px', height: '40px' } }} />
              </HOOShimmer>
              <HOOShimmer shape={HOOShimmerShape.Container} theme={HOOShimmerTheme.Neutral} rootElementAttributes={{ style: { display: 'flex', marginBottom: '3em' } }} >
                <HOOShimmer shape={HOOShimmerShape.Square} theme={HOOShimmerTheme.Neutral} rootElementAttributes={{ style: { width: '150px', height: '150px', paddingRight: '3em' } }} />
                <HOOShimmer shape={HOOShimmerShape.Square} theme={HOOShimmerTheme.Neutral} rootElementAttributes={{ style: { width: '150px', height: '150px', paddingRight: '3em' } }} />
                <HOOShimmer shape={HOOShimmerShape.Square} theme={HOOShimmerTheme.Neutral} rootElementAttributes={{ style: { width: '150px', height: '150px', paddingRight: '3em' } }} />
                <HOOShimmer shape={HOOShimmerShape.Square} theme={HOOShimmerTheme.Neutral} rootElementAttributes={{ style: { width: '150px', height: '150px', paddingRight: '3em' } }} />
              </HOOShimmer>
              <HOOShimmer shape={HOOShimmerShape.Container} theme={HOOShimmerTheme.Neutral} rootElementAttributes={{ style: { display: 'flex', marginBottom: '3em' } }} >
                <HOOShimmer shape={HOOShimmerShape.Square} theme={HOOShimmerTheme.Neutral} rootElementAttributes={{ style: { width: '200px', height: '40px' } }} />
              </HOOShimmer>
              <HOOShimmer shape={HOOShimmerShape.Container} theme={HOOShimmerTheme.Neutral} rootElementAttributes={{ style: { display: 'flex', marginBottom: '3em' } }} >
                <HOOShimmer shape={HOOShimmerShape.Square} theme={HOOShimmerTheme.Neutral} rootElementAttributes={{ style: { width: '150px', height: '150px', paddingRight: '3em' } }} />
                <HOOShimmer shape={HOOShimmerShape.Square} theme={HOOShimmerTheme.Neutral} rootElementAttributes={{ style: { width: '150px', height: '150px', paddingRight: '3em' } }} />
                <HOOShimmer shape={HOOShimmerShape.Square} theme={HOOShimmerTheme.Neutral} rootElementAttributes={{ style: { width: '150px', height: '150px', paddingRight: '3em' } }} />
                <HOOShimmer shape={HOOShimmerShape.Square} theme={HOOShimmerTheme.Neutral} rootElementAttributes={{ style: { width: '150px', height: '150px', paddingRight: '3em' } }} />
              </HOOShimmer>
              <HOOShimmer shape={HOOShimmerShape.Container} theme={HOOShimmerTheme.Neutral} rootElementAttributes={{ style: { display: 'flex', marginBottom: '3em' } }} >
                <HOOShimmer shape={HOOShimmerShape.Square} theme={HOOShimmerTheme.Neutral} rootElementAttributes={{ style: { width: '150px', height: '150px', paddingRight: '3em' } }} />
                <HOOShimmer shape={HOOShimmerShape.Square} theme={HOOShimmerTheme.Neutral} rootElementAttributes={{ style: { width: '150px', height: '150px', paddingRight: '3em' } }} />
                <HOOShimmer shape={HOOShimmerShape.Square} theme={HOOShimmerTheme.Neutral} rootElementAttributes={{ style: { width: '150px', height: '150px', paddingRight: '3em' } }} />
                <HOOShimmer shape={HOOShimmerShape.Square} theme={HOOShimmerTheme.Neutral} rootElementAttributes={{ style: { width: '150px', height: '150px', paddingRight: '3em' } }} />
              </HOOShimmer>
            </>
          }
          {((this.props.shimmerView === ShimmerView.ViewerSubCategory) || (this.props.shimmerView === ShimmerView.ViewerPlaylist)) &&
            <HOOShimmer shape={HOOShimmerShape.Container} theme={HOOShimmerTheme.Neutral} rootElementAttributes={{ style: { display: 'flex', marginBottom: '3em' } }} >
              <HOOShimmer shape={HOOShimmerShape.Square} theme={HOOShimmerTheme.Neutral} rootElementAttributes={{ style: { width: '100px', height: '40px', marginRight: '900px' } }} />
              <HOOShimmer shape={HOOShimmerShape.Square} theme={HOOShimmerTheme.Neutral} rootElementAttributes={{ style: { width: '40px', height: '40px', marginRight: '10px' } }} />
              <HOOShimmer shape={HOOShimmerShape.Square} theme={HOOShimmerTheme.Neutral} rootElementAttributes={{ style: { width: '40px', height: '40px', marginRight: '10px' } }} />
              <HOOShimmer shape={HOOShimmerShape.Square} theme={HOOShimmerTheme.Neutral} rootElementAttributes={{ style: { width: '40px', height: '40px', marginRight: '10px' } }} />
            </HOOShimmer>
          }
          {(this.props.shimmerView === ShimmerView.Admin) &&
            <HOOShimmer shape={HOOShimmerShape.Container} theme={HOOShimmerTheme.Neutral} rootElementAttributes={{ style: { display: 'flex', marginBottom: '30px' } }} >
              <HOOShimmer shape={HOOShimmerShape.Square} theme={HOOShimmerTheme.Neutral} rootElementAttributes={{ style: { width: '200px', height: '40px', marginRight: '670px' } }} />
              <HOOShimmer shape={HOOShimmerShape.Square} theme={HOOShimmerTheme.Neutral} rootElementAttributes={{ style: { width: '40px', height: '40px', marginRight: '20px' } }} />
              <HOOShimmer shape={HOOShimmerShape.Square} theme={HOOShimmerTheme.Neutral} rootElementAttributes={{ style: { width: '200px', height: '40px' } }} />
            </HOOShimmer>
          }
          {(this.props.shimmerView === ShimmerView.Admin || this.props.shimmerView === ShimmerView.AdminCdn) &&
            <HOOShimmer shape={HOOShimmerShape.Container} theme={HOOShimmerTheme.Neutral} rootElementAttributes={{ style: { display: 'flex', marginBottom: '30px' } }} >
              <HOOShimmer shape={HOOShimmerShape.Square} theme={HOOShimmerTheme.Neutral} rootElementAttributes={{ style: { width: '200px', height: '400px', marginRight: '30px' } }} />
              <HOOShimmer shape={HOOShimmerShape.Square} theme={HOOShimmerTheme.Neutral} rootElementAttributes={{ style: { width: '900px', height: '400px' } }} />
            </HOOShimmer>
          }
        </div>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}