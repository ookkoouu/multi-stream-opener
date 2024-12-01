type ProtocolMap = {
  copyMultiUrl: (url: string) => void;
  showToast: (props: { label: string; sec?: number }) => void;
  ping: () => void;
};

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>(
  { logger: DefaultLogger.create("message") },
);
