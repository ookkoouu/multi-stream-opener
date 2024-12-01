import { or, r } from "@okou/regex-compose";

export function randomStr(): string {
  return crypto.randomUUID().split("-")[4];
}

export function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

const rIgnoreTags = r`/${or(
  ...["body", "style"].map((s) => r`<${s}.+?</${s}>`),
)}/gs`;
export async function fetchHTMLHead(url: string): Promise<string> {
  const html = fetch(url, {
    headers: { accept: "text/html", "user-agent": "bot" },
  }).then((r) => r.text());
  return (await html).replaceAll(rIgnoreTags, "");
}
export async function fetchHTML(url: string): Promise<string> {
  return fetch(url, {
    headers: { accept: "text/html", "user-agent": "bot" },
  }).then((r) => r.text());
}

export function tryObjectAccess<T>(o: object, path: string): T | undefined {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  function accessRec(o: any, path: string[]) {
    if (o == null) return undefined;
    if (path.length === 0) return o;
    return accessRec(o?.[path[0]], path.slice(1));
  }

  return accessRec(o, path.split("."));
}

export function hasOwnT<T, K extends PropertyKey>(
  o: object,
  v: K,
): o is Record<K, T> {
  return Object.hasOwn(o, v);
}

export interface Logger {
  create: (name: string) => Logger;
  debug: (...msg: unknown[]) => void;
  error: (...msg: unknown[]) => void;
  log: (...msg: unknown[]) => void;
  warn: (...msg: unknown[]) => void;
  groupCollapsed: (...label: unknown[]) => void;
  groupEnd: () => void;
}

function getLogger(name = "MultiOpener"): Logger {
  const print = (f: (...msg: unknown[]) => void, ...arg: unknown[]) =>
    f(
      `%c[${name}]`,
      "color:deepskyblue; background-color:black; padding:2px; font-weight:600;",
      ...arg,
    );
  return {
    create: (_name) => getLogger(`${name}/${_name}`),
    debug: (...msg) => print(console.debug, ...msg),
    error: (...msg) => print(console.error, ...msg),
    log: (...msg) => print(console.log, ...msg),
    warn: (...msg) => print(console.warn, ...msg),
    groupCollapsed: (...label) => print(console.groupCollapsed, ...label),
    groupEnd: () => console.groupEnd(),
  };
}

export const DefaultLogger = getLogger();

export async function getActiveTab(): Promise<number | undefined> {
  return (await browser.tabs.query({ active: true })).at(0)?.id;
}
