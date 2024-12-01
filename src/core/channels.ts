import { storageKey } from "@/constants";
import { Platform } from "./platforms";
import type { PlatformType } from "./platforms";

const logger = DefaultLogger.create("channels");

let channelsCache: StreamChannel[] = [];

export type StreamChannel = {
  platform: PlatformType;
  url: string;
  user: {
    id: string;
    name: string;
  };
};

export interface IChannels {
  add(url: string): Promise<StreamChannel | undefined>;
  get(): Promise<StreamChannel[]>;
  up(url: string): Promise<void>;
  down(url: string): Promise<void>;
  del(url: string): Promise<void>;
  clear(): Promise<void>;
}

async function save(e: StreamChannel[]): Promise<void> {
  channelsCache = e;
  return storage.setItem(storageKey.channels, e);
}
async function load(): Promise<StreamChannel[]> {
  if (channelsCache.length === 0) {
    return storage
      .getItem<StreamChannel[]>(storageKey.channels)
      .then((v) => v ?? []);
  }
  return channelsCache;
}

function swap<T>(arr: T[], i: number, j: number): T[] {
  if (Math.max(i, j) >= arr.length) return arr;
  const tmp = [...arr];
  tmp[i] = arr[j];
  tmp[j] = arr[i];
  return tmp;
}

export const Channels: IChannels = {
  add: async (url: string) => {
    const channels = await load();
    const ch = await Platform.createChannel(url);
    if (ch !== undefined && channels.every((e) => e.url !== ch.url)) {
      await save([...channels, ch]);
      logger.log("add:", await load());
    }
    return ch;
  },
  get: async () => {
    return load();
  },
  up: async (url: string) => {
    const channels = await load();
    const i = channels.findIndex((e) => e.url === url);
    if (i === -1 || i === 0) return;
    await save(swap(channels, i, i - 1));
    logger.log("up:", await load());
  },
  down: async (url: string) => {
    const channels = await load();
    const i = channels.findIndex((e) => e.url === url);
    if (i === -1 || i === channels.length - 1) return;
    await save(swap(channels, i, i + 1));
    logger.log("down:", await load());
  },
  del: async (url: string) => {
    const channels = await load();
    await save(channels.filter((e) => e.url !== url));
    logger.log("del:", await load());
  },
  clear: async () => {
    await save([]);
  },
};
