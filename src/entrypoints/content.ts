import { ContentScriptMatches } from "@/constants";
import { Toast } from "@/core/components/toast/toast";
import { onMessage, sendMessage } from "@/core/message";
import { DefaultLogger } from "@/utils";

const logger = DefaultLogger.create("content");

export default defineContentScript({
  matches: ContentScriptMatches,
  world: "ISOLATED",
  runAt: "document_idle",
  cssInjectionMode: "ui",
  main: async (ctx) => {
    sendMessage("ping", undefined);

    let toast: Toast;

    onMessage("copyMultiUrl", (msg) => {
      navigator.clipboard.writeText(msg.data);
      toast.show({
        label: i18n.t("toast.copied"),
      });
      logger.debug("copied:", msg.data);
    });

    onMessage("showToast", ({ data }) => {
      toast.show({
        label: data.label,
        sec: data.sec,
      });
    });

    const ui = await createShadowRootUi(ctx, {
      name: "multi-opener",
      position: "overlay",
      anchor: "body",
      zIndex: 100000,
      onMount(uiContainer) {
        toast = new Toast(uiContainer);
        logger.debug("mounted:", uiContainer);
      },
    });

    ui.mount();

    logger.debug("loaded");
  },
});
