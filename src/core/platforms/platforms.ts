import { twitch } from "./twitch";
import type { IPlatform } from "./types";
import { youtube } from "./youtube";

const _platforms: IPlatform[] = [youtube, twitch];

export const Platform: IPlatform = {
  async createChannel(url) {
    for (const pl of _platforms) {
      const ch = await pl.createChannel(url);
      if (ch) return ch;
    }
  },
  async getStreamURL(channel) {
    for (const pl of _platforms) {
      const url = await pl.getStreamURL(channel);
      if (url) return url;
    }
  },
};
