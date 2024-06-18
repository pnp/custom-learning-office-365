import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import HOOButton, { HOOButtonType } from "@n8d/htwoo-react/HOOButton";
import HOOText from "@n8d/htwoo-react/HOOText";

import * as strings from "M365LPStrings";

export interface ILinkPanelProps {
  panelOpen: boolean;
  linkUrl: string;
}

export default class LinkPanel extends React.PureComponent<ILinkPanelProps> {
  private LOG_SOURCE: string = "LinkPanel";

  constructor(props) {
    super(props);
  }

  private linkClick = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(this.props.linkUrl);
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (linkClick) - ${err}`, LogLevel.Error);
    }
  }

  public render(): React.ReactElement<ILinkPanelProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE} className={`headerpanel fbcolumn ${(this.props.panelOpen) ? "show" : ""}`}>
          <div className="copypanel">
            <HOOText value={this.props.linkUrl} onChange={() => { }}
              rootElementAttributes={{
                style: {
                  width: '100%'
                }
              }}
              inputElementAttributes={{
                readOnly: true,
                style: {
                  width: '100%'
                }
              }} />
            <HOOButton type={HOOButtonType.Primary}
              label={strings.LinkPanelCopyLabel}
              onClick={this.linkClick} />
          </div>
        </div>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}
