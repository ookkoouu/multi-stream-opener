import { fetchHTMLHead, tryObjectAccess as tryAccessObject } from "@/utils";
import { maybe, ncap, or, r } from "@okou/regex-compose";
import type { StreamChannel } from "../channels";
import type { IPlatform } from "./types";

const logger = DefaultLogger.create("youtube");

const rYTURL = r`https://${maybe(r`www.`)}youtube\.com`;
const rYTURLShort = r`https://youtu\.be`;

const rVideoID = r`[-\w]+`;
const rStreamWatch = r`/watch\?v=${rVideoID}`;
const rStreamLive = r`/live/${rVideoID}`;
const rStreamURL = r`${rYTURL}${or(rStreamLive, rStreamWatch)}`;
const rStreamURLShort = r`${rYTURLShort}/${rVideoID}`;
function matchStreamURL(url: string): string | undefined {
  const match = rStreamURL.exec(url) ?? rStreamURLShort.exec(url) ?? undefined;
  return match?.at(0);
}

const rProfileChannel = r`/channel/[\w_-]+`;
const rProfileHandle = r`/@[^/?]+`;
const rProfileNamed = r`/[\w_-]+`;
const rProfileURL = new RegExp(
  r`${rYTURL}${or(rProfileHandle, rProfileChannel, rProfileNamed)}`,
);
function matchProfileURL(url: string): string | undefined {
  const match = rProfileURL.exec(url) ?? undefined;
  return match?.at(0);
}

const isWatchPage = (html: string) =>
  html.includes('<meta property="og:type" content="video.other"') ||
  html.includes('<meta content="video.other" property="og:type"');
const isProfilePage = (html: string) =>
  html.includes('<meta property="og:type" content="profile"') ||
  html.includes('<meta content="profile" property="og:type"');
const rCanonicalLink = r`<link rel="canonical" href="${ncap("url", r`[^"]+`)}"`;
const rLDjson = r`<script type="application/ld\+json" nonce="[^"]+">${ncap(
  "ldjson",
  r`.+?`,
)}</script>`;

async function fetchRss(channel: StreamChannel) {
  return fetchHTMLHead(
    `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.user.id}`,
  );
}

async function getChannelFromStream(
  url: string,
): Promise<StreamChannel | undefined> {
  const streamHtml = await fetchHTMLHead(url);
  logger.groupCollapsed("stream html:");
  logger.debug(streamHtml);
  logger.groupEnd();
  if (streamHtml === undefined) return;
  if (!isWatchPage(streamHtml)) return;
  const ldjson = JSON.parse(rLDjson.exec(streamHtml)?.groups?.ldjson ?? "{}");
  logger.debug("ldjson:", ldjson);
  const channelUrl = tryAccessObject<string>(
    ldjson,
    "itemListElement.0.item.@id",
  )?.replace("http:", "https:");
  logger.debug("channelUrl:", channelUrl);
  if (channelUrl === undefined) return;
  return getChannelFromProfile(channelUrl);
}

async function getChannelFromProfile(
  url: string,
): Promise<StreamChannel | undefined> {
  const html = await fetchHTMLHead(url);
  logger.groupCollapsed("profile html:");
  logger.debug(html);
  logger.groupEnd();
  if (html === undefined || !isProfilePage(html)) return;
  // https://www.youtube.com/channel/xxxx
  const matchedLink = rCanonicalLink.exec(html)?.groups?.url;
  if (matchedLink === undefined) return;
  logger.debug("matchedLink:", matchedLink);

  const id = matchedLink.split("/").at(-1);
  const rName = r`<meta property="og:title" content="${ncap("name", r`[^"]+`)}`;
  const name = rName.exec(html)?.groups?.name;
  logger.debug("id:", id);
  logger.debug("name:", name);
  if (name === undefined || id === undefined) return;

  return {
    platform: "youtube",
    url: matchedLink, // https://www.youtube.com/channel/{channelID}
    user: {
      id,
      name,
    },
  };
}

async function createChannel(url: string): Promise<StreamChannel | undefined> {
  logger.debug("create:", url);
  const str = matchStreamURL(url);
  if (str) {
    return getChannelFromStream(str).catch((_) => undefined);
  }
  const prf = matchProfileURL(url);
  if (prf) {
    return getChannelFromProfile(prf).catch((_) => undefined);
  }
}

async function getStreamURL(
  channel: StreamChannel,
): Promise<string | undefined> {
  const log = logger.create(`getStream:${channel.user.name}`);
  log.debug(channel);

  const html = await fetchHTML(`${channel.url}/live`);
  log.groupCollapsed("html:");
  log.debug(html);
  log.groupEnd();

  const streamUrl = rCanonicalLink.exec(html)?.groups?.url ?? undefined;
  if (streamUrl === undefined || !rStreamURL.test(streamUrl)) return;

  const isUpcoming = html.includes('"isUpcoming":true');
  log.debug("streamUrl:", streamUrl);
  log.debug("isUpcoming:", isUpcoming);

  return isUpcoming ? undefined : streamUrl;
}

export const youtube: IPlatform = {
  createChannel,
  getStreamURL,
};
