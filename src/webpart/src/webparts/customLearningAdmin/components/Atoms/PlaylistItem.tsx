import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash/isEqual";
import Button from "../../../common/components/Atoms/Button";
import { ButtonTypes } from "../../../common/models/Enums";
import * as strings from "M365LPStrings";

export interface IPlaylistItemProps {
  playlistId: string;
  playlistTitle: string;
  playlistVisible: boolean;
  playlistEditable: boolean;
  onVisible: (playlistId: string, exists: boolean) => void;
  onEdit: () => void;
  onClick: () => void;
  onMoveDown: () => void;
  onMoveUp: () => void;
  onDelete: () => void;
}

export interface IPlaylistItemState {
}

export class PlaylistItemState implements IPlaylistItemState {
  constructor() { }
}

export default class PlaylistItem extends React.Component<IPlaylistItemProps, IPlaylistItemState> {
  private LOG_SOURCE: string = "PlaylistItem";

  constructor(props) {
    super(props);
    this.state = new PlaylistItemState();
  }

  public shouldComponentUpdate(nextProps: Readonly<IPlaylistItemProps>, nextState: Readonly<IPlaylistItemState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<IPlaylistItemProps> {
    try {
      // Setting title for aria-label and title
      let title = this.props.playlistTitle + (this.props.playlistEditable ? " - Custom Playlist" : "");

      return (
        <div data-component={this.LOG_SOURCE} className="pl-edit-item" title={title} aria-title={title}>
          {this.props.playlistEditable &&
            <img className="pl-edit-icon" alt="" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4OC43MiA5NS41OCI+PGRlZnM+PHN0eWxlPi5he2ZpbGw6IzFkMWQxYjt9PC9zdHlsZT48L2RlZnM+PHRpdGxlPmN1c3RvbS1wbGF5bGlzdDwvdGl0bGU+PHBhdGggY2xhc3M9ImEiIGQ9Ik02OC40Niw3MS4xN2EzMy42NCwzMy42NCwwLDAsMC0xMi4wOC04LjU2LDM3LjQ3LDM3LjQ3LDAsMCwwLTE0LjU2LTIuODcsMzYuMTUsMzYuMTUsMCwwLDAtMTguMjMsNC44M0EzNS4wOSwzNS4wOSwwLDAsMCwxMC44LDc3LjM1LDM2LjE1LDM2LjE1LDAsMCwwLDYsOTUuNThIMEE0Mi41MSw0Mi41MSwwLDAsMSwxLjk0LDgyLjc1LDQxLjY3LDQxLjY3LDAsMCwxLDcuNDcsNzEuNGE0MC41NSw0MC41NSwwLDAsMSw4LjctOS4xLDQxLjcsNDEuNywwLDAsMSwxMS40MS02LjE2LDI5LjE5LDI5LjE5LDAsMCwxLTYuNTMtNC43NkEyOS42NSwyOS42NSwwLDAsMSwxMiwyOS44N2EyOS4xNywyOS4xNywwLDAsMSwyLjMzLTExLjY1QTI5Ljg5LDI5Ljg5LDAsMCwxLDMwLjE3LDIuMzNhMzAuMjcsMzAuMjcsMCwwLDEsMjMuMjksMEEyOS44OSwyOS44OSwwLDAsMSw2OS4zNSwxOC4yMmEyOS4xNywyOS4xNywwLDAsMSwyLjMzLDExLjY1LDI5LjQyLDI5LjQyLDAsMCwxLTEuMDksOCwzMC4zOCwzMC4zOCwwLDAsMS0zLjEzLDcuMjgsMjkuNTgsMjkuNTgsMCwwLDEtNC45Miw2LjJBMjksMjksMCwwLDEsNTYsNTYuMTRhNDAuNzMsNDAuNzMsMCwwLDEsOSw0LjQ2LDQxLjY1LDQxLjY1LDAsMCwxLDcuNjEsNi40NlpNMTcuOTIsMjkuODdhMjMsMjMsMCwwLDAsMS44OSw5LjI5QTI0LjE1LDI0LjE1LDAsMCwwLDMyLjUzLDUxLjg3YTIzLjc1LDIzLjc1LDAsMCwwLDE4LjU3LDBBMjQuMTUsMjQuMTUsMCwwLDAsNjMuODIsMzkuMTZhMjMsMjMsMCwwLDAsMS44OS05LjI5LDIzLDIzLDAsMCwwLTEuODktOS4yOUEyNC4yMSwyNC4yMSwwLDAsMCw1MS4xLDcuODZhMjMuNzUsMjMuNzUsMCwwLDAtMTguNTcsMEEyNC4yMSwyNC4yMSwwLDAsMCwxOS44MSwyMC41OCwyMywyMywwLDAsMCwxNy45MiwyOS44N1ptNzAuOCwzNy45NC0yNiwyNkw1MC4xNyw4MS4yNWw0LjItNC4yLDguMzUsOC4zMSwyMS44LTIxLjc1WiIvPjwvc3ZnPg==" />
          }
          <span className="pl-edit-title" onClick={this.props.onClick}>{this.props.playlistTitle}</span>
          <span className="pl-edit-actions">
            {this.props.playlistEditable &&
              <Button title={strings.PlaylistItemPlaylistDelete} buttonType={ButtonTypes.Delete} onClick={this.props.onDelete} disabled={false} />
            }
            {!this.props.playlistEditable &&
              <Button title={`${(this.props.playlistVisible) ? strings.Hide : strings.Show} ${strings.PlaylistItemPlaylistHeadingLabel}`} buttonType={(this.props.playlistVisible) ? ButtonTypes.Show : ButtonTypes.Hide} onClick={() => { this.props.onVisible(this.props.playlistId, this.props.playlistVisible); }} disabled={false} />
            }
          </span>
        </div>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}
