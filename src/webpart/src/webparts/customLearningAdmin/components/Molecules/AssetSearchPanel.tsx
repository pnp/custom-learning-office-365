import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash/isEqual";
import cloneDeep from "lodash/cloneDeep";
import find from "lodash/find";
import includes from "lodash/includes";

import { PrimaryButton, Label } from "office-ui-fabric-react";

import * as strings from "M365LPStrings";
import { params } from "../../../common/services/Parameters";
import { IAsset, ITechnology, IMultilingualString, Asset } from "../../../common/models/Models";
import Paging from "../../../common/components/Atoms/Paging";
import SearchItem from "../Atoms/SearchItem";
import { CustomWebpartSource } from "../../../common/models/Enums";

export interface IAssetSearchPanelProps {
  allTechnologies: ITechnology[];
  searchResults: IAsset[];
  loadSearchResult: (assets: string[]) => Promise<void>;
}

export interface IAssetSearchPanelState {
  selectedAssets: string[];
  pages: number;
  currentPage: number;
}

export class AssetSearchPanelState implements IAssetSearchPanelState {
  constructor(
    public pages: number = 0,
    public currentPage: number = 0,
    public selectedAssets: string[] = []
  ) { }
}

export default class AssetSearchPanel extends React.Component<IAssetSearchPanelProps, IAssetSearchPanelState> {
  private LOG_SOURCE: string = "AssetSearchPanel";
  private _searchChanged: boolean = false;
  private _pageSize: number = 5;

  constructor(props) {
    super(props);
    let pages = Math.ceil(props.searchResults.length / this._pageSize) - 1;
    this.state = new AssetSearchPanelState(pages);
  }

  public shouldComponentUpdate(nextProps: Readonly<IAssetSearchPanelProps>, nextState: Readonly<IAssetSearchPanelState>) {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    if (!isEqual(nextProps.searchResults, this.props.searchResults))
      this._searchChanged = true;
    return true;
  }

  public componentDidUpdate() {
    if (this._searchChanged) {
      this._searchChanged = false;
      let pages = (this.props.searchResults.length / this._pageSize) - 1;
      this.setState({
        pages: pages,
        currentPage: 0
      });
    }
  }

  private onPreviewAsset = (asset: IAsset) => {
    window.open(`${params.baseViewerUrl}?asset=${asset.Id}`, '_blank');
  }

  private onChecked = (assetId: string, checked: boolean): void => {
    let selectedAssets = cloneDeep(this.state.selectedAssets);
    let idx = selectedAssets.indexOf(assetId);
    if (idx > -1) {
      selectedAssets.splice(idx, 1);
    } else {
      selectedAssets.push(assetId);
    }

    this.setState({ selectedAssets: selectedAssets });
  }

  private addAssets = async () => {
    await this.props.loadSearchResult(this.state.selectedAssets);
  }

  public render(): React.ReactElement<IAssetSearchPanelProps> {
    try {
      //if (!this.props.searchResults || this.props.searchResults.length < 1) return null;
      let searchResults: IAsset[] = [];
      if (this.props.searchResults.length < this._pageSize) {
        searchResults = this.props.searchResults;
      } else {
        searchResults = this.props.searchResults.slice((this.state.currentPage * this._pageSize), (this.state.currentPage * this._pageSize) + this._pageSize);
      }
      return (
        <div data-component={this.LOG_SOURCE}>
          <div className="srchr-add-btn">
            <PrimaryButton
              text="Add Selected Assets"
              onClick={this.addAssets}
              allowDisabledFocus={false}
              disabled={(this.state.selectedAssets.length < 1)} />
          </div>
          {(!searchResults || searchResults.length < 1) &&
            <Label>{strings.NoSearchResults}</Label>
          }
          {searchResults && searchResults.map((a) => {
            let technology = find(this.props.allTechnologies, { Id: a.TechnologyId });
            let subject = null;
            if (a.SubjectId.length > 0) {
              subject = find(technology.Subjects, { Id: a.SubjectId });
            }
            let checked = includes(this.state.selectedAssets, a.Id);
            return (
              <SearchItem
                assetTitle={(a.Title instanceof Array) ? (a.Title as IMultilingualString[])[0].Text : a.Title as string}
                technologyName={(technology) ? technology.Name : strings.NotApplicable}
                subjectName={(subject) ? subject.Name : null}
                checked={checked}
                editable={a.Source === CustomWebpartSource.Tenant}
                onChecked={(ev?: React.FormEvent<HTMLElement | HTMLInputElement>, chk?: boolean) => {
                  this.onChecked(a.Id, chk);
                }}
                onPreviewAsset={() => {
                  this.onPreviewAsset(a);
                }}
              />
            );
          })
          }
          {this.state.pages > 0 &&
            <Paging
              pages={this.state.pages}
              currentPage={this.state.currentPage}
              changePage={(newPage) => { this.setState({ currentPage: newPage }); }} />
          }
        </div>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (assetHeader) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}
