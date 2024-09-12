import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import LinkPanel from "../Atoms/LinkPanel";
import SearchPanel from "../Atoms/SearchPanel";

export interface IHeaderPanelProps {
  panelOpen: string;
  linkUrl: string;
  alwaysShowSearch: boolean;
  closePanel: (panelName: string) => void;
}

export default class HeaderPanel extends React.PureComponent<IHeaderPanelProps> {
  private LOG_SOURCE: string = "HeaderPanel";

  constructor(props) {
    super(props);
  }

  public render(): React.ReactElement<IHeaderPanelProps> {
    try {
      return (
        <>
          {(this.props.panelOpen === "Search" || this.props.alwaysShowSearch) &&
            <SearchPanel
              panelOpen={this.props.panelOpen === "Search" || this.props.alwaysShowSearch}
              closePanel={() => { this.props.closePanel("Search") }} />
          }
          {this.props.panelOpen === "Link" &&
            <LinkPanel
              panelOpen={this.props.panelOpen === "Link"}
              linkUrl={this.props.linkUrl} />
          }
        </>
      )
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}
