export const ContentScriptMatches = [
  "https://www.twitch.tv/*",
  "https://www.youtube.com/*",
];

export const storageKey = {
  channels: "local:channels",
  viewer: "local:viewer",
} as const;
