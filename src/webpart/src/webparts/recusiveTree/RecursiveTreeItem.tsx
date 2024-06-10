import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash-es/isEqual";
import includes from "lodash-es/includes";
import HOOButtonCommand from "@n8d/htwoo-react/HOOButtonCommand";
import HOOCheckbox from "@n8d/htwoo-react/HOOCheckbox";

import { IRecursiveList } from "./RecursiveTree";
import styles from "./RecursiveTree.module.scss";


export interface IRecursiveTreeItemProps {
  disabled: boolean;
  level: number;
  treeItem: IRecursiveList;
  selectedKeys: string[];
  selectItem: (itemKey: string) => void;
  show: boolean;
  autoExpandChildren: boolean;
  expandParent: (expand: boolean) => void;
}

export interface IRecursiveTreeItemState {
  selected: boolean;
  expanded: boolean;
}

export class RecursiveTreeItemState implements IRecursiveTreeItemState {
  constructor(
    public selected: boolean = false,
    public expanded: boolean = false
  ) { }
}

export default class RecursiveTreeItem extends React.Component<IRecursiveTreeItemProps, IRecursiveTreeItemState> {
  private LOG_SOURCE: string = "RecursiveTreeItem";
  private _updateSelected: boolean = false;

  constructor(props) {
    super(props);
    const selected = includes(props.selectedKeys, props.treeItem.key);
    if (selected && props.autoExpandChildren)
      props.expandParent(true);
    this.state = new RecursiveTreeItemState(selected);
  }

  public shouldComponentUpdate(nextProps: Readonly<IRecursiveTreeItemProps>, nextState: Readonly<IRecursiveTreeItemState>): boolean {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    if (this.props.autoExpandChildren && this.props.treeItem.children.length < 1 && (nextProps.selectedKeys != this.props.selectedKeys)) {
      const selected = includes(nextProps.selectedKeys, this.props.treeItem.key);
      if (nextState.selected !== selected)
        this._updateSelected = true;
    }
    return true;
  }

  public componentDidUpdate(): void {
    if (this._updateSelected) {
      this._updateSelected = false;
      const selected = includes(this.props.selectedKeys, this.props.treeItem.key);
      this.expandParent(selected);
      this.setState({
        selected: selected
      });
    }
  }

  private expandGroup = (): void => {
    this.setState({
      expanded: !this.state.expanded
    });
  }

  private checkboxChange = (): void => {
    this.props.selectItem(this.props.treeItem.key);
  }

  private expandParent = (expand: boolean): void => {
    this.setState({
      expanded: expand
    });
    this.props.expandParent(expand);
  }

  public render(): React.ReactElement<IRecursiveTreeItemProps> {
    try {
      const styleLevel = styles[`level${this.props.level}`];
      return (
        <div className={`${styles.recursiveCont} ${(this.props.show) ? styles.showCont : ""} ${styleLevel}`} >
          <div>
            {this.props.treeItem.children.length > 0 &&
              <HOOButtonCommand
                flyoutMenuItems={[]}
                label={this.props.treeItem.name}
                onClick={this.expandGroup}
                leftIconName={this.state.expanded ? "icon-chevron-down-regular" : "icon-chevron-up-regular"}

              />
            }
            {this.props.treeItem.children.length < 1 &&
              <HOOCheckbox
                disabled={this.props.disabled}
                label={this.props.treeItem.name}
                onChange={this.checkboxChange}
                rootElementAttributes={{ className: styles.recursiveTerm }}
                checked={this.state.selected}
              />

            }
          </div>
          {this.props.treeItem.children && this.props.treeItem.children.length > 0 && this.props.treeItem.children.map((c, idx) => {
            return (
              <RecursiveTreeItem
                key={idx}
                level={this.props.level + 1}
                treeItem={c}
                selectedKeys={this.props.selectedKeys}
                selectItem={this.props.selectItem}
                show={this.state.expanded}
                autoExpandChildren={this.props.autoExpandChildren}
                expandParent={this.expandParent}
                disabled={this.props.disabled}
              />
            );
          })}
        </div>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}