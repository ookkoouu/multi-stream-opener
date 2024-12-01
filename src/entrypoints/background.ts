import { ContentScriptMatches } from "@/constants";
import { MultiMenu } from "@/core/components/menu/menu";
import { onMessage, sendMessage } from "@/core/message";
import { mount } from "@/utils/reactive-menu";

function keepalive() {
  setInterval(() => sendMessage("ping", undefined).catch(() => true), 10_000);
  onMessage("ping", () => undefined);
}

function mountMenu() {
  mount(
    MultiMenu(),
    { contexts: ["page", "link"], documentUrlPatterns: ContentScriptMatches },
    false,
  );
}

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(async () => {
    setTimeout(mountMenu, 1000);
    keepalive();
  });

  browser.runtime.onStartup.addListener(async () => {
    setTimeout(mountMenu, 1000);
    keepalive();
  });
});
