import { DefaultLogger, fetchHTMLHead } from "@/utils";
import { ncap, or, r } from "@okou/regex-compose";
import type { StreamChannel } from "../channels";
import type { IPlatform } from "./types";

const logger = DefaultLogger.create("twitch");

const rTwitchURL = r`https://www\.twitch\.tv`;
const rStreamURL = r`${rTwitchURL}/\w+`;

const rIsWatchPage = or(
  r`<meta property="og:type" content="video\.other"`,
  r`<meta content="video\.other" property="og:type"`,
);
const rPageTitle = or(
  r`<meta name="title" content="${ncap("pagetitle", r`[^"]+`)}"`,
  r`<meta content="${ncap("pagetitle", r`[^"]+`)}" name="title"`,
);

async function createChannel(url: string): Promise<StreamChannel | undefined> {
  logger.debug("create:", url);
  const match = rStreamURL.exec(url);
  if (match == null || typeof match[0] !== "string") return;
  const _url = match[0];
  logger.debug("matched:", _url);
  const html = await fetchHTMLHead(_url).catch((_) => undefined);
  logger.groupCollapsed("html:");
  logger.debug(html);
  logger.groupEnd();
  if (html === undefined || !rIsWatchPage.test(html)) return;
  logger.debug("valid html");

  // pagetitle: "displayname - Twitch"
  // name: "displayname (username)"
  // id: "username"
  const displayName = rPageTitle
    .exec(html)
    ?.groups?.pagetitle.split(" - ")
    .at(0);
  const username = _url.split("/").at(-1) ?? "";
  logger.debug("displayName:", displayName);
  logger.debug("username:", username);
  if (!displayName || !username) return;

  return {
    platform: "twitch",
    url: _url,
    user: {
      id: username,
      name: displayName,
    },
  };
}

export const twitch: IPlatform = {
  createChannel,
  async getStreamURL(entry) {
    return entry.url;
  },
};
