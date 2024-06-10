import * as React from "react";
import { Logger, LogLevel } from "@pnp/logging";

import isEqual from "lodash-es/isEqual";

export interface IPagingProps {
  pages: number;
  currentPage: number;
  changePage: (newPage: number) => void;
}

export interface IPagingState {
  displayPages: number[];
}

export class PagingState implements IPagingState {
  constructor(
    public displayPages: number[] = [0]
  ) { }
}

export default class Paging extends React.Component<IPagingProps, IPagingState> {
  private LOG_SOURCE: string = "Paging";
  private _pageChanged: boolean = false;

  constructor(props) {
    super(props);
    const displayPages = this.getDisplayPages(props.currentPage, props.pages);
    this.state = new PagingState(displayPages);
  }

  private getDisplayPages(currentPage: number, pages: number): number[] {
    const displayPages: number[] = [];
    const start = (currentPage - 2) >= 0 ? (currentPage - 2) : 0;
    const end = (currentPage + 2) <= (this.props.pages - 1) ? (currentPage + 2) : (this.props.pages - 1);
    let count = start;
    while (count <= end && count < this.props.pages) {
      displayPages.push(count);
      count++;
    }
    while (displayPages.length < 5) {
      if (Math.max(...displayPages) < this.props.pages)
        displayPages.push(displayPages[displayPages.length - 1] + 1);
      else
        displayPages.push(-1);
    }
    return displayPages;
  }

  public shouldComponentUpdate(nextProps: Readonly<IPagingProps>, nextState: Readonly<IPagingState>): boolean {
    if ((isEqual(nextState, this.state) && isEqual(nextProps, this.props)))
      return false;
    if (!isEqual(nextProps.currentPage, this.props.currentPage))
      this._pageChanged = true;
    return true;
  }

  public componentDidUpdate(): void {
    if (this._pageChanged) {
      this._pageChanged = false;
      this.setState({
        displayPages: this.getDisplayPages(this.props.currentPage, this.props.pages)
      });
    }
  }

  private movePrevious = (): void => {
    this.props.changePage(this.props.currentPage - 1);
  }

  private moveNext = (): void => {
    this.props.changePage(this.props.currentPage + 1);
  }

  public render(): React.ReactElement<IPagingProps> {
    try {
      const showFirstMore = this.state.displayPages[0] > 0;
      const showLastMore = this.props.pages > Math.max(...this.state.displayPages);
      return (
        <ol className="pagination" data-component={this.LOG_SOURCE}>
          <li className={`pagination-item ${(showFirstMore) ? "" : "hidden"} `}>
            <button className="pagination-button" onClick={this.movePrevious}>&lt;&lt;</button>
          </li>

          {this.props.pages && this.state.displayPages.map((page: number, idx) => {
            return (
              <li key={idx} className={`pagination-item ${(page === -1) ? "hidden" : ""} `}>
                <button className={`pagination-button ${(page === this.props.currentPage) ? "selected" : ""}`}
                  onClick={() => { this.props.changePage(page); }}
                  aria-title={`${page + 1} of ${this.props.pages} pages`}
                >{page + 1}</button>
              </li>
            );
          })
          }
          <li className={`pagination-item ${(showLastMore) ? "" : "hidden"} `}>
            <button className="pagination-button"
              title={`${this.state.displayPages[this.state.displayPages.length - 1] + 1} of ${this.props.pages} pages`}
              onClick={this.moveNext}
            >&gt;&gt;</button>
          </li>
        </ol>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}