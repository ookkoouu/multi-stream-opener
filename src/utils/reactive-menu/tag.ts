import { randomStr } from "@/utils";
import type { Child, Dom, MenuElement } from "./elements";

type ReqOf<T, K extends keyof T> = Required<Pick<T, K>> &
  Pick<T, Exclude<keyof T, K>>;
type Pretty<T> = { [P in keyof T]: T[P] };

const elementProto = {};
function element(fn: MenuElement): MenuElement {
  Object.setPrototypeOf(fn, elementProto);
  return fn;
}
function isElement(fn: Child): fn is MenuElement {
  return Object.getPrototypeOf(fn) === elementProto;
}

export type OnClickCallback = Dom["onclick"];
export type NormalProps = Pretty<
  ReqOf<
    Partial<Omit<Dom, "checked" | "parentId" | "type" | "children">>,
    "label"
  >
>;
export function normal(props: NormalProps, ...children: Child[]): MenuElement {
  function child2dom(child: Child): Dom[] {
    if (child === undefined) return [];
    if (isElement(child)) {
      return [child()];
    }
    if (Array.isArray(child)) {
      return child.flatMap((e) => (isElement(e) ? e() : child2dom(e)));
    }
    return child2dom(child());
  }

  return element(() => {
    const childrenDom: Dom[] = children.flatMap((e) => child2dom(e));
    const dom: Dom = {
      ...props,
      type: "normal",
      id: randomStr(),
      children: childrenDom,
    };
    return dom;
  });
}
export function separator(): MenuElement {
  return element(() => {
    return { type: "separator", id: randomStr(), children: [] };
  });
}

export type CheckboxProps = Pretty<
  ReqOf<Partial<Omit<Dom, "parentId" | "type" | "children">>, "label">
>;
export function checkbox(props: CheckboxProps): MenuElement {
  return element(() => {
    return {
      ...props,
      type: "checkbox",
      id: props.id ?? randomStr(),
      children: [],
    };
  });
}

export type RadioProps = Pretty<
  ReqOf<Partial<Omit<Dom, "parentId" | "type" | "children">>, "label">
>;
export function radio(props: RadioProps): MenuElement {
  return element(() => {
    return {
      ...props,
      type: "radio",
      id: props.id ?? randomStr(),
      children: [],
    };
  });
}
