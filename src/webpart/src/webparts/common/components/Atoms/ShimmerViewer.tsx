import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import HOOShimmer, { HOOShimmerShape, HOOShimmerTheme } from "@n8d/htwoo-react/HOOShimmer";

import isEqual from "lodash-es/isEqual";

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
        // TODO Make sure I did this right.
        <div className={`${styles.loadingShimmer} ${(params.appPartPage) ? styles.appPartPage : ""}`}>
          {(this.props.shimmerView === ShimmerView.ViewerCategory) &&
            <div>
              <HOOShimmer shape={HOOShimmerShape.Container} theme={HOOShimmerTheme.Primary} >
                <HOOShimmer
                  shape={HOOShimmerShape.Row}
                  theme={HOOShimmerTheme.Primary}
                  rootElementAttributes={{
                    style: {
                      height: '29',
                      width: '100',
                      paddingRight: '90%'
                    }
                  }}
                />
                <HOOShimmer
                  shape={HOOShimmerShape.Row}
                  theme={HOOShimmerTheme.Primary}
                  rootElementAttributes={{
                    style: {
                      height: '40',
                      width: '40',
                      paddingRight: '5'
                    }
                  }}
                />
                <HOOShimmer
                  shape={HOOShimmerShape.Row}
                  theme={HOOShimmerTheme.Primary}
                  rootElementAttributes={{
                    style: {
                      height: '40',
                      width: '40',
                      paddingRight: '5'
                    }
                  }}
                />
                <HOOShimmer
                  shape={HOOShimmerShape.Row}
                  theme={HOOShimmerTheme.Primary}
                  rootElementAttributes={{
                    style: {
                      height: '40',
                      width: '40'
                    }
                  }}
                />
              </HOOShimmer>

              <HOOShimmer shape={HOOShimmerShape.Container} theme={HOOShimmerTheme.Primary} >
                <HOOShimmer
                  shape={HOOShimmerShape.Row}
                  theme={HOOShimmerTheme.Primary}
                  rootElementAttributes={{
                    style: {
                      height: '29',
                      width: '100',
                      paddingRight: '90%'
                    }
                  }}
                />
              </HOOShimmer>

              <HOOShimmer shape={HOOShimmerShape.Container} theme={HOOShimmerTheme.Primary} >
                <HOOShimmer
                  shape={HOOShimmerShape.Row}
                  theme={HOOShimmerTheme.Primary}
                  rootElementAttributes={{
                    style: {
                      height: '160',
                      width: '160',
                      paddingLeft: '32'
                    }
                  }}
                />
                <HOOShimmer
                  shape={HOOShimmerShape.Row}
                  theme={HOOShimmerTheme.Primary}
                  rootElementAttributes={{
                    style: {
                      height: '160',
                      width: '160',
                      paddingLeft: '32'
                    }
                  }}
                />
                <HOOShimmer
                  shape={HOOShimmerShape.Row}
                  theme={HOOShimmerTheme.Primary}
                  rootElementAttributes={{
                    style: {
                      height: '160',
                      width: '160',
                      paddingLeft: '32'
                    }
                  }}
                />
                <HOOShimmer
                  shape={HOOShimmerShape.Row}
                  theme={HOOShimmerTheme.Primary}
                  rootElementAttributes={{
                    style: {
                      height: '160',
                      width: '160',
                      paddingLeft: '32'
                    }
                  }}
                />
                <HOOShimmer
                  shape={HOOShimmerShape.Row}
                  theme={HOOShimmerTheme.Primary}
                  rootElementAttributes={{
                    style: {
                      height: '160',
                      width: '90%'
                    }
                  }}
                />
              </HOOShimmer>

              <HOOShimmer shape={HOOShimmerShape.Container} theme={HOOShimmerTheme.Primary} >
                <HOOShimmer
                  shape={HOOShimmerShape.Row}
                  theme={HOOShimmerTheme.Primary}
                  rootElementAttributes={{
                    style: {
                      height: '29',
                      width: '200',
                      paddingRight: '90%'
                    }
                  }}
                />
              </HOOShimmer>

              <HOOShimmer shape={HOOShimmerShape.Container} theme={HOOShimmerTheme.Primary} >
                <HOOShimmer
                  shape={HOOShimmerShape.Row}
                  theme={HOOShimmerTheme.Primary}
                  rootElementAttributes={{
                    style: {
                      height: '160',
                      width: '160',
                      paddingLeft: '32'
                    }
                  }}
                />
                <HOOShimmer
                  shape={HOOShimmerShape.Row}
                  theme={HOOShimmerTheme.Primary}
                  rootElementAttributes={{
                    style: {
                      height: '160',
                      width: '160',
                      paddingLeft: '32'
                    }
                  }}
                />
                <HOOShimmer
                  shape={HOOShimmerShape.Row}
                  theme={HOOShimmerTheme.Primary}
                  rootElementAttributes={{
                    style: {
                      height: '160',
                      width: '160',
                      paddingLeft: '32'
                    }
                  }}
                />
                <HOOShimmer
                  shape={HOOShimmerShape.Row}
                  theme={HOOShimmerTheme.Primary}
                  rootElementAttributes={{
                    style: {
                      height: '160',
                      width: '160',
                      paddingLeft: '32'
                    }
                  }}
                />
                <HOOShimmer
                  shape={HOOShimmerShape.Row}
                  theme={HOOShimmerTheme.Primary}
                  rootElementAttributes={{
                    style: {
                      height: '160',
                      width: '90%'
                    }
                  }}
                />
              </HOOShimmer>

              <HOOShimmer shape={HOOShimmerShape.Container} theme={HOOShimmerTheme.Primary} >
                <HOOShimmer
                  shape={HOOShimmerShape.Row}
                  theme={HOOShimmerTheme.Primary}
                  rootElementAttributes={{
                    style: {
                      height: '160',
                      width: '160',
                      paddingLeft: '32'
                    }
                  }}
                />
                <HOOShimmer
                  shape={HOOShimmerShape.Row}
                  theme={HOOShimmerTheme.Primary}
                  rootElementAttributes={{
                    style: {
                      height: '160',
                      width: '160',
                      paddingLeft: '32'
                    }
                  }}
                />
                <HOOShimmer
                  shape={HOOShimmerShape.Row}
                  theme={HOOShimmerTheme.Primary}
                  rootElementAttributes={{
                    style: {
                      height: '160',
                      width: '160',
                      paddingLeft: '32'
                    }
                  }}
                />
                <HOOShimmer
                  shape={HOOShimmerShape.Row}
                  theme={HOOShimmerTheme.Primary}
                  rootElementAttributes={{
                    style: {
                      height: '160',
                      width: '160',
                      paddingLeft: '32'
                    }
                  }}
                />
                <HOOShimmer
                  shape={HOOShimmerShape.Row}
                  theme={HOOShimmerTheme.Primary}
                  rootElementAttributes={{
                    style: {
                      height: '160',
                      width: '90%'
                    }
                  }}
                />
              </HOOShimmer>

              <HOOShimmer shape={HOOShimmerShape.Container} theme={HOOShimmerTheme.Primary} >
                <HOOShimmer
                  shape={HOOShimmerShape.Row}
                  theme={HOOShimmerTheme.Primary}
                  rootElementAttributes={{
                    style: {
                      height: '160',
                      width: '160',
                      paddingLeft: '32'
                    }
                  }}
                />
                <HOOShimmer
                  shape={HOOShimmerShape.Row}
                  theme={HOOShimmerTheme.Primary}
                  rootElementAttributes={{
                    style: {
                      height: '160',
                      width: '160',
                      paddingLeft: '32'
                    }
                  }}
                />
                <HOOShimmer
                  shape={HOOShimmerShape.Row}
                  theme={HOOShimmerTheme.Primary}
                  rootElementAttributes={{
                    style: {
                      height: '160',
                      width: '160',
                      paddingLeft: '32'
                    }
                  }}
                />
                <HOOShimmer
                  shape={HOOShimmerShape.Row}
                  theme={HOOShimmerTheme.Primary}
                  rootElementAttributes={{
                    style: {
                      height: '160',
                      width: '160',
                      paddingLeft: '32'
                    }
                  }}
                />
                <HOOShimmer
                  shape={HOOShimmerShape.Row}
                  theme={HOOShimmerTheme.Primary}
                  rootElementAttributes={{
                    style: {
                      height: '160',
                      width: '90%'
                    }
                  }}
                />
              </HOOShimmer>
            </div>
          }
          {(this.props.shimmerView === ShimmerView.ViewerSubCategory) &&
            <HOOShimmer shape={HOOShimmerShape.Container} theme={HOOShimmerTheme.Primary} >
              <HOOShimmer
                shape={HOOShimmerShape.Row}
                theme={HOOShimmerTheme.Primary}
                rootElementAttributes={{
                  style: {
                    height: '29',
                    width: '200',
                    paddingRight: '90%'
                  }
                }}
              />
              <HOOShimmer
                shape={HOOShimmerShape.Row}
                theme={HOOShimmerTheme.Primary}
                rootElementAttributes={{
                  style: {
                    height: '40',
                    width: '40',
                    paddingRight: '5'
                  }
                }}
              />
              <HOOShimmer
                shape={HOOShimmerShape.Row}
                theme={HOOShimmerTheme.Primary}
                rootElementAttributes={{
                  style: {
                    height: '40',
                    width: '40',
                    paddingRight: '5'
                  }
                }}
              />
              <HOOShimmer
                shape={HOOShimmerShape.Row}
                theme={HOOShimmerTheme.Primary}
                rootElementAttributes={{
                  style: {
                    height: '40',
                    width: '40'
                  }
                }}
              />
            </HOOShimmer>
          }
          {(this.props.shimmerView === ShimmerView.ViewerPlaylist) &&
            <HOOShimmer shape={HOOShimmerShape.Container} theme={HOOShimmerTheme.Primary} >
              <HOOShimmer
                shape={HOOShimmerShape.Row}
                theme={HOOShimmerTheme.Primary}
                rootElementAttributes={{
                  style: {
                    height: '29',
                    width: '100',
                    paddingRight: '90%'
                  }
                }}
              />
              <HOOShimmer
                shape={HOOShimmerShape.Row}
                theme={HOOShimmerTheme.Primary}
                rootElementAttributes={{
                  style: {
                    height: '40',
                    width: '40',
                    paddingRight: '5'
                  }
                }}
              />
              <HOOShimmer
                shape={HOOShimmerShape.Row}
                theme={HOOShimmerTheme.Primary}
                rootElementAttributes={{
                  style: {
                    height: '40',
                    width: '40',
                    paddingRight: '5'
                  }
                }}
              />
              <HOOShimmer
                shape={HOOShimmerShape.Row}
                theme={HOOShimmerTheme.Primary}
                rootElementAttributes={{
                  style: {
                    height: '40',
                    width: '40'
                  }
                }}
              />
            </HOOShimmer>
          }
          {(this.props.shimmerView === ShimmerView.Admin) &&
            <HOOShimmer shape={HOOShimmerShape.Container} theme={HOOShimmerTheme.Primary} >
              <HOOShimmer
                shape={HOOShimmerShape.Row}
                theme={HOOShimmerTheme.Primary}
                rootElementAttributes={{
                  style: {
                    height: '29',
                    width: '200',
                    paddingRight: '90%'
                  }
                }}
              />
              <HOOShimmer
                shape={HOOShimmerShape.Row}
                theme={HOOShimmerTheme.Primary}
                rootElementAttributes={{
                  style: {
                    height: '40',
                    width: '40',
                    paddingRight: '32'
                  }
                }}
              />
              <HOOShimmer
                shape={HOOShimmerShape.Row}
                theme={HOOShimmerTheme.Primary}
                rootElementAttributes={{
                  style: {
                    height: '40',
                    width: '200'
                  }
                }}
              />
            </HOOShimmer>
          }
          {(this.props.shimmerView === ShimmerView.Admin || this.props.shimmerView === ShimmerView.AdminCdn) &&
            <HOOShimmer shape={HOOShimmerShape.Container} theme={HOOShimmerTheme.Primary} >
              <HOOShimmer
                shape={HOOShimmerShape.Row}
                theme={HOOShimmerTheme.Primary}
                rootElementAttributes={{
                  style: {
                    height: '400',
                    width: '200',
                    paddingRight: '20'
                  }
                }}
              />
              <HOOShimmer
                shape={HOOShimmerShape.Row}
                theme={HOOShimmerTheme.Primary}
                rootElementAttributes={{
                  style: {
                    height: '400',
                    width: '90%'
                  }
                }}
              />
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