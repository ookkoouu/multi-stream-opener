import type { StreamChannel } from "../channels";
import { Platform } from "../platforms";
import type { Viewer } from "./types";

async function getUrl(channels: StreamChannel[]): Promise<string | undefined> {
  // https://twitchtheater.tv/fps_shaka/v=abcd1234

  const tasks = [];
  for (const channel of channels) {
    switch (channel.platform) {
      case "twitch":
        tasks.push(channel.user.id);
        break;

      case "youtube":
        tasks.push(
          (async () => {
            const url = await Platform.getStreamURL(channel);
            if (!url) return;
            const id = new URL(url).searchParams.get("v") ?? undefined;
            if (!id) return;
            return `v=${id}`;
          })(),
        );
        break;
      default:
        throw new Error(
          `Unknown type: ${(channel.platform as { type: "__invalid__" }).type}`,
        );
    }
  }
  const ids = (await Promise.all(tasks)).filter((e) => e != null);
  return `https://twitchtheater.tv/${ids.join("/")}`;
}

export const twitchtheater: Viewer = {
  type: "twitchtheater.tv",
  name: "TwitchTheater.tv",
  getUrl,
};
