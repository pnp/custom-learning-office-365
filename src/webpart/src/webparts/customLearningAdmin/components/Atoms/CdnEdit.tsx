import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash-es/isEqual";
import cloneDeep from "lodash-es/cloneDeep";
import { ICDN, CDN } from "../../../common/models/Models";
import HOOText from "@n8d/htwoo-react/HOOText";
import HOOLabel from "@n8d/htwoo-react/HOOLabel";
import HOOButton from "@n8d/htwoo-react/HOOButton";

import * as strings from "M365LPStrings";
import styles from "../../../common/CustomLearningCommon.module.scss";

export interface ICdnEditProps {
  cdn: ICDN;
  closeForm: () => void;
  upsertCdn: (cdn: ICDN) => Promise<void>;
}

export interface ICdnEditState {
  cdn: ICDN;
  formChanged: boolean;
}

export class CdnEditState implements ICdnEditState {
  constructor(
    public cdn: ICDN = null,
    public formChanged: boolean = false
  ) { }
}

export default class CdnEdit extends React.Component<ICdnEditProps, ICdnEditState> {
  private LOG_SOURCE: string = "CdnEdit";

  constructor(props) {
    super(props);
    let cdn = new CDN();
    if (props.cdn)
      cdn = cloneDeep(props.cdn);
    this.state = new CdnEditState(cdn);
  }

  public shouldComponentUpdate(nextProps: Readonly<ICdnEditProps>, nextState: Readonly<ICdnEditState>): boolean {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private changeValue = (key: string, value: string): void => {
    const cdn = cloneDeep(this.state.cdn);
    cdn[key] = (key === "Name") ? value : value.trim();
    if (key === "Base") {
      this.validateBase(value)
    }
    this.setState({
      cdn: cdn,
      formChanged: true
    });
  }

  private upsertCdn = (): void => {
    this.props.upsertCdn(this.state.cdn);
  }

  private validateBase = (value: string): string => {
    let retVal = "";
    if (value.substr(value.length - 1, 1) !== "/") {
      retVal = strings.ValidateBase;
    }
    return retVal;
  }

  private getValidForm = (): boolean => {
    let retVal = false;
    if (this.state.cdn.Name.length > 0 &&
      this.state.cdn.Id.length > 0 &&
      this.state.cdn.Base.length > 0 &&
      this.state.cdn.Base.substr(this.state.cdn.Base.length - 1, 1) === "/")
      retVal = true;
    return retVal;
  }

  public render(): React.ReactElement<ICdnEditProps> {
    try {
      return (
        <div className="about-field-grid">
          <HOOLabel label={strings.AdminCdnIdLabel} for={strings.AdminCdnIdLabel} required={true} />
          <HOOText
            forId={strings.AdminCdnIdLabel}
            onChange={(ev) => { this.changeValue("Id", ev.currentTarget.value); }}
            value={this.state.cdn.Id}
            inputElementAttributes={{
              style: {
                width: '100%'
              }
            }}
          />
          <HOOLabel label={strings.AdminCdnDisplayName} for={strings.AdminCdnDisplayName} />
          <HOOText
            forId={strings.AdminCdnDisplayName}
            onChange={(ev) => { this.changeValue("Name", ev.currentTarget.value); }}
            value={this.state.cdn.Name}
            inputElementAttributes={{
              style: {
                width: '100%'
              }
            }}
          />

          <HOOLabel label={strings.AdminCdnBaseUrl} for={strings.AdminCdnBaseUrl} required={true} />
          <HOOText
            forId={strings.AdminCdnBaseUrl}
            onChange={(ev) => { this.changeValue("Base", ev.currentTarget.value); }}
            value={this.state.cdn.Base}
            inputElementAttributes={{
              style: {
                width: '100%'
              }
            }}
          />
          <div>
            <HOOButton
              label={(this.props.cdn.Name === "") ? strings.AdminCdnSaveButton : strings.AdminCdnUpdateButton}
              onClick={this.upsertCdn}
              type={1}
              disabled={!(this.getValidForm() && this.state.formChanged)}
              rootElementAttributes={{
                className: styles.buttonMargin
              }}
            />
            <HOOButton
              label={strings.AdminCdnCancelButton}
              onClick={this.props.closeForm}
              type={2}
              rootElementAttributes={{
                className: styles.buttonMargin
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