import type { Menus, Tabs } from "wxt/browser";
import { type MenuElement, type Real, dom2real } from "./elements";
import { onStateChanged } from "./signal";

const logger = DefaultLogger.create("menu");

const onclickHandlers = new Map<string, Real["onclick"]>();

function render(
  element: MenuElement,
  defaultProps: Partial<Real>,
  asRoot = true,
): Real[] {
  const dom = element();
  if (asRoot) {
    return dom.children
      .flatMap((e) => dom2real(e))
      .map((e) => ({ ...e, ...defaultProps }));
  }
  return dom2real(dom).map((e) => ({ ...e, ...defaultProps }));
}

interface MountOptions {
  contexts: Menus.ContextType[];
  documentUrlPatterns: string[];
}
const defaultMountOptions: MountOptions = {
  contexts: ["page"],
  documentUrlPatterns: [],
};
export async function mount(
  element: MenuElement,
  opts = defaultMountOptions,
  asRoot = true,
): Promise<() => void> {
  await browser.contextMenus.removeAll();

  // run at menu item clicked
  const onclickCB = (info: Menus.OnClickData, tab?: Tabs.Tab) => {
    logger.log("clicked:", info, tab);
    const hdl = onclickHandlers.get(String(info.menuItemId));
    if (hdl) {
      hdl(info, tab);
    }
  };
  browser.contextMenus.onClicked.addListener(onclickCB);

  // run at re-rendering
  const create = async () => {
    await browser.contextMenus.removeAll();
    onclickHandlers.clear();

    const real = render(element, opts, asRoot);
    logger.debug("rendered:", real);
    for (const e of real) {
      if (e.onclick) {
        onclickHandlers.set(e.id, e.onclick);
      }
      const c = omit(e, "onclick");
      // logger.debug("create:", c);
      browser.contextMenus.create(c);
    }
  };

  await create();

  const unsub = onStateChanged(create);

  return () => {
    browser.contextMenus.removeAll();
    browser.contextMenus.onClicked.removeListener(onclickCB);
    unsub();
  };
}

function omit<T, K extends keyof T>(o: T, key: K): Omit<T, K> {
  const res = { ...o };
  //@ts-expect-error
  res[key] = undefined;
  return res;
}
