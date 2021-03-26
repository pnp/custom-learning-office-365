import { AppInsights } from "applicationinsights-js";
import { Logger, LogLevel } from "@pnp/logging";
import { extend, find } from "lodash";

import * as shajs from "sha.js";

import { params } from "./Parameters";
import { IAsset, ITechnology } from "../models/Models";
import { CustomWebpartSource } from "../models/Enums";

interface IAppInsightsService {
  initialize(cdn: string, telemetryKey: string): void;
  readonly isTelemetryEnabled: boolean;
  trackEvent(
    eventName: string,
    properties: {
      [name: string]: string;
    }
  ): void;
  trackViewAsset(
    playlistId: string,
    playlistName: string,
    asset: IAsset
  ): void;
}

class AppInsightsServiceInternal implements IAppInsightsService {
  private LOG_SOURCE: string = "AppInsightsService";
  private _isEnabled: boolean = false;
  private _cdn: string;
  private _technologies: ITechnology[] = [];

  /**
   * Init Application Insights service. Called only once.
   * You must set telemetry key and user consent in params before calling.
   */
  public initialize(cdn: string, telemetryKey: string) {
    try {
      this._cdn = cdn;
      if (params.telemetryOn && telemetryKey) {
        AppInsights.downloadAndSetup({
          instrumentationKey: telemetryKey,
        });
        let userHash = shajs("sha256")
          .update(params.context.pageContext.user.loginName)
          .digest("hex");
        AppInsights.setAuthenticatedUserContext(userHash);
        this._isEnabled = true;
      } else {
        Logger.write(
          `AppInsights Telemetry Disabled - Tenant: ${params.context.pageContext.aadInfo.tenantId}`,
          LogLevel.Info
        );
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (trackEvent) - ${err}`, LogLevel.Error);
    }
  }

  /**
   * Returns whether telemetry is enabled.
   */
  public get isTelemetryEnabled(): boolean {
    return this._isEnabled;
  }

  public set Technologies(value: ITechnology[]) {
    this._technologies = value;
  }

  /**
   * Send generic event with optional event properties.
   *
   * @param name        Event name
   * @param properties  Optional event properties
   */
  public trackEvent(
    name: string,
    properties: {
      [name: string]: string;
    } = {}
  ) {
    if (!this.isTelemetryEnabled) return;

    try {
      const eventProps = extend(
        {
          tenant: params.context.pageContext.aadInfo.tenantId as string,
          webpart_ver: params.manifestVersion,
          language: params.userLanguage,
          contentset: this._cdn
        },
        properties
      );
      AppInsights.trackEvent(name, eventProps);
      Logger.write(
        `Logged event ${name} - Tenant: ${params.context.pageContext.aadInfo.tenantId}`,
        LogLevel.Verbose
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (trackEvent) - ${err}`, LogLevel.Error);
    }
  }

  /**
   * Track asset view.
   *
   * @param playlist        A playlist GUID
   * @param playlistName    A playlist title
   * @param url             URL of the asset
   * @param techId          A technology GUID
   */
  public trackViewAsset(
    playlist: string,
    playlistName: string,
    asset: IAsset
  ): void {
    if (!this.isTelemetryEnabled) return;

    const eventProps = {
      appName: this.findTechnology(asset.TechnologyId),
      asset: asset.Id,
      assetName: asset.Title as string,
      contentset: this._cdn,
      playlist,
      playlistName,
      url: asset.Url as string
    };

    // Privacy policy. 
    if (asset.Source === CustomWebpartSource.Tenant) {
      eventProps.playlistName = eventProps.assetName = "Custom";
      if (this._cdn != "Default") {
        eventProps.appName = "Custom";
      }
      eventProps.url = asset.Id;
    }

    this.trackEvent("LearningPathwaysViewAsset", eventProps);
  }

  /**
   * Returns name of technology, or empty string if not found.
   *
   * @param techId A technology GUID
   */
  private findTechnology(techId: string) {
    if (techId && this._technologies.length > 0) {
      const tech = find(
        this._technologies,
        (t) => t.Id == techId
      );
      if (tech) return tech.Name;
    }
    return "";
  }
}

export const AppInsightsService = new AppInsightsServiceInternal();
