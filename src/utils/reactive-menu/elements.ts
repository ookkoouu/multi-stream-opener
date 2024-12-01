import type { Menus, Tabs } from "wxt/browser";

// utils
type ReqOf<T, K extends keyof T> = Required<Pick<T, K>> &
  Pick<T, Exclude<keyof T, K>>;

// elements
export type MenuElement = () => Dom;
export type Child =
  | MenuElement
  | MenuElement[]
  | undefined
  | (() => Child)
  | Child[];
type ParentableElement = (props: object, ...children: Child[]) => MenuElement;
type SingleElement = (props: object) => MenuElement;
export type IntrinsicElement = ParentableElement | SingleElement;

interface DomProps {
  id: string;
  type: Menus.ItemType;
  label?: string;
  checked?: boolean;
  enabled?: boolean;
  parentId?: string;
}
export interface Dom extends DomProps {
  onclick?: (info: Menus.OnClickData, tab?: Tabs.Tab) => void;
  children: Dom[];
}
export interface Real
  extends ReqOf<Menus.CreateCreatePropertiesType, "id" | "type"> {
  onclick?: (info: Menus.OnClickData, tab?: Tabs.Tab) => void;
}

export function dom2real(dom: Dom): Real[] {
  const real: Real = {
    id: dom.id,
    type: dom.type,
    title: dom.label,
    checked: dom.checked,
    enabled: dom.enabled,
    parentId: dom.parentId,
    onclick: dom.onclick,
  };
  for (const child of dom.children) {
    child.parentId = real.id;
  }
  const realChildren = dom.children.flatMap((e) => dom2real(e));
  return [real, ...realChildren];
}
