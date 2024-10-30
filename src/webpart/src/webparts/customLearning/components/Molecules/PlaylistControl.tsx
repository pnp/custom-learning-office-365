import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash-es/isEqual";
import indexOf from "lodash-es/indexOf";
import HOOButton, { HOOButtonType } from "@n8d/htwoo-react/HOOButton";
import { IHOODropDownItem } from "@n8d/htwoo-react";
import HOODropDown from "@n8d/htwoo-react/HOODropDown";

import * as strings from "M365LPStrings";
import { IAsset } from "../../../common/models/Models";

export interface IPlaylistControlProps {
  currentAsset: IAsset;
  assets: IAsset[];
  selectAsset: (assetId: string) => void;
  renderPanel: () => void;
}

export interface IPlaylistControlState {
  assetOptions: IHOODropDownItem[];
  ddShow: boolean;
  showFullScreen: boolean;
}

export class PlaylistControlState implements IPlaylistControlState {
  constructor(
    public assetOptions: IHOODropDownItem[] = [],
    public ddShow: boolean = false,
    public showFullScreen = false
  ) { }
}

export default class PlaylistControl extends React.Component<IPlaylistControlProps, IPlaylistControlState> {
  private LOG_SOURCE: string = "PlaylistControl";
  private refreshAssets: boolean = false;

  constructor(props) {
    super(props);
    this.state = new PlaylistControlState(this.getAssetOptions(props.assets));
  }

  private getAssetOptions(assets: IAsset[]): IHOODropDownItem[] {
    const assetOptions: IHOODropDownItem[] = [];
    for (let i = 0; i < assets.length; i++) {
      assetOptions.push({ key: assets[i].Id.toString(), text: assets[i].Title as string, disabled: false });
    }
    return assetOptions;
  }

  public shouldComponentUpdate(nextProps: Readonly<IPlaylistControlProps>, nextState: Readonly<IPlaylistControlState>): boolean {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    if (!isEqual(nextProps.assets, this.props.assets))
      this.refreshAssets = true;
    return true;
  }

  public componentDidUpdate(): void {
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
      const currentIdx = indexOf(this.props.assets, this.props.currentAsset);
      this.props.selectAsset(this.props.assets[(currentIdx + 1)].Id);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (playlistAdvance) - ${err}`, LogLevel.Error);
    }
  }

  private playlistBack = (): void => {
    try {
      const currentIdx = indexOf(this.props.assets, this.props.currentAsset);
      this.props.selectAsset(this.props.assets[(currentIdx - 1)].Id);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (playlistBack) - ${err}`, LogLevel.Error);
    }
  }

  private selectAsset = (key: string): void => {
    this.setState({
      ddShow: false
    }, () => {
      this.props.selectAsset(key.toString());
    });
  }

  public render(): React.ReactElement<IPlaylistControlProps> {
    if (!this.props.currentAsset) return null;
    try {
      return (
        <div data-component={this.LOG_SOURCE} className="playerwrapper">
          <div className="playerctrl">
            <div className="playerctrl-prev">
              <HOOButton type={HOOButtonType.Primary} iconName="icon-chevron-left-regular" onClick={this.playlistBack} disabled={this.disableBack()} label={strings.PlaylistPrevious} iconTitle={strings.PlaylistPrevious} />
            </div>
            <span className="playerctrl-title">
              <HOODropDown
                value={this.props.currentAsset.Id}
                options={this.state.assetOptions}
                onChange={this.selectAsset} />
              {console.log(this.state.assetOptions)}
              <HOOButton
                type={HOOButtonType.Icon}
                iconName="icon-full-screen-maximize-filled"
                iconTitle={strings.PlaylistFullScreen}
                onClick={this.props.renderPanel} />
            </span>
            <div className="playerctrl-next">
              <HOOButton type={HOOButtonType.Primary} iconRight="icon-chevron-right-regular" onClick={this.playlistAdvance} disabled={this.disableAdvance()} label={strings.PlaylistNext} iconTitle={strings.PlaylistNext} />
            </div>
          </div>
          {/* <div>
            <HOODialog
              changeVisibility={function noRefCheck() { }}
              type={8} visible={this.state.showFullScreen}            >
              <HOODialogHeader
                closeIconName="hoo-icon-close"
                closeOnClick={() => this.setState({ showFullScreen: false })}
                title="Dialog Header" closeDisabled={false} />
              <HOODialogContent>
                <div className="playerctrl">
                  <div className="playerctrl-prev">
                    <HOOButton type={HOOButtonType.Primary} iconName="icon-chevron-left-regular" onClick={this.playlistBack} disabled={this.disableBack()} label={strings.PlaylistPrevious} iconTitle={strings.PlaylistPrevious} />
                  </div>
                  <span className="playerctrl-title">
                    <HOODropDown
                      onChange={this.selectAsset}
                      value={this.props.currentAsset.Id}
                      options={this.state.assetOptions}
                      containsTypeAhead={false}
                    />
                    <HOOButton
                      type={HOOButtonType.Icon}
                      iconName="icon-full-screen-maximize-filled"
                      iconTitle={strings.PlaylistFullScreen}
                      onClick={() => this.setState({ showFullScreen: true })} />
                  </span>
                  <div className="playerctrl-next">
                    <HOOButton type={HOOButtonType.Primary} iconRight="icon-chevron-right-regular" onClick={this.playlistAdvance} disabled={this.disableAdvance()} label={strings.PlaylistNext} iconTitle={strings.PlaylistNext} />
                  </div>
                </div>
              </HOODialogContent>
            </HOODialog>
          </div> */}
        </div>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}
