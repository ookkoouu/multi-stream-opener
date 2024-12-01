import { state } from "@/utils/reactive-menu";
import type { StorageItemKey } from "wxt/storage";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const local = state<Record<string, any>>({});

browser.storage.local.get().then((v) => {
  local.val = v;
});

export function useStorage<T>(
  key: StorageItemKey,
  fallback: T,
): [() => T, (v: T) => void] {
  const get = () => local.val[key] ?? fallback;
  const set = (v: T) => {
    local.val = { ...local.val, [key]: v };
    browser.storage.local.set({ [key]: v });
  };
  return [get, set];
}
