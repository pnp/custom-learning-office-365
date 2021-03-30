import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash/isEqual";
import cloneDeep from "lodash/cloneDeep";

import * as strings from "M365LPStrings";
import styles from "../../../common/CustomLearningCommon.module.scss";
import { DefaultButton, PrimaryButton, TextField } from "office-ui-fabric-react";
import { ICDN, CDN } from "../../../common/models/Models";

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

  public shouldComponentUpdate(nextProps: Readonly<ICdnEditProps>, nextState: Readonly<ICdnEditState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private changeValue = (key: string, value: string): void => {
    let cdn = cloneDeep(this.state.cdn);
    cdn[key] = (key === "Name") ? value : value.trim();
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
        <>
          <TextField
            label={strings.AdminCdnIdLabel}
            required={true}
            value={this.state.cdn.Id}
            onChange={(ev, newValue) => this.changeValue("Id", newValue)}
          />
          <TextField
            label={strings.AdminCdnDisplayName}
            required={true}
            value={this.state.cdn.Name}
            onChange={(ev, newValue) => this.changeValue("Name", newValue)}
          />
          <TextField
            label={strings.AdminCdnBaseUrl}
            required={true}
            value={this.state.cdn.Base}
            onChange={(ev, newValue) => this.changeValue("Base", newValue)}
            onGetErrorMessage={this.validateBase}
          />
          <PrimaryButton
            disabled={!(this.getValidForm() && this.state.formChanged)}
            className={styles.buttonMargin}
            text={(this.props.cdn.Name === "") ? strings.AdminCdnSaveButton : strings.AdminCdnUpdateButton}
            onClick={this.upsertCdn}
          />
          <DefaultButton
            className={styles.buttonMargin}
            text={strings.AdminCdnCancelButton}
            onClick={this.props.closeForm}
          />
        </>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}