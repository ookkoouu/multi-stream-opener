import { ContentScriptMatches } from "./src/constants";
import { defineConfig } from "wxt";

export default defineConfig({
  srcDir: "src",
  manifest: {
    name: "__MSG_app_name__",
    description: "__MSG_app_description__",
    default_locale: "ja",
    permissions: ["storage", "contextMenus"],
    host_permissions: ContentScriptMatches,
  },
  modules: ["@wxt-dev/i18n/module", "@wxt-dev/auto-icons"],
  autoIcons: {
    baseIconPath: "assets/icon.svg",
    grayscaleOnDevelopment: false,
  },
});
