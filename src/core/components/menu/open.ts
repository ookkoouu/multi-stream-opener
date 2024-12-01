import { normal } from "@/utils/reactive-menu";
import { ViewerSelector, setDefaultViewer } from "./viewerList";

export function Open(onclick_: (tabId?: number) => void) {
  return normal(
    {
      label: i18n.t("menu.item.open"),
      onclick: (_, tab) => onclick_(tab?.id),
    },
    ViewerSelector({
      onclick: (t, tid) => {
        setDefaultViewer(t);
        onclick_(tid);
      },
    }),
  );
}
