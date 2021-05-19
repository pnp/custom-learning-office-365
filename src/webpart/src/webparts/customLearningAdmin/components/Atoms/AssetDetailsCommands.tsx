import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash/isEqual";
import { IAsset, IMultilingualString } from "../../../common/models/Models";
import { CommandBar, IContextualMenuItem } from "office-ui-fabric-react";

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

  public shouldComponentUpdate(nextProps: Readonly<IAssetDetailsCommandsProps>, nextState: Readonly<IAssetDetailsCommandsState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private getAssetCommandFarItems = (): IContextualMenuItem[] => {
    let retVal: IContextualMenuItem[] = [];
    try {
      if (!this.props.allDisabled) {
        retVal.push({
          key: 'moveUp',
          name: strings.MoveUpButton,
          iconOnly: true,
          iconProps: {
            iconName: 'ChevronUp'
          },
          disabled: (this.props.assetIndex === 0),
          onClick: () => this.props.moveUp()
        });
        retVal.push({
          key: 'moveDown',
          name: strings.MoveDownButton,
          iconOnly: true,
          iconProps: {
            iconName: 'ChevronDown'
          },
          disabled: (this.props.assetIndex === this.props.assetTotal),
          onClick: () => this.props.moveDown()
        });
        retVal.push({
          key: 'remove',
          name: strings.PlaylistRemove,
          iconOnly: true,
          iconProps: {
            iconName: 'Delete'
          },
          onClick: () => this.props.remove()
        });
        retVal.push({
          key: 'edit',
          name: strings.EditButton,
          iconOnly: true,
          iconProps: {
            iconName: 'Edit'
          },
          disabled: (this.props.editDisabled),
          onClick: () => this.props.edit()
        });
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (getAssetCommandFarItems) - ${err}`, LogLevel.Error);
    }
    return retVal;
  }

  public render(): React.ReactElement<IAssetDetailsCommandsProps> {
    try {
      let iconName = (this.props.editDisabled) ? "" : "UserFollowed";
      return (
        <CommandBar
          data-component={this.LOG_SOURCE}
          items={[{
            key: 'title',
            iconProps: { iconName: iconName },
            name: this.props.assetTitle,
            onClick: () => this.props.select()
          }]}
          farItems={this.getAssetCommandFarItems()}
        />
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}