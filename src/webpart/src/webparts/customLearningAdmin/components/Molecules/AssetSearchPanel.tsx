import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash-es/isEqual";
import cloneDeep from "lodash-es/cloneDeep";
import find from "lodash-es/find";
import includes from "lodash-es/includes";
import HOOButton from "@n8d/htwoo-react/HOOButton";
import HOOLabel from "@n8d/htwoo-react/HOOLabel";

import * as strings from "M365LPStrings";
import { params } from "../../../common/services/Parameters";
import { IAsset, ITechnology, IMultilingualString } from "../../../common/models/Models";
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
    const pages = Math.ceil(props.searchResults.length / this._pageSize) - 1;
    this.state = new AssetSearchPanelState(pages);
  }

  public shouldComponentUpdate(nextProps: Readonly<IAssetSearchPanelProps>, nextState: Readonly<IAssetSearchPanelState>): boolean {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    if (!isEqual(nextProps.searchResults, this.props.searchResults))
      this._searchChanged = true;
    return true;
  }

  public componentDidUpdate(): void {
    if (this._searchChanged) {
      this._searchChanged = false;
      const pages = (this.props.searchResults.length / this._pageSize) - 1;
      this.setState({
        pages: pages,
        currentPage: 0
      });
    }
  }

  private onPreviewAsset = (asset: IAsset): void => {
    window.open(`${params.baseViewerUrl}?asset=${asset.Id}`, '_blank');
  }

  private onChecked = (assetId: string, checked: boolean): void => {
    const selectedAssets = cloneDeep(this.state.selectedAssets);
    const idx = selectedAssets.indexOf(assetId);
    if (idx > -1) {
      selectedAssets.splice(idx, 1);
    } else {
      selectedAssets.push(assetId);
    }

    this.setState({ selectedAssets: selectedAssets });
  }

  private addAssets = async (): Promise<void> => {
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
            <HOOButton
              label="Add Selected Assets"
              onClick={this.addAssets}
              disabled={(this.state.selectedAssets.length < 1)}
              type={1}
            />
          </div>
          {(!searchResults || searchResults.length < 1) &&
            <HOOLabel label={strings.NoSearchResults}/>
          }
          {searchResults && searchResults.map((a, idx) => {
            const technology = find(this.props.allTechnologies, { Id: a.TechnologyId });
            let subject = null;
            if (a.SubjectId.length > 0) {
              subject = find(technology.Subjects, { Id: a.SubjectId });
            }
            const checked = includes(this.state.selectedAssets, a.Id);
            return (
              <SearchItem
                key={idx}
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
