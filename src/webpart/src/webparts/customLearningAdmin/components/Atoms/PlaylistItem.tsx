import HOOButton from "@n8d/htwoo-react/HOOButton";
import { Logger, LogLevel } from "@pnp/logging";
import * as React from "react";

import HOOIcon from "@n8d/htwoo-react/HOOIcon";
import HOOLoading from "@n8d/htwoo-react/HOOLoading";
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

export default class PlaylistItem extends React.PureComponent<IPlaylistItemProps> {
  private LOG_SOURCE: string = "PlaylistItem";

  constructor(props) {
    super(props);
  }

  public render(): React.ReactElement<IPlaylistItemProps> {
    try {
      // Setting title for aria-label and title
      const title = this.props.playlistTitle + (this.props.playlistEditable ? " - Custom Playlist" : "");

      return (
        <div data-component={this.LOG_SOURCE} className="pl-edit-item" title={title} aria-title={title}>
          {this.props.playlistEditable &&
            <HOOIcon
              iconName="icon-person-available-regular"
              title="Custom"
            // rootElementAttributes={{
            //   className: 'pl-edit-icon'
            // }}
            />

          }
          <span className="pl-edit-title" onClick={this.props.onClick}>{this.props.playlistTitle}</span>
          <div className='fullWidth'>
            <HOOLoading maxValue={100}
              minValue={0}
              value={20} /></div>
          <menu className="pl-edit-actions" role="toolbar">
            {this.props.playlistEditable &&
              <li>
                <HOOButton
                  iconName="icon-delete-regular"
                  onClick={this.props.onDelete}
                  type={0}
                  iconTitle={strings.PlaylistItemPlaylistDelete}

                />
              </li>
            }
            {!this.props.playlistEditable &&
              <li>
                <HOOButton
                  iconName={(this.props.playlistVisible) ? "icon-eye-filled" : "icon-eye-off-filled"}
                  onClick={() => { this.props.onVisible(this.props.playlistId, this.props.playlistVisible); }}
                  iconTitle={`${(this.props.playlistVisible) ? strings.Hide : strings.Show} ${strings.PlaylistItemPlaylistHeadingLabel}`}
                  type={0}
                />
              </li>
            }
          </menu>
        </div>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}
