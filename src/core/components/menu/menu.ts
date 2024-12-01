import { Show, normal, separator } from "@/utils/reactive-menu";
import { copyMulti, openMulti } from "../../core";
import { sendMessage } from "../../message";
import { CopyMenu } from "./copy";
import { Open } from "./open";
import { StreamList, useStreamChannel } from "./stream";

export function MultiMenu() {
  const [channelList, channels] = useStreamChannel();

  return normal(
    { label: i18n.t("app.name") },

    normal({
      label: i18n.t("menu.item.add"),
      onclick: async (info, tab) => {
        const ch = await channels.add(info.linkUrl ?? info.pageUrl ?? "");
        if (ch && tab?.id) {
          sendMessage(
            "showToast",
            { label: i18n.t("toast.added", [ch.user.name]) },
            tab.id,
          );
        }
      },
    }),

    Show(
      () => channelList().length > 0,
      separator(),
      StreamList({
        channels: channelList,
        clear: channels.clear,
        del: channels.del,
        down: channels.down,
        up: channels.up,
      }),
      separator(),

      Open((tabId) => openMulti(tabId)),
      CopyMenu((tabId) => copyMulti(tabId)),
    ),
  );
}
