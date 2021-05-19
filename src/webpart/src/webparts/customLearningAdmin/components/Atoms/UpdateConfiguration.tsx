import * as React from "react";
import { Logger, LogLevel, ILogEntry, FunctionListener, ConsoleListener } from "@pnp/logging";
import { sp } from "@pnp/sp";

import isEqual from "lodash/isEqual";
import cloneDeep from "lodash/cloneDeep";
import countBy from "lodash/countBy";
import { Label, Link, PrimaryButton, Icon } from "office-ui-fabric-react";

import * as strings from "M365LPStrings";
import styles from "../../../common/CustomLearningCommon.module.scss";
import { params } from "../../../common/services/Parameters";
import { ICustomDataService, CustomDataService } from "../../../common/services/CustomDataService";
import { ICacheConfig } from "../../../common/models/Models";
import { IDataService } from "../../../common/services/DataService";

export interface IUpdateConfigurationProps {
  cdn: string;
  startVersion: string;
  cache: ICacheConfig;
  dataService: IDataService;
}

export interface IUpdateConfigurationState {
  state: number;
  messages: ILogEntry[];
  errors: number;
}

export class UpdateConfigurationState implements IUpdateConfigurationState {
  constructor(
    public state: number = 1,
    public messages: ILogEntry[] = [],
    public errors: number = 0
  ) { }
}

export default class UpdateConfiguration extends React.Component<IUpdateConfigurationProps, IUpdateConfigurationState> {
  private LOG_SOURCE: string = "UpdateConfiguration";
  private endVersion: string = "";
  private _customDataService: ICustomDataService;

  constructor(props) {
    super(props);
    this.endVersion = params.manifestVersion;
    this._customDataService = new CustomDataService(props.cdn);
    this.state = new UpdateConfigurationState();
    Logger.clearSubscribers();
    Logger.subscribe(this.logMessage);
    Logger.activeLogLevel = LogLevel.Warning;
  }

  public shouldComponentUpdate(nextProps: Readonly<IUpdateConfigurationProps>, nextState: Readonly<IUpdateConfigurationState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public componentWillUnmount() {
    Logger.clearSubscribers();
    Logger.subscribe(new ConsoleListener());
    Logger.activeLogLevel = LogLevel.Info;
  }

  private logMessage = new FunctionListener((entry: ILogEntry) => {
    let messages = cloneDeep(this.state.messages);
    let messageCount = countBy(messages, "level");
    let errors = messageCount["3"] ? messageCount["3"] : 0;
    messages.push(entry);
    this.setState({
      messages: messages,
      errors: errors
    });
  });

  private buttonClick = async () => {
    if (this.state.state === 1) {
      this.setState({
        state: 2
      });
      let m = await this.props.dataService.getMetadata();
      this._customDataService.doDataUpgrade(this.props.dataService, this.props.startVersion, this.props.cache, m, this.complete);
    } else if (this.state.state === 3) {
      window.location.href = window.location.origin + window.location.pathname;
    }
  }

  private complete = () => {
    this.setState({
      state: 3
    });
  }

  public render(): React.ReactElement<IUpdateConfigurationProps> {
    try {
      let supportUrl = `${params.updateInstructionUrl.substring(0, params.updateInstructionUrl.indexOf("#"))}/issues`;
      return (
        <div data-component={this.LOG_SOURCE} className={`${styles.customLearning} ${(params.appPartPage) ? styles.appPartPage : ""}`}>
          <h1>{this.props.cdn}</h1>
          <h2>{`${strings.DataUpgradeTitle} ${this.props.startVersion.toLowerCase()} -> ${this.endVersion.toLowerCase()}`}</h2>
          {this.state.state === 1 &&
            <Label>{strings.DataUpgradeIntro}</Label>
          }
          {this.state.state !== 1 &&
            <Label>{strings.DataUpgradeIssue}<Link target="_blank" href={supportUrl}>{strings.DataUpgradeIssueLink}</Link></Label>
          }
          {this.state.state === 3 &&
            <Label>{strings.DataUpgradeComplete}</Label>
          }
          {this.state.state !== 2 &&
            <PrimaryButton onClick={this.buttonClick}>{(this.state.state === 1) ? strings.DataUpgradeStart : strings.DataUpgradeClose}</PrimaryButton>
          }
          {this.state.errors > 0 &&
            <Label>{strings.DataUpgradeErrors}: {this.state.errors}</Label>
          }
          {this.state.state !== 1 &&
            <>
              <h2>{strings.DataUpgradeLog}</h2>
              <table className="upgrade-info">
                <thead>
                  <tr>
                    <th>{strings.LogLevel}</th>
                    <th>{strings.LogMessage}</th>
                  </tr>
                </thead>
                {this.state.messages && this.state.messages.length > 0 && this.state.messages.map((m: ILogEntry) => {
                  return (
                    <tr>
                      <td><Icon iconName={(m.level === 2) ? "Info" : "Error"} className={(m.level === 2 ? styles.info : styles.error)} /></td>
                      <td>{m.message}</td>
                    </tr>
                  );
                })
                }
              </table>
            </>
          }
        </div>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}