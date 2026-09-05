// Source of the JS/TS sandbox worker, kept as a string so it can be turned into a
// Blob URL at runtime. This runs on its own thread with no DOM access — the worker
// boundary *is* the sandbox, and a runaway loop is killed by terminating the thread
// rather than by trying to interrupt it from inside.

// Tried in order. More than one, because a single hard-coded CDN path is a single
// point of failure for every .ts file in the workspace — and a blocked CDN should
// degrade to "run it as JavaScript", never to a broken button.
export const SUCRASE_CDNS = [
  'https://cdn.jsdelivr.net/npm/sucrase@3.35.0/dist/browser/sucrase.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/sucrase/3.35.0/sucrase.min.js',
  'https://unpkg.com/sucrase@3.35.0/dist/browser/sucrase.min.js',
];

export const JS_WORKER_SOURCE = String.raw`
'use strict';

var SUCRASE_URLS = __SUCRASE_URLS__;
var sucraseReady = false;
var sucraseFailed = false;

function post(msg) { self.postMessage(msg); }
function out(kind, text) { post({ type: 'out', kind: kind, text: text }); }
function status(message) { post({ type: 'status', message: message }); }

/* ------------------------------------------------------------------ *
 * Value formatting — a small util.inspect, so console.log({a:1}) prints
 * { a: 1 } instead of [object Object].
 * ------------------------------------------------------------------ */
function quote(s) {
  var escaped = s
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
  return "'" + escaped + "'";
}

function isPlainKey(k) {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k);
}

function format(value, seen, depth) {
  seen = seen || new Set();
  depth = depth || 0;

  if (value === null) return 'null';
  if (value === undefined) return 'undefined';

  var t = typeof value;
  if (t === 'number') return Object.is(value, -0) ? '-0' : String(value);
  if (t === 'boolean') return String(value);
  if (t === 'bigint') return String(value) + 'n';
  if (t === 'symbol') return value.toString();
  if (t === 'string') return depth === 0 ? value : quote(value);
  if (t === 'function') {
    var name = value.name;
    if (/^class\s/.test(Function.prototype.toString.call(value))) {
      return '[class ' + (name || '(anonymous)') + ']';
    }
    return name ? '[Function: ' + name + ']' : '[Function (anonymous)]';
  }

  if (value instanceof Error) {
    return (value.stack || (value.name + ': ' + value.message));
  }
  if (value instanceof Date) return value.toISOString();
  if (value instanceof RegExp) return String(value);

  if (seen.has(value)) return '[Circular *1]';
  if (depth > 4) return Array.isArray(value) ? '[Array]' : '[Object]';

  seen.add(value);
  try {
    if (Array.isArray(value)) {
      if (value.length === 0) return '[]';
      var items = value.map(function (v) { return format(v, seen, depth + 1); });
      var oneLine = '[ ' + items.join(', ') + ' ]';
      if (oneLine.length <= 72 && oneLine.indexOf('\n') === -1) return oneLine;
      var pad = '  '.repeat(depth + 1);
      return '[\n' + items.map(function (i) { return pad + i; }).join(',\n') +
             '\n' + '  '.repeat(depth) + ']';
    }

    if (value instanceof Map) {
      if (value.size === 0) return 'Map(0) {}';
      var entries = [];
      value.forEach(function (v, k) {
        entries.push(format(k, seen, depth + 1) + ' => ' + format(v, seen, depth + 1));
      });
      return 'Map(' + value.size + ') { ' + entries.join(', ') + ' }';
    }

    if (value instanceof Set) {
      if (value.size === 0) return 'Set(0) {}';
      var vals = [];
      value.forEach(function (v) { vals.push(format(v, seen, depth + 1)); });
      return 'Set(' + value.size + ') { ' + vals.join(', ') + ' }';
    }

    if (ArrayBuffer.isView(value) && !(value instanceof DataView)) {
      var ta = Array.prototype.slice.call(value);
      return value.constructor.name + '(' + ta.length + ') [ ' + ta.join(', ') + ' ]';
    }

    if (typeof Promise !== 'undefined' && value instanceof Promise) return 'Promise { <pending> }';

    var keys = Object.keys(value);
    var ctor = value.constructor && value.constructor.name;
    var prefix = ctor && ctor !== 'Object' ? ctor + ' ' : '';
    if (keys.length === 0) return prefix + '{}';

    var parts = keys.map(function (k) {
      var key = isPlainKey(k) ? k : quote(k);
      return key + ': ' + format(value[k], seen, depth + 1);
    });
    var flat = prefix + '{ ' + parts.join(', ') + ' }';
    if (flat.length <= 72 && flat.indexOf('\n') === -1) return flat;
    var p = '  '.repeat(depth + 1);
    return prefix + '{\n' + parts.map(function (x) { return p + x; }).join(',\n') +
           '\n' + '  '.repeat(depth) + '}';
  } finally {
    seen.delete(value);
  }
}

function joinArgs(args) {
  return Array.prototype.map.call(args, function (a) { return format(a); }).join(' ');
}

/* ------------------------------------------------------------------ *
 * Console + process shims
 * ------------------------------------------------------------------ */
var counters = Object.create(null);
var timers = Object.create(null);

var sandboxConsole = {
  log: function () { out('stdout', joinArgs(arguments) + '\n'); },
  info: function () { out('stdout', joinArgs(arguments) + '\n'); },
  debug: function () { out('stdout', joinArgs(arguments) + '\n'); },
  warn: function () { out('stderr', joinArgs(arguments) + '\n'); },
  error: function () { out('stderr', joinArgs(arguments) + '\n'); },
  trace: function () { out('stderr', 'Trace: ' + joinArgs(arguments) + '\n'); },
  dir: function (o) { out('stdout', format(o, null, 1) + '\n'); },
  table: function (o) { out('stdout', format(o, null, 1) + '\n'); },
  group: function () { out('stdout', joinArgs(arguments) + '\n'); },
  groupEnd: function () {},
  assert: function (cond) {
    if (!cond) {
      out('stderr', 'Assertion failed' +
        (arguments.length > 1 ? ': ' + joinArgs(Array.prototype.slice.call(arguments, 1)) : '') + '\n');
    }
  },
  count: function (label) {
    label = label || 'default';
    counters[label] = (counters[label] || 0) + 1;
    out('stdout', label + ': ' + counters[label] + '\n');
  },
  time: function (label) { timers[label || 'default'] = Date.now(); },
  timeEnd: function (label) {
    label = label || 'default';
    if (timers[label] === undefined) return;
    out('stdout', label + ': ' + (Date.now() - timers[label]) + 'ms\n');
    delete timers[label];
  },
  clear: function () { post({ type: 'clear' }); }
};

/* stdin, exposed the way each ecosystem expects it */
var stdinLines = [];
var stdinCursor = 0;

function readline() {
  if (stdinCursor >= stdinLines.length) return null;
  return stdinLines[stdinCursor++];
}

var processShim = {
  argv: ['node', 'main.js'],
  env: {},
  platform: 'browser',
  exitCode: 0,
  stdout: { write: function (s) { out('stdout', String(s)); return true; } },
  stderr: { write: function (s) { out('stderr', String(s)); return true; } },
  exit: function (code) { throw { __exit: true, code: code || 0 }; },
  cwd: function () { return '/home/guest/portfolio'; },
  nextTick: function (fn) { Promise.resolve().then(fn); },
  hrtime: { bigint: function () { return BigInt(Math.round(performance.now() * 1e6)); } },
  memoryUsage: function () { return { heapUsed: 0, heapTotal: 0, rss: 0 }; },
  version: 'v20.0.0-portfolio'
};

/* Deliberately unsupported, with an honest message rather than a confusing
   ReferenceError. Nothing here has a filesystem behind it. */
function requireShim(name) {
  throw new Error(
    "Cannot find module '" + name + "'. This sandbox runs a single file with no " +
    'package installation — the standard library and Web APIs are available, npm modules are not.'
  );
}

/* ------------------------------------------------------------------ *
 * TypeScript handling
 * ------------------------------------------------------------------ */
function ensureSucrase() {
  if (sucraseReady || sucraseFailed) return;
  status('Fetching the TypeScript transform (first run only)...');
  for (var i = 0; i < SUCRASE_URLS.length; i++) {
    try {
      importScripts(SUCRASE_URLS[i]);
      if (typeof self.Sucrase !== 'undefined') {
        sucraseReady = true;
        return;
      }
    } catch (e) {
      /* try the next mirror */
    }
  }
  sucraseFailed = true;
}

function prepare(code, filename, isTypeScript) {
  if (!isTypeScript) return code;
  ensureSucrase();
  if (sucraseReady) {
    try {
      var transforms = ['typescript'];
      if (/\.tsx$/.test(filename)) transforms.push('jsx');
      return self.Sucrase.transform(code, {
        transforms: transforms,
        filePath: filename,
        production: true
      }).code;
    } catch (e) {
      out('stderr', 'TypeScript transform failed: ' + (e && e.message ? e.message : String(e)) + '\n');
      throw e;
    }
  }
  status('TypeScript transform unavailable offline — running the file as plain JavaScript.');
  return code;
}

/* ------------------------------------------------------------------ *
 * Runner
 * ------------------------------------------------------------------ */
self.onmessage = function (event) {
  var data = event.data || {};
  if (data.type !== 'run') return;

  stdinLines = typeof data.stdin === 'string' && data.stdin.length
    ? data.stdin.replace(/\n$/, '').split('\n')
    : [];
  stdinCursor = 0;
  processShim.argv = ['node', data.filename || 'main.js'];

  var finished = false;
  function finish(exitCode, error) {
    if (finished) return;
    finished = true;
    post({ type: 'done', exitCode: exitCode, error: error || null });
  }

  function reportThrown(err) {
    if (err && err.__exit) { finish(err.code); return true; }
    var text = err instanceof Error
      ? (err.stack || (err.name + ': ' + err.message))
      : 'Uncaught ' + format(err);
    // Strip our own wrapper frames so the trace points at the user's code.
    text = String(text).split('\n').filter(function (line) {
      return line.indexOf('blob:') === -1 && line.indexOf('__sandbox__') === -1;
    }).join('\n');
    out('stderr', text + '\n');
    finish(1);
    return true;
  }

  var source;
  try {
    source = prepare(data.code, data.filename || 'main.js', !!data.isTypeScript);
  } catch (e) {
    finish(1);
    return;
  }

  // Wrapped in an async function so top-level await works, exactly like an ESM entry point.
  var wrapper;
  try {
    wrapper = new Function(
      'console', 'process', 'require', 'readline', 'prompt', 'module', 'exports', 'globalThis__',
      '"use strict";\nreturn (async function __sandbox__() {\n' + source + '\n})();'
    );
  } catch (syntaxError) {
    reportThrown(syntaxError);
    return;
  }

  var moduleShim = { exports: {} };
  var promise;
  try {
    promise = wrapper(
      sandboxConsole, processShim, requireShim, readline, readline,
      moduleShim, moduleShim.exports, self
    );
  } catch (e) {
    reportThrown(e);
    return;
  }

  Promise.resolve(promise).then(
    function () { finish(processShim.exitCode || 0); },
    function (e) { reportThrown(e); }
  );
};

self.onerror = function (message) {
  out('stderr', String(message) + '\n');
  post({ type: 'done', exitCode: 1, error: String(message) });
};

self.onunhandledrejection = function (event) {
  var reason = event && event.reason;
  out('stderr', 'Unhandled promise rejection: ' +
    (reason instanceof Error ? (reason.stack || reason.message) : format(reason)) + '\n');
};
`.replace('__SUCRASE_URLS__', JSON.stringify(SUCRASE_CDNS));
