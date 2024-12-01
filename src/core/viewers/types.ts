import type { StreamChannel } from "../channels";

export type ViewerType = "twitchtheater.tv" | "costream.app" | "multistre.am";
export interface Viewer {
  type: ViewerType;
  name: string;
  getUrl(channels: StreamChannel[]): Promise<string | undefined>;
}
