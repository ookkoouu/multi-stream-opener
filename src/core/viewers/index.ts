import type { StreamChannel } from "../channels";
import { costream } from "./costream";
import { multistream } from "./multistream";
import { twitchtheater } from "./twitchtheater";
import type { Viewer, ViewerType } from "./types";

export type { ViewerType } from "./types";

export const viewers: Viewer[] = [twitchtheater, multistream, costream];

const viewerMap: Record<ViewerType, Viewer> = {
  "costream.app": costream,
  "multistre.am": multistream,
  "twitchtheater.tv": twitchtheater,
};

export async function getMultiURL(
  type: ViewerType,
  channels: StreamChannel[],
): Promise<string | undefined> {
  if (channels.length === 0) return;
  return viewerMap[type].getUrl(channels);
}
