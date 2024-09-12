import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import HOOButton from "@n8d/htwoo-react/HOOButton";
import HOOIcon from "@n8d/htwoo-react/HOOIcon";

import * as strings from "M365LPStrings";


export interface IAssetDetailsCommandsProps {
  assetIndex: number;
  assetTotal: number;
  assetTitle: string;
  editDisabled: boolean;
  allDisabled: boolean;
  edit: () => void;
  moveUp: () => void;
  moveDown: () => void;
  remove: () => void;
  select: () => void;
}

export default class AssetDetailsCommands extends React.PureComponent<IAssetDetailsCommandsProps> {
  private LOG_SOURCE: string = "AssetDetailsCommands";

  constructor(props) {
    super(props);
  }

  public render(): React.ReactElement<IAssetDetailsCommandsProps> {
    try {
      return (
        <div className="pl-edit-item">
          {!this.props.editDisabled &&
            <HOOIcon
              iconName="icon-person-available-regular"
              rootElementAttributes={{ "aria-label": strings.AssetDetailsManageHeader }}
            />
          }
          <span className="pl-edit-title" onClick={this.props.select}>{this.props.assetTitle}</span>
          {!this.props.allDisabled &&
            <menu className="pl-edit-actions" role="toolbar">
              <li>
                <HOOButton
                  type={0}
                  iconName="icon-chevron-up-regular"
                  iconTitle={strings.MoveUpButton}
                  disabled={(this.props.assetIndex === 0)}
                  onClick={() => this.props.moveUp()}
                  reactKey={'moveUp'}
                  rootElementAttributes={{ "aria-label": strings.MoveUpButton }} />
              </li>
              <li>
                <HOOButton
                  iconName="icon-chevron-down-regular"
                  reactKey='moveDown'
                  iconTitle={strings.MoveDownButton}
                  disabled={(this.props.assetIndex === this.props.assetTotal)}
                  type={0}
                  onClick={() => this.props.moveDown()}
                  rootElementAttributes={{ "aria-label": strings.MoveDownButton }}
                />
              </li>
              <li>
                <HOOButton
                  iconName="icon-delete-regular"
                  reactKey='remove'
                  iconTitle={strings.PlaylistRemove}
                  type={0}
                  onClick={() => this.props.remove()}
                  rootElementAttributes={{ "aria-label": strings.DeleteButton }}
                />
              </li>
              <li>
                <HOOButton
                  iconName="icon-pen-regular"
                  reactKey='edit'
                  iconTitle={strings.EditButton}
                  type={0}
                  disabled={this.props.editDisabled}
                  onClick={() => this.props.edit()}
                  rootElementAttributes={{ "aria-label": strings.EditButton }}
                />
              </li>
            </menu>
          }
        </div>

      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}