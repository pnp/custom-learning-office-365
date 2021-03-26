import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash/isEqual";
import find from "lodash/find";
import { DefaultButton, PrimaryButton, Icon } from "office-ui-fabric-react";

import { params } from "../../../common/services/Parameters";
import * as strings from "M365LPStrings";
import ContentPackItem from "../Atoms/ContentPackItem";
import CdnEdit from '../Atoms/CdnEdit';
import styles from "../../../common/CustomLearningCommon.module.scss";
import { IContentPack, ICDN, CDN } from "../../../common/models/Models";

export interface IContentPackProps {
  //contentPacks: IContentPack[];
  placeholderUrl: string;
  addCdn: (cdn: ICDN) => Promise<void>;
  close: () => void;
}

export interface IContentPackState {
  confirmContentPack: boolean;
  deployContentPack: IContentPack;
  addCustomCdn: boolean;
}

export class ContentPackState implements IContentPackState {
  constructor(
    public confirmContentPack: boolean = false,
    public deployContentPack: IContentPack = null,
    public addCustomCdn: boolean = false
  ) { }
}

export default class ContentPack extends React.Component<IContentPackProps, IContentPackState> {
  private LOG_SOURCE: string = "ContentPack";

  constructor(props) {
    super(props);
    this.state = new ContentPackState();
  }

  public shouldComponentUpdate(nextProps: Readonly<IContentPackProps>, nextState: Readonly<IContentPackState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private addCdn = async (Id: string): Promise<void> => {
    if (Id === "new") {
      this.setState({
        addCustomCdn: true
      });
    } else {
      let cp = find(params.contentPacks, { Id: Id });
      if (cp) {
        if (cp.ProvisionUrl.length > 0) {
          //open content pack in new window
          window.open(cp.ProvisionUrl, "_blank");
          //display confirmation page
          this.setState({
            confirmContentPack: true,
            deployContentPack: cp
          });
        } else {
          //content pack has no provisioning step, add it
          let cdn: ICDN = new CDN(cp.Id, cp.Name, cp.CdnBase);
          await this.props.addCdn(cdn);
          this.setState({
            confirmContentPack: false,
            deployContentPack: null
          });
        }
      }
    }
  }

  private confirmContentPack = async () => {
    if (this.state.deployContentPack) {
      //Add content pack cdn to custom content packs
      let cdn: ICDN = new CDN(this.state.deployContentPack.Id, this.state.deployContentPack.Name, this.state.deployContentPack.CdnBase);
      await this.props.addCdn(cdn);
      this.setState({
        confirmContentPack: false,
        deployContentPack: null
      });
    }
  }

  private cancelContentPack = () => {
    this.setState({
      confirmContentPack: false,
      deployContentPack: null
    });
  }

  private saveCdn = async (cdn: ICDN): Promise<void> => {
    await this.props.addCdn(cdn);
    this.setState({
      addCustomCdn: false
    });
  }

  private cancelAddCdn = () => {
    this.setState({
      addCustomCdn: false
    });
  }

  public render(): React.ReactElement<IContentPackProps> {
    try {
      return (
        <>
          <div data-component={this.LOG_SOURCE} className="buttonRight">
            <Icon iconName="ChromeClose" onClick={this.props.close} />
          </div>
          {!this.state.confirmContentPack && !this.state.addCustomCdn &&
            <div data-component={this.LOG_SOURCE} className="plov">
              <ContentPackItem
                imageSource={this.props.placeholderUrl}
                title={strings.AdminCustomCdnTitle}
                description={strings.AdminCustomCdnDescription}
                onClick={() => this.addCdn("new")}
              />
              {params.contentPacks && params.contentPacks.length > 0 && params.contentPacks.map((cp) => {
                return (
                  <ContentPackItem
                    imageSource={cp.Image}
                    title={cp.Name}
                    description={cp.Description}
                    onClick={() => this.addCdn(cp.Id)}
                  />
                );
              })}
            </div>
          }
          {this.state.confirmContentPack &&
            <div data-component={this.LOG_SOURCE}>
              <p>{strings.AdminConfirmContentPack}</p>
              <PrimaryButton
                className={styles.buttonMargin}
                text={strings.AdminCdnCompleteButton}
                onClick={this.confirmContentPack}
              />
              <DefaultButton
                className={styles.buttonMargin}
                text={strings.AdminCdnCancelButton}
                onClick={this.cancelContentPack}
              />
            </div>
          }
          {this.state.addCustomCdn &&
            <CdnEdit
              cdn={new CDN()}
              closeForm={this.cancelAddCdn}
              upsertCdn={this.saveCdn}
            />
          }
        </>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}