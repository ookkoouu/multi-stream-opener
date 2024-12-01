import type { Child } from "./elements";
import { type State, isState } from "./signal";

export function Show(
  props: { when: () => boolean; fallback: Child },
  ...children: Child[]
): Child;
export function Show(when: () => boolean, ...children: Child[]): Child;
export function Show(
  props: { when: () => boolean; fallback: Child } | (() => boolean),
  ...children: Child[]
): Child {
  if (typeof props === "function") {
    return () => (props() ? children : []);
  }
  return () => (props.when() ? children : props.fallback);
}

export function For<T>(
  each: State<T[]> | (() => T[]),
  child: (item: T, index?: number) => Child,
): Child {
  return () => {
    if (isState(each)) {
      return each.val.map((v, i) => child(v, i));
    }
    return each().map((v, i) => child(v, i));
  };
}
