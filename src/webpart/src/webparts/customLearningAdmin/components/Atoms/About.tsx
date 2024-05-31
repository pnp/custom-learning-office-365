import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash-es/isEqual";
import forEach from "lodash-es/forEach";
import HOOText from "@n8d/htwoo-react/HOOText";
import HOOLabel from "@n8d/htwoo-react/HOOLabel";

import * as strings from "M365LPStrings";
import { params } from "../../../common/services/Parameters";
import HOOButton, { HOOButtonType } from "@n8d/htwoo-react/HOOButton";


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
            <HOOButton type={HOOButtonType.Icon} iconName="icon-dismiss-regular"
              onClick={this.props.close} />
          </div>
          <HOOLabel label={`${strings.AboutGroupHeader} - ${strings.AboutGroupTitle2}`}></HOOLabel>
          <div className="plov">
            <HOOLabel label={strings.AboutLearningSiteUrl}></HOOLabel>
            <HOOText disabled onChange={null} value={params.learningSiteUrl} />

            <HOOLabel label={strings.AboutDefaultSiteLanguage}></HOOLabel>
            <HOOText disabled onChange={null} value={defaultLanguageValue} />

            <HOOLabel label={strings.AboutTelemetryStatus}></HOOLabel>
            <HOOText disabled onChange={null} value={params.telemetryOn.toString()} />

            <HOOLabel label={strings.AboutCurrentWPVersion}></HOOLabel>
            <HOOText disabled onChange={null} value={params.webPartVersion} />

            <HOOLabel label={strings.AboutMultilingualEnabled}></HOOLabel>
            <HOOText disabled onChange={null} value={params.multilingualEnabled.toString()} />

            <HOOLabel label={strings.AboutMultilingualLanguages}></HOOLabel>
            <HOOText disabled onChange={null} value={multilingualLanguages} />

            <HOOLabel label={strings.AboutCurrentUserLanguage}></HOOLabel>
            <HOOText disabled onChange={null} value={params.userLanguage} />

            <HOOLabel label={strings.AboutAllCDNs}></HOOLabel>
            <HOOText disabled onChange={null} value={allCdn} />

            <HOOLabel label={strings.AboutBaseCDNPath}></HOOLabel>
            <HOOText disabled onChange={null} value={params.baseCdnPath} />

            <HOOLabel label={strings.AboutSupportedLanguages}></HOOLabel>
            <HOOText disabled onChange={null} value={supportedLanguages} />

            <HOOLabel label={strings.AboutConfiguredLanguages}></HOOLabel>
            <HOOText disabled onChange={null} value={configuredLanguages} />

            <HOOLabel label={strings.AboutContentPackAssetOrigins}></HOOLabel>
            <HOOText disabled onChange={null} value={assetOrigins} />

            <HOOLabel label={strings.AboutCacheLastUpdate} ></HOOLabel>
            <HOOText disabled onChange={null} value={(params.lastUpdatedCache) ? `${params.lastUpdatedCache.toDateString()} ${params.lastUpdatedCache.toTimeString()}` : "N/A"} />

          </div>
        </div>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}