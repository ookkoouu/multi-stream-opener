import type { StreamChannel } from "../channels";

export type PlatformType = "youtube" | "twitch";
export interface IPlatform {
  createChannel(url: string): Promise<StreamChannel | undefined>;
  getStreamURL(channel: StreamChannel): Promise<string | undefined>;
}
