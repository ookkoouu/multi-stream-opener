import type { StreamChannel } from "../channels";
import type { Viewer } from "./types";

async function getUrl(channels: StreamChannel[]): Promise<string | undefined> {
  // https://multistre.am/fps_shaka/ibai

  const ids = channels
    .filter((e) => e.platform === "twitch")
    .map((e) => e.user.id);
  if (ids.length === 0) return;

  return `https://multistre.am/${ids.join("/")}`;
}

export const multistream: Viewer = {
  type: "multistre.am",
  name: "Multistre.am",
  getUrl,
};
