import { storageKey } from "@/constants";
import { type ViewerType, viewers } from "@/core/viewers";
import { For, normal } from "@/utils/reactive-menu";
import { useStorage } from "./useStorage";

export const [defaultViewer, setDefaultViewer] = useStorage<ViewerType>(
  storageKey.viewer,
  "twitchtheater.tv",
);

export function ViewerSelector({
  onclick,
}: {
  onclick?: (type: ViewerType, tabId?: number) => void;
}) {
  return For(
    () => viewers,
    (item) =>
      normal({
        label: item.name,
        onclick: (_, tab) => onclick?.(item.type, tab?.id),
      }),
  );
}
