import type { StreamChannel } from "../channels";
import type { Viewer } from "./types";

async function getUrl(channels: StreamChannel[]): Promise<string | undefined> {
  // https://www.costream.app/?stream=nacho_dayo&platform=twitch&stream2=sasatikk&platform2=twitch&stream3=sasatikk&platform3=twitch&chat3=true
  const url = new URL("https://www.costream.app/");
  const _channels = channels.filter((e) => e.platform === "twitch");
  if (_channels.length === 0) return;

  url.searchParams.set("stream", _channels[0].user.id);
  url.searchParams.set("platform", "twitch");
  if (_channels.length === 1) return url.toString();

  url.searchParams.set("stream2", _channels[1].user.id);
  url.searchParams.set("platform2", "twitch");
  url.searchParams.set("stream3", _channels[1].user.id);
  url.searchParams.set("platform3", "twitch");
  url.searchParams.set("chat3", "true");

  return url.toString();
}

export const costream: Viewer = {
  type: "costream.app",
  name: "Costream.app",
  getUrl,
};
