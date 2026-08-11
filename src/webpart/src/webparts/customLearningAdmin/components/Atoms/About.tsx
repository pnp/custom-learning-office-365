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
              iconTitle={strings.CloseButton}
              onClick={this.props.close} />
          </div>
          <HOOLabel label={`${strings.AboutGroupHeader} - ${strings.AboutGroupTitle2}`} />
          <div className="about-field-grid">
            <HOOLabel label={strings.AboutLearningSiteUrl} for="about-learning-site-url" />
            <HOOText
              forId="about-learning-site-url"
              onChange={null}
              value={params.learningSiteUrl}
              inputElementAttributes={{
                readOnly: true,
                style: {
                  width: '100%'
                }
              }}
            />

            <HOOLabel label={strings.AboutDefaultSiteLanguage} for="about-default-site-language" />
            <HOOText
              forId="about-default-site-language"
              onChange={null}
              value={defaultLanguageValue}
              inputElementAttributes={{
                readOnly: true,
                style: {
                  width: '100%'
                }
              }}
            />

            <HOOLabel label={strings.AboutTelemetryStatus} for="about-telemetry-status" />
            <HOOText
              forId="about-telemetry-status"
              onChange={null}
              value={params.telemetryOn.toString()}
              inputElementAttributes={{
                readOnly: true,
                style: {
                  width: '100%'
                }
              }}
            />

            <HOOLabel label={strings.AboutCurrentWPVersion} for="about-current-wp-version" />
            <HOOText
              forId="about-current-wp-version"
              onChange={null}
              value={params.webPartVersion}
              inputElementAttributes={{
                readOnly: true,
                style: {
                  width: '100%'
                }
              }}
            />

            <HOOLabel label={strings.AboutMultilingualEnabled} for="about-multilingual-enabled" />
            <HOOText
              forId="about-multilingual-enabled"
              onChange={null}
              value={params.multilingualEnabled.toString()}
              inputElementAttributes={{
                readOnly: true,
                style: {
                  width: '100%'
                }
              }}
            />

            <HOOLabel label={strings.AboutMultilingualLanguages} for="about-multilingual-languages" />
            <HOOText
              forId="about-multilingual-languages"
              onChange={null}
              value={multilingualLanguages}
              inputElementAttributes={{
                readOnly: true,
                style: {
                  width: '100%'
                }
              }}
            />

            <HOOLabel label={strings.AboutCurrentUserLanguage} for="about-current-user-language" />
            <HOOText
              forId="about-current-user-language"
              onChange={null}
              value={params.userLanguage}
              inputElementAttributes={{
                readOnly: true,
                style: {
                  width: '100%'
                }
              }}
            />

            <HOOLabel label={strings.AboutAllCDNs} for="about-all-cdns" />
            <HOOText
              forId="about-all-cdns"
              onChange={null}
              value={allCdn}
              inputElementAttributes={{
                readOnly: true,
                style: {
                  width: '100%'
                }
              }}
            />

            <HOOLabel label={strings.AboutBaseCDNPath} for="about-base-cdn-path" />
            <HOOText
              forId="about-base-cdn-path"
              onChange={null}
              value={params.baseCdnPath}
              inputElementAttributes={{
                readOnly: true,
                style: {
                  width: '100%'
                }
              }}
            />

            <HOOLabel label={strings.AboutSupportedLanguages} for="about-supported-languages" />
            <HOOText
              forId="about-supported-languages"
              onChange={null}
              value={supportedLanguages}
              inputElementAttributes={{
                readOnly: true,
                style: {
                  width: '100%'
                }
              }}
            />

            <HOOLabel label={strings.AboutConfiguredLanguages} for="about-configured-languages" />
            <HOOText
              forId="about-configured-languages"
              onChange={null}
              value={configuredLanguages}
              inputElementAttributes={{
                readOnly: true,
                style: {
                  width: '100%'
                }
              }}
            />

            <HOOLabel label={strings.AboutContentPackAssetOrigins} for="about-content-pack-asset-origins" />
            <HOOText
              forId="about-content-pack-asset-origins"
              onChange={null}
              value={assetOrigins}
              inputElementAttributes={{
                readOnly: true,
                style: {
                  width: '100%'
                }
              }}
            />

            <HOOLabel label={strings.AboutCacheLastUpdate} for="about-cache-last-update" />
            <HOOText
              forId="about-cache-last-update"
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