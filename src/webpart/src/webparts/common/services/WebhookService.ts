import { Logger, LogLevel } from "@pnp/logging";
import { extend } from "lodash";

import * as shajs from "sha.js";

import { params } from "./Parameters";
import { IWebhookNotification } from "../models/Models";

interface IWebhookService {
  initialize(): void;
  trackEvent(
    eventName: string,
    webhookProperties: IWebhookNotification
  ): void;
}

class WebhookServiceInternal implements IWebhookService {
  private LOG_SOURCE: string = "WebhookService";
  private _isEnabled: boolean = false;
  private _webhookUrl: string;
  private _webhookKeyHeader: string;
  private _webhookKey: string;
  private _anonymizeUser: boolean = true;
  private _user: string = "";

  /**
   * Init Application Insights service. Called only once.
   * You must set telemetry key and user consent in params before calling.
   */
  public initialize(): void {
    try {
      if (params.webhookConfig != null && params.webhookConfig.Url != null && params.webhookConfig.Url.length > 0) {
        this._webhookUrl = params.webhookConfig.Url;
        this._anonymizeUser = params.webhookConfig.AnonymizeUser || true;
        this._webhookKeyHeader = params.webhookConfig.KeyHeader || "M365LP-API-KEY";
        this._webhookKey = params.webhookConfig.Key || null;
        if (this._anonymizeUser) {
          this._user = shajs("sha256")
            .update(params.context.pageContext.user.loginName)
            .digest("hex");
        } else {
          this._user = params.context.pageContext.user.loginName;
        }
        if (this._webhookUrl != null && this._webhookUrl.length > 0) {
          this._isEnabled = true;
        }
      } else {
        Logger.write(
          `Webhook Service Disabled - Tenant: ${params.context.pageContext.aadInfo.tenantId}`,
          LogLevel.Info
        );
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (trackEvent) - ${err}`, LogLevel.Error);
    }
  }

  /**
   * Returns whether webhook is enabled.
   */
  public get isWebhookEnabled(): boolean {
    return this._isEnabled;
  }

  /**
   * Send webhook notification.
   *
   * @param name        Event name
   * @param properties  IWebhookNotification - must include playlistId, playlistName, and asset
   */
  public trackEvent(name: string, properties: IWebhookNotification): void {
    if (!this._isEnabled) return;

    try {
      // build the payload for the webhook notification
      const eventProps = extend(
        {
          user: this._user,
          tenant: params.context.pageContext.aadInfo.tenantId as string,
          webpart_ver: params.manifestVersion,
          language: params.userLanguage,
          eventType: name,
          pageUrl: document.location.href
        },
        properties
      );

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // If webhook key is configured, add it to the headers using the supplied key header or the default.
      if(this._webhookKey != null){
        headers[this._webhookKeyHeader] = this._webhookKey;
      }

      const options: RequestInit  = {
        method: "post",
        headers,
        body: JSON.stringify(eventProps)
      }
      fetch(this._webhookUrl, options).then((webhookResult) => {
        if(webhookResult.ok){
          Logger.write(
            `🎓 M365LP:${this.LOG_SOURCE} (trackEvent) Webhook called successfully: ${name}`,
            LogLevel.Verbose
          );
        }else{
          Logger.write(
            `🎓 M365LP:${this.LOG_SOURCE} (trackEvent) Webhook called failed - ${webhookResult.status}:${webhookResult.statusText}`,
            LogLevel.Error
          );
        }
      });      
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (trackEvent) - ${err}`, LogLevel.Error);
    }
  }
}

export const WebhookService = new WebhookServiceInternal();
