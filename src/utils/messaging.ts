import type { Logger } from "@/utils";
import type { Runtime } from "webextension-polyfill";

type MaybePromise<T> = T | Promise<T>;
type ProtocolMap = { [k: string]: (arg: never) => unknown };
type GetArg<T extends ProtocolMap, K extends keyof T> = Parameters<T[K]>[0];
type GetReturn<T extends ProtocolMap, K extends keyof T> = ReturnType<T[K]>;
type Message<T extends ProtocolMap, K extends keyof T> = {
  id: string;
  type: K;
  data: GetArg<T, K>;
  sender: Runtime.MessageSender;
};
type MessageHandler<T extends ProtocolMap, K extends keyof T> = (
  message: Message<T, K>,
) => MaybePromise<GetReturn<T, K>>;

interface Messenger<T extends ProtocolMap> {
  sendMessage<K extends keyof T>(
    type: K,
    data: GetArg<T, K>,
    tabId?: number,
  ): Promise<GetReturn<T, K>>;
  sendMessageSafe<K extends keyof T>(
    type: K,
    data: GetArg<T, K>,
    tabId?: number,
  ): Promise<GetReturn<T, K> | undefined>;
  onMessage<K extends keyof T>(
    type: K,
    handler: MessageHandler<T, K>,
  ): () => void;
}

export interface MessagingConfig {
  logger: Logger;
}

export function defineExtensionMessaging<T extends ProtocolMap = ProtocolMap>(
  config?: MessagingConfig,
): Messenger<T> {
  return {
    onMessage: (type, handler) => {
      const listener = (
        message: Message<T, typeof type>,
        sender: Runtime.MessageSender,
      ) => {
        if (typeof message !== "object" || message.type !== type) {
          return;
        }

        config?.logger.debug(`recive {id=${message.id}} ᐊ─`, message);

        const result = handler({ ...message, sender });
        return Promise.resolve(result)
          .then((res) =>
            config?.logger.debug(`recive {id=${message.id}} ─ᐅ`, res),
          )
          .catch((err) =>
            config?.logger.debug(`recive {id=${message.id}} ─ᐅ`, err),
          );
      };

      browser.runtime.onMessage.addListener(listener);
      return () => browser.runtime.onMessage.removeListener(listener);
    },

    sendMessage: async <K extends keyof T>(
      type: K,
      arg: GetArg<T, K>,
      tabId?: number,
    ) => {
      const message: Omit<Message<T, K>, "sender"> = {
        type: type,
        data: arg,
        id: crypto.randomUUID().split("-")[0],
      };

      config?.logger.debug(`send {id=${message.id}} ─ᐅ`, message, tabId);

      const res = await (
        tabId == null
          ? (browser.runtime.sendMessage(message) as Promise<GetReturn<T, K>>)
          : (browser.tabs.sendMessage(tabId, message) as Promise<
              GetReturn<T, K>
            >)
      ).catch((err) => {
        config?.logger.debug(`send {id=${message.id}} ᐊ─`, err);
        throw err;
      });

      config?.logger.debug(`send {id=${message.id}} ᐊ─`, res);

      return res;
    },
    sendMessageSafe(type, data, tabId) {
      return this.sendMessage(type, data, tabId).catch((_) => undefined);
    },
  };
}
