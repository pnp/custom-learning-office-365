import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash/isEqual";

import styles from "./RecursiveTree.module.scss";
import RecursiveTreeItem from "./RecursiveTreeItem";
import { Label } from "office-ui-fabric-react";

export interface IRecursiveList {
  key: string;
  name: string;
  children: IRecursiveList[];
}

export class RecursiveList implements IRecursiveList {
  constructor(
    public key: string = "",
    public name: string = "",
    public children: IRecursiveList[] = []
  ) { }
}

export interface IRecursiveTreeProps {
  label: string;
  noDataMessage: string;
  autoExpandChildren: boolean;
  required: boolean;
  treeItems: IRecursiveList[];
  selectedKeys: string[];
  disabled: boolean;
  errorMessage: string;
  selectItem: (itemKey: string) => void;
}

export interface IRecursiveTreeState {
}

export class RecursiveTreeState implements IRecursiveTreeState {
  constructor() { }
}

export default class RecursiveTree extends React.Component<IRecursiveTreeProps, IRecursiveTreeState> {
  private LOG_SOURCE: string = "RecursiveTree";

  constructor(props) {
    super(props);
    this.state = new RecursiveTreeState();
  }

  public shouldComponentUpdate(nextProps: Readonly<IRecursiveTreeProps>, nextState: Readonly<IRecursiveTreeState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<IRecursiveTreeProps> {
    try {
      return (
        <>
          <Label className={(this.props.disabled ? styles.disabled : "")}>{this.props.label}
            {this.props.required &&
              <span className={styles.recursiveTreeRequired}>*</span>
            }
          </Label>
          <div className={`${styles.recursiveTree} ${(this.props.errorMessage.length > 0 ? styles.error : "")} ${(this.props.disabled ? styles.disabled : "")}`}>
            {this.props.treeItems && this.props.treeItems.length > 0 && this.props.treeItems.map((t) => {
              return (<RecursiveTreeItem
                level={0}
                treeItem={t}
                selectedKeys={this.props.selectedKeys}
                selectItem={this.props.selectItem}
                show={true}
                autoExpandChildren={this.props.autoExpandChildren}
                expandParent={() => { }}
                disabled={this.props.disabled}
              />);
            })}
            {this.props.treeItems && this.props.treeItems.length < 1 &&
              <span>{this.props.noDataMessage}</span>
            }
          </div>
          {this.props.errorMessage && this.props.errorMessage.length > 0 &&
            <span className={styles.recursiveError}>{this.props.errorMessage}</span>
          }
        </>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}