import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash-es/isEqual";
import find from "lodash-es/find";
import HOOButton, { HOOButtonType } from "@n8d/htwoo-react/HOOButton";

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

  public shouldComponentUpdate(nextProps: Readonly<IContentPackProps>, nextState: Readonly<IContentPackState>): boolean {
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
      const cp = find(params.contentPacks, { Id: Id });
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
          const cdn: ICDN = new CDN(cp.Id, cp.Name, cp.CdnBase);
          await this.props.addCdn(cdn);
          this.setState({
            confirmContentPack: false,
            deployContentPack: null
          });
        }
      }
    }
  }

  private confirmContentPack = async (): Promise<void> => {
    if (this.state.deployContentPack) {
      //Add content pack cdn to custom content packs
      const cdn: ICDN = new CDN(this.state.deployContentPack.Id, this.state.deployContentPack.Name, this.state.deployContentPack.CdnBase);
      await this.props.addCdn(cdn);
      this.setState({
        confirmContentPack: false,
        deployContentPack: null
      });
    }
  }

  private cancelContentPack = (): void => {
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

  private cancelAddCdn = (): void => {
    this.setState({
      addCustomCdn: false
    });
  }

  public render(): React.ReactElement<IContentPackProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE} className="about">
          <div className="buttonRight">
            <HOOButton type={HOOButtonType.Icon} iconName="icon-dismiss-regular"
              onClick={this.props.close} />
          </div>
          <h3>{strings.AdminAddCdnLabel}</h3>

          {!this.state.confirmContentPack && !this.state.addCustomCdn &&
            <div className="plov">
              <ContentPackItem
                imageSource={this.props.placeholderUrl}
                title={strings.AdminCustomCdnTitle}
                description={strings.AdminCustomCdnDescription}
                onClick={() => this.addCdn("new")}
              />
              {params.contentPacks && params.contentPacks.length > 0 && params.contentPacks.map((cp, idx) => {
                return (
                  <ContentPackItem
                    key={idx}
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
              <HOOButton
                label={strings.AdminCdnCompleteButton}
                onClick={this.confirmContentPack}
                rootElementAttributes={{ className: styles.buttonMargin }}
                type={1}
              />
              <HOOButton
                label={strings.AdminCdnCancelButton}
                onClick={this.cancelContentPack}
                rootElementAttributes={{ className: styles.buttonMargin }}
                type={2}
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
        </div>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}