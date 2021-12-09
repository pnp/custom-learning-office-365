import * as React from "react";

import isEqual from "lodash/isEqual";
import indexOf from "lodash/indexOf";
import { Logger, LogLevel } from "@pnp/logging";
import { Dropdown, IDropdownOption, Icon } from "office-ui-fabric-react";

import styles from "../../../common/CustomLearningCommon.module.scss";
import * as strings from "M365LPStrings";
import { ButtonTypes } from "../../../common/models/Enums";
import { IAsset } from "../../../common/models/Models";
import Button from "../../../common/components/Atoms/Button";

export interface IPlaylistControlProps {
  currentAsset: IAsset;
  assets: IAsset[];
  selectAsset: (assetId: string) => void;
  renderPanel: () => void;
}

export interface IPlaylistControlState {
  assetOptions: IDropdownOption[];
  ddShow: boolean;
}

export class PlaylistControlState implements IPlaylistControlState {
  constructor(
    public assetOptions: IDropdownOption[] = [],
    public ddShow: boolean = false
  ) { }
}

export default class PlaylistControl extends React.Component<IPlaylistControlProps, IPlaylistControlState> {
  private LOG_SOURCE: string = "PlaylistControl";
  private refreshAssets: boolean = false;

  constructor(props) {
    super(props);
    this.state = new PlaylistControlState(this.getAssetOptions(props.assets));
  }

  private getAssetOptions(assets: IAsset[]): IDropdownOption[] {
    let assetOptions: IDropdownOption[] = [];
    for (let i = 0; i < assets.length; i++) {
      assetOptions.push({ key: assets[i].Id, text: assets[i].Title as string });
    }
    return assetOptions;
  }

  public shouldComponentUpdate(nextProps: Readonly<IPlaylistControlProps>, nextState: Readonly<IPlaylistControlState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    if (!isEqual(nextProps.assets, this.props.assets))
      this.refreshAssets = true;
    return true;
  }

  public componentDidUpdate() {
    if (this.refreshAssets) {
      this.refreshAssets = false;
      this.setState({ assetOptions: this.getAssetOptions(this.props.assets) });
    }
  }

  private disableAdvance = (): boolean => {
    try {
      if (!this.props.currentAsset || this.props.assets.length < 1) return true;
      return (this.props.currentAsset.Id === this.props.assets[this.props.assets.length - 1].Id);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (doDisableAdvance) - ${err}`, LogLevel.Error);
      return true;
    }
  }

  private disableBack = (): boolean => {
    try {
      if (!this.props.currentAsset || this.props.assets.length < 1) return true;
      return (this.props.currentAsset.Id === this.props.assets[0].Id);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (doDisableBack) - ${err}`, LogLevel.Error);
      return true;
    }
  }

  private playlistAdvance = (): void => {
    try {
      let currentIdx = indexOf(this.props.assets, this.props.currentAsset);
      this.props.selectAsset(this.props.assets[(currentIdx + 1)].Id);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (playlistAdvance) - ${err}`, LogLevel.Error);
    }
  }

  private playlistBack = (): void => {
    try {
      let currentIdx = indexOf(this.props.assets, this.props.currentAsset);
      this.props.selectAsset(this.props.assets[(currentIdx - 1)].Id);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (playlistBack) - ${err}`, LogLevel.Error);
    }
  }

  private selectAsset = (key: string): void => {
    this.setState({
      ddShow: false
    }, () => {
      this.props.selectAsset(key as string);
    });
  }

  public render(): React.ReactElement<IPlaylistControlProps> {
    if (!this.props.currentAsset) return null;
    try {
      return (
        <div data-component={this.LOG_SOURCE} className="playerctrl">
          <span className="playerctrl-prev">
            <Button className={styles.primaryButton} buttonType={ButtonTypes.ChevronLeft} onClick={this.playlistBack} disabled={this.disableBack()} postTextLabel={strings.PlaylistPrevious} title={strings.PlaylistPrevious} />
          </span>
          <span className="playerctrl-title">
            <div className="fuif-dd">
              <div className={`fuif-dd-title`} onClick={() => { this.setState({ ddShow: !this.state.ddShow }); }}>
                {(this.props.currentAsset) ? this.props.currentAsset.Title : null}
                <span><Icon iconName="ChevronDown" /></span>
              </div>
              <div className={`fuif-dd-opts ${(this.state.ddShow) ? "selected" : ""}`}>
                {this.state.assetOptions && this.state.assetOptions.map((o) => {
                  let selected = (o.key === this.props.currentAsset.Id) ? " selected" : "";
                  return (
                    <div className={`fuif-dd-opt${selected}`} onClick={() => this.selectAsset(o.key as string)}>{o.text}</div>
                  );
                })}
              </div>
            </div>
            <Button buttonType={ButtonTypes.FullScreen} onClick={this.props.renderPanel} disabled={false} title={strings.PlaylistFullScreen} />
          </span>
          <span className="playerctrl-next">
            <Button className={styles.primaryButton} buttonType={ButtonTypes.ChevronRight} onClick={this.playlistAdvance} disabled={this.disableAdvance()} preTextLabel={strings.PlaylistNext} title={strings.PlaylistNext} />
          </span>
        </div>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}
