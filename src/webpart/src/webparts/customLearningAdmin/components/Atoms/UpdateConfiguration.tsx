import * as React from "react";
import { Logger, LogLevel, ILogEntry, FunctionListener, ConsoleListener } from "@pnp/logging";

import cloneDeep from "lodash-es/cloneDeep";
import countBy from "lodash-es/countBy";

import * as strings from "M365LPStrings";
import styles from "../../../common/CustomLearningCommon.module.scss";
import { params } from "../../../common/services/Parameters";
import { ICustomDataService, CustomDataService } from "../../../common/services/CustomDataService";
import { ICacheConfig } from "../../../common/models/Models";
import { IDataService } from "../../../common/services/DataService";
import HOOButton from "@n8d/htwoo-react/HOOButton";
import HOOIcon from "@n8d/htwoo-react/HOOIcon";
import HOOLabel from "@n8d/htwoo-react/HOOLabel";
import HOODialog from "@n8d/htwoo-react/HOODialog";
import HOODialogContent from "@n8d/htwoo-react/HOODialogContent";
import HOODialogActions from "@n8d/htwoo-react/HOODialogActions";

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

export default class UpdateConfiguration extends React.PureComponent<IUpdateConfigurationProps, IUpdateConfigurationState> {
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

  public componentWillUnmount(): void {
    Logger.clearSubscribers();
    Logger.subscribe(ConsoleListener());
    Logger.activeLogLevel = LogLevel.Info;
  }

  private logMessage = FunctionListener((entry: ILogEntry) => {
    const messages = cloneDeep(this.state.messages);
    const messageCount = countBy(messages, "level");
    const errors = messageCount["3"] ? messageCount["3"] : 0;
    messages.push(entry);
    this.setState({
      messages: messages,
      errors: errors
    });
  });

  private buttonClick = async (): Promise<void> => {
    if (this.state.state === 1) {
      this.setState({
        state: 2
      });
      const m = await this.props.dataService.getMetadata();
      this._customDataService.doDataUpgrade(this.props.dataService, this.props.startVersion, this.props.cache, m, this.complete);
    } else if (this.state.state === 3) {
      window.location.href = window.location.origin + window.location.pathname;
    }
  }

  private complete = (): void => {
    this.setState({
      state: 3
    });
  }

  public render(): React.ReactElement<IUpdateConfigurationProps> {
    try {
      const supportUrl = `${params.updateInstructionUrl.substring(0, params.updateInstructionUrl.indexOf("#"))}/issues`;
      return (
        <div data-component={this.LOG_SOURCE} className={`${styles.customLearning} updateConfiguration ${(params.appPartPage) ? styles.appPartPage : ""}`}>
          <h1>{this.props.cdn}</h1>
          <h2>{`${strings.DataUpgradeTitle} ${this.props.startVersion.toLowerCase()} -> ${this.endVersion.toLowerCase()}`}</h2>
          {this.state.state === 1 &&
            <HOOLabel label={strings.DataUpgradeIntro} />
          }
          {this.state.state === 2 &&
            <HOODialog
              changeVisibility={function noRefCheck() { }}
              type={1}
              visible
            >
              <HOODialogContent>
                {strings.DataUpgradeIssue} <a href={supportUrl} rel="noreferrer" target="_blank">{strings.DataUpgradeIssueLink}</a>
              </HOODialogContent>
            </HOODialog>

          }
          {this.state.state === 3 &&
            <HOODialog
              changeVisibility={function noRefCheck() { }}
              type={2}
              visible
            >
              <HOODialogContent>
                {strings.DataUpgradeComplete}
              </HOODialogContent>
              <HOODialogActions>
                <HOOButton
                  iconName="hoo-icon-close"
                  onClick={this.buttonClick}
                  type={0}
                />
              </HOODialogActions>
            </HOODialog>

          }
          {this.state.state === 1 &&
            <div>
              <HOOButton
                label={(this.state.state === 1) ? strings.DataUpgradeStart : strings.DataUpgradeClose}
                onClick={this.buttonClick}
                type={1}
              />
            </div>
          }
          {this.state.errors > 0 &&
            <HOOLabel label={`${strings.DataUpgradeErrors}: ${this.state.errors}`} />
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
                {this.state.messages && this.state.messages.length > 0 && this.state.messages.map((m: ILogEntry, idx) => {
                  return (
                    <tr key={idx}>
                      <td><HOOIcon
                        iconName={(m.level === 2) ? "icon-info-regular" : "icon-error-circle-regular"}
                        rootElementAttributes={{ className: (m.level === 2 ? styles.info : styles.error) }}
                      /></td>
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