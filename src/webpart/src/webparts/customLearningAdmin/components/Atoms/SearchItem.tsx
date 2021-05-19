import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash/isEqual";

import { Checkbox } from "office-ui-fabric-react";

export interface ISearchItemProps {
  assetTitle: string;
  checked: boolean;
  technologyName: string;
  subjectName: string;
  editable: boolean;
  onChecked: (ev?: React.FormEvent<HTMLElement | HTMLInputElement>, chk?: boolean) => void;
  onPreviewAsset: () => void;
}

export interface ISearchItemState {
}

export class SearchItemState implements ISearchItemState {
  constructor() { }
}

export default class SearchItem extends React.Component<ISearchItemProps, ISearchItemState> {
  private LOG_SOURCE: string = "SearchItem";

  constructor(props) {
    super(props);
    this.state = new SearchItemState();
  }

  public shouldComponentUpdate(nextProps: Readonly<ISearchItemProps>, nextState: Readonly<ISearchItemState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<ISearchItemProps> {
    try {
      return (
        <div className="srchr-item" data-component={this.LOG_SOURCE}>
          <div className="srchr-cb">
            <Checkbox onChange={this.props.onChecked} checked={this.props.checked} />
          </div>
          <div className="srchr-desc">
            <h3 className="srchr-title" onClick={this.props.onPreviewAsset}>
              {this.props.editable &&
                <img className="pl-edit-icon" alt="" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4OC43MiA5NS41OCI+PGRlZnM+PHN0eWxlPi5he2ZpbGw6IzFkMWQxYjt9PC9zdHlsZT48L2RlZnM+PHRpdGxlPmN1c3RvbS1wbGF5bGlzdDwvdGl0bGU+PHBhdGggY2xhc3M9ImEiIGQ9Ik02OC40Niw3MS4xN2EzMy42NCwzMy42NCwwLDAsMC0xMi4wOC04LjU2LDM3LjQ3LDM3LjQ3LDAsMCwwLTE0LjU2LTIuODcsMzYuMTUsMzYuMTUsMCwwLDAtMTguMjMsNC44M0EzNS4wOSwzNS4wOSwwLDAsMCwxMC44LDc3LjM1LDM2LjE1LDM2LjE1LDAsMCwwLDYsOTUuNThIMEE0Mi41MSw0Mi41MSwwLDAsMSwxLjk0LDgyLjc1LDQxLjY3LDQxLjY3LDAsMCwxLDcuNDcsNzEuNGE0MC41NSw0MC41NSwwLDAsMSw4LjctOS4xLDQxLjcsNDEuNywwLDAsMSwxMS40MS02LjE2LDI5LjE5LDI5LjE5LDAsMCwxLTYuNTMtNC43NkEyOS42NSwyOS42NSwwLDAsMSwxMiwyOS44N2EyOS4xNywyOS4xNywwLDAsMSwyLjMzLTExLjY1QTI5Ljg5LDI5Ljg5LDAsMCwxLDMwLjE3LDIuMzNhMzAuMjcsMzAuMjcsMCwwLDEsMjMuMjksMEEyOS44OSwyOS44OSwwLDAsMSw2OS4zNSwxOC4yMmEyOS4xNywyOS4xNywwLDAsMSwyLjMzLDExLjY1LDI5LjQyLDI5LjQyLDAsMCwxLTEuMDksOCwzMC4zOCwzMC4zOCwwLDAsMS0zLjEzLDcuMjgsMjkuNTgsMjkuNTgsMCwwLDEtNC45Miw2LjJBMjksMjksMCwwLDEsNTYsNTYuMTRhNDAuNzMsNDAuNzMsMCwwLDEsOSw0LjQ2LDQxLjY1LDQxLjY1LDAsMCwxLDcuNjEsNi40NlpNMTcuOTIsMjkuODdhMjMsMjMsMCwwLDAsMS44OSw5LjI5QTI0LjE1LDI0LjE1LDAsMCwwLDMyLjUzLDUxLjg3YTIzLjc1LDIzLjc1LDAsMCwwLDE4LjU3LDBBMjQuMTUsMjQuMTUsMCwwLDAsNjMuODIsMzkuMTZhMjMsMjMsMCwwLDAsMS44OS05LjI5LDIzLDIzLDAsMCwwLTEuODktOS4yOUEyNC4yMSwyNC4yMSwwLDAsMCw1MS4xLDcuODZhMjMuNzUsMjMuNzUsMCwwLDAtMTguNTcsMEEyNC4yMSwyNC4yMSwwLDAsMCwxOS44MSwyMC41OCwyMywyMywwLDAsMCwxNy45MiwyOS44N1ptNzAuOCwzNy45NC0yNiwyNkw1MC4xNyw4MS4yNWw0LjItNC4yLDguMzUsOC4zMSwyMS44LTIxLjc1WiIvPjwvc3ZnPg==" />
              }
              {this.props.assetTitle}
            </h3>
            <div className="srchr-category"><b>Technology: </b>{this.props.technologyName}</div>
            {this.props.subjectName &&
              <div className="srchr-meta">
                <label className="srchr-metalabel">Subject:</label>
                <span>{this.props.subjectName}</span>
              </div>
            }
          </div>
        </div>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}