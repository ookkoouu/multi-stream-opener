const logger = DefaultLogger.create("signal");

type Effect = () => void;
type Deps = Set<Effect>;
export type State<T> = {
  subs: Deps;
  rawValue: T;
  val: T;
};

const gDeps: Set<Effect> = new Set();
const gEffect: Effect = () => {
  for (const e of gDeps) {
    e();
  }
};
const currentEffect: Effect[] = [];

function track(target: State<unknown>) {
  const running = currentEffect.at(-1);
  if (running) {
    target.subs.add(running);
  }
}
function trigger(target: State<unknown>) {
  logger.log("state changed:", target);
  for (const sub of [...target.subs]) {
    sub();
  }
  setTimeout(() => gEffect());
}

const stateProto = {};
export function isState<T = unknown>(o: unknown): o is State<T> {
  if (o == null) return false;
  return Object.getPrototypeOf(o) === stateProto;
}
export function state<T>(value: T): State<T> {
  const s: State<T> = {
    subs: new Set(),
    rawValue: value,
    get val() {
      track(s);
      return this.rawValue;
    },
    set val(v: T) {
      if (this.rawValue === v) return;
      this.rawValue = v;
      trigger(s);
    },
  };
  Object.setPrototypeOf(s, stateProto);
  return s;
}

export function effect(fn: () => void) {
  currentEffect.push(fn);
  try {
    fn();
  } finally {
    currentEffect.pop();
  }
}

export function computed<T = unknown>(fn: () => T): () => T {
  let value: T;
  effect(() => {
    value = fn();
  });
  return () => value;
}

export function onStateChanged(callback: () => void): () => void {
  gDeps.add(callback);
  return () => gDeps.delete(callback);
}
