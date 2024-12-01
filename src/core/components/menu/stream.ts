import { For, effect, normal, state } from "@/utils/reactive-menu";
import equal from "fast-deep-equal";
import { Channels, type IChannels, type StreamChannel } from "../../channels";
import type { PlatformType } from "../../platforms";

const platformColors: Record<PlatformType, string> = {
  twitch: "🟪",
  youtube: "🟥",
};

interface StreamProps {
  platform: PlatformType;
  label: string;
  onUp: () => void;
  onDown: () => void;
  onDel: () => void;
}

export function Stream(p: StreamProps) {
  return normal(
    { label: `${platformColors[p.platform]} ${p.label}` },
    normal({ label: i18n.t("menu.item.up"), onclick: p.onUp }),
    normal({ label: i18n.t("menu.item.down"), onclick: p.onDown }),
    normal({ label: i18n.t("menu.item.delete"), onclick: p.onDel }),
  );
}

export function StreamList(p: {
  channels: () => StreamChannel[];
  up: (url: string) => void;
  down: (url: string) => void;
  del: (url: string) => void;
  clear: () => void;
}) {
  return [
    For(p.channels, (item) =>
      Stream({
        label: item.user.name,
        platform: item.platform,
        onDel: () => p.del(item.url),
        onDown: () => p.down(item.url),
        onUp: () => p.up(item.url),
      }),
    ),
    normal({
      label: i18n.t("menu.item.clear"),
      onclick: () => p.clear(),
    }),
  ];
}

export function useStreamChannel(): [() => StreamChannel[], IChannels] {
  const list = state<StreamChannel[]>([]);

  effect(() => {
    Channels.get().then((v) => {
      if (Array.isArray(v) && !equal(list.val, v)) {
        list.val = v;
      }
    });
  });

  return [
    () => list.val,
    {
      async add(url) {
        const res = await Channels.add(url);
        list.val = await Channels.get();
        return res;
      },
      async clear() {
        const res = await Channels.clear();
        list.val = await Channels.get();
        return res;
      },
      async del(url) {
        const res = await Channels.del(url);
        list.val = await Channels.get();
        return res;
      },
      async down(url) {
        const res = await Channels.down(url);
        list.val = await Channels.get();
        return res;
      },
      async up(url) {
        const res = await Channels.up(url);
        list.val = await Channels.get();
        return res;
      },
      async get() {
        const res = await Channels.get();
        list.val = await Channels.get();
        return res;
      },
    },
  ];
}
