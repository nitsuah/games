/**
 * Test doubles for the Web Audio API and HTMLAudioElement.
 *
 * installFakeAudioContext() replaces window.AudioContext with a constructor
 * that records every context it creates, so tests can inspect the nodes a
 * sound routine built. installFakeAudioElement() replaces window.Audio with
 * an element whose load() fires `canplaythrough` (or `error` for srcs listed
 * in FakeAudio.failing) on the next microtask.
 */

export function createParam(value = 0) {
  return {
    value,
    setValueAtTime: jest.fn(),
    linearRampToValueAtTime: jest.fn(),
    exponentialRampToValueAtTime: jest.fn(),
    setTargetAtTime: jest.fn(),
  };
}

function createNode(kind, extra = {}) {
  const node = {
    kind,
    connect: jest.fn((dest) => dest),
    disconnect: jest.fn(),
    ...extra,
  };
  return node;
}

export function createFakeAudioContext({ state = 'running', sampleRate = 100 } = {}) {
  const ctx = {
    state,
    sampleRate,
    currentTime: 0,
    destination: createNode('destination'),
    nodes: [],
    resume: jest.fn(async () => {
      ctx.state = 'running';
    }),
    close: jest.fn(async () => {
      ctx.state = 'closed';
    }),
  };
  const track = (node) => {
    ctx.nodes.push(node);
    return node;
  };
  ctx.createOscillator = jest.fn(() =>
    track(createNode('oscillator', { type: 'sine', frequency: createParam(440), start: jest.fn(), stop: jest.fn() }))
  );
  ctx.createGain = jest.fn(() => track(createNode('gain', { gain: createParam(1) })));
  ctx.createBiquadFilter = jest.fn(() =>
    track(createNode('filter', { type: 'lowpass', frequency: createParam(350), Q: createParam(1) }))
  );
  ctx.createStereoPanner = jest.fn(() => track(createNode('panner', { pan: createParam(0) })));
  ctx.createBufferSource = jest.fn(() =>
    track(createNode('bufferSource', { buffer: null, start: jest.fn(), stop: jest.fn() }))
  );
  ctx.createBuffer = jest.fn((channels, length) => {
    const data = new Float32Array(length);
    return { length, getChannelData: () => data };
  });
  ctx.nodesOf = (kind) => ctx.nodes.filter((n) => n.kind === kind);
  return ctx;
}

export function installFakeAudioContext(options) {
  const contexts = [];
  const Ctor = jest.fn(() => {
    const ctx = createFakeAudioContext(options);
    contexts.push(ctx);
    return ctx;
  });
  window.AudioContext = Ctor;
  global.AudioContext = Ctor;
  return { Ctor, contexts };
}

export class FakeAudio {
  constructor() {
    this.listeners = {};
    this.paused = true;
    this.currentTime = 0;
    this.volume = 1;
    this.loop = false;
    this.src = '';
    this.load = jest.fn(() => {
      const src = this.src;
      Promise.resolve().then(() => {
        const event = FakeAudio.failing.has(src) ? 'error' : 'canplaythrough';
        (this.listeners[event] || []).slice().forEach((fn) => fn({ type: event }));
      });
    });
    this.play = jest.fn(async () => {
      if (FakeAudio.playRejects) throw new Error('play blocked');
      this.paused = false;
    });
    this.pause = jest.fn(() => {
      this.paused = true;
    });
    FakeAudio.instances.push(this);
  }

  addEventListener(type, fn) {
    (this.listeners[type] = this.listeners[type] || []).push(fn);
  }

  removeEventListener(type, fn) {
    this.listeners[type] = (this.listeners[type] || []).filter((f) => f !== fn);
  }
}
FakeAudio.instances = [];
FakeAudio.failing = new Set();
FakeAudio.playRejects = false;

export function installFakeAudioElement() {
  FakeAudio.instances = [];
  FakeAudio.failing = new Set();
  FakeAudio.playRejects = false;
  window.Audio = FakeAudio;
  global.Audio = FakeAudio;
  return FakeAudio;
}

/** Flush pending microtasks (e.g. FakeAudio load events). */
export const flushPromises = () => new Promise((r) => setTimeout(r, 0));
