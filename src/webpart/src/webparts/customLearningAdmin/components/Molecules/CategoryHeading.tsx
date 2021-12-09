import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash/isEqual";

import { IconButton } from "office-ui-fabric-react";

import * as strings from "M365LPStrings";
import { ICategory, IMultilingualString } from "../../../common/models/Models";
import Button from "../../../common/components/Atoms/Button";
import { ButtonTypes } from "../../../common/models/Enums";
import CategoryHeadingDetail from "../Atoms/CategoryHeadingDetail";
import cloneDeep from "lodash/cloneDeep";

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

export default class CategoryHeading extends React.Component<ICategoryHeadingProps, ICategoryHeadingState> {
  private LOG_SOURCE: string = "CategoryHeading";

  constructor(props) {
    super(props);
    this.state = new CategoryHeadingState();
  }

  public shouldComponentUpdate(nextProps: Readonly<ICategoryHeadingProps>, nextState: Readonly<ICategoryHeadingState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    return true;
  }

  private onUpdate = () => {
    if (!this.state.editHeading) return;
    this.props.saveSubCategory(this.state.editHeading);
    this.setState({
      edit: false,
      editHeading: null
    });
  }

  private onDelete = () => {
    this.setState({
      edit: false,
      editHeading: null
    });
    this.props.onDelete();
  }

  private updateHeading = (heading: ICategory) => {
    this.setState({
      editHeading: heading
    });
  }

  private renderHeading = () => {
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

  private renderButtons = () => {
    let retVal = [];
    try {
      if (this.state.edit) {
        retVal.push(
          <IconButton
            iconProps={{ iconName: 'Save' }}
            title={strings.SaveButton}
            ariaLabel={strings.SaveButton}
            onClick={this.onUpdate}
          />);
        retVal.push(
          <IconButton
            iconProps={{ iconName: 'Delete' }}
            title={strings.DeleteButton}
            ariaLabel={strings.DeleteButton}
            onClick={this.onDelete}
            disabled={!this.props.canDelete}
          />);
        retVal.push(
          <IconButton
            iconProps={{ iconName: 'ChromeClose' }}
            title={strings.CancelButton}
            ariaLabel={strings.CancelButton}
            onClick={() => { this.setState({ edit: false }); }}
          />
        );
      } else {
        retVal.push(
          <Button
            title={`${(this.props.new) ? strings.Add : strings.Edit} ${strings.SubcategoryHeadingLabel}`}
            buttonType={(this.props.new) ? ButtonTypes.Add : ButtonTypes.Edit}
            onClick={() => { this.setState({ edit: true, editHeading: cloneDeep(this.props.heading) }); }}
            disabled={!this.props.canEdit}
          />);
        if (!this.props.new) {
          retVal.push(
            <Button
              title={`${(this.props.visible) ? strings.Hide : strings.Show} ${strings.CategoryHeadingLabel}`}
              buttonType={(this.props.visible) ? ButtonTypes.Show : ButtonTypes.Hide}
              onClick={() => { this.props.onVisibility(this.props.heading.Id, this.props.visible); }}
              disabled={false}
            />);
        }
        if (this.props.addPlaylist) {
          retVal.push(
            <Button
              title={strings.CategoryHeadingAddPlaylistToSubcategory}
              buttonType={ButtonTypes.Add}
              disabled={false}
              selected={false}
              onClick={this.props.addPlaylist}
            />);
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
