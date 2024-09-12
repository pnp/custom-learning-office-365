import { Logger, LogLevel } from "@pnp/logging";
import * as React from "react";

import HOOLabel from "@n8d/htwoo-react/HOOLabel";
import HOOText from "@n8d/htwoo-react/HOOText";
import forEach from "lodash-es/forEach";

import HOOButton, { HOOButtonType } from "@n8d/htwoo-react/HOOButton";
import * as strings from "M365LPStrings";
import { params } from "../../../common/services/Parameters";


export interface IAboutProps {
  close: () => void;
}

export default class About extends React.PureComponent<IAboutProps> {
  private LOG_SOURCE: string = "About";
  private _allCdn: string[] = [];
  private _configuredLanguages: string[] = [];

  constructor(props) {
    super(props);

    forEach(params.allCdn, (cdn) => {
      this._allCdn.push(cdn.Name);
    });

    forEach(params.configuredLanguages, (cl) => {
      this._configuredLanguages.push(cl.description);
    });
  }

  public render(): React.ReactElement<IAboutProps> {
    try {
      const defaultLanguageValue = `${params.defaultLanguage}${(params.defaultLanguage !== params.webLanguage) ? ` (${params.webLanguage})` : ""}`;
      const allCdn = (this._allCdn instanceof Array) ? this._allCdn.join(", ") : "";
      const multilingualLanguages = (params.multilingualLanguages instanceof Array) ? params.multilingualLanguages.join(", ") : "";
      const supportedLanguages = (params.supportedLanguages instanceof Array) ? params.supportedLanguages.join(", ") : "";
      const configuredLanguages = (this._configuredLanguages instanceof Array) ? this._configuredLanguages.join(", ") : "";
      const assetOrigins = (params.assetOrigins instanceof Array) ? params.assetOrigins.join(", ") : "";
      return (
        <div data-component={this.LOG_SOURCE} className="about">
          <div className="buttonRight">
            <HOOButton type={HOOButtonType.Icon} iconName="icon-dismiss-regular"
              onClick={this.props.close} />
          </div>
          <HOOLabel label={`${strings.AboutGroupHeader} - ${strings.AboutGroupTitle2}`} />
          <div className="about-field-grid">
            <HOOLabel label={strings.AboutLearningSiteUrl} />
            <HOOText
              onChange={null}
              value={params.learningSiteUrl}
              inputElementAttributes={{
                readOnly: true,
                style: {
                  width: '100%'
                }
              }}
            />

            <HOOLabel label={strings.AboutDefaultSiteLanguage} />
            <HOOText
              onChange={null}
              value={defaultLanguageValue}
              inputElementAttributes={{
                readOnly: true,
                style: {
                  width: '100%'
                }
              }}
            />

            <HOOLabel label={strings.AboutTelemetryStatus} />
            <HOOText
              onChange={null}
              value={params.telemetryOn.toString()}
              inputElementAttributes={{
                readOnly: true,
                style: {
                  width: '100%'
                }
              }}
            />

            <HOOLabel label={strings.AboutCurrentWPVersion} />
            <HOOText
              onChange={null}
              value={params.webPartVersion}
              inputElementAttributes={{
                readOnly: true,
                style: {
                  width: '100%'
                }
              }}
            />

            <HOOLabel label={strings.AboutMultilingualEnabled} />
            <HOOText
              onChange={null}
              value={params.multilingualEnabled.toString()}
              inputElementAttributes={{
                readOnly: true,
                style: {
                  width: '100%'
                }
              }}
            />

            <HOOLabel label={strings.AboutMultilingualLanguages} />
            <HOOText
              onChange={null}
              value={multilingualLanguages}
              inputElementAttributes={{
                readOnly: true,
                style: {
                  width: '100%'
                }
              }}
            />

            <HOOLabel label={strings.AboutCurrentUserLanguage} />
            <HOOText
              onChange={null}
              value={params.userLanguage}
              inputElementAttributes={{
                readOnly: true,
                style: {
                  width: '100%'
                }
              }}
            />

            <HOOLabel label={strings.AboutAllCDNs} />
            <HOOText
              onChange={null}
              value={allCdn}
              inputElementAttributes={{
                readOnly: true,
                style: {
                  width: '100%'
                }
              }}
            />

            <HOOLabel label={strings.AboutBaseCDNPath} />
            <HOOText
              onChange={null}
              value={params.baseCdnPath}
              inputElementAttributes={{
                readOnly: true,
                style: {
                  width: '100%'
                }
              }}
            />

            <HOOLabel label={strings.AboutSupportedLanguages} />
            <HOOText
              onChange={null}
              value={supportedLanguages}
              inputElementAttributes={{
                readOnly: true,
                style: {
                  width: '100%'
                }
              }}
            />

            <HOOLabel label={strings.AboutConfiguredLanguages} />
            <HOOText
              onChange={null}
              value={configuredLanguages}
              inputElementAttributes={{
                readOnly: true,
                style: {
                  width: '100%'
                }
              }}
            />

            <HOOLabel label={strings.AboutContentPackAssetOrigins} />
            <HOOText
              onChange={null}
              value={assetOrigins}
              inputElementAttributes={{
                readOnly: true,
                style: {
                  width: '100%'
                }
              }}
            />

            <HOOLabel label={strings.AboutCacheLastUpdate} />
            <HOOText
              onChange={null}
              value={(params.lastUpdatedCache) ? `${params.lastUpdatedCache.toDateString()} ${params.lastUpdatedCache.toTimeString()}` : "N/A"}
              inputElementAttributes={{
                readOnly: true,
                style: {
                  width: '100%'
                }
              }}
            />

          </div>
        </div>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}