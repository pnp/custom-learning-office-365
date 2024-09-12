import { Logger, LogLevel } from "@pnp/logging";
import * as React from "react";

import HOOIcon from "@n8d/htwoo-react/HOOIcon";
import { Templates } from '../../../common/models/Enums';

export interface ICategoryItemProps {
  index: number;
  dragMode: boolean;
  subcategoryId: string;
  subcategoryImage: string;
  subcategoryName: string;
  selectItem: (type: string, id: string) => void;
  onDragStart: (event: React.DragEvent<HTMLElement>, index: number) => void;
  onDragEnter: (index: number) => void;
  onDragEnd: (event) => void;
}

declare module 'react' {
  interface HTMLAttributes<T> extends React.DOMAttributes<T> {
    // extends React's HTMLAttributes for lazy loading
    loading?: string;
  }
}

export default class CategoryItem extends React.PureComponent<ICategoryItemProps> {
  private LOG_SOURCE: string = "CategoryItem";

  constructor(props) {
    super(props);
  }

  private handleKeyPress(event): void {
    // Handles both mouse clicks and keyboard
    // activate with Enter or Space

    // Keypresses other then Enter and Space should not trigger a command
    if (event instanceof KeyboardEvent && event.key !== "Enter" && event.key !== " ") {
      return;
    }
    if (!this.props.dragMode) {
      this.props.selectItem(Templates.SubCategory, this.props.subcategoryId);
    }
  }

  public render(): React.ReactElement<ICategoryItemProps> {
    try {
      let categoryImage;

      if (this.props.subcategoryImage === "") {
        categoryImage = "data:image/gif;base64,R0lGODlhFgHIAIAAAP///wAAACH/C1hNUCBEYXRhWE1QPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjQ5NWUyN2ZjLTI3NmYtNDU2Zi1hOGNjLWRkZThiMDQ0N2JlNiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo5QkM2Mzk3RTE1N0YxMUU5ODhGQkI3NkM3RDA0NTQ5MCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo5QkM2Mzk3RDE1N0YxMUU5ODhGQkI3NkM3RDA0NTQ5MCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoTWFjaW50b3NoKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjQ5NWUyN2ZjLTI3NmYtNDU2Zi1hOGNjLWRkZThiMDQ0N2JlNiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo0OTVlMjdmYy0yNzZmLTQ1NmYtYThjYy1kZGU4YjA0NDdiZTYiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4B//79/Pv6+fj39vX08/Lx8O/u7ezr6uno5+bl5OPi4eDf3t3c29rZ2NfW1dTT0tHQz87NzMvKycjHxsXEw8LBwL++vby7urm4t7a1tLOysbCvrq2sq6qpqKempaSjoqGgn56dnJuamZiXlpWUk5KRkI+OjYyLiomIh4aFhIOCgYB/fn18e3p5eHd2dXRzcnFwb25tbGtqaWhnZmVkY2JhYF9eXVxbWllYV1ZVVFNSUVBPTk1MS0pJSEdGRURDQkFAPz49PDs6OTg3NjU0MzIxMC8uLSwrKikoJyYlJCMiISAfHh0cGxoZGBcWFRQTEhEQDw4NDAsKCQgHBgUEAwIBAAAh+QQBAAAAACwAAAAAFgHIAAAC/4SPqcvtD6OctNqLs968+w+G4kiW5omm6sq27gvH8kzX9o3n+s73/g8MCofEovGITCqXzKbzCY1Kp9Sq9YrNarfcrvcLDovH5LL5jE6r1+y2+w2Py+f0uv2Oz+v3/L7/DxgoOEhYaHiImKi4yNjo+AgZKTlJWWl5iZmpucnZ6fkJGio6SlpqeoqaqrrK2ur6ChsrO0tba3uLm6u7y9vr+wscLDxMXGx8jJysvMzc7PwMHS09TV1tfY2drb3N3e39DR4uPk5ebn6Onq6+zt7u/g4fLz9PX29/j5+vv8/f7/8PMKDAgQQLGjyIMKHChQwbOnwIMaLEiRQrWryIMaPGjT4cO3r8CDKkyJEkS5o8iTKlypUsW7p8CTOmzJk0a9q8iTOnzp08e/r8CTSo0KFEixo9ijSp0qVMmzp9CtVoAQA7";
      } else {
        categoryImage = this.props.subcategoryImage;
      }

      return (
        <article data-component={this.LOG_SOURCE}
          tabIndex={0}
          className="category-item"
          onClick={() => { if (!this.props.dragMode) { this.props.selectItem(Templates.SubCategory, this.props.subcategoryId); } }}
          onKeyDown={(e) => this.handleKeyPress(e)}
          key={`item-${this.props.index}`}
          role="button"
          draggable={this.props.dragMode}
          onDragStart={(event) => { this.props.onDragStart(event, this.props.index); }}
          onDragEnter={() => { this.props.onDragEnter(this.props.index); }}
          onDragEnd={this.props.onDragEnd}
          data-index={this.props.index}
        >
          <div className="category-icon" role="presentation">
            <img src={categoryImage} alt="" loading="lazy" />
          </div>
          <div className="category-label">
            {this.props.dragMode &&
              <div className="category-handle">
                <HOOIcon
                  iconName="icon-re-order-dots-vertical-regular"
                />
              </div>
            }
            <span>
              {this.props.subcategoryName}
            </span>
          </div>
        </article>
      );
    } catch (err) {
      Logger.write(`🎓 M365LP:${this.LOG_SOURCE} (render) - ${err}`, LogLevel.Error);
      return null;
    }
  }
}
