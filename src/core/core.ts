import { Channels } from "./channels";
import { defaultViewer } from "./components/menu/viewerList";
import { sendMessage } from "./message";
import { getMultiURL } from "./viewers";

export async function openMulti(tabId?: number) {
  sendMessage("showToast", { label: i18n.t("toast.fetching") }, tabId).catch(
    () => null,
  );

  const url = await getMultiURL(defaultViewer(), await Channels.get());
  if (url) {
    browser.tabs.create({ active: true, url });
  }
}

export async function copyMulti(tabId?: number) {
  sendMessage("showToast", { label: i18n.t("toast.fetching") }, tabId).catch(
    () => null,
  );

  const url = await getMultiURL(defaultViewer(), await Channels.get());
  if (url) {
    await sendMessage("copyMultiUrl", url, tabId).catch(() => null);
  } else {
    sendMessage("showToast", { label: i18n.t("toast.failed") }, tabId).catch(
      () => null,
    );
  }
}
