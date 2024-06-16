import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash-es/isEqual";
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

export interface IAssetDetailsCommandsState {
}

export class AssetDetailsCommandsState implements IAssetDetailsCommandsState {
  constructor() { }
}

export default class AssetDetailsCommands extends React.Component<IAssetDetailsCommandsProps, IAssetDetailsCommandsState> {
  private LOG_SOURCE: string = "AssetDetailsCommands";

  constructor(props) {
    super(props);
    this.state = new AssetDetailsCommandsState();
  }

  public shouldComponentUpdate(nextProps: Readonly<IAssetDetailsCommandsProps>, nextState: Readonly<IAssetDetailsCommandsState>): boolean {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<IAssetDetailsCommandsProps> {
    try {
      return (
        <div className="pl-edit-item">
          {!this.props.editDisabled &&
            <HOOIcon
              iconName="icon-person-available-regular"
            />
          }
          <span className="pl-edit-title" onClick={this.props.select}>{this.props.assetTitle}</span>
          <menu className="pl-edit-actions" role="toolbar">
            <li>
              <HOOButton
                type={0}
                iconName="icon-chevron-up-regular"
                iconTitle={strings.MoveUpButton}
                disabled={(this.props.assetIndex === 0)}
                onClick={() => this.props.moveUp()}
                reactKey={'moveUp'} />
            </li>
            <li>
              <HOOButton
                iconName="icon-chevron-down-regular"
                reactKey='moveDown'
                iconTitle={strings.MoveDownButton}
                disabled={(this.props.assetIndex === this.props.assetTotal)}
                type={0}
                onClick={() => this.props.moveDown()}
              />
            </li>
            <li>
              <HOOButton
                iconName="icon-delete-regular"
                reactKey='remove'
                iconTitle={strings.PlaylistRemove}
                type={0}
                onClick={() => this.props.remove()}
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
              />
            </li>
          </menu>
        </div>

      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}