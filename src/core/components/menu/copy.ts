import { normal } from "@/utils/reactive-menu";
import { ViewerSelector, setDefaultViewer } from "./viewerList";

export function CopyMenu(onclick_: (tabId?: number) => void) {
  return normal(
    {
      label: i18n.t("menu.item.copy"),
      onclick: (_, tab) => onclick_(tab?.id),
    },
    ViewerSelector({
      onclick: (type, tid) => {
        setDefaultViewer(type);
        onclick_(tid);
      },
    }),
  );
}
