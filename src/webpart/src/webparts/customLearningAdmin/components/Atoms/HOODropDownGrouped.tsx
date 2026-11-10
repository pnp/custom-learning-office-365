import HOODropDown, { IHOODropDownGroup, IHOODropDownItem, IHOODropDownProps } from "@n8d/htwoo-react/HOODropDown";

/**
 * Workaround for an @n8d/htwoo-react HOODropDown bug (still present in 2.11.1):
 * with grouped options, the closed-state display text is only searched for in
 * the first group, so a selection in any later group shows its raw key (GUID).
 * This subclass replaces the display lookup so every group is searched.
 * Remove once the library is fixed.
 */
export default class HOODropDownGrouped extends HOODropDown {
  constructor(props: IHOODropDownProps) {
    super(props);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any)._getDisplayValue = (): string => {
      const currentValue = this.state.currentValue;
      const options = this.props.options as (IHOODropDownGroup | IHOODropDownItem)[];
      const items: IHOODropDownItem[] = this.state.grouped
        ? (options as IHOODropDownGroup[]).reduce((all, g) => all.concat(g.groupItems || []), [] as IHOODropDownItem[])
        : options as IHOODropDownItem[];
      const match = items.find((item) => item.key === currentValue);
      return match ? match.text : (currentValue as string) || "";
    };
  }
}
