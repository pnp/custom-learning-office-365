import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";
import cloneDeep from "lodash-es/cloneDeep";
import HOOButton, { HOOButtonType } from "@n8d/htwoo-react/HOOButton";

import * as strings from "M365LPStrings";
import { ICategory, IMultilingualString } from "../../../common/models/Models";
import CategoryHeadingDetail from "../Atoms/CategoryHeadingDetail";

export interface ICategoryHeadingProps {
  heading: ICategory;
  new: boolean;
  canEdit: boolean;
  visible: boolean;
  canDelete: boolean;
  saveSubCategory: (heading: ICategory) => void;
  addPlaylist?: () => void;
  onVisibility: (subCategory: string, exists: boolean) => void;
  onDelete: () => void;
}

export interface ICategoryHeadingState {
  edit: boolean;
  editHeading: ICategory;
}

export class CategoryHeadingState implements ICategoryHeadingState {
  constructor(
    public edit: boolean = false,
    public editHeading: ICategory = null
  ) { }
}

export default class CategoryHeading extends React.PureComponent<ICategoryHeadingProps, ICategoryHeadingState> {
  private LOG_SOURCE: string = "CategoryHeading";

  constructor(props) {
    super(props);
    this.state = new CategoryHeadingState();
  }

  private onUpdate = (): void => {
    if (!this.state.editHeading) return;
    this.props.saveSubCategory(this.state.editHeading);
    this.setState({
      edit: false,
      editHeading: null
    });
  }

  private onDelete = (): void => {
    this.setState({
      edit: false,
      editHeading: null
    });
    this.props.onDelete();
  }

  private updateHeading = (heading: ICategory): void => {
    this.setState({
      editHeading: heading
    });
  }

  private renderHeading = (): JSX.Element => {
    try {
      if (this.state.edit) {
        return (
          <div className="category-edit">
            <CategoryHeadingDetail
              heading={this.state.editHeading}
              edit={this.state.edit}
              updateHeading={this.updateHeading}
            />
          </div>);
      } else {
        return (
          <h3 className='category-heading'>
            {(this.props.heading.Name instanceof Array) ?
              (this.props.new ?
                strings.CategoryHeading :
                (this.props.heading.Name as IMultilingualString[])[0].Text
              ) :
              this.props.heading.Name
            }
          </h3>);
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (renderHeading) - ${err}`, LogLevel.Error);
      return null;
    }
  }

  private renderButtons = (): JSX.Element[] => {
    const retVal: JSX.Element[] = [];
    try {
      if (this.state.edit) {
        retVal.push(
          <HOOButton type={HOOButtonType.Icon}
            iconName="icon-save-regular"
            iconTitle={strings.SaveButton}
            onClick={this.onUpdate} />
        );
        if (this.props.canDelete) {
          retVal.push(
            <HOOButton type={HOOButtonType.Icon}
              iconName="icon-delete-regular"
              iconTitle={strings.DeleteButton}
              onClick={this.onDelete}
              disabled={!this.props.canDelete} />
          );
        }

        retVal.push(
          <HOOButton type={HOOButtonType.Icon}
            iconName="icon-dismiss-regular"
            iconTitle={strings.CancelButton}
            onClick={() => { this.setState({ edit: false }); }} />
        );
      } else {
        if (this.props.canEdit || this.props.new) {
          retVal.push(
            <HOOButton type={HOOButtonType.Icon}
              iconName={(this.props.new) ? "icon-add-regular" : "icon-pen-regular"}
              iconTitle={`${(this.props.new) ? strings.Add : strings.Edit} ${strings.SubcategoryHeadingLabel}`}
              onClick={() => { this.setState({ edit: true, editHeading: cloneDeep(this.props.heading) }); }}
              disabled={!this.props.canEdit} />
          );
        }

        if (!this.props.new) {
          retVal.push(
            <HOOButton type={HOOButtonType.Icon} adm-subcatheading
              iconName={(this.props.visible) ? "icon-eye-filled" : "icon-eye-off-filled"}
              iconTitle={`${(this.props.visible) ? strings.Hide : strings.Show} ${strings.CategoryHeadingLabel}`}
              onClick={() => { this.props.onVisibility(this.props.heading.Id, this.props.visible); }} />
          );
        }
        if (this.props.addPlaylist) {
          retVal.push(
            <HOOButton type={HOOButtonType.Icon}
              iconName="icon-add-regular"
              iconTitle={strings.CategoryHeadingAddPlaylistToSubcategory}
              onClick={this.props.addPlaylist} />
          );
        }
      }
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (renderButtons) - ${err}`, LogLevel.Error);
    }
    return retVal;
  }

  public render(): React.ReactElement<ICategoryHeadingProps> {
    try {
      return (
        <div data-component={this.LOG_SOURCE} className="admpl-heading">
          {this.renderHeading()}
          <span className="admpl-heading-edit">
            {this.renderButtons()}
          </span>
        </div>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}
