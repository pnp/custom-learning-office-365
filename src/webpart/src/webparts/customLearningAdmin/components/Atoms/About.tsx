import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash/isEqual";
import forEach from "lodash/forEach";
import { Label, Icon, TextField, arraysEqual } from "office-ui-fabric-react";

import * as strings from "M365LPStrings";
import { params } from "../../../common/services/Parameters";

export interface IAboutProps {
  close: () => void;
}

export interface IAboutState {
}

export class AboutState implements IAboutState {
  constructor() { }
}

export default class About extends React.Component<IAboutProps, IAboutState> {
  private LOG_SOURCE: string = "About";
  private _allCdn: string[] = [];
  private _configuredLanguages: string[] = [];

  constructor(props) {
    super(props);
    this.state = new AboutState();

    forEach(params.allCdn, (cdn) => {
      this._allCdn.push(cdn.Name);
    });

    forEach(params.configuredLanguages, (cl) => {
      this._configuredLanguages.push(cl.description);
    });
  }

  public shouldComponentUpdate(nextProps: Readonly<IAboutProps>, nextState: Readonly<IAboutState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  public render(): React.ReactElement<IAboutProps> {
    try {
      let defaultLanguageValue = `${params.defaultLanguage}${(params.defaultLanguage !== params.webLanguage) ? ` (${params.webLanguage})` : ""}`;
      let allCdn = (this._allCdn instanceof Array) ? this._allCdn.join(", ") : "";
      let multilingualLanguages = (params.multilingualLanguages instanceof Array) ? params.multilingualLanguages.join(", ") : "";
      let supportedLanguages = (params.supportedLanguages instanceof Array) ? params.supportedLanguages.join(", ") : "";
      let configuredLanguages = (this._configuredLanguages instanceof Array) ? this._configuredLanguages.join(", ") : "";
      let assetOrigins = (params.assetOrigins instanceof Array) ? params.assetOrigins.join(", ") : "";
      return (
        <div data-component={this.LOG_SOURCE}>
          <div className="buttonRight">
            <Icon iconName="ChromeClose" onClick={this.props.close} />
          </div>
          <Label>{strings.AboutGroupHeader} - {strings.AboutGroupTitle2}</Label>
          <div className="plov">
            <TextField label={strings.AboutLearningSiteUrl} readOnly value={params.learningSiteUrl} />
            <TextField label={strings.AboutDefaultSiteLanguage} readOnly value={defaultLanguageValue} />
            <TextField label={strings.AboutTelemetryStatus} readOnly value={params.telemetryOn.toString()} />
            <TextField label={strings.AboutCurrentWPVersion} readOnly value={params.webPartVersion} />
            <TextField label={strings.AboutMultilingualEnabled} readOnly value={params.multilingualEnabled.toString()} />
            <TextField label={strings.AboutMultilingualLanguages} readOnly value={multilingualLanguages} />
            <TextField label={strings.AboutCurrentUserLanguage} readOnly value={params.userLanguage} />
            <TextField label={strings.AboutAllCDNs} readOnly value={allCdn} />
            <TextField label={strings.AboutBaseCDNPath} required readOnly value={params.baseCdnPath} />
            <TextField label={strings.AboutSupportedLanguages} required readOnly value={supportedLanguages} />
            <TextField label={strings.AboutConfiguredLanguages} required readOnly value={configuredLanguages} />
            <TextField label={strings.AboutContentPackAssetOrigins} required readOnly value={assetOrigins} />
            <TextField label={strings.AboutCacheLastUpdate} readOnly value={(params.lastUpdatedCache) ? `${params.lastUpdatedCache.toDateString()} ${params.lastUpdatedCache.toTimeString()}` : "N/A"} />
          </div>
        </div>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}