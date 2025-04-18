/*! For license information please see index.js.LICENSE.txt */
!(function (t, e) {
  "object" == typeof exports && "object" == typeof module
    ? (module.exports = e())
    : "function" == typeof define && define.amd
      ? define([], e)
      : "object" == typeof exports
        ? (exports.BillboardSDK = e())
        : (t.BillboardSDK = e());
})(this, () =>
  (() => {
    "use strict";
    var t = {
      d: (e, n) => {
        for (var r in n)
          t.o(n, r) &&
            !t.o(e, r) &&
            Object.defineProperty(e, r, { enumerable: !0, get: n[r] });
      },
    };
    (t.g = (function () {
      if ("object" == typeof globalThis) return globalThis;
      try {
        return this || new Function("return this")();
      } catch (t) {
        if ("object" == typeof window) return window;
      }
    })()),
      (t.o = (t, e) => Object.prototype.hasOwnProperty.call(t, e)),
      (t.r = (t) => {
        "undefined" != typeof Symbol &&
          Symbol.toStringTag &&
          Object.defineProperty(t, Symbol.toStringTag, { value: "Module" }),
          Object.defineProperty(t, "__esModule", { value: !0 });
      });
    var e = {};
    t.r(e), t.d(e, { BillboardSDK: () => bu, default: () => Eu });
    const n = function (t) {
        const e = [];
        let n = 0;
        for (let r = 0; r < t.length; r++) {
          let s = t.charCodeAt(r);
          s < 128
            ? (e[n++] = s)
            : s < 2048
              ? ((e[n++] = (s >> 6) | 192), (e[n++] = (63 & s) | 128))
              : 55296 == (64512 & s) &&
                  r + 1 < t.length &&
                  56320 == (64512 & t.charCodeAt(r + 1))
                ? ((s =
                    65536 + ((1023 & s) << 10) + (1023 & t.charCodeAt(++r))),
                  (e[n++] = (s >> 18) | 240),
                  (e[n++] = ((s >> 12) & 63) | 128),
                  (e[n++] = ((s >> 6) & 63) | 128),
                  (e[n++] = (63 & s) | 128))
                : ((e[n++] = (s >> 12) | 224),
                  (e[n++] = ((s >> 6) & 63) | 128),
                  (e[n++] = (63 & s) | 128));
        }
        return e;
      },
      r = {
        byteToCharMap_: null,
        charToByteMap_: null,
        byteToCharMapWebSafe_: null,
        charToByteMapWebSafe_: null,
        ENCODED_VALS_BASE:
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
        get ENCODED_VALS() {
          return this.ENCODED_VALS_BASE + "+/=";
        },
        get ENCODED_VALS_WEBSAFE() {
          return this.ENCODED_VALS_BASE + "-_.";
        },
        HAS_NATIVE_SUPPORT: "function" == typeof atob,
        encodeByteArray(t, e) {
          if (!Array.isArray(t))
            throw Error("encodeByteArray takes an array as a parameter");
          this.init_();
          const n = e ? this.byteToCharMapWebSafe_ : this.byteToCharMap_,
            r = [];
          for (let e = 0; e < t.length; e += 3) {
            const s = t[e],
              i = e + 1 < t.length,
              o = i ? t[e + 1] : 0,
              a = e + 2 < t.length,
              c = a ? t[e + 2] : 0,
              u = s >> 2,
              h = ((3 & s) << 4) | (o >> 4);
            let l = ((15 & o) << 2) | (c >> 6),
              d = 63 & c;
            a || ((d = 64), i || (l = 64)), r.push(n[u], n[h], n[l], n[d]);
          }
          return r.join("");
        },
        encodeString(t, e) {
          return this.HAS_NATIVE_SUPPORT && !e
            ? btoa(t)
            : this.encodeByteArray(n(t), e);
        },
        decodeString(t, e) {
          return this.HAS_NATIVE_SUPPORT && !e
            ? atob(t)
            : (function (t) {
                const e = [];
                let n = 0,
                  r = 0;
                for (; n < t.length; ) {
                  const s = t[n++];
                  if (s < 128) e[r++] = String.fromCharCode(s);
                  else if (s > 191 && s < 224) {
                    const i = t[n++];
                    e[r++] = String.fromCharCode(((31 & s) << 6) | (63 & i));
                  } else if (s > 239 && s < 365) {
                    const i =
                      (((7 & s) << 18) |
                        ((63 & t[n++]) << 12) |
                        ((63 & t[n++]) << 6) |
                        (63 & t[n++])) -
                      65536;
                    (e[r++] = String.fromCharCode(55296 + (i >> 10))),
                      (e[r++] = String.fromCharCode(56320 + (1023 & i)));
                  } else {
                    const i = t[n++],
                      o = t[n++];
                    e[r++] = String.fromCharCode(
                      ((15 & s) << 12) | ((63 & i) << 6) | (63 & o),
                    );
                  }
                }
                return e.join("");
              })(this.decodeStringToByteArray(t, e));
        },
        decodeStringToByteArray(t, e) {
          this.init_();
          const n = e ? this.charToByteMapWebSafe_ : this.charToByteMap_,
            r = [];
          for (let e = 0; e < t.length; ) {
            const i = n[t.charAt(e++)],
              o = e < t.length ? n[t.charAt(e)] : 0;
            ++e;
            const a = e < t.length ? n[t.charAt(e)] : 64;
            ++e;
            const c = e < t.length ? n[t.charAt(e)] : 64;
            if ((++e, null == i || null == o || null == a || null == c))
              throw new s();
            const u = (i << 2) | (o >> 4);
            if ((r.push(u), 64 !== a)) {
              const t = ((o << 4) & 240) | (a >> 2);
              if ((r.push(t), 64 !== c)) {
                const t = ((a << 6) & 192) | c;
                r.push(t);
              }
            }
          }
          return r;
        },
        init_() {
          if (!this.byteToCharMap_) {
            (this.byteToCharMap_ = {}),
              (this.charToByteMap_ = {}),
              (this.byteToCharMapWebSafe_ = {}),
              (this.charToByteMapWebSafe_ = {});
            for (let t = 0; t < this.ENCODED_VALS.length; t++)
              (this.byteToCharMap_[t] = this.ENCODED_VALS.charAt(t)),
                (this.charToByteMap_[this.byteToCharMap_[t]] = t),
                (this.byteToCharMapWebSafe_[t] =
                  this.ENCODED_VALS_WEBSAFE.charAt(t)),
                (this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[t]] = t),
                t >= this.ENCODED_VALS_BASE.length &&
                  ((this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(t)] =
                    t),
                  (this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(t)] =
                    t));
          }
        },
      };
    class s extends Error {
      constructor() {
        super(...arguments), (this.name = "DecodeBase64StringError");
      }
    }
    const i = function (t) {
        return (function (t) {
          const e = n(t);
          return r.encodeByteArray(e, !0);
        })(t).replace(/\./g, "");
      },
      o = () => {
        try {
          return (
            (function () {
              if ("undefined" != typeof self) return self;
              if ("undefined" != typeof window) return window;
              if (void 0 !== t.g) return t.g;
              throw new Error("Unable to locate global object.");
            })().__FIREBASE_DEFAULTS__ ||
            (() => {
              if ("undefined" == typeof process || void 0 === process.env)
                return;
              const t = process.env.__FIREBASE_DEFAULTS__;
              return t ? JSON.parse(t) : void 0;
            })() ||
            (() => {
              if ("undefined" == typeof document) return;
              let t;
              try {
                t = document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/);
              } catch (t) {
                return;
              }
              const e =
                t &&
                (function (t) {
                  try {
                    return r.decodeString(t, !0);
                  } catch (t) {
                    console.error("base64Decode failed: ", t);
                  }
                  return null;
                })(t[1]);
              return e && JSON.parse(e);
            })()
          );
        } catch (t) {
          return void console.info(
            `Unable to get __FIREBASE_DEFAULTS__ due to: ${t}`,
          );
        }
      },
      a = () => {
        var t;
        return null === (t = o()) || void 0 === t ? void 0 : t.config;
      };
    class c {
      constructor() {
        (this.reject = () => {}),
          (this.resolve = () => {}),
          (this.promise = new Promise((t, e) => {
            (this.resolve = t), (this.reject = e);
          }));
      }
      wrapCallback(t) {
        return (e, n) => {
          e ? this.reject(e) : this.resolve(n),
            "function" == typeof t &&
              (this.promise.catch(() => {}), 1 === t.length ? t(e) : t(e, n));
        };
      }
    }
    class u extends Error {
      constructor(t, e, n) {
        super(e),
          (this.code = t),
          (this.customData = n),
          (this.name = "FirebaseError"),
          Object.setPrototypeOf(this, u.prototype),
          Error.captureStackTrace &&
            Error.captureStackTrace(this, h.prototype.create);
      }
    }
    class h {
      constructor(t, e, n) {
        (this.service = t), (this.serviceName = e), (this.errors = n);
      }
      create(t, ...e) {
        const n = e[0] || {},
          r = `${this.service}/${t}`,
          s = this.errors[t],
          i = s
            ? (function (t, e) {
                return t.replace(l, (t, n) => {
                  const r = e[n];
                  return null != r ? String(r) : `<${n}?>`;
                });
              })(s, n)
            : "Error",
          o = `${this.serviceName}: ${i} (${r}).`;
        return new u(r, o, n);
      }
    }
    const l = /\{\$([^}]+)}/g;
    function d(t, e) {
      if (t === e) return !0;
      const n = Object.keys(t),
        r = Object.keys(e);
      for (const s of n) {
        if (!r.includes(s)) return !1;
        const n = t[s],
          i = e[s];
        if (f(n) && f(i)) {
          if (!d(n, i)) return !1;
        } else if (n !== i) return !1;
      }
      for (const t of r) if (!n.includes(t)) return !1;
      return !0;
    }
    function f(t) {
      return null !== t && "object" == typeof t;
    }
    function g(t) {
      return t && t._delegate ? t._delegate : t;
    }
    class p {
      constructor(t, e, n) {
        (this.name = t),
          (this.instanceFactory = e),
          (this.type = n),
          (this.multipleInstances = !1),
          (this.serviceProps = {}),
          (this.instantiationMode = "LAZY"),
          (this.onInstanceCreated = null);
      }
      setInstantiationMode(t) {
        return (this.instantiationMode = t), this;
      }
      setMultipleInstances(t) {
        return (this.multipleInstances = t), this;
      }
      setServiceProps(t) {
        return (this.serviceProps = t), this;
      }
      setInstanceCreatedCallback(t) {
        return (this.onInstanceCreated = t), this;
      }
    }
    const m = "[DEFAULT]";
    class y {
      constructor(t, e) {
        (this.name = t),
          (this.container = e),
          (this.component = null),
          (this.instances = new Map()),
          (this.instancesDeferred = new Map()),
          (this.instancesOptions = new Map()),
          (this.onInitCallbacks = new Map());
      }
      get(t) {
        const e = this.normalizeInstanceIdentifier(t);
        if (!this.instancesDeferred.has(e)) {
          const t = new c();
          if (
            (this.instancesDeferred.set(e, t),
            this.isInitialized(e) || this.shouldAutoInitialize())
          )
            try {
              const n = this.getOrInitializeService({ instanceIdentifier: e });
              n && t.resolve(n);
            } catch (t) {}
        }
        return this.instancesDeferred.get(e).promise;
      }
      getImmediate(t) {
        var e;
        const n = this.normalizeInstanceIdentifier(
            null == t ? void 0 : t.identifier,
          ),
          r =
            null !== (e = null == t ? void 0 : t.optional) && void 0 !== e && e;
        if (!this.isInitialized(n) && !this.shouldAutoInitialize()) {
          if (r) return null;
          throw Error(`Service ${this.name} is not available`);
        }
        try {
          return this.getOrInitializeService({ instanceIdentifier: n });
        } catch (t) {
          if (r) return null;
          throw t;
        }
      }
      getComponent() {
        return this.component;
      }
      setComponent(t) {
        if (t.name !== this.name)
          throw Error(
            `Mismatching Component ${t.name} for Provider ${this.name}.`,
          );
        if (this.component)
          throw Error(`Component for ${this.name} has already been provided`);
        if (((this.component = t), this.shouldAutoInitialize())) {
          if (
            (function (t) {
              return "EAGER" === t.instantiationMode;
            })(t)
          )
            try {
              this.getOrInitializeService({ instanceIdentifier: m });
            } catch (t) {}
          for (const [t, e] of this.instancesDeferred.entries()) {
            const n = this.normalizeInstanceIdentifier(t);
            try {
              const t = this.getOrInitializeService({ instanceIdentifier: n });
              e.resolve(t);
            } catch (t) {}
          }
        }
      }
      clearInstance(t = m) {
        this.instancesDeferred.delete(t),
          this.instancesOptions.delete(t),
          this.instances.delete(t);
      }
      async delete() {
        const t = Array.from(this.instances.values());
        await Promise.all([
          ...t.filter((t) => "INTERNAL" in t).map((t) => t.INTERNAL.delete()),
          ...t.filter((t) => "_delete" in t).map((t) => t._delete()),
        ]);
      }
      isComponentSet() {
        return null != this.component;
      }
      isInitialized(t = m) {
        return this.instances.has(t);
      }
      getOptions(t = m) {
        return this.instancesOptions.get(t) || {};
      }
      initialize(t = {}) {
        const { options: e = {} } = t,
          n = this.normalizeInstanceIdentifier(t.instanceIdentifier);
        if (this.isInitialized(n))
          throw Error(`${this.name}(${n}) has already been initialized`);
        if (!this.isComponentSet())
          throw Error(`Component ${this.name} has not been registered yet`);
        const r = this.getOrInitializeService({
          instanceIdentifier: n,
          options: e,
        });
        for (const [t, e] of this.instancesDeferred.entries())
          n === this.normalizeInstanceIdentifier(t) && e.resolve(r);
        return r;
      }
      onInit(t, e) {
        var n;
        const r = this.normalizeInstanceIdentifier(e),
          s =
            null !== (n = this.onInitCallbacks.get(r)) && void 0 !== n
              ? n
              : new Set();
        s.add(t), this.onInitCallbacks.set(r, s);
        const i = this.instances.get(r);
        return (
          i && t(i, r),
          () => {
            s.delete(t);
          }
        );
      }
      invokeOnInitCallbacks(t, e) {
        const n = this.onInitCallbacks.get(e);
        if (n)
          for (const r of n)
            try {
              r(t, e);
            } catch (t) {}
      }
      getOrInitializeService({ instanceIdentifier: t, options: e = {} }) {
        let n = this.instances.get(t);
        if (
          !n &&
          this.component &&
          ((n = this.component.instanceFactory(this.container, {
            instanceIdentifier: ((r = t), r === m ? void 0 : r),
            options: e,
          })),
          this.instances.set(t, n),
          this.instancesOptions.set(t, e),
          this.invokeOnInitCallbacks(n, t),
          this.component.onInstanceCreated)
        )
          try {
            this.component.onInstanceCreated(this.container, t, n);
          } catch (t) {}
        var r;
        return n || null;
      }
      normalizeInstanceIdentifier(t = m) {
        return this.component ? (this.component.multipleInstances ? t : m) : t;
      }
      shouldAutoInitialize() {
        return (
          !!this.component && "EXPLICIT" !== this.component.instantiationMode
        );
      }
    }
    class v {
      constructor(t) {
        (this.name = t), (this.providers = new Map());
      }
      addComponent(t) {
        const e = this.getProvider(t.name);
        if (e.isComponentSet())
          throw new Error(
            `Component ${t.name} has already been registered with ${this.name}`,
          );
        e.setComponent(t);
      }
      addOrOverwriteComponent(t) {
        this.getProvider(t.name).isComponentSet() &&
          this.providers.delete(t.name),
          this.addComponent(t);
      }
      getProvider(t) {
        if (this.providers.has(t)) return this.providers.get(t);
        const e = new y(t, this);
        return this.providers.set(t, e), e;
      }
      getProviders() {
        return Array.from(this.providers.values());
      }
    }
    const w = [];
    var b;
    !(function (t) {
      (t[(t.DEBUG = 0)] = "DEBUG"),
        (t[(t.VERBOSE = 1)] = "VERBOSE"),
        (t[(t.INFO = 2)] = "INFO"),
        (t[(t.WARN = 3)] = "WARN"),
        (t[(t.ERROR = 4)] = "ERROR"),
        (t[(t.SILENT = 5)] = "SILENT");
    })(b || (b = {}));
    const E = {
        debug: b.DEBUG,
        verbose: b.VERBOSE,
        info: b.INFO,
        warn: b.WARN,
        error: b.ERROR,
        silent: b.SILENT,
      },
      _ = b.INFO,
      T = {
        [b.DEBUG]: "log",
        [b.VERBOSE]: "log",
        [b.INFO]: "info",
        [b.WARN]: "warn",
        [b.ERROR]: "error",
      },
      S = (t, e, ...n) => {
        if (e < t.logLevel) return;
        const r = new Date().toISOString(),
          s = T[e];
        if (!s)
          throw new Error(
            `Attempted to log a message with an invalid logType (value: ${e})`,
          );
        console[s](`[${r}]  ${t.name}:`, ...n);
      };
    class C {
      constructor(t) {
        (this.name = t),
          (this._logLevel = _),
          (this._logHandler = S),
          (this._userLogHandler = null),
          w.push(this);
      }
      get logLevel() {
        return this._logLevel;
      }
      set logLevel(t) {
        if (!(t in b))
          throw new TypeError(`Invalid value "${t}" assigned to \`logLevel\``);
        this._logLevel = t;
      }
      setLogLevel(t) {
        this._logLevel = "string" == typeof t ? E[t] : t;
      }
      get logHandler() {
        return this._logHandler;
      }
      set logHandler(t) {
        if ("function" != typeof t)
          throw new TypeError(
            "Value assigned to `logHandler` must be a function",
          );
        this._logHandler = t;
      }
      get userLogHandler() {
        return this._userLogHandler;
      }
      set userLogHandler(t) {
        this._userLogHandler = t;
      }
      debug(...t) {
        this._userLogHandler && this._userLogHandler(this, b.DEBUG, ...t),
          this._logHandler(this, b.DEBUG, ...t);
      }
      log(...t) {
        this._userLogHandler && this._userLogHandler(this, b.VERBOSE, ...t),
          this._logHandler(this, b.VERBOSE, ...t);
      }
      info(...t) {
        this._userLogHandler && this._userLogHandler(this, b.INFO, ...t),
          this._logHandler(this, b.INFO, ...t);
      }
      warn(...t) {
        this._userLogHandler && this._userLogHandler(this, b.WARN, ...t),
          this._logHandler(this, b.WARN, ...t);
      }
      error(...t) {
        this._userLogHandler && this._userLogHandler(this, b.ERROR, ...t),
          this._logHandler(this, b.ERROR, ...t);
      }
    }
    let I, A;
    const D = new WeakMap(),
      k = new WeakMap(),
      N = new WeakMap(),
      x = new WeakMap(),
      R = new WeakMap();
    let L = {
      get(t, e, n) {
        if (t instanceof IDBTransaction) {
          if ("done" === e) return k.get(t);
          if ("objectStoreNames" === e) return t.objectStoreNames || N.get(t);
          if ("store" === e)
            return n.objectStoreNames[1]
              ? void 0
              : n.objectStore(n.objectStoreNames[0]);
        }
        return M(t[e]);
      },
      set: (t, e, n) => ((t[e] = n), !0),
      has: (t, e) =>
        (t instanceof IDBTransaction && ("done" === e || "store" === e)) ||
        e in t,
    };
    function O(t) {
      return "function" == typeof t
        ? (e = t) !== IDBDatabase.prototype.transaction ||
          "objectStoreNames" in IDBTransaction.prototype
          ? (
              A ||
              (A = [
                IDBCursor.prototype.advance,
                IDBCursor.prototype.continue,
                IDBCursor.prototype.continuePrimaryKey,
              ])
            ).includes(e)
            ? function (...t) {
                return e.apply(P(this), t), M(D.get(this));
              }
            : function (...t) {
                return M(e.apply(P(this), t));
              }
          : function (t, ...n) {
              const r = e.call(P(this), t, ...n);
              return N.set(r, t.sort ? t.sort() : [t]), M(r);
            }
        : (t instanceof IDBTransaction &&
            (function (t) {
              if (k.has(t)) return;
              const e = new Promise((e, n) => {
                const r = () => {
                    t.removeEventListener("complete", s),
                      t.removeEventListener("error", i),
                      t.removeEventListener("abort", i);
                  },
                  s = () => {
                    e(), r();
                  },
                  i = () => {
                    n(t.error || new DOMException("AbortError", "AbortError")),
                      r();
                  };
                t.addEventListener("complete", s),
                  t.addEventListener("error", i),
                  t.addEventListener("abort", i);
              });
              k.set(t, e);
            })(t),
          (n = t),
          (
            I ||
            (I = [
              IDBDatabase,
              IDBObjectStore,
              IDBIndex,
              IDBCursor,
              IDBTransaction,
            ])
          ).some((t) => n instanceof t)
            ? new Proxy(t, L)
            : t);
      var e, n;
    }
    function M(t) {
      if (t instanceof IDBRequest)
        return (function (t) {
          const e = new Promise((e, n) => {
            const r = () => {
                t.removeEventListener("success", s),
                  t.removeEventListener("error", i);
              },
              s = () => {
                e(M(t.result)), r();
              },
              i = () => {
                n(t.error), r();
              };
            t.addEventListener("success", s), t.addEventListener("error", i);
          });
          return (
            e
              .then((e) => {
                e instanceof IDBCursor && D.set(e, t);
              })
              .catch(() => {}),
            R.set(e, t),
            e
          );
        })(t);
      if (x.has(t)) return x.get(t);
      const e = O(t);
      return e !== t && (x.set(t, e), R.set(e, t)), e;
    }
    const P = (t) => R.get(t),
      V = ["get", "getKey", "getAll", "getAllKeys", "count"],
      F = ["put", "add", "delete", "clear"],
      U = new Map();
    function B(t, e) {
      if (!(t instanceof IDBDatabase) || e in t || "string" != typeof e) return;
      if (U.get(e)) return U.get(e);
      const n = e.replace(/FromIndex$/, ""),
        r = e !== n,
        s = F.includes(n);
      if (
        !(n in (r ? IDBIndex : IDBObjectStore).prototype) ||
        (!s && !V.includes(n))
      )
        return;
      const i = async function (t, ...e) {
        const i = this.transaction(t, s ? "readwrite" : "readonly");
        let o = i.store;
        return (
          r && (o = o.index(e.shift())),
          (await Promise.all([o[n](...e), s && i.done]))[0]
        );
      };
      return U.set(e, i), i;
    }
    var j;
    (j = L),
      (L = {
        ...j,
        get: (t, e, n) => B(t, e) || j.get(t, e, n),
        has: (t, e) => !!B(t, e) || j.has(t, e),
      });
    class q {
      constructor(t) {
        this.container = t;
      }
      getPlatformInfoString() {
        return this.container
          .getProviders()
          .map((t) => {
            if (
              (function (t) {
                const e = t.getComponent();
                return "VERSION" === (null == e ? void 0 : e.type);
              })(t)
            ) {
              const e = t.getImmediate();
              return `${e.library}/${e.version}`;
            }
            return null;
          })
          .filter((t) => t)
          .join(" ");
      }
    }
    const $ = "@firebase/app",
      z = "0.11.4",
      K = new C("@firebase/app"),
      H = "@firebase/app-compat",
      G = "@firebase/analytics-compat",
      Q = "@firebase/analytics",
      W = "@firebase/app-check-compat",
      X = "@firebase/app-check",
      Y = "@firebase/auth",
      J = "@firebase/auth-compat",
      Z = "@firebase/database",
      tt = "@firebase/data-connect",
      et = "@firebase/database-compat",
      nt = "@firebase/functions",
      rt = "@firebase/functions-compat",
      st = "@firebase/installations",
      it = "@firebase/installations-compat",
      ot = "@firebase/messaging",
      at = "@firebase/messaging-compat",
      ct = "@firebase/performance",
      ut = "@firebase/performance-compat",
      ht = "@firebase/remote-config",
      lt = "@firebase/remote-config-compat",
      dt = "@firebase/storage",
      ft = "@firebase/storage-compat",
      gt = "@firebase/firestore",
      pt = "@firebase/vertexai",
      mt = "@firebase/firestore-compat",
      yt = "firebase",
      vt = "[DEFAULT]",
      wt = {
        [$]: "fire-core",
        [H]: "fire-core-compat",
        [Q]: "fire-analytics",
        [G]: "fire-analytics-compat",
        [X]: "fire-app-check",
        [W]: "fire-app-check-compat",
        [Y]: "fire-auth",
        [J]: "fire-auth-compat",
        [Z]: "fire-rtdb",
        [tt]: "fire-data-connect",
        [et]: "fire-rtdb-compat",
        [nt]: "fire-fn",
        [rt]: "fire-fn-compat",
        [st]: "fire-iid",
        [it]: "fire-iid-compat",
        [ot]: "fire-fcm",
        [at]: "fire-fcm-compat",
        [ct]: "fire-perf",
        [ut]: "fire-perf-compat",
        [ht]: "fire-rc",
        [lt]: "fire-rc-compat",
        [dt]: "fire-gcs",
        [ft]: "fire-gcs-compat",
        [gt]: "fire-fst",
        [mt]: "fire-fst-compat",
        [pt]: "fire-vertex",
        "fire-js": "fire-js",
        [yt]: "fire-js-all",
      },
      bt = new Map(),
      Et = new Map(),
      _t = new Map();
    function Tt(t, e) {
      try {
        t.container.addComponent(e);
      } catch (n) {
        K.debug(
          `Component ${e.name} failed to register with FirebaseApp ${t.name}`,
          n,
        );
      }
    }
    function St(t) {
      const e = t.name;
      if (_t.has(e))
        return (
          K.debug(`There were multiple attempts to register component ${e}.`),
          !1
        );
      _t.set(e, t);
      for (const e of bt.values()) Tt(e, t);
      for (const e of Et.values()) Tt(e, t);
      return !0;
    }
    const Ct = new h("app", "Firebase", {
      "no-app":
        "No Firebase App '{$appName}' has been created - call initializeApp() first",
      "bad-app-name": "Illegal App name: '{$appName}'",
      "duplicate-app":
        "Firebase App named '{$appName}' already exists with different options or config",
      "app-deleted": "Firebase App named '{$appName}' already deleted",
      "server-app-deleted": "Firebase Server App has been deleted",
      "no-options":
        "Need to provide options, when not being deployed to hosting via source.",
      "invalid-app-argument":
        "firebase.{$appName}() takes either no argument or a Firebase App instance.",
      "invalid-log-argument":
        "First argument to `onLog` must be null or a function.",
      "idb-open":
        "Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.",
      "idb-get":
        "Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.",
      "idb-set":
        "Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.",
      "idb-delete":
        "Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.",
      "finalization-registry-not-supported":
        "FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.",
      "invalid-server-app-environment":
        "FirebaseServerApp is not for use in browser environments.",
    });
    class It {
      constructor(t, e, n) {
        (this._isDeleted = !1),
          (this._options = Object.assign({}, t)),
          (this._config = Object.assign({}, e)),
          (this._name = e.name),
          (this._automaticDataCollectionEnabled =
            e.automaticDataCollectionEnabled),
          (this._container = n),
          this.container.addComponent(new p("app", () => this, "PUBLIC"));
      }
      get automaticDataCollectionEnabled() {
        return this.checkDestroyed(), this._automaticDataCollectionEnabled;
      }
      set automaticDataCollectionEnabled(t) {
        this.checkDestroyed(), (this._automaticDataCollectionEnabled = t);
      }
      get name() {
        return this.checkDestroyed(), this._name;
      }
      get options() {
        return this.checkDestroyed(), this._options;
      }
      get config() {
        return this.checkDestroyed(), this._config;
      }
      get container() {
        return this._container;
      }
      get isDeleted() {
        return this._isDeleted;
      }
      set isDeleted(t) {
        this._isDeleted = t;
      }
      checkDestroyed() {
        if (this.isDeleted)
          throw Ct.create("app-deleted", { appName: this._name });
      }
    }
    function At(t, e = {}) {
      let n = t;
      "object" != typeof e && (e = { name: e });
      const r = Object.assign(
          { name: vt, automaticDataCollectionEnabled: !1 },
          e,
        ),
        s = r.name;
      if ("string" != typeof s || !s)
        throw Ct.create("bad-app-name", { appName: String(s) });
      if ((n || (n = a()), !n)) throw Ct.create("no-options");
      const i = bt.get(s);
      if (i) {
        if (d(n, i.options) && d(r, i.config)) return i;
        throw Ct.create("duplicate-app", { appName: s });
      }
      const o = new v(s);
      for (const t of _t.values()) o.addComponent(t);
      const c = new It(n, r, o);
      return bt.set(s, c), c;
    }
    function Dt(t, e, n) {
      var r;
      let s = null !== (r = wt[t]) && void 0 !== r ? r : t;
      n && (s += `-${n}`);
      const i = s.match(/\s|\//),
        o = e.match(/\s|\//);
      if (i || o) {
        const t = [`Unable to register library "${s}" with version "${e}":`];
        return (
          i &&
            t.push(
              `library name "${s}" contains illegal characters (whitespace or "/")`,
            ),
          i && o && t.push("and"),
          o &&
            t.push(
              `version name "${e}" contains illegal characters (whitespace or "/")`,
            ),
          void K.warn(t.join(" "))
        );
      }
      St(new p(`${s}-version`, () => ({ library: s, version: e }), "VERSION"));
    }
    const kt = "firebase-heartbeat-store";
    let Nt = null;
    function xt() {
      return (
        Nt ||
          (Nt = (function (
            t,
            e,
            { blocked: n, upgrade: r, blocking: s, terminated: i } = {},
          ) {
            const o = indexedDB.open(t, e),
              a = M(o);
            return (
              r &&
                o.addEventListener("upgradeneeded", (t) => {
                  r(
                    M(o.result),
                    t.oldVersion,
                    t.newVersion,
                    M(o.transaction),
                    t,
                  );
                }),
              n &&
                o.addEventListener("blocked", (t) =>
                  n(t.oldVersion, t.newVersion, t),
                ),
              a
                .then((t) => {
                  i && t.addEventListener("close", () => i()),
                    s &&
                      t.addEventListener("versionchange", (t) =>
                        s(t.oldVersion, t.newVersion, t),
                      );
                })
                .catch(() => {}),
              a
            );
          })("firebase-heartbeat-database", 1, {
            upgrade: (t, e) => {
              if (0 === e)
                try {
                  t.createObjectStore(kt);
                } catch (t) {
                  console.warn(t);
                }
            },
          }).catch((t) => {
            throw Ct.create("idb-open", { originalErrorMessage: t.message });
          })),
        Nt
      );
    }
    async function Rt(t, e) {
      try {
        const n = (await xt()).transaction(kt, "readwrite"),
          r = n.objectStore(kt);
        await r.put(e, Lt(t)), await n.done;
      } catch (t) {
        if (t instanceof u) K.warn(t.message);
        else {
          const e = Ct.create("idb-set", {
            originalErrorMessage: null == t ? void 0 : t.message,
          });
          K.warn(e.message);
        }
      }
    }
    function Lt(t) {
      return `${t.name}!${t.options.appId}`;
    }
    class Ot {
      constructor(t) {
        (this.container = t), (this._heartbeatsCache = null);
        const e = this.container.getProvider("app").getImmediate();
        (this._storage = new Pt(e)),
          (this._heartbeatsCachePromise = this._storage
            .read()
            .then((t) => ((this._heartbeatsCache = t), t)));
      }
      async triggerHeartbeat() {
        var t, e;
        try {
          const n = this.container
              .getProvider("platform-logger")
              .getImmediate()
              .getPlatformInfoString(),
            r = Mt();
          if (
            null ==
              (null === (t = this._heartbeatsCache) || void 0 === t
                ? void 0
                : t.heartbeats) &&
            ((this._heartbeatsCache = await this._heartbeatsCachePromise),
            null ==
              (null === (e = this._heartbeatsCache) || void 0 === e
                ? void 0
                : e.heartbeats))
          )
            return;
          if (
            this._heartbeatsCache.lastSentHeartbeatDate === r ||
            this._heartbeatsCache.heartbeats.some((t) => t.date === r)
          )
            return;
          if (
            (this._heartbeatsCache.heartbeats.push({ date: r, agent: n }),
            this._heartbeatsCache.heartbeats.length > 30)
          ) {
            const t = (function (t) {
              if (0 === t.length) return -1;
              let e = 0,
                n = t[0].date;
              for (let r = 1; r < t.length; r++)
                t[r].date < n && ((n = t[r].date), (e = r));
              return e;
            })(this._heartbeatsCache.heartbeats);
            this._heartbeatsCache.heartbeats.splice(t, 1);
          }
          return this._storage.overwrite(this._heartbeatsCache);
        } catch (t) {
          K.warn(t);
        }
      }
      async getHeartbeatsHeader() {
        var t;
        try {
          if (
            (null === this._heartbeatsCache &&
              (await this._heartbeatsCachePromise),
            null ==
              (null === (t = this._heartbeatsCache) || void 0 === t
                ? void 0
                : t.heartbeats) ||
              0 === this._heartbeatsCache.heartbeats.length)
          )
            return "";
          const e = Mt(),
            { heartbeatsToSend: n, unsentEntries: r } = (function (
              t,
              e = 1024,
            ) {
              const n = [];
              let r = t.slice();
              for (const s of t) {
                const t = n.find((t) => t.agent === s.agent);
                if (t) {
                  if ((t.dates.push(s.date), Vt(n) > e)) {
                    t.dates.pop();
                    break;
                  }
                } else if (
                  (n.push({ agent: s.agent, dates: [s.date] }), Vt(n) > e)
                ) {
                  n.pop();
                  break;
                }
                r = r.slice(1);
              }
              return { heartbeatsToSend: n, unsentEntries: r };
            })(this._heartbeatsCache.heartbeats),
            s = i(JSON.stringify({ version: 2, heartbeats: n }));
          return (
            (this._heartbeatsCache.lastSentHeartbeatDate = e),
            r.length > 0
              ? ((this._heartbeatsCache.heartbeats = r),
                await this._storage.overwrite(this._heartbeatsCache))
              : ((this._heartbeatsCache.heartbeats = []),
                this._storage.overwrite(this._heartbeatsCache)),
            s
          );
        } catch (t) {
          return K.warn(t), "";
        }
      }
    }
    function Mt() {
      return new Date().toISOString().substring(0, 10);
    }
    class Pt {
      constructor(t) {
        (this.app = t),
          (this._canUseIndexedDBPromise = this.runIndexedDBEnvironmentCheck());
      }
      async runIndexedDBEnvironmentCheck() {
        return (
          !!(function () {
            try {
              return "object" == typeof indexedDB;
            } catch (t) {
              return !1;
            }
          })() &&
          new Promise((t, e) => {
            try {
              let n = !0;
              const r =
                  "validate-browser-context-for-indexeddb-analytics-module",
                s = self.indexedDB.open(r);
              (s.onsuccess = () => {
                s.result.close(), n || self.indexedDB.deleteDatabase(r), t(!0);
              }),
                (s.onupgradeneeded = () => {
                  n = !1;
                }),
                (s.onerror = () => {
                  var t;
                  e(
                    (null === (t = s.error) || void 0 === t
                      ? void 0
                      : t.message) || "",
                  );
                });
            } catch (t) {
              e(t);
            }
          })
            .then(() => !0)
            .catch(() => !1)
        );
      }
      async read() {
        if (await this._canUseIndexedDBPromise) {
          const t = await (async function (t) {
            try {
              const e = (await xt()).transaction(kt),
                n = await e.objectStore(kt).get(Lt(t));
              return await e.done, n;
            } catch (t) {
              if (t instanceof u) K.warn(t.message);
              else {
                const e = Ct.create("idb-get", {
                  originalErrorMessage: null == t ? void 0 : t.message,
                });
                K.warn(e.message);
              }
            }
          })(this.app);
          return (null == t ? void 0 : t.heartbeats) ? t : { heartbeats: [] };
        }
        return { heartbeats: [] };
      }
      async overwrite(t) {
        var e;
        if (await this._canUseIndexedDBPromise) {
          const n = await this.read();
          return Rt(this.app, {
            lastSentHeartbeatDate:
              null !== (e = t.lastSentHeartbeatDate) && void 0 !== e
                ? e
                : n.lastSentHeartbeatDate,
            heartbeats: t.heartbeats,
          });
        }
      }
      async add(t) {
        var e;
        if (await this._canUseIndexedDBPromise) {
          const n = await this.read();
          return Rt(this.app, {
            lastSentHeartbeatDate:
              null !== (e = t.lastSentHeartbeatDate) && void 0 !== e
                ? e
                : n.lastSentHeartbeatDate,
            heartbeats: [...n.heartbeats, ...t.heartbeats],
          });
        }
      }
    }
    function Vt(t) {
      return i(JSON.stringify({ version: 2, heartbeats: t })).length;
    }
    St(new p("platform-logger", (t) => new q(t), "PRIVATE")),
      St(new p("heartbeat", (t) => new Ot(t), "PRIVATE")),
      Dt($, z, ""),
      Dt($, z, "esm2017"),
      Dt("fire-js", "");
    var Ft,
      Ut,
      Bt =
        "undefined" != typeof globalThis
          ? globalThis
          : "undefined" != typeof window
            ? window
            : "undefined" != typeof global
              ? global
              : "undefined" != typeof self
                ? self
                : {},
      jt = {};
    (function () {
      var t;
      function e() {
        (this.blockSize = -1),
          (this.blockSize = 64),
          (this.g = Array(4)),
          (this.B = Array(this.blockSize)),
          (this.o = this.h = 0),
          this.s();
      }
      function n(t, e, n) {
        n || (n = 0);
        var r = Array(16);
        if ("string" == typeof e)
          for (var s = 0; 16 > s; ++s)
            r[s] =
              e.charCodeAt(n++) |
              (e.charCodeAt(n++) << 8) |
              (e.charCodeAt(n++) << 16) |
              (e.charCodeAt(n++) << 24);
        else
          for (s = 0; 16 > s; ++s)
            r[s] = e[n++] | (e[n++] << 8) | (e[n++] << 16) | (e[n++] << 24);
        (e = t.g[0]), (n = t.g[1]), (s = t.g[2]);
        var i = t.g[3],
          o = (e + (i ^ (n & (s ^ i))) + r[0] + 3614090360) & 4294967295;
        (o =
          ((n =
            (s =
              (i =
                (e =
                  (n =
                    (s =
                      (i =
                        (e =
                          (n =
                            (s =
                              (i =
                                (e =
                                  (n =
                                    (s =
                                      (i =
                                        (e =
                                          (n =
                                            (s =
                                              (i =
                                                (e =
                                                  (n =
                                                    (s =
                                                      (i =
                                                        (e =
                                                          (n =
                                                            (s =
                                                              (i =
                                                                (e =
                                                                  (n =
                                                                    (s =
                                                                      (i =
                                                                        (e =
                                                                          (n =
                                                                            (s =
                                                                              (i =
                                                                                (e =
                                                                                  (n =
                                                                                    (s =
                                                                                      (i =
                                                                                        (e =
                                                                                          (n =
                                                                                            (s =
                                                                                              (i =
                                                                                                (e =
                                                                                                  (n =
                                                                                                    (s =
                                                                                                      (i =
                                                                                                        (e =
                                                                                                          (n =
                                                                                                            (s =
                                                                                                              (i =
                                                                                                                (e =
                                                                                                                  (n =
                                                                                                                    (s =
                                                                                                                      (i =
                                                                                                                        (e =
                                                                                                                          (n =
                                                                                                                            (s =
                                                                                                                              (i =
                                                                                                                                (e =
                                                                                                                                  n +
                                                                                                                                  (((o <<
                                                                                                                                    7) &
                                                                                                                                    4294967295) |
                                                                                                                                    (o >>>
                                                                                                                                      25))) +
                                                                                                                                ((((o =
                                                                                                                                  (i +
                                                                                                                                    (s ^
                                                                                                                                      (e &
                                                                                                                                        (n ^
                                                                                                                                          s))) +
                                                                                                                                    r[1] +
                                                                                                                                    3905402710) &
                                                                                                                                  4294967295) <<
                                                                                                                                  12) &
                                                                                                                                  4294967295) |
                                                                                                                                  (o >>>
                                                                                                                                    20))) +
                                                                                                                              ((((o =
                                                                                                                                (s +
                                                                                                                                  (n ^
                                                                                                                                    (i &
                                                                                                                                      (e ^
                                                                                                                                        n))) +
                                                                                                                                  r[2] +
                                                                                                                                  606105819) &
                                                                                                                                4294967295) <<
                                                                                                                                17) &
                                                                                                                                4294967295) |
                                                                                                                                (o >>>
                                                                                                                                  15))) +
                                                                                                                            ((((o =
                                                                                                                              (n +
                                                                                                                                (e ^
                                                                                                                                  (s &
                                                                                                                                    (i ^
                                                                                                                                      e))) +
                                                                                                                                r[3] +
                                                                                                                                3250441966) &
                                                                                                                              4294967295) <<
                                                                                                                              22) &
                                                                                                                              4294967295) |
                                                                                                                              (o >>>
                                                                                                                                10))) +
                                                                                                                          ((((o =
                                                                                                                            (e +
                                                                                                                              (i ^
                                                                                                                                (n &
                                                                                                                                  (s ^
                                                                                                                                    i))) +
                                                                                                                              r[4] +
                                                                                                                              4118548399) &
                                                                                                                            4294967295) <<
                                                                                                                            7) &
                                                                                                                            4294967295) |
                                                                                                                            (o >>>
                                                                                                                              25))) +
                                                                                                                        ((((o =
                                                                                                                          (i +
                                                                                                                            (s ^
                                                                                                                              (e &
                                                                                                                                (n ^
                                                                                                                                  s))) +
                                                                                                                            r[5] +
                                                                                                                            1200080426) &
                                                                                                                          4294967295) <<
                                                                                                                          12) &
                                                                                                                          4294967295) |
                                                                                                                          (o >>>
                                                                                                                            20))) +
                                                                                                                      ((((o =
                                                                                                                        (s +
                                                                                                                          (n ^
                                                                                                                            (i &
                                                                                                                              (e ^
                                                                                                                                n))) +
                                                                                                                          r[6] +
                                                                                                                          2821735955) &
                                                                                                                        4294967295) <<
                                                                                                                        17) &
                                                                                                                        4294967295) |
                                                                                                                        (o >>>
                                                                                                                          15))) +
                                                                                                                    ((((o =
                                                                                                                      (n +
                                                                                                                        (e ^
                                                                                                                          (s &
                                                                                                                            (i ^
                                                                                                                              e))) +
                                                                                                                        r[7] +
                                                                                                                        4249261313) &
                                                                                                                      4294967295) <<
                                                                                                                      22) &
                                                                                                                      4294967295) |
                                                                                                                      (o >>>
                                                                                                                        10))) +
                                                                                                                  ((((o =
                                                                                                                    (e +
                                                                                                                      (i ^
                                                                                                                        (n &
                                                                                                                          (s ^
                                                                                                                            i))) +
                                                                                                                      r[8] +
                                                                                                                      1770035416) &
                                                                                                                    4294967295) <<
                                                                                                                    7) &
                                                                                                                    4294967295) |
                                                                                                                    (o >>>
                                                                                                                      25))) +
                                                                                                                ((((o =
                                                                                                                  (i +
                                                                                                                    (s ^
                                                                                                                      (e &
                                                                                                                        (n ^
                                                                                                                          s))) +
                                                                                                                    r[9] +
                                                                                                                    2336552879) &
                                                                                                                  4294967295) <<
                                                                                                                  12) &
                                                                                                                  4294967295) |
                                                                                                                  (o >>>
                                                                                                                    20))) +
                                                                                                              ((((o =
                                                                                                                (s +
                                                                                                                  (n ^
                                                                                                                    (i &
                                                                                                                      (e ^
                                                                                                                        n))) +
                                                                                                                  r[10] +
                                                                                                                  4294925233) &
                                                                                                                4294967295) <<
                                                                                                                17) &
                                                                                                                4294967295) |
                                                                                                                (o >>>
                                                                                                                  15))) +
                                                                                                            ((((o =
                                                                                                              (n +
                                                                                                                (e ^
                                                                                                                  (s &
                                                                                                                    (i ^
                                                                                                                      e))) +
                                                                                                                r[11] +
                                                                                                                2304563134) &
                                                                                                              4294967295) <<
                                                                                                              22) &
                                                                                                              4294967295) |
                                                                                                              (o >>>
                                                                                                                10))) +
                                                                                                          ((((o =
                                                                                                            (e +
                                                                                                              (i ^
                                                                                                                (n &
                                                                                                                  (s ^
                                                                                                                    i))) +
                                                                                                              r[12] +
                                                                                                              1804603682) &
                                                                                                            4294967295) <<
                                                                                                            7) &
                                                                                                            4294967295) |
                                                                                                            (o >>>
                                                                                                              25))) +
                                                                                                        ((((o =
                                                                                                          (i +
                                                                                                            (s ^
                                                                                                              (e &
                                                                                                                (n ^
                                                                                                                  s))) +
                                                                                                            r[13] +
                                                                                                            4254626195) &
                                                                                                          4294967295) <<
                                                                                                          12) &
                                                                                                          4294967295) |
                                                                                                          (o >>>
                                                                                                            20))) +
                                                                                                      ((((o =
                                                                                                        (s +
                                                                                                          (n ^
                                                                                                            (i &
                                                                                                              (e ^
                                                                                                                n))) +
                                                                                                          r[14] +
                                                                                                          2792965006) &
                                                                                                        4294967295) <<
                                                                                                        17) &
                                                                                                        4294967295) |
                                                                                                        (o >>>
                                                                                                          15))) +
                                                                                                    ((((o =
                                                                                                      (n +
                                                                                                        (e ^
                                                                                                          (s &
                                                                                                            (i ^
                                                                                                              e))) +
                                                                                                        r[15] +
                                                                                                        1236535329) &
                                                                                                      4294967295) <<
                                                                                                      22) &
                                                                                                      4294967295) |
                                                                                                      (o >>>
                                                                                                        10))) +
                                                                                                  ((((o =
                                                                                                    (e +
                                                                                                      (s ^
                                                                                                        (i &
                                                                                                          (n ^
                                                                                                            s))) +
                                                                                                      r[1] +
                                                                                                      4129170786) &
                                                                                                    4294967295) <<
                                                                                                    5) &
                                                                                                    4294967295) |
                                                                                                    (o >>>
                                                                                                      27))) +
                                                                                                ((((o =
                                                                                                  (i +
                                                                                                    (n ^
                                                                                                      (s &
                                                                                                        (e ^
                                                                                                          n))) +
                                                                                                    r[6] +
                                                                                                    3225465664) &
                                                                                                  4294967295) <<
                                                                                                  9) &
                                                                                                  4294967295) |
                                                                                                  (o >>>
                                                                                                    23))) +
                                                                                              ((((o =
                                                                                                (s +
                                                                                                  (e ^
                                                                                                    (n &
                                                                                                      (i ^
                                                                                                        e))) +
                                                                                                  r[11] +
                                                                                                  643717713) &
                                                                                                4294967295) <<
                                                                                                14) &
                                                                                                4294967295) |
                                                                                                (o >>>
                                                                                                  18))) +
                                                                                            ((((o =
                                                                                              (n +
                                                                                                (i ^
                                                                                                  (e &
                                                                                                    (s ^
                                                                                                      i))) +
                                                                                                r[0] +
                                                                                                3921069994) &
                                                                                              4294967295) <<
                                                                                              20) &
                                                                                              4294967295) |
                                                                                              (o >>>
                                                                                                12))) +
                                                                                          ((((o =
                                                                                            (e +
                                                                                              (s ^
                                                                                                (i &
                                                                                                  (n ^
                                                                                                    s))) +
                                                                                              r[5] +
                                                                                              3593408605) &
                                                                                            4294967295) <<
                                                                                            5) &
                                                                                            4294967295) |
                                                                                            (o >>>
                                                                                              27))) +
                                                                                        ((((o =
                                                                                          (i +
                                                                                            (n ^
                                                                                              (s &
                                                                                                (e ^
                                                                                                  n))) +
                                                                                            r[10] +
                                                                                            38016083) &
                                                                                          4294967295) <<
                                                                                          9) &
                                                                                          4294967295) |
                                                                                          (o >>>
                                                                                            23))) +
                                                                                      ((((o =
                                                                                        (s +
                                                                                          (e ^
                                                                                            (n &
                                                                                              (i ^
                                                                                                e))) +
                                                                                          r[15] +
                                                                                          3634488961) &
                                                                                        4294967295) <<
                                                                                        14) &
                                                                                        4294967295) |
                                                                                        (o >>>
                                                                                          18))) +
                                                                                    ((((o =
                                                                                      (n +
                                                                                        (i ^
                                                                                          (e &
                                                                                            (s ^
                                                                                              i))) +
                                                                                        r[4] +
                                                                                        3889429448) &
                                                                                      4294967295) <<
                                                                                      20) &
                                                                                      4294967295) |
                                                                                      (o >>>
                                                                                        12))) +
                                                                                  ((((o =
                                                                                    (e +
                                                                                      (s ^
                                                                                        (i &
                                                                                          (n ^
                                                                                            s))) +
                                                                                      r[9] +
                                                                                      568446438) &
                                                                                    4294967295) <<
                                                                                    5) &
                                                                                    4294967295) |
                                                                                    (o >>>
                                                                                      27))) +
                                                                                ((((o =
                                                                                  (i +
                                                                                    (n ^
                                                                                      (s &
                                                                                        (e ^
                                                                                          n))) +
                                                                                    r[14] +
                                                                                    3275163606) &
                                                                                  4294967295) <<
                                                                                  9) &
                                                                                  4294967295) |
                                                                                  (o >>>
                                                                                    23))) +
                                                                              ((((o =
                                                                                (s +
                                                                                  (e ^
                                                                                    (n &
                                                                                      (i ^
                                                                                        e))) +
                                                                                  r[3] +
                                                                                  4107603335) &
                                                                                4294967295) <<
                                                                                14) &
                                                                                4294967295) |
                                                                                (o >>>
                                                                                  18))) +
                                                                            ((((o =
                                                                              (n +
                                                                                (i ^
                                                                                  (e &
                                                                                    (s ^
                                                                                      i))) +
                                                                                r[8] +
                                                                                1163531501) &
                                                                              4294967295) <<
                                                                              20) &
                                                                              4294967295) |
                                                                              (o >>>
                                                                                12))) +
                                                                          ((((o =
                                                                            (e +
                                                                              (s ^
                                                                                (i &
                                                                                  (n ^
                                                                                    s))) +
                                                                              r[13] +
                                                                              2850285829) &
                                                                            4294967295) <<
                                                                            5) &
                                                                            4294967295) |
                                                                            (o >>>
                                                                              27))) +
                                                                        ((((o =
                                                                          (i +
                                                                            (n ^
                                                                              (s &
                                                                                (e ^
                                                                                  n))) +
                                                                            r[2] +
                                                                            4243563512) &
                                                                          4294967295) <<
                                                                          9) &
                                                                          4294967295) |
                                                                          (o >>>
                                                                            23))) +
                                                                      ((((o =
                                                                        (s +
                                                                          (e ^
                                                                            (n &
                                                                              (i ^
                                                                                e))) +
                                                                          r[7] +
                                                                          1735328473) &
                                                                        4294967295) <<
                                                                        14) &
                                                                        4294967295) |
                                                                        (o >>>
                                                                          18))) +
                                                                    ((((o =
                                                                      (n +
                                                                        (i ^
                                                                          (e &
                                                                            (s ^
                                                                              i))) +
                                                                        r[12] +
                                                                        2368359562) &
                                                                      4294967295) <<
                                                                      20) &
                                                                      4294967295) |
                                                                      (o >>>
                                                                        12))) +
                                                                  ((((o =
                                                                    (e +
                                                                      (n ^
                                                                        s ^
                                                                        i) +
                                                                      r[5] +
                                                                      4294588738) &
                                                                    4294967295) <<
                                                                    4) &
                                                                    4294967295) |
                                                                    (o >>>
                                                                      28))) +
                                                                ((((o =
                                                                  (i +
                                                                    (e ^
                                                                      n ^
                                                                      s) +
                                                                    r[8] +
                                                                    2272392833) &
                                                                  4294967295) <<
                                                                  11) &
                                                                  4294967295) |
                                                                  (o >>> 21))) +
                                                              ((((o =
                                                                (s +
                                                                  (i ^ e ^ n) +
                                                                  r[11] +
                                                                  1839030562) &
                                                                4294967295) <<
                                                                16) &
                                                                4294967295) |
                                                                (o >>> 16))) +
                                                            ((((o =
                                                              (n +
                                                                (s ^ i ^ e) +
                                                                r[14] +
                                                                4259657740) &
                                                              4294967295) <<
                                                              23) &
                                                              4294967295) |
                                                              (o >>> 9))) +
                                                          ((((o =
                                                            (e +
                                                              (n ^ s ^ i) +
                                                              r[1] +
                                                              2763975236) &
                                                            4294967295) <<
                                                            4) &
                                                            4294967295) |
                                                            (o >>> 28))) +
                                                        ((((o =
                                                          (i +
                                                            (e ^ n ^ s) +
                                                            r[4] +
                                                            1272893353) &
                                                          4294967295) <<
                                                          11) &
                                                          4294967295) |
                                                          (o >>> 21))) +
                                                      ((((o =
                                                        (s +
                                                          (i ^ e ^ n) +
                                                          r[7] +
                                                          4139469664) &
                                                        4294967295) <<
                                                        16) &
                                                        4294967295) |
                                                        (o >>> 16))) +
                                                    ((((o =
                                                      (n +
                                                        (s ^ i ^ e) +
                                                        r[10] +
                                                        3200236656) &
                                                      4294967295) <<
                                                      23) &
                                                      4294967295) |
                                                      (o >>> 9))) +
                                                  ((((o =
                                                    (e +
                                                      (n ^ s ^ i) +
                                                      r[13] +
                                                      681279174) &
                                                    4294967295) <<
                                                    4) &
                                                    4294967295) |
                                                    (o >>> 28))) +
                                                ((((o =
                                                  (i +
                                                    (e ^ n ^ s) +
                                                    r[0] +
                                                    3936430074) &
                                                  4294967295) <<
                                                  11) &
                                                  4294967295) |
                                                  (o >>> 21))) +
                                              ((((o =
                                                (s +
                                                  (i ^ e ^ n) +
                                                  r[3] +
                                                  3572445317) &
                                                4294967295) <<
                                                16) &
                                                4294967295) |
                                                (o >>> 16))) +
                                            ((((o =
                                              (n +
                                                (s ^ i ^ e) +
                                                r[6] +
                                                76029189) &
                                              4294967295) <<
                                              23) &
                                              4294967295) |
                                              (o >>> 9))) +
                                          ((((o =
                                            (e +
                                              (n ^ s ^ i) +
                                              r[9] +
                                              3654602809) &
                                            4294967295) <<
                                            4) &
                                            4294967295) |
                                            (o >>> 28))) +
                                        ((((o =
                                          (i +
                                            (e ^ n ^ s) +
                                            r[12] +
                                            3873151461) &
                                          4294967295) <<
                                          11) &
                                          4294967295) |
                                          (o >>> 21))) +
                                      ((((o =
                                        (s + (i ^ e ^ n) + r[15] + 530742520) &
                                        4294967295) <<
                                        16) &
                                        4294967295) |
                                        (o >>> 16))) +
                                    ((((o =
                                      (n + (s ^ i ^ e) + r[2] + 3299628645) &
                                      4294967295) <<
                                      23) &
                                      4294967295) |
                                      (o >>> 9))) +
                                  ((((o =
                                    (e + (s ^ (n | ~i)) + r[0] + 4096336452) &
                                    4294967295) <<
                                    6) &
                                    4294967295) |
                                    (o >>> 26))) +
                                ((((o =
                                  (i + (n ^ (e | ~s)) + r[7] + 1126891415) &
                                  4294967295) <<
                                  10) &
                                  4294967295) |
                                  (o >>> 22))) +
                              ((((o =
                                (s + (e ^ (i | ~n)) + r[14] + 2878612391) &
                                4294967295) <<
                                15) &
                                4294967295) |
                                (o >>> 17))) +
                            ((((o =
                              (n + (i ^ (s | ~e)) + r[5] + 4237533241) &
                              4294967295) <<
                              21) &
                              4294967295) |
                              (o >>> 11))) +
                          ((((o =
                            (e + (s ^ (n | ~i)) + r[12] + 1700485571) &
                            4294967295) <<
                            6) &
                            4294967295) |
                            (o >>> 26))) +
                        ((((o =
                          (i + (n ^ (e | ~s)) + r[3] + 2399980690) &
                          4294967295) <<
                          10) &
                          4294967295) |
                          (o >>> 22))) +
                      ((((o =
                        (s + (e ^ (i | ~n)) + r[10] + 4293915773) &
                        4294967295) <<
                        15) &
                        4294967295) |
                        (o >>> 17))) +
                    ((((o =
                      (n + (i ^ (s | ~e)) + r[1] + 2240044497) & 4294967295) <<
                      21) &
                      4294967295) |
                      (o >>> 11))) +
                  ((((o =
                    (e + (s ^ (n | ~i)) + r[8] + 1873313359) & 4294967295) <<
                    6) &
                    4294967295) |
                    (o >>> 26))) +
                ((((o =
                  (i + (n ^ (e | ~s)) + r[15] + 4264355552) & 4294967295) <<
                  10) &
                  4294967295) |
                  (o >>> 22))) +
              ((((o = (s + (e ^ (i | ~n)) + r[6] + 2734768916) & 4294967295) <<
                15) &
                4294967295) |
                (o >>> 17))) +
            ((((o = (n + (i ^ (s | ~e)) + r[13] + 1309151649) & 4294967295) <<
              21) &
              4294967295) |
              (o >>> 11))) +
            ((i =
              (e =
                n +
                ((((o =
                  (e + (s ^ (n | ~i)) + r[4] + 4149444226) & 4294967295) <<
                  6) &
                  4294967295) |
                  (o >>> 26))) +
              ((((o = (i + (n ^ (e | ~s)) + r[11] + 3174756917) & 4294967295) <<
                10) &
                4294967295) |
                (o >>> 22))) ^
              ((s =
                i +
                ((((o = (s + (e ^ (i | ~n)) + r[2] + 718787259) & 4294967295) <<
                  15) &
                  4294967295) |
                  (o >>> 17))) |
                ~e)) +
            r[9] +
            3951481745) &
          4294967295),
          (t.g[0] = (t.g[0] + e) & 4294967295),
          (t.g[1] =
            (t.g[1] + (s + (((o << 21) & 4294967295) | (o >>> 11)))) &
            4294967295),
          (t.g[2] = (t.g[2] + s) & 4294967295),
          (t.g[3] = (t.g[3] + i) & 4294967295);
      }
      function r(t, e) {
        this.h = e;
        for (var n = [], r = !0, s = t.length - 1; 0 <= s; s--) {
          var i = 0 | t[s];
          (r && i == e) || ((n[s] = i), (r = !1));
        }
        this.g = n;
      }
      !(function (t, e) {
        function n() {}
        (n.prototype = e.prototype),
          (t.D = e.prototype),
          (t.prototype = new n()),
          (t.prototype.constructor = t),
          (t.C = function (t, n, r) {
            for (
              var s = Array(arguments.length - 2), i = 2;
              i < arguments.length;
              i++
            )
              s[i - 2] = arguments[i];
            return e.prototype[n].apply(t, s);
          });
      })(e, function () {
        this.blockSize = -1;
      }),
        (e.prototype.s = function () {
          (this.g[0] = 1732584193),
            (this.g[1] = 4023233417),
            (this.g[2] = 2562383102),
            (this.g[3] = 271733878),
            (this.o = this.h = 0);
        }),
        (e.prototype.u = function (t, e) {
          void 0 === e && (e = t.length);
          for (
            var r = e - this.blockSize, s = this.B, i = this.h, o = 0;
            o < e;

          ) {
            if (0 == i) for (; o <= r; ) n(this, t, o), (o += this.blockSize);
            if ("string" == typeof t) {
              for (; o < e; )
                if (((s[i++] = t.charCodeAt(o++)), i == this.blockSize)) {
                  n(this, s), (i = 0);
                  break;
                }
            } else
              for (; o < e; )
                if (((s[i++] = t[o++]), i == this.blockSize)) {
                  n(this, s), (i = 0);
                  break;
                }
          }
          (this.h = i), (this.o += e);
        }),
        (e.prototype.v = function () {
          var t = Array(
            (56 > this.h ? this.blockSize : 2 * this.blockSize) - this.h,
          );
          t[0] = 128;
          for (var e = 1; e < t.length - 8; ++e) t[e] = 0;
          var n = 8 * this.o;
          for (e = t.length - 8; e < t.length; ++e)
            (t[e] = 255 & n), (n /= 256);
          for (this.u(t), t = Array(16), e = n = 0; 4 > e; ++e)
            for (var r = 0; 32 > r; r += 8) t[n++] = (this.g[e] >>> r) & 255;
          return t;
        });
      var s = {};
      function i(t) {
        return -128 <= t && 128 > t
          ? (function (t) {
              var e = s;
              return Object.prototype.hasOwnProperty.call(e, t)
                ? e[t]
                : (e[t] = (function (t) {
                    return new r([0 | t], 0 > t ? -1 : 0);
                  })(t));
            })(t)
          : new r([0 | t], 0 > t ? -1 : 0);
      }
      function o(t) {
        if (isNaN(t) || !isFinite(t)) return a;
        if (0 > t) return d(o(-t));
        for (var e = [], n = 1, s = 0; t >= n; s++)
          (e[s] = (t / n) | 0), (n *= 4294967296);
        return new r(e, 0);
      }
      var a = i(0),
        c = i(1),
        u = i(16777216);
      function h(t) {
        if (0 != t.h) return !1;
        for (var e = 0; e < t.g.length; e++) if (0 != t.g[e]) return !1;
        return !0;
      }
      function l(t) {
        return -1 == t.h;
      }
      function d(t) {
        for (var e = t.g.length, n = [], s = 0; s < e; s++) n[s] = ~t.g[s];
        return new r(n, ~t.h).add(c);
      }
      function f(t, e) {
        return t.add(d(e));
      }
      function g(t, e) {
        for (; (65535 & t[e]) != t[e]; )
          (t[e + 1] += t[e] >>> 16), (t[e] &= 65535), e++;
      }
      function p(t, e) {
        (this.g = t), (this.h = e);
      }
      function m(t, e) {
        if (h(e)) throw Error("division by zero");
        if (h(t)) return new p(a, a);
        if (l(t)) return (e = m(d(t), e)), new p(d(e.g), d(e.h));
        if (l(e)) return (e = m(t, d(e))), new p(d(e.g), e.h);
        if (30 < t.g.length) {
          if (l(t) || l(e))
            throw Error("slowDivide_ only works with positive integers.");
          for (var n = c, r = e; 0 >= r.l(t); ) (n = y(n)), (r = y(r));
          var s = v(n, 1),
            i = v(r, 1);
          for (r = v(r, 2), n = v(n, 2); !h(r); ) {
            var u = i.add(r);
            0 >= u.l(t) && ((s = s.add(n)), (i = u)),
              (r = v(r, 1)),
              (n = v(n, 1));
          }
          return (e = f(t, s.j(e))), new p(s, e);
        }
        for (s = a; 0 <= t.l(e); ) {
          for (
            n = Math.max(1, Math.floor(t.m() / e.m())),
              r =
                48 >= (r = Math.ceil(Math.log(n) / Math.LN2))
                  ? 1
                  : Math.pow(2, r - 48),
              u = (i = o(n)).j(e);
            l(u) || 0 < u.l(t);

          )
            u = (i = o((n -= r))).j(e);
          h(i) && (i = c), (s = s.add(i)), (t = f(t, u));
        }
        return new p(s, t);
      }
      function y(t) {
        for (var e = t.g.length + 1, n = [], s = 0; s < e; s++)
          n[s] = (t.i(s) << 1) | (t.i(s - 1) >>> 31);
        return new r(n, t.h);
      }
      function v(t, e) {
        var n = e >> 5;
        e %= 32;
        for (var s = t.g.length - n, i = [], o = 0; o < s; o++)
          i[o] =
            0 < e
              ? (t.i(o + n) >>> e) | (t.i(o + n + 1) << (32 - e))
              : t.i(o + n);
        return new r(i, t.h);
      }
      ((t = r.prototype).m = function () {
        if (l(this)) return -d(this).m();
        for (var t = 0, e = 1, n = 0; n < this.g.length; n++) {
          var r = this.i(n);
          (t += (0 <= r ? r : 4294967296 + r) * e), (e *= 4294967296);
        }
        return t;
      }),
        (t.toString = function (t) {
          if (2 > (t = t || 10) || 36 < t)
            throw Error("radix out of range: " + t);
          if (h(this)) return "0";
          if (l(this)) return "-" + d(this).toString(t);
          for (var e = o(Math.pow(t, 6)), n = this, r = ""; ; ) {
            var s = m(n, e).g,
              i = (
                (0 < (n = f(n, s.j(e))).g.length ? n.g[0] : n.h) >>> 0
              ).toString(t);
            if (h((n = s))) return i + r;
            for (; 6 > i.length; ) i = "0" + i;
            r = i + r;
          }
        }),
        (t.i = function (t) {
          return 0 > t ? 0 : t < this.g.length ? this.g[t] : this.h;
        }),
        (t.l = function (t) {
          return l((t = f(this, t))) ? -1 : h(t) ? 0 : 1;
        }),
        (t.abs = function () {
          return l(this) ? d(this) : this;
        }),
        (t.add = function (t) {
          for (
            var e = Math.max(this.g.length, t.g.length), n = [], s = 0, i = 0;
            i <= e;
            i++
          ) {
            var o = s + (65535 & this.i(i)) + (65535 & t.i(i)),
              a = (o >>> 16) + (this.i(i) >>> 16) + (t.i(i) >>> 16);
            (s = a >>> 16), (o &= 65535), (a &= 65535), (n[i] = (a << 16) | o);
          }
          return new r(n, -2147483648 & n[n.length - 1] ? -1 : 0);
        }),
        (t.j = function (t) {
          if (h(this) || h(t)) return a;
          if (l(this)) return l(t) ? d(this).j(d(t)) : d(d(this).j(t));
          if (l(t)) return d(this.j(d(t)));
          if (0 > this.l(u) && 0 > t.l(u)) return o(this.m() * t.m());
          for (
            var e = this.g.length + t.g.length, n = [], s = 0;
            s < 2 * e;
            s++
          )
            n[s] = 0;
          for (s = 0; s < this.g.length; s++)
            for (var i = 0; i < t.g.length; i++) {
              var c = this.i(s) >>> 16,
                f = 65535 & this.i(s),
                p = t.i(i) >>> 16,
                m = 65535 & t.i(i);
              (n[2 * s + 2 * i] += f * m),
                g(n, 2 * s + 2 * i),
                (n[2 * s + 2 * i + 1] += c * m),
                g(n, 2 * s + 2 * i + 1),
                (n[2 * s + 2 * i + 1] += f * p),
                g(n, 2 * s + 2 * i + 1),
                (n[2 * s + 2 * i + 2] += c * p),
                g(n, 2 * s + 2 * i + 2);
            }
          for (s = 0; s < e; s++) n[s] = (n[2 * s + 1] << 16) | n[2 * s];
          for (s = e; s < 2 * e; s++) n[s] = 0;
          return new r(n, 0);
        }),
        (t.A = function (t) {
          return m(this, t).h;
        }),
        (t.and = function (t) {
          for (
            var e = Math.max(this.g.length, t.g.length), n = [], s = 0;
            s < e;
            s++
          )
            n[s] = this.i(s) & t.i(s);
          return new r(n, this.h & t.h);
        }),
        (t.or = function (t) {
          for (
            var e = Math.max(this.g.length, t.g.length), n = [], s = 0;
            s < e;
            s++
          )
            n[s] = this.i(s) | t.i(s);
          return new r(n, this.h | t.h);
        }),
        (t.xor = function (t) {
          for (
            var e = Math.max(this.g.length, t.g.length), n = [], s = 0;
            s < e;
            s++
          )
            n[s] = this.i(s) ^ t.i(s);
          return new r(n, this.h ^ t.h);
        }),
        (e.prototype.digest = e.prototype.v),
        (e.prototype.reset = e.prototype.s),
        (e.prototype.update = e.prototype.u),
        (Ut = jt.Md5 = e),
        (r.prototype.add = r.prototype.add),
        (r.prototype.multiply = r.prototype.j),
        (r.prototype.modulo = r.prototype.A),
        (r.prototype.compare = r.prototype.l),
        (r.prototype.toNumber = r.prototype.m),
        (r.prototype.toString = r.prototype.toString),
        (r.prototype.getBits = r.prototype.i),
        (r.fromNumber = o),
        (r.fromString = function t(e, n) {
          if (0 == e.length) throw Error("number format error: empty string");
          if (2 > (n = n || 10) || 36 < n)
            throw Error("radix out of range: " + n);
          if ("-" == e.charAt(0)) return d(t(e.substring(1), n));
          if (0 <= e.indexOf("-"))
            throw Error('number format error: interior "-" character');
          for (var r = o(Math.pow(n, 8)), s = a, i = 0; i < e.length; i += 8) {
            var c = Math.min(8, e.length - i),
              u = parseInt(e.substring(i, i + c), n);
            8 > c
              ? ((c = o(Math.pow(n, c))), (s = s.j(c).add(o(u))))
              : (s = (s = s.j(r)).add(o(u)));
          }
          return s;
        }),
        (Ft = jt.Integer = r);
    }).apply(
      void 0 !== Bt
        ? Bt
        : "undefined" != typeof self
          ? self
          : "undefined" != typeof window
            ? window
            : {},
    );
    var qt,
      $t,
      zt,
      Kt,
      Ht,
      Gt,
      Qt,
      Wt,
      Xt =
        "undefined" != typeof globalThis
          ? globalThis
          : "undefined" != typeof window
            ? window
            : "undefined" != typeof global
              ? global
              : "undefined" != typeof self
                ? self
                : {},
      Yt = {};
    (function () {
      var t,
        e =
          "function" == typeof Object.defineProperties
            ? Object.defineProperty
            : function (t, e, n) {
                return (
                  t == Array.prototype ||
                    t == Object.prototype ||
                    (t[e] = n.value),
                  t
                );
              },
        n = (function (t) {
          t = [
            "object" == typeof globalThis && globalThis,
            t,
            "object" == typeof window && window,
            "object" == typeof self && self,
            "object" == typeof Xt && Xt,
          ];
          for (var e = 0; e < t.length; ++e) {
            var n = t[e];
            if (n && n.Math == Math) return n;
          }
          throw Error("Cannot find global object");
        })(this);
      !(function (t, r) {
        if (r)
          t: {
            var s = n;
            t = t.split(".");
            for (var i = 0; i < t.length - 1; i++) {
              var o = t[i];
              if (!(o in s)) break t;
              s = s[o];
            }
            (r = r((i = s[(t = t[t.length - 1])]))) != i &&
              null != r &&
              e(s, t, { configurable: !0, writable: !0, value: r });
          }
      })("Array.prototype.values", function (t) {
        return (
          t ||
          function () {
            return (function (t, e) {
              t instanceof String && (t += "");
              var n = 0,
                r = !1,
                s = {
                  next: function () {
                    if (!r && n < t.length) {
                      var s = n++;
                      return { value: e(0, t[s]), done: !1 };
                    }
                    return (r = !0), { done: !0, value: void 0 };
                  },
                };
              return (
                (s[Symbol.iterator] = function () {
                  return s;
                }),
                s
              );
            })(this, function (t, e) {
              return e;
            });
          }
        );
      });
      var r = r || {},
        s = this || self;
      function i(t) {
        var e = typeof t;
        return (
          "array" ==
            (e =
              "object" != e
                ? e
                : t
                  ? Array.isArray(t)
                    ? "array"
                    : e
                  : "null") ||
          ("object" == e && "number" == typeof t.length)
        );
      }
      function o(t) {
        var e = typeof t;
        return ("object" == e && null != t) || "function" == e;
      }
      function a(t, e, n) {
        return t.call.apply(t.bind, arguments);
      }
      function c(t, e, n) {
        if (!t) throw Error();
        if (2 < arguments.length) {
          var r = Array.prototype.slice.call(arguments, 2);
          return function () {
            var n = Array.prototype.slice.call(arguments);
            return Array.prototype.unshift.apply(n, r), t.apply(e, n);
          };
        }
        return function () {
          return t.apply(e, arguments);
        };
      }
      function u(t, e, n) {
        return (u =
          Function.prototype.bind &&
          -1 != Function.prototype.bind.toString().indexOf("native code")
            ? a
            : c).apply(null, arguments);
      }
      function h(t, e) {
        var n = Array.prototype.slice.call(arguments, 1);
        return function () {
          var e = n.slice();
          return e.push.apply(e, arguments), t.apply(this, e);
        };
      }
      function l(t, e) {
        function n() {}
        (n.prototype = e.prototype),
          (t.aa = e.prototype),
          (t.prototype = new n()),
          (t.prototype.constructor = t),
          (t.Qb = function (t, n, r) {
            for (
              var s = Array(arguments.length - 2), i = 2;
              i < arguments.length;
              i++
            )
              s[i - 2] = arguments[i];
            return e.prototype[n].apply(t, s);
          });
      }
      function d(t) {
        const e = t.length;
        if (0 < e) {
          const n = Array(e);
          for (let r = 0; r < e; r++) n[r] = t[r];
          return n;
        }
        return [];
      }
      function f(t, e) {
        for (let e = 1; e < arguments.length; e++) {
          const n = arguments[e];
          if (i(n)) {
            const e = t.length || 0,
              r = n.length || 0;
            t.length = e + r;
            for (let s = 0; s < r; s++) t[e + s] = n[s];
          } else t.push(n);
        }
      }
      function g(t) {
        return /^[\s\xa0]*$/.test(t);
      }
      function p() {
        var t = s.navigator;
        return t && (t = t.userAgent) ? t : "";
      }
      function m(t) {
        return m[" "](t), t;
      }
      m[" "] = function () {};
      var y = !(
        -1 == p().indexOf("Gecko") ||
        (-1 != p().toLowerCase().indexOf("webkit") &&
          -1 == p().indexOf("Edge")) ||
        -1 != p().indexOf("Trident") ||
        -1 != p().indexOf("MSIE") ||
        -1 != p().indexOf("Edge")
      );
      function v(t, e, n) {
        for (const r in t) e.call(n, t[r], r, t);
      }
      function w(t) {
        const e = {};
        for (const n in t) e[n] = t[n];
        return e;
      }
      const b =
        "constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(
          " ",
        );
      function E(t, e) {
        let n, r;
        for (let e = 1; e < arguments.length; e++) {
          for (n in ((r = arguments[e]), r)) t[n] = r[n];
          for (let e = 0; e < b.length; e++)
            (n = b[e]),
              Object.prototype.hasOwnProperty.call(r, n) && (t[n] = r[n]);
        }
      }
      function _(t) {
        var e = 1;
        t = t.split(":");
        const n = [];
        for (; 0 < e && t.length; ) n.push(t.shift()), e--;
        return t.length && n.push(t.join(":")), n;
      }
      function T(t) {
        s.setTimeout(() => {
          throw t;
        }, 0);
      }
      function S() {
        var t = k;
        let e = null;
        return (
          t.g &&
            ((e = t.g), (t.g = t.g.next), t.g || (t.h = null), (e.next = null)),
          e
        );
      }
      var C = new (class {
        constructor(t, e) {
          (this.i = t), (this.j = e), (this.h = 0), (this.g = null);
        }
        get() {
          let t;
          return (
            0 < this.h
              ? (this.h--, (t = this.g), (this.g = t.next), (t.next = null))
              : (t = this.i()),
            t
          );
        }
      })(
        () => new I(),
        (t) => t.reset(),
      );
      class I {
        constructor() {
          this.next = this.g = this.h = null;
        }
        set(t, e) {
          (this.h = t), (this.g = e), (this.next = null);
        }
        reset() {
          this.next = this.g = this.h = null;
        }
      }
      let A,
        D = !1,
        k = new (class {
          constructor() {
            this.h = this.g = null;
          }
          add(t, e) {
            const n = C.get();
            n.set(t, e),
              this.h ? (this.h.next = n) : (this.g = n),
              (this.h = n);
          }
        })(),
        N = () => {
          const t = s.Promise.resolve(void 0);
          A = () => {
            t.then(x);
          };
        };
      var x = () => {
        for (var t; (t = S()); ) {
          try {
            t.h.call(t.g);
          } catch (t) {
            T(t);
          }
          var e = C;
          e.j(t), 100 > e.h && (e.h++, (t.next = e.g), (e.g = t));
        }
        D = !1;
      };
      function R() {
        (this.s = this.s), (this.C = this.C);
      }
      function L(t, e) {
        (this.type = t),
          (this.g = this.target = e),
          (this.defaultPrevented = !1);
      }
      (R.prototype.s = !1),
        (R.prototype.ma = function () {
          this.s || ((this.s = !0), this.N());
        }),
        (R.prototype.N = function () {
          if (this.C) for (; this.C.length; ) this.C.shift()();
        }),
        (L.prototype.h = function () {
          this.defaultPrevented = !0;
        });
      var O = (function () {
        if (!s.addEventListener || !Object.defineProperty) return !1;
        var t = !1,
          e = Object.defineProperty({}, "passive", {
            get: function () {
              t = !0;
            },
          });
        try {
          const t = () => {};
          s.addEventListener("test", t, e), s.removeEventListener("test", t, e);
        } catch (t) {}
        return t;
      })();
      function M(t, e) {
        if (
          (L.call(this, t ? t.type : ""),
          (this.relatedTarget = this.g = this.target = null),
          (this.button =
            this.screenY =
            this.screenX =
            this.clientY =
            this.clientX =
              0),
          (this.key = ""),
          (this.metaKey = this.shiftKey = this.altKey = this.ctrlKey = !1),
          (this.state = null),
          (this.pointerId = 0),
          (this.pointerType = ""),
          (this.i = null),
          t)
        ) {
          var n = (this.type = t.type),
            r =
              t.changedTouches && t.changedTouches.length
                ? t.changedTouches[0]
                : null;
          if (
            ((this.target = t.target || t.srcElement),
            (this.g = e),
            (e = t.relatedTarget))
          ) {
            if (y) {
              t: {
                try {
                  m(e.nodeName);
                  var s = !0;
                  break t;
                } catch (t) {}
                s = !1;
              }
              s || (e = null);
            }
          } else
            "mouseover" == n
              ? (e = t.fromElement)
              : "mouseout" == n && (e = t.toElement);
          (this.relatedTarget = e),
            r
              ? ((this.clientX = void 0 !== r.clientX ? r.clientX : r.pageX),
                (this.clientY = void 0 !== r.clientY ? r.clientY : r.pageY),
                (this.screenX = r.screenX || 0),
                (this.screenY = r.screenY || 0))
              : ((this.clientX = void 0 !== t.clientX ? t.clientX : t.pageX),
                (this.clientY = void 0 !== t.clientY ? t.clientY : t.pageY),
                (this.screenX = t.screenX || 0),
                (this.screenY = t.screenY || 0)),
            (this.button = t.button),
            (this.key = t.key || ""),
            (this.ctrlKey = t.ctrlKey),
            (this.altKey = t.altKey),
            (this.shiftKey = t.shiftKey),
            (this.metaKey = t.metaKey),
            (this.pointerId = t.pointerId || 0),
            (this.pointerType =
              "string" == typeof t.pointerType
                ? t.pointerType
                : P[t.pointerType] || ""),
            (this.state = t.state),
            (this.i = t),
            t.defaultPrevented && M.aa.h.call(this);
        }
      }
      l(M, L);
      var P = { 2: "touch", 3: "pen", 4: "mouse" };
      M.prototype.h = function () {
        M.aa.h.call(this);
        var t = this.i;
        t.preventDefault ? t.preventDefault() : (t.returnValue = !1);
      };
      var V = "closure_listenable_" + ((1e6 * Math.random()) | 0),
        F = 0;
      function U(t, e, n, r, s) {
        (this.listener = t),
          (this.proxy = null),
          (this.src = e),
          (this.type = n),
          (this.capture = !!r),
          (this.ha = s),
          (this.key = ++F),
          (this.da = this.fa = !1);
      }
      function B(t) {
        (t.da = !0),
          (t.listener = null),
          (t.proxy = null),
          (t.src = null),
          (t.ha = null);
      }
      function j(t) {
        (this.src = t), (this.g = {}), (this.h = 0);
      }
      function q(t, e) {
        var n = e.type;
        if (n in t.g) {
          var r,
            s = t.g[n],
            i = Array.prototype.indexOf.call(s, e, void 0);
          (r = 0 <= i) && Array.prototype.splice.call(s, i, 1),
            r && (B(e), 0 == t.g[n].length && (delete t.g[n], t.h--));
        }
      }
      function $(t, e, n, r) {
        for (var s = 0; s < t.length; ++s) {
          var i = t[s];
          if (!i.da && i.listener == e && i.capture == !!n && i.ha == r)
            return s;
        }
        return -1;
      }
      j.prototype.add = function (t, e, n, r, s) {
        var i = t.toString();
        (t = this.g[i]) || ((t = this.g[i] = []), this.h++);
        var o = $(t, e, r, s);
        return (
          -1 < o
            ? ((e = t[o]), n || (e.fa = !1))
            : (((e = new U(e, this.src, i, !!r, s)).fa = n), t.push(e)),
          e
        );
      };
      var z = "closure_lm_" + ((1e6 * Math.random()) | 0),
        K = {};
      function H(t, e, n, r, s) {
        if (r && r.once) return Q(t, e, n, r, s);
        if (Array.isArray(e)) {
          for (var i = 0; i < e.length; i++) H(t, e[i], n, r, s);
          return null;
        }
        return (
          (n = et(n)),
          t && t[V]
            ? t.K(e, n, o(r) ? !!r.capture : !!r, s)
            : G(t, e, n, !1, r, s)
        );
      }
      function G(t, e, n, r, s, i) {
        if (!e) throw Error("Invalid event type");
        var a = o(s) ? !!s.capture : !!s,
          c = Z(t);
        if ((c || (t[z] = c = new j(t)), (n = c.add(e, n, r, a, i)).proxy))
          return n;
        if (
          ((r = (function () {
            const t = J;
            return function e(n) {
              return t.call(e.src, e.listener, n);
            };
          })()),
          (n.proxy = r),
          (r.src = t),
          (r.listener = n),
          t.addEventListener)
        )
          O || (s = a),
            void 0 === s && (s = !1),
            t.addEventListener(e.toString(), r, s);
        else if (t.attachEvent) t.attachEvent(Y(e.toString()), r);
        else {
          if (!t.addListener || !t.removeListener)
            throw Error("addEventListener and attachEvent are unavailable.");
          t.addListener(r);
        }
        return n;
      }
      function Q(t, e, n, r, s) {
        if (Array.isArray(e)) {
          for (var i = 0; i < e.length; i++) Q(t, e[i], n, r, s);
          return null;
        }
        return (
          (n = et(n)),
          t && t[V]
            ? t.L(e, n, o(r) ? !!r.capture : !!r, s)
            : G(t, e, n, !0, r, s)
        );
      }
      function W(t, e, n, r, s) {
        if (Array.isArray(e))
          for (var i = 0; i < e.length; i++) W(t, e[i], n, r, s);
        else
          (r = o(r) ? !!r.capture : !!r),
            (n = et(n)),
            t && t[V]
              ? ((t = t.i),
                (e = String(e).toString()) in t.g &&
                  -1 < (n = $((i = t.g[e]), n, r, s)) &&
                  (B(i[n]),
                  Array.prototype.splice.call(i, n, 1),
                  0 == i.length && (delete t.g[e], t.h--)))
              : t &&
                (t = Z(t)) &&
                ((e = t.g[e.toString()]),
                (t = -1),
                e && (t = $(e, n, r, s)),
                (n = -1 < t ? e[t] : null) && X(n));
      }
      function X(t) {
        if ("number" != typeof t && t && !t.da) {
          var e = t.src;
          if (e && e[V]) q(e.i, t);
          else {
            var n = t.type,
              r = t.proxy;
            e.removeEventListener
              ? e.removeEventListener(n, r, t.capture)
              : e.detachEvent
                ? e.detachEvent(Y(n), r)
                : e.addListener && e.removeListener && e.removeListener(r),
              (n = Z(e))
                ? (q(n, t), 0 == n.h && ((n.src = null), (e[z] = null)))
                : B(t);
          }
        }
      }
      function Y(t) {
        return t in K ? K[t] : (K[t] = "on" + t);
      }
      function J(t, e) {
        if (t.da) t = !0;
        else {
          e = new M(e, this);
          var n = t.listener,
            r = t.ha || t.src;
          t.fa && X(t), (t = n.call(r, e));
        }
        return t;
      }
      function Z(t) {
        return (t = t[z]) instanceof j ? t : null;
      }
      var tt = "__closure_events_fn_" + ((1e9 * Math.random()) >>> 0);
      function et(t) {
        return "function" == typeof t
          ? t
          : (t[tt] ||
              (t[tt] = function (e) {
                return t.handleEvent(e);
              }),
            t[tt]);
      }
      function nt() {
        R.call(this), (this.i = new j(this)), (this.M = this), (this.F = null);
      }
      function rt(t, e) {
        var n,
          r = t.F;
        if (r) for (n = []; r; r = r.F) n.push(r);
        if (((t = t.M), (r = e.type || e), "string" == typeof e))
          e = new L(e, t);
        else if (e instanceof L) e.target = e.target || t;
        else {
          var s = e;
          E((e = new L(r, t)), s);
        }
        if (((s = !0), n))
          for (var i = n.length - 1; 0 <= i; i--) {
            var o = (e.g = n[i]);
            s = st(o, r, !0, e) && s;
          }
        if (
          ((s = st((o = e.g = t), r, !0, e) && s),
          (s = st(o, r, !1, e) && s),
          n)
        )
          for (i = 0; i < n.length; i++)
            s = st((o = e.g = n[i]), r, !1, e) && s;
      }
      function st(t, e, n, r) {
        if (!(e = t.i.g[String(e)])) return !0;
        e = e.concat();
        for (var s = !0, i = 0; i < e.length; ++i) {
          var o = e[i];
          if (o && !o.da && o.capture == n) {
            var a = o.listener,
              c = o.ha || o.src;
            o.fa && q(t.i, o), (s = !1 !== a.call(c, r) && s);
          }
        }
        return s && !r.defaultPrevented;
      }
      function it(t, e, n) {
        if ("function" == typeof t) n && (t = u(t, n));
        else {
          if (!t || "function" != typeof t.handleEvent)
            throw Error("Invalid listener argument");
          t = u(t.handleEvent, t);
        }
        return 2147483647 < Number(e) ? -1 : s.setTimeout(t, e || 0);
      }
      function ot(t) {
        t.g = it(() => {
          (t.g = null), t.i && ((t.i = !1), ot(t));
        }, t.l);
        const e = t.h;
        (t.h = null), t.m.apply(null, e);
      }
      l(nt, R),
        (nt.prototype[V] = !0),
        (nt.prototype.removeEventListener = function (t, e, n, r) {
          W(this, t, e, n, r);
        }),
        (nt.prototype.N = function () {
          if ((nt.aa.N.call(this), this.i)) {
            var t,
              e = this.i;
            for (t in e.g) {
              for (var n = e.g[t], r = 0; r < n.length; r++) B(n[r]);
              delete e.g[t], e.h--;
            }
          }
          this.F = null;
        }),
        (nt.prototype.K = function (t, e, n, r) {
          return this.i.add(String(t), e, !1, n, r);
        }),
        (nt.prototype.L = function (t, e, n, r) {
          return this.i.add(String(t), e, !0, n, r);
        });
      class at extends R {
        constructor(t, e) {
          super(),
            (this.m = t),
            (this.l = e),
            (this.h = null),
            (this.i = !1),
            (this.g = null);
        }
        j(t) {
          (this.h = arguments), this.g ? (this.i = !0) : ot(this);
        }
        N() {
          super.N(),
            this.g &&
              (s.clearTimeout(this.g),
              (this.g = null),
              (this.i = !1),
              (this.h = null));
        }
      }
      function ct(t) {
        R.call(this), (this.h = t), (this.g = {});
      }
      l(ct, R);
      var ut = [];
      function ht(t) {
        v(
          t.g,
          function (t, e) {
            this.g.hasOwnProperty(e) && X(t);
          },
          t,
        ),
          (t.g = {});
      }
      (ct.prototype.N = function () {
        ct.aa.N.call(this), ht(this);
      }),
        (ct.prototype.handleEvent = function () {
          throw Error("EventHandler.handleEvent not implemented");
        });
      var lt = s.JSON.stringify,
        dt = s.JSON.parse,
        ft = class {
          stringify(t) {
            return s.JSON.stringify(t, void 0);
          }
          parse(t) {
            return s.JSON.parse(t, void 0);
          }
        };
      function gt() {}
      function pt(t) {
        return t.h || (t.h = t.i());
      }
      function mt() {}
      gt.prototype.h = null;
      var yt = { OPEN: "a", kb: "b", Ja: "c", wb: "d" };
      function vt() {
        L.call(this, "d");
      }
      function wt() {
        L.call(this, "c");
      }
      l(vt, L), l(wt, L);
      var bt = {},
        Et = null;
      function _t() {
        return (Et = Et || new nt());
      }
      function Tt(t) {
        L.call(this, bt.La, t);
      }
      function St(t) {
        const e = _t();
        rt(e, new Tt(e));
      }
      function Ct(t, e) {
        L.call(this, bt.STAT_EVENT, t), (this.stat = e);
      }
      function It(t) {
        const e = _t();
        rt(e, new Ct(e, t));
      }
      function At(t, e) {
        L.call(this, bt.Ma, t), (this.size = e);
      }
      function Dt(t, e) {
        if ("function" != typeof t)
          throw Error("Fn must not be null and must be a function");
        return s.setTimeout(function () {
          t();
        }, e);
      }
      function kt() {
        this.g = !0;
      }
      function Nt(t, e, n, r) {
        t.info(function () {
          return (
            "XMLHTTP TEXT (" +
            e +
            "): " +
            (function (t, e) {
              if (!t.g) return e;
              if (!e) return null;
              try {
                var n = JSON.parse(e);
                if (n)
                  for (t = 0; t < n.length; t++)
                    if (Array.isArray(n[t])) {
                      var r = n[t];
                      if (!(2 > r.length)) {
                        var s = r[1];
                        if (Array.isArray(s) && !(1 > s.length)) {
                          var i = s[0];
                          if ("noop" != i && "stop" != i && "close" != i)
                            for (var o = 1; o < s.length; o++) s[o] = "";
                        }
                      }
                    }
                return lt(n);
              } catch (t) {
                return e;
              }
            })(t, n) +
            (r ? " " + r : "")
          );
        });
      }
      (bt.La = "serverreachability"),
        l(Tt, L),
        (bt.STAT_EVENT = "statevent"),
        l(Ct, L),
        (bt.Ma = "timingevent"),
        l(At, L),
        (kt.prototype.xa = function () {
          this.g = !1;
        }),
        (kt.prototype.info = function () {});
      var xt,
        Rt = {
          NO_ERROR: 0,
          gb: 1,
          tb: 2,
          sb: 3,
          nb: 4,
          rb: 5,
          ub: 6,
          Ia: 7,
          TIMEOUT: 8,
          xb: 9,
        },
        Lt = {
          lb: "complete",
          Hb: "success",
          Ja: "error",
          Ia: "abort",
          zb: "ready",
          Ab: "readystatechange",
          TIMEOUT: "timeout",
          vb: "incrementaldata",
          yb: "progress",
          ob: "downloadprogress",
          Pb: "uploadprogress",
        };
      function Ot() {}
      function Mt(t, e, n, r) {
        (this.j = t),
          (this.i = e),
          (this.l = n),
          (this.R = r || 1),
          (this.U = new ct(this)),
          (this.I = 45e3),
          (this.H = null),
          (this.o = !1),
          (this.m = this.A = this.v = this.L = this.F = this.S = this.B = null),
          (this.D = []),
          (this.g = null),
          (this.C = 0),
          (this.s = this.u = null),
          (this.X = -1),
          (this.J = !1),
          (this.O = 0),
          (this.M = null),
          (this.W = this.K = this.T = this.P = !1),
          (this.h = new Pt());
      }
      function Pt() {
        (this.i = null), (this.g = ""), (this.h = !1);
      }
      l(Ot, gt),
        (Ot.prototype.g = function () {
          return new XMLHttpRequest();
        }),
        (Ot.prototype.i = function () {
          return {};
        }),
        (xt = new Ot());
      var Vt = {},
        Ft = {};
      function Ut(t, e, n) {
        (t.L = 1), (t.v = Ee(me(e))), (t.m = n), (t.P = !0), Bt(t, null);
      }
      function Bt(t, e) {
        (t.F = Date.now()), Zt(t), (t.A = me(t.v));
        var n = t.A,
          r = t.R;
        Array.isArray(r) || (r = [String(r)]),
          Me(n.i, "t", r),
          (t.C = 0),
          (n = t.j.J),
          (t.h = new Pt()),
          (t.g = Tn(t.j, n ? e : null, !t.m)),
          0 < t.O && (t.M = new at(u(t.Y, t, t.g), t.O)),
          (e = t.U),
          (n = t.g),
          (r = t.ca);
        var s = "readystatechange";
        Array.isArray(s) || (s && (ut[0] = s.toString()), (s = ut));
        for (var i = 0; i < s.length; i++) {
          var o = H(n, s[i], r || e.handleEvent, !1, e.h || e);
          if (!o) break;
          e.g[o.key] = o;
        }
        (e = t.H ? w(t.H) : {}),
          t.m
            ? (t.u || (t.u = "POST"),
              (e["Content-Type"] = "application/x-www-form-urlencoded"),
              t.g.ea(t.A, t.u, t.m, e))
            : ((t.u = "GET"), t.g.ea(t.A, t.u, null, e)),
          St(),
          (function (t, e, n, r, s, i) {
            t.info(function () {
              if (t.g)
                if (i)
                  for (var o = "", a = i.split("&"), c = 0; c < a.length; c++) {
                    var u = a[c].split("=");
                    if (1 < u.length) {
                      var h = u[0];
                      u = u[1];
                      var l = h.split("_");
                      o =
                        2 <= l.length && "type" == l[1]
                          ? o + (h + "=") + u + "&"
                          : o + (h + "=redacted&");
                    }
                  }
                else o = null;
              else o = i;
              return (
                "XMLHTTP REQ (" +
                r +
                ") [attempt " +
                s +
                "]: " +
                e +
                "\n" +
                n +
                "\n" +
                o
              );
            });
          })(t.i, t.u, t.A, t.l, t.R, t.m);
      }
      function jt(t) {
        return !!t.g && "GET" == t.u && 2 != t.L && t.j.Ca;
      }
      function Jt(t, e) {
        var n = t.C,
          r = e.indexOf("\n", n);
        return -1 == r
          ? Ft
          : ((n = Number(e.substring(n, r))),
            isNaN(n)
              ? Vt
              : (r += 1) + n > e.length
                ? Ft
                : ((e = e.slice(r, r + n)), (t.C = r + n), e));
      }
      function Zt(t) {
        (t.S = Date.now() + t.I), te(t, t.I);
      }
      function te(t, e) {
        if (null != t.B) throw Error("WatchDog timer not null");
        t.B = Dt(u(t.ba, t), e);
      }
      function ee(t) {
        t.B && (s.clearTimeout(t.B), (t.B = null));
      }
      function ne(t) {
        0 == t.j.G || t.J || vn(t.j, t);
      }
      function re(t) {
        ee(t);
        var e = t.M;
        e && "function" == typeof e.ma && e.ma(),
          (t.M = null),
          ht(t.U),
          t.g && ((e = t.g), (t.g = null), e.abort(), e.ma());
      }
      function se(t, e) {
        try {
          var n = t.j;
          if (0 != n.G && (n.g == t || ue(n.h, t)))
            if (!t.K && ue(n.h, t) && 3 == n.G) {
              try {
                var r = n.Da.g.parse(e);
              } catch (t) {
                r = null;
              }
              if (Array.isArray(r) && 3 == r.length) {
                var s = r;
                if (0 == s[0]) {
                  t: if (!n.u) {
                    if (n.g) {
                      if (!(n.g.F + 3e3 < t.F)) break t;
                      yn(n), an(n);
                    }
                    gn(n), It(18);
                  }
                } else
                  (n.za = s[1]),
                    0 < n.za - n.T &&
                      37500 > s[2] &&
                      n.F &&
                      0 == n.v &&
                      !n.C &&
                      (n.C = Dt(u(n.Za, n), 6e3));
                if (1 >= ce(n.h) && n.ca) {
                  try {
                    n.ca();
                  } catch (t) {}
                  n.ca = void 0;
                }
              } else bn(n, 11);
            } else if (((t.K || n.g == t) && yn(n), !g(e)))
              for (s = n.Da.g.parse(e), e = 0; e < s.length; e++) {
                let u = s[e];
                if (((n.T = u[0]), (u = u[1]), 2 == n.G))
                  if ("c" == u[0]) {
                    (n.K = u[1]), (n.ia = u[2]);
                    const e = u[3];
                    null != e && ((n.la = e), n.j.info("VER=" + n.la));
                    const s = u[4];
                    null != s && ((n.Aa = s), n.j.info("SVER=" + n.Aa));
                    const h = u[5];
                    null != h &&
                      "number" == typeof h &&
                      0 < h &&
                      ((r = 1.5 * h),
                      (n.L = r),
                      n.j.info("backChannelRequestTimeoutMs_=" + r)),
                      (r = n);
                    const l = t.g;
                    if (l) {
                      const t = l.g
                        ? l.g.getResponseHeader("X-Client-Wire-Protocol")
                        : null;
                      if (t) {
                        var i = r.h;
                        i.g ||
                          (-1 == t.indexOf("spdy") &&
                            -1 == t.indexOf("quic") &&
                            -1 == t.indexOf("h2")) ||
                          ((i.j = i.l),
                          (i.g = new Set()),
                          i.h && (he(i, i.h), (i.h = null)));
                      }
                      if (r.D) {
                        const t = l.g
                          ? l.g.getResponseHeader("X-HTTP-Session-Id")
                          : null;
                        t && ((r.ya = t), be(r.I, r.D, t));
                      }
                    }
                    (n.G = 3),
                      n.l && n.l.ua(),
                      n.ba &&
                        ((n.R = Date.now() - t.F),
                        n.j.info("Handshake RTT: " + n.R + "ms"));
                    var o = t;
                    if ((((r = n).qa = _n(r, r.J ? r.ia : null, r.W)), o.K)) {
                      le(r.h, o);
                      var a = o,
                        c = r.L;
                      c && (a.I = c), a.B && (ee(a), Zt(a)), (r.g = o);
                    } else fn(r);
                    0 < n.i.length && un(n);
                  } else ("stop" != u[0] && "close" != u[0]) || bn(n, 7);
                else
                  3 == n.G &&
                    ("stop" == u[0] || "close" == u[0]
                      ? "stop" == u[0]
                        ? bn(n, 7)
                        : on(n)
                      : "noop" != u[0] && n.l && n.l.ta(u),
                    (n.v = 0));
              }
          St();
        } catch (t) {}
      }
      (Mt.prototype.ca = function (t) {
        t = t.target;
        const e = this.M;
        e && 3 == en(t) ? e.j() : this.Y(t);
      }),
        (Mt.prototype.Y = function (t) {
          try {
            if (t == this.g)
              t: {
                const d = en(this.g);
                var e = this.g.Ba();
                if (
                  (this.g.Z(),
                  !(3 > d) &&
                    (3 != d ||
                      (this.g && (this.h.h || this.g.oa() || nn(this.g)))))
                ) {
                  this.J || 4 != d || 7 == e || St(), ee(this);
                  var n = this.g.Z();
                  this.X = n;
                  e: if (jt(this)) {
                    var r = nn(this.g);
                    t = "";
                    var i = r.length,
                      o = 4 == en(this.g);
                    if (!this.h.i) {
                      if ("undefined" == typeof TextDecoder) {
                        re(this), ne(this);
                        var a = "";
                        break e;
                      }
                      this.h.i = new s.TextDecoder();
                    }
                    for (e = 0; e < i; e++)
                      (this.h.h = !0),
                        (t += this.h.i.decode(r[e], {
                          stream: !(o && e == i - 1),
                        }));
                    (r.length = 0),
                      (this.h.g += t),
                      (this.C = 0),
                      (a = this.h.g);
                  } else a = this.g.oa();
                  if (
                    ((this.o = 200 == n),
                    (function (t, e, n, r, s, i, o) {
                      t.info(function () {
                        return (
                          "XMLHTTP RESP (" +
                          r +
                          ") [ attempt " +
                          s +
                          "]: " +
                          e +
                          "\n" +
                          n +
                          "\n" +
                          i +
                          " " +
                          o
                        );
                      });
                    })(this.i, this.u, this.A, this.l, this.R, d, n),
                    this.o)
                  ) {
                    if (this.T && !this.K) {
                      e: {
                        if (this.g) {
                          var c,
                            u = this.g;
                          if (
                            (c = u.g
                              ? u.g.getResponseHeader("X-HTTP-Initial-Response")
                              : null) &&
                            !g(c)
                          ) {
                            var h = c;
                            break e;
                          }
                        }
                        h = null;
                      }
                      if (!(n = h)) {
                        (this.o = !1), (this.s = 3), It(12), re(this), ne(this);
                        break t;
                      }
                      Nt(
                        this.i,
                        this.l,
                        n,
                        "Initial handshake response via X-HTTP-Initial-Response",
                      ),
                        (this.K = !0),
                        se(this, n);
                    }
                    if (this.P) {
                      let t;
                      for (n = !0; !this.J && this.C < a.length; ) {
                        if (((t = Jt(this, a)), t == Ft)) {
                          4 == d && ((this.s = 4), It(14), (n = !1)),
                            Nt(this.i, this.l, null, "[Incomplete Response]");
                          break;
                        }
                        if (t == Vt) {
                          (this.s = 4),
                            It(15),
                            Nt(this.i, this.l, a, "[Invalid Chunk]"),
                            (n = !1);
                          break;
                        }
                        Nt(this.i, this.l, t, null), se(this, t);
                      }
                      if (
                        (jt(this) &&
                          0 != this.C &&
                          ((this.h.g = this.h.g.slice(this.C)), (this.C = 0)),
                        4 != d ||
                          0 != a.length ||
                          this.h.h ||
                          ((this.s = 1), It(16), (n = !1)),
                        (this.o = this.o && n),
                        n)
                      ) {
                        if (0 < a.length && !this.W) {
                          this.W = !0;
                          var l = this.j;
                          l.g == this &&
                            l.ba &&
                            !l.M &&
                            (l.j.info(
                              "Great, no buffering proxy detected. Bytes received: " +
                                a.length,
                            ),
                            pn(l),
                            (l.M = !0),
                            It(11));
                        }
                      } else
                        Nt(this.i, this.l, a, "[Invalid Chunked Response]"),
                          re(this),
                          ne(this);
                    } else Nt(this.i, this.l, a, null), se(this, a);
                    4 == d && re(this),
                      this.o &&
                        !this.J &&
                        (4 == d ? vn(this.j, this) : ((this.o = !1), Zt(this)));
                  } else
                    (function (t) {
                      const e = {};
                      t = (
                        (t.g && 2 <= en(t) && t.g.getAllResponseHeaders()) ||
                        ""
                      ).split("\r\n");
                      for (let r = 0; r < t.length; r++) {
                        if (g(t[r])) continue;
                        var n = _(t[r]);
                        const s = n[0];
                        if ("string" != typeof (n = n[1])) continue;
                        n = n.trim();
                        const i = e[s] || [];
                        (e[s] = i), i.push(n);
                      }
                      !(function (t, e) {
                        for (const n in t) e.call(void 0, t[n], n, t);
                      })(e, function (t) {
                        return t.join(", ");
                      });
                    })(this.g),
                      400 == n && 0 < a.indexOf("Unknown SID")
                        ? ((this.s = 3), It(12))
                        : ((this.s = 0), It(13)),
                      re(this),
                      ne(this);
                }
              }
          } catch (t) {}
        }),
        (Mt.prototype.cancel = function () {
          (this.J = !0), re(this);
        }),
        (Mt.prototype.ba = function () {
          this.B = null;
          const t = Date.now();
          0 <= t - this.S
            ? ((function (t, e) {
                t.info(function () {
                  return "TIMEOUT: " + e;
                });
              })(this.i, this.A),
              2 != this.L && (St(), It(17)),
              re(this),
              (this.s = 2),
              ne(this))
            : te(this, this.S - t);
        });
      var ie = class {
        constructor(t, e) {
          (this.g = t), (this.map = e);
        }
      };
      function oe(t) {
        (this.l = t || 10),
          (t = s.PerformanceNavigationTiming
            ? 0 < (t = s.performance.getEntriesByType("navigation")).length &&
              ("hq" == t[0].nextHopProtocol || "h2" == t[0].nextHopProtocol)
            : !!(
                s.chrome &&
                s.chrome.loadTimes &&
                s.chrome.loadTimes() &&
                s.chrome.loadTimes().wasFetchedViaSpdy
              )),
          (this.j = t ? this.l : 1),
          (this.g = null),
          1 < this.j && (this.g = new Set()),
          (this.h = null),
          (this.i = []);
      }
      function ae(t) {
        return !!t.h || (!!t.g && t.g.size >= t.j);
      }
      function ce(t) {
        return t.h ? 1 : t.g ? t.g.size : 0;
      }
      function ue(t, e) {
        return t.h ? t.h == e : !!t.g && t.g.has(e);
      }
      function he(t, e) {
        t.g ? t.g.add(e) : (t.h = e);
      }
      function le(t, e) {
        t.h && t.h == e ? (t.h = null) : t.g && t.g.has(e) && t.g.delete(e);
      }
      function de(t) {
        if (null != t.h) return t.i.concat(t.h.D);
        if (null != t.g && 0 !== t.g.size) {
          let e = t.i;
          for (const n of t.g.values()) e = e.concat(n.D);
          return e;
        }
        return d(t.i);
      }
      function fe(t, e) {
        if (t.forEach && "function" == typeof t.forEach) t.forEach(e, void 0);
        else if (i(t) || "string" == typeof t)
          Array.prototype.forEach.call(t, e, void 0);
        else
          for (
            var n = (function (t) {
                if (t.na && "function" == typeof t.na) return t.na();
                if (!t.V || "function" != typeof t.V) {
                  if ("undefined" != typeof Map && t instanceof Map)
                    return Array.from(t.keys());
                  if (!("undefined" != typeof Set && t instanceof Set)) {
                    if (i(t) || "string" == typeof t) {
                      var e = [];
                      t = t.length;
                      for (var n = 0; n < t; n++) e.push(n);
                      return e;
                    }
                    (e = []), (n = 0);
                    for (const r in t) e[n++] = r;
                    return e;
                  }
                }
              })(t),
              r = (function (t) {
                if (t.V && "function" == typeof t.V) return t.V();
                if (
                  ("undefined" != typeof Map && t instanceof Map) ||
                  ("undefined" != typeof Set && t instanceof Set)
                )
                  return Array.from(t.values());
                if ("string" == typeof t) return t.split("");
                if (i(t)) {
                  for (var e = [], n = t.length, r = 0; r < n; r++)
                    e.push(t[r]);
                  return e;
                }
                for (r in ((e = []), (n = 0), t)) e[n++] = t[r];
                return e;
              })(t),
              s = r.length,
              o = 0;
            o < s;
            o++
          )
            e.call(void 0, r[o], n && n[o], t);
      }
      oe.prototype.cancel = function () {
        if (((this.i = de(this)), this.h)) this.h.cancel(), (this.h = null);
        else if (this.g && 0 !== this.g.size) {
          for (const t of this.g.values()) t.cancel();
          this.g.clear();
        }
      };
      var ge = RegExp(
        "^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$",
      );
      function pe(t) {
        if (
          ((this.g = this.o = this.j = ""),
          (this.s = null),
          (this.m = this.l = ""),
          (this.h = !1),
          t instanceof pe)
        ) {
          (this.h = t.h),
            ye(this, t.j),
            (this.o = t.o),
            (this.g = t.g),
            ve(this, t.s),
            (this.l = t.l);
          var e = t.i,
            n = new xe();
          (n.i = e.i),
            e.g && ((n.g = new Map(e.g)), (n.h = e.h)),
            we(this, n),
            (this.m = t.m);
        } else
          t && (e = String(t).match(ge))
            ? ((this.h = !1),
              ye(this, e[1] || "", !0),
              (this.o = _e(e[2] || "")),
              (this.g = _e(e[3] || "", !0)),
              ve(this, e[4]),
              (this.l = _e(e[5] || "", !0)),
              we(this, e[6] || "", !0),
              (this.m = _e(e[7] || "")))
            : ((this.h = !1), (this.i = new xe(null, this.h)));
      }
      function me(t) {
        return new pe(t);
      }
      function ye(t, e, n) {
        (t.j = n ? _e(e, !0) : e), t.j && (t.j = t.j.replace(/:$/, ""));
      }
      function ve(t, e) {
        if (e) {
          if (((e = Number(e)), isNaN(e) || 0 > e))
            throw Error("Bad port number " + e);
          t.s = e;
        } else t.s = null;
      }
      function we(t, e, n) {
        e instanceof xe
          ? ((t.i = e),
            (function (t, e) {
              e &&
                !t.j &&
                (Re(t),
                (t.i = null),
                t.g.forEach(function (t, e) {
                  var n = e.toLowerCase();
                  e != n && (Le(this, e), Me(this, n, t));
                }, t)),
                (t.j = e);
            })(t.i, t.h))
          : (n || (e = Te(e, ke)), (t.i = new xe(e, t.h)));
      }
      function be(t, e, n) {
        t.i.set(e, n);
      }
      function Ee(t) {
        return (
          be(
            t,
            "zx",
            Math.floor(2147483648 * Math.random()).toString(36) +
              Math.abs(
                Math.floor(2147483648 * Math.random()) ^ Date.now(),
              ).toString(36),
          ),
          t
        );
      }
      function _e(t, e) {
        return t
          ? e
            ? decodeURI(t.replace(/%25/g, "%2525"))
            : decodeURIComponent(t)
          : "";
      }
      function Te(t, e, n) {
        return "string" == typeof t
          ? ((t = encodeURI(t).replace(e, Se)),
            n && (t = t.replace(/%25([0-9a-fA-F]{2})/g, "%$1")),
            t)
          : null;
      }
      function Se(t) {
        return (
          "%" +
          (((t = t.charCodeAt(0)) >> 4) & 15).toString(16) +
          (15 & t).toString(16)
        );
      }
      pe.prototype.toString = function () {
        var t = [],
          e = this.j;
        e && t.push(Te(e, Ie, !0), ":");
        var n = this.g;
        return (
          (n || "file" == e) &&
            (t.push("//"),
            (e = this.o) && t.push(Te(e, Ie, !0), "@"),
            t.push(
              encodeURIComponent(String(n)).replace(
                /%25([0-9a-fA-F]{2})/g,
                "%$1",
              ),
            ),
            null != (n = this.s) && t.push(":", String(n))),
          (n = this.l) &&
            (this.g && "/" != n.charAt(0) && t.push("/"),
            t.push(Te(n, "/" == n.charAt(0) ? De : Ae, !0))),
          (n = this.i.toString()) && t.push("?", n),
          (n = this.m) && t.push("#", Te(n, Ne)),
          t.join("")
        );
      };
      var Ce,
        Ie = /[#\/\?@]/g,
        Ae = /[#\?:]/g,
        De = /[#\?]/g,
        ke = /[#\?@]/g,
        Ne = /#/g;
      function xe(t, e) {
        (this.h = this.g = null), (this.i = t || null), (this.j = !!e);
      }
      function Re(t) {
        t.g ||
          ((t.g = new Map()),
          (t.h = 0),
          t.i &&
            (function (t, e) {
              if (t) {
                t = t.split("&");
                for (var n = 0; n < t.length; n++) {
                  var r = t[n].indexOf("="),
                    s = null;
                  if (0 <= r) {
                    var i = t[n].substring(0, r);
                    s = t[n].substring(r + 1);
                  } else i = t[n];
                  e(i, s ? decodeURIComponent(s.replace(/\+/g, " ")) : "");
                }
              }
            })(t.i, function (e, n) {
              t.add(decodeURIComponent(e.replace(/\+/g, " ")), n);
            }));
      }
      function Le(t, e) {
        Re(t),
          (e = Pe(t, e)),
          t.g.has(e) &&
            ((t.i = null), (t.h -= t.g.get(e).length), t.g.delete(e));
      }
      function Oe(t, e) {
        return Re(t), (e = Pe(t, e)), t.g.has(e);
      }
      function Me(t, e, n) {
        Le(t, e),
          0 < n.length &&
            ((t.i = null), t.g.set(Pe(t, e), d(n)), (t.h += n.length));
      }
      function Pe(t, e) {
        return (e = String(e)), t.j && (e = e.toLowerCase()), e;
      }
      function Ve(t, e, n, r, s) {
        try {
          s &&
            ((s.onload = null),
            (s.onerror = null),
            (s.onabort = null),
            (s.ontimeout = null)),
            r(n);
        } catch (t) {}
      }
      function Fe() {
        this.g = new ft();
      }
      function Ue(t, e, n) {
        const r = n || "";
        try {
          fe(t, function (t, n) {
            let s = t;
            o(t) && (s = lt(t)), e.push(r + n + "=" + encodeURIComponent(s));
          });
        } catch (t) {
          throw (e.push(r + "type=" + encodeURIComponent("_badmap")), t);
        }
      }
      function Be(t) {
        (this.l = t.Ub || null), (this.j = t.eb || !1);
      }
      function je(t, e) {
        nt.call(this),
          (this.D = t),
          (this.o = e),
          (this.m = void 0),
          (this.status = this.readyState = 0),
          (this.responseType =
            this.responseText =
            this.response =
            this.statusText =
              ""),
          (this.onreadystatechange = null),
          (this.u = new Headers()),
          (this.h = null),
          (this.B = "GET"),
          (this.A = ""),
          (this.g = !1),
          (this.v = this.j = this.l = null);
      }
      function qe(t) {
        t.j.read().then(t.Pa.bind(t)).catch(t.ga.bind(t));
      }
      function $e(t) {
        (t.readyState = 4), (t.l = null), (t.j = null), (t.v = null), ze(t);
      }
      function ze(t) {
        t.onreadystatechange && t.onreadystatechange.call(t);
      }
      function Ke(t) {
        let e = "";
        return (
          v(t, function (t, n) {
            (e += n), (e += ":"), (e += t), (e += "\r\n");
          }),
          e
        );
      }
      function He(t, e, n) {
        t: {
          for (r in n) {
            var r = !1;
            break t;
          }
          r = !0;
        }
        r ||
          ((n = Ke(n)),
          "string" == typeof t
            ? null != n && encodeURIComponent(String(n))
            : be(t, e, n));
      }
      function Ge(t) {
        nt.call(this),
          (this.headers = new Map()),
          (this.o = t || null),
          (this.h = !1),
          (this.v = this.g = null),
          (this.D = ""),
          (this.m = 0),
          (this.l = ""),
          (this.j = this.B = this.u = this.A = !1),
          (this.I = null),
          (this.H = ""),
          (this.J = !1);
      }
      ((t = xe.prototype).add = function (t, e) {
        Re(this), (this.i = null), (t = Pe(this, t));
        var n = this.g.get(t);
        return n || this.g.set(t, (n = [])), n.push(e), (this.h += 1), this;
      }),
        (t.forEach = function (t, e) {
          Re(this),
            this.g.forEach(function (n, r) {
              n.forEach(function (n) {
                t.call(e, n, r, this);
              }, this);
            }, this);
        }),
        (t.na = function () {
          Re(this);
          const t = Array.from(this.g.values()),
            e = Array.from(this.g.keys()),
            n = [];
          for (let r = 0; r < e.length; r++) {
            const s = t[r];
            for (let t = 0; t < s.length; t++) n.push(e[r]);
          }
          return n;
        }),
        (t.V = function (t) {
          Re(this);
          let e = [];
          if ("string" == typeof t)
            Oe(this, t) && (e = e.concat(this.g.get(Pe(this, t))));
          else {
            t = Array.from(this.g.values());
            for (let n = 0; n < t.length; n++) e = e.concat(t[n]);
          }
          return e;
        }),
        (t.set = function (t, e) {
          return (
            Re(this),
            (this.i = null),
            Oe(this, (t = Pe(this, t))) && (this.h -= this.g.get(t).length),
            this.g.set(t, [e]),
            (this.h += 1),
            this
          );
        }),
        (t.get = function (t, e) {
          return t && 0 < (t = this.V(t)).length ? String(t[0]) : e;
        }),
        (t.toString = function () {
          if (this.i) return this.i;
          if (!this.g) return "";
          const t = [],
            e = Array.from(this.g.keys());
          for (var n = 0; n < e.length; n++) {
            var r = e[n];
            const i = encodeURIComponent(String(r)),
              o = this.V(r);
            for (r = 0; r < o.length; r++) {
              var s = i;
              "" !== o[r] && (s += "=" + encodeURIComponent(String(o[r]))),
                t.push(s);
            }
          }
          return (this.i = t.join("&"));
        }),
        l(Be, gt),
        (Be.prototype.g = function () {
          return new je(this.l, this.j);
        }),
        (Be.prototype.i =
          ((Ce = {}),
          function () {
            return Ce;
          })),
        l(je, nt),
        ((t = je.prototype).open = function (t, e) {
          if (0 != this.readyState)
            throw (this.abort(), Error("Error reopening a connection"));
          (this.B = t), (this.A = e), (this.readyState = 1), ze(this);
        }),
        (t.send = function (t) {
          if (1 != this.readyState)
            throw (this.abort(), Error("need to call open() first. "));
          this.g = !0;
          const e = {
            headers: this.u,
            method: this.B,
            credentials: this.m,
            cache: void 0,
          };
          t && (e.body = t),
            (this.D || s)
              .fetch(new Request(this.A, e))
              .then(this.Sa.bind(this), this.ga.bind(this));
        }),
        (t.abort = function () {
          (this.response = this.responseText = ""),
            (this.u = new Headers()),
            (this.status = 0),
            this.j && this.j.cancel("Request was aborted.").catch(() => {}),
            1 <= this.readyState &&
              this.g &&
              4 != this.readyState &&
              ((this.g = !1), $e(this)),
            (this.readyState = 0);
        }),
        (t.Sa = function (t) {
          if (
            this.g &&
            ((this.l = t),
            this.h ||
              ((this.status = this.l.status),
              (this.statusText = this.l.statusText),
              (this.h = t.headers),
              (this.readyState = 2),
              ze(this)),
            this.g && ((this.readyState = 3), ze(this), this.g))
          )
            if ("arraybuffer" === this.responseType)
              t.arrayBuffer().then(this.Qa.bind(this), this.ga.bind(this));
            else if (void 0 !== s.ReadableStream && "body" in t) {
              if (((this.j = t.body.getReader()), this.o)) {
                if (this.responseType)
                  throw Error(
                    'responseType must be empty for "streamBinaryChunks" mode responses.',
                  );
                this.response = [];
              } else
                (this.response = this.responseText = ""),
                  (this.v = new TextDecoder());
              qe(this);
            } else t.text().then(this.Ra.bind(this), this.ga.bind(this));
        }),
        (t.Pa = function (t) {
          if (this.g) {
            if (this.o && t.value) this.response.push(t.value);
            else if (!this.o) {
              var e = t.value ? t.value : new Uint8Array(0);
              (e = this.v.decode(e, { stream: !t.done })) &&
                (this.response = this.responseText += e);
            }
            t.done ? $e(this) : ze(this), 3 == this.readyState && qe(this);
          }
        }),
        (t.Ra = function (t) {
          this.g && ((this.response = this.responseText = t), $e(this));
        }),
        (t.Qa = function (t) {
          this.g && ((this.response = t), $e(this));
        }),
        (t.ga = function () {
          this.g && $e(this);
        }),
        (t.setRequestHeader = function (t, e) {
          this.u.append(t, e);
        }),
        (t.getResponseHeader = function (t) {
          return (this.h && this.h.get(t.toLowerCase())) || "";
        }),
        (t.getAllResponseHeaders = function () {
          if (!this.h) return "";
          const t = [],
            e = this.h.entries();
          for (var n = e.next(); !n.done; )
            (n = n.value), t.push(n[0] + ": " + n[1]), (n = e.next());
          return t.join("\r\n");
        }),
        Object.defineProperty(je.prototype, "withCredentials", {
          get: function () {
            return "include" === this.m;
          },
          set: function (t) {
            this.m = t ? "include" : "same-origin";
          },
        }),
        l(Ge, nt);
      var Qe = /^https?$/i,
        We = ["POST", "PUT"];
      function Xe(t, e) {
        (t.h = !1),
          t.g && ((t.j = !0), t.g.abort(), (t.j = !1)),
          (t.l = e),
          (t.m = 5),
          Ye(t),
          Ze(t);
      }
      function Ye(t) {
        t.A || ((t.A = !0), rt(t, "complete"), rt(t, "error"));
      }
      function Je(t) {
        if (t.h && void 0 !== r && (!t.v[1] || 4 != en(t) || 2 != t.Z()))
          if (t.u && 4 == en(t)) it(t.Ea, 0, t);
          else if ((rt(t, "readystatechange"), 4 == en(t))) {
            t.h = !1;
            try {
              const r = t.Z();
              t: switch (r) {
                case 200:
                case 201:
                case 202:
                case 204:
                case 206:
                case 304:
                case 1223:
                  var e = !0;
                  break t;
                default:
                  e = !1;
              }
              var n;
              if (!(n = e)) {
                var i;
                if ((i = 0 === r)) {
                  var o = String(t.D).match(ge)[1] || null;
                  !o &&
                    s.self &&
                    s.self.location &&
                    (o = s.self.location.protocol.slice(0, -1)),
                    (i = !Qe.test(o ? o.toLowerCase() : ""));
                }
                n = i;
              }
              if (n) rt(t, "complete"), rt(t, "success");
              else {
                t.m = 6;
                try {
                  var a = 2 < en(t) ? t.g.statusText : "";
                } catch (t) {
                  a = "";
                }
                (t.l = a + " [" + t.Z() + "]"), Ye(t);
              }
            } finally {
              Ze(t);
            }
          }
      }
      function Ze(t, e) {
        if (t.g) {
          tn(t);
          const n = t.g,
            r = t.v[0] ? () => {} : null;
          (t.g = null), (t.v = null), e || rt(t, "ready");
          try {
            n.onreadystatechange = r;
          } catch (t) {}
        }
      }
      function tn(t) {
        t.I && (s.clearTimeout(t.I), (t.I = null));
      }
      function en(t) {
        return t.g ? t.g.readyState : 0;
      }
      function nn(t) {
        try {
          if (!t.g) return null;
          if ("response" in t.g) return t.g.response;
          switch (t.H) {
            case "":
            case "text":
              return t.g.responseText;
            case "arraybuffer":
              if ("mozResponseArrayBuffer" in t.g)
                return t.g.mozResponseArrayBuffer;
          }
          return null;
        } catch (t) {
          return null;
        }
      }
      function rn(t, e, n) {
        return (
          (n && n.internalChannelParams && n.internalChannelParams[t]) || e
        );
      }
      function sn(t) {
        (this.Aa = 0),
          (this.i = []),
          (this.j = new kt()),
          (this.ia =
            this.qa =
            this.I =
            this.W =
            this.g =
            this.ya =
            this.D =
            this.H =
            this.m =
            this.S =
            this.o =
              null),
          (this.Ya = this.U = 0),
          (this.Va = rn("failFast", !1, t)),
          (this.F = this.C = this.u = this.s = this.l = null),
          (this.X = !0),
          (this.za = this.T = -1),
          (this.Y = this.v = this.B = 0),
          (this.Ta = rn("baseRetryDelayMs", 5e3, t)),
          (this.cb = rn("retryDelaySeedMs", 1e4, t)),
          (this.Wa = rn("forwardChannelMaxRetries", 2, t)),
          (this.wa = rn("forwardChannelRequestTimeoutMs", 2e4, t)),
          (this.pa = (t && t.xmlHttpFactory) || void 0),
          (this.Xa = (t && t.Tb) || void 0),
          (this.Ca = (t && t.useFetchStreams) || !1),
          (this.L = void 0),
          (this.J = (t && t.supportsCrossDomainXhr) || !1),
          (this.K = ""),
          (this.h = new oe(t && t.concurrentRequestLimit)),
          (this.Da = new Fe()),
          (this.P = (t && t.fastHandshake) || !1),
          (this.O = (t && t.encodeInitMessageHeaders) || !1),
          this.P && this.O && (this.O = !1),
          (this.Ua = (t && t.Rb) || !1),
          t && t.xa && this.j.xa(),
          t && t.forceLongPolling && (this.X = !1),
          (this.ba = (!this.P && this.X && t && t.detectBufferingProxy) || !1),
          (this.ja = void 0),
          t &&
            t.longPollingTimeout &&
            0 < t.longPollingTimeout &&
            (this.ja = t.longPollingTimeout),
          (this.ca = void 0),
          (this.R = 0),
          (this.M = !1),
          (this.ka = this.A = null);
      }
      function on(t) {
        if ((cn(t), 3 == t.G)) {
          var e = t.U++,
            n = me(t.I);
          if (
            (be(n, "SID", t.K),
            be(n, "RID", e),
            be(n, "TYPE", "terminate"),
            ln(t, n),
            ((e = new Mt(t, t.j, e)).L = 2),
            (e.v = Ee(me(n))),
            (n = !1),
            s.navigator && s.navigator.sendBeacon)
          )
            try {
              n = s.navigator.sendBeacon(e.v.toString(), "");
            } catch (t) {}
          !n && s.Image && ((new Image().src = e.v), (n = !0)),
            n || ((e.g = Tn(e.j, null)), e.g.ea(e.v)),
            (e.F = Date.now()),
            Zt(e);
        }
        En(t);
      }
      function an(t) {
        t.g && (pn(t), t.g.cancel(), (t.g = null));
      }
      function cn(t) {
        an(t),
          t.u && (s.clearTimeout(t.u), (t.u = null)),
          yn(t),
          t.h.cancel(),
          t.s && ("number" == typeof t.s && s.clearTimeout(t.s), (t.s = null));
      }
      function un(t) {
        if (!ae(t.h) && !t.s) {
          t.s = !0;
          var e = t.Ga;
          A || N(), D || (A(), (D = !0)), k.add(e, t), (t.B = 0);
        }
      }
      function hn(t, e) {
        var n;
        n = e ? e.l : t.U++;
        const r = me(t.I);
        be(r, "SID", t.K),
          be(r, "RID", n),
          be(r, "AID", t.T),
          ln(t, r),
          t.m && t.o && He(r, t.m, t.o),
          (n = new Mt(t, t.j, n, t.B + 1)),
          null === t.m && (n.H = t.o),
          e && (t.i = e.D.concat(t.i)),
          (e = dn(t, n, 1e3)),
          (n.I =
            Math.round(0.5 * t.wa) + Math.round(0.5 * t.wa * Math.random())),
          he(t.h, n),
          Ut(n, r, e);
      }
      function ln(t, e) {
        t.H &&
          v(t.H, function (t, n) {
            be(e, n, t);
          }),
          t.l &&
            fe({}, function (t, n) {
              be(e, n, t);
            });
      }
      function dn(t, e, n) {
        n = Math.min(t.i.length, n);
        var r = t.l ? u(t.l.Na, t.l, t) : null;
        t: {
          var s = t.i;
          let e = -1;
          for (;;) {
            const t = ["count=" + n];
            -1 == e
              ? 0 < n
                ? ((e = s[0].g), t.push("ofs=" + e))
                : (e = 0)
              : t.push("ofs=" + e);
            let i = !0;
            for (let o = 0; o < n; o++) {
              let n = s[o].g;
              const a = s[o].map;
              if (((n -= e), 0 > n)) (e = Math.max(0, s[o].g - 100)), (i = !1);
              else
                try {
                  Ue(a, t, "req" + n + "_");
                } catch (t) {
                  r && r(a);
                }
            }
            if (i) {
              r = t.join("&");
              break t;
            }
          }
        }
        return (t = t.i.splice(0, n)), (e.D = t), r;
      }
      function fn(t) {
        if (!t.g && !t.u) {
          t.Y = 1;
          var e = t.Fa;
          A || N(), D || (A(), (D = !0)), k.add(e, t), (t.v = 0);
        }
      }
      function gn(t) {
        return !(
          t.g ||
          t.u ||
          3 <= t.v ||
          (t.Y++, (t.u = Dt(u(t.Fa, t), wn(t, t.v))), t.v++, 0)
        );
      }
      function pn(t) {
        null != t.A && (s.clearTimeout(t.A), (t.A = null));
      }
      function mn(t) {
        (t.g = new Mt(t, t.j, "rpc", t.Y)),
          null === t.m && (t.g.H = t.o),
          (t.g.O = 0);
        var e = me(t.qa);
        be(e, "RID", "rpc"),
          be(e, "SID", t.K),
          be(e, "AID", t.T),
          be(e, "CI", t.F ? "0" : "1"),
          !t.F && t.ja && be(e, "TO", t.ja),
          be(e, "TYPE", "xmlhttp"),
          ln(t, e),
          t.m && t.o && He(e, t.m, t.o),
          t.L && (t.g.I = t.L);
        var n = t.g;
        (t = t.ia),
          (n.L = 1),
          (n.v = Ee(me(e))),
          (n.m = null),
          (n.P = !0),
          Bt(n, t);
      }
      function yn(t) {
        null != t.C && (s.clearTimeout(t.C), (t.C = null));
      }
      function vn(t, e) {
        var n = null;
        if (t.g == e) {
          yn(t), pn(t), (t.g = null);
          var r = 2;
        } else {
          if (!ue(t.h, e)) return;
          (n = e.D), le(t.h, e), (r = 1);
        }
        if (0 != t.G)
          if (e.o)
            if (1 == r) {
              (n = e.m ? e.m.length : 0), (e = Date.now() - e.F);
              var s = t.B;
              rt((r = _t()), new At(r, n)), un(t);
            } else fn(t);
          else if (
            3 == (s = e.s) ||
            (0 == s && 0 < e.X) ||
            !(
              (1 == r &&
                (function (t, e) {
                  return !(
                    ce(t.h) >= t.h.j - (t.s ? 1 : 0) ||
                    (t.s
                      ? ((t.i = e.D.concat(t.i)), 0)
                      : 1 == t.G ||
                        2 == t.G ||
                        t.B >= (t.Va ? 0 : t.Wa) ||
                        ((t.s = Dt(u(t.Ga, t, e), wn(t, t.B))), t.B++, 0))
                  );
                })(t, e)) ||
              (2 == r && gn(t))
            )
          )
            switch (
              (n && 0 < n.length && ((e = t.h), (e.i = e.i.concat(n))), s)
            ) {
              case 1:
                bn(t, 5);
                break;
              case 4:
                bn(t, 10);
                break;
              case 3:
                bn(t, 6);
                break;
              default:
                bn(t, 2);
            }
      }
      function wn(t, e) {
        let n = t.Ta + Math.floor(Math.random() * t.cb);
        return t.isActive() || (n *= 2), n * e;
      }
      function bn(t, e) {
        if ((t.j.info("Error code " + e), 2 == e)) {
          var n = u(t.fb, t),
            r = t.Xa;
          const e = !r;
          (r = new pe(r || "//www.google.com/images/cleardot.gif")),
            (s.location && "http" == s.location.protocol) || ye(r, "https"),
            Ee(r),
            e
              ? (function (t, e) {
                  const n = new kt();
                  if (s.Image) {
                    const r = new Image();
                    (r.onload = h(Ve, n, "TestLoadImage: loaded", !0, e, r)),
                      (r.onerror = h(Ve, n, "TestLoadImage: error", !1, e, r)),
                      (r.onabort = h(Ve, n, "TestLoadImage: abort", !1, e, r)),
                      (r.ontimeout = h(
                        Ve,
                        n,
                        "TestLoadImage: timeout",
                        !1,
                        e,
                        r,
                      )),
                      s.setTimeout(function () {
                        r.ontimeout && r.ontimeout();
                      }, 1e4),
                      (r.src = t);
                  } else e(!1);
                })(r.toString(), n)
              : (function (t, e) {
                  new kt();
                  const n = new AbortController(),
                    r = setTimeout(() => {
                      n.abort(), Ve(0, 0, !1, e);
                    }, 1e4);
                  fetch(t, { signal: n.signal })
                    .then((t) => {
                      clearTimeout(r), t.ok ? Ve(0, 0, !0, e) : Ve(0, 0, !1, e);
                    })
                    .catch(() => {
                      clearTimeout(r), Ve(0, 0, !1, e);
                    });
                })(r.toString(), n);
        } else It(2);
        (t.G = 0), t.l && t.l.sa(e), En(t), cn(t);
      }
      function En(t) {
        if (((t.G = 0), (t.ka = []), t.l)) {
          const e = de(t.h);
          (0 == e.length && 0 == t.i.length) ||
            (f(t.ka, e),
            f(t.ka, t.i),
            (t.h.i.length = 0),
            d(t.i),
            (t.i.length = 0)),
            t.l.ra();
        }
      }
      function _n(t, e, n) {
        var r = n instanceof pe ? me(n) : new pe(n);
        if ("" != r.g) e && (r.g = e + "." + r.g), ve(r, r.s);
        else {
          var i = s.location;
          (r = i.protocol),
            (e = e ? e + "." + i.hostname : i.hostname),
            (i = +i.port);
          var o = new pe(null);
          r && ye(o, r), e && (o.g = e), i && ve(o, i), n && (o.l = n), (r = o);
        }
        return (
          (n = t.D),
          (e = t.ya),
          n && e && be(r, n, e),
          be(r, "VER", t.la),
          ln(t, r),
          r
        );
      }
      function Tn(t, e, n) {
        if (e && !t.J)
          throw Error("Can't create secondary domain capable XhrIo object.");
        return (
          (e = t.Ca && !t.pa ? new Ge(new Be({ eb: n })) : new Ge(t.pa)).Ha(
            t.J,
          ),
          e
        );
      }
      function Sn() {}
      function Cn() {}
      function In(t, e) {
        nt.call(this),
          (this.g = new sn(e)),
          (this.l = t),
          (this.h = (e && e.messageUrlParams) || null),
          (t = (e && e.messageHeaders) || null),
          e &&
            e.clientProtocolHeaderRequired &&
            (t
              ? (t["X-Client-Protocol"] = "webchannel")
              : (t = { "X-Client-Protocol": "webchannel" })),
          (this.g.o = t),
          (t = (e && e.initMessageHeaders) || null),
          e &&
            e.messageContentType &&
            (t
              ? (t["X-WebChannel-Content-Type"] = e.messageContentType)
              : (t = { "X-WebChannel-Content-Type": e.messageContentType })),
          e &&
            e.va &&
            (t
              ? (t["X-WebChannel-Client-Profile"] = e.va)
              : (t = { "X-WebChannel-Client-Profile": e.va })),
          (this.g.S = t),
          (t = e && e.Sb) && !g(t) && (this.g.m = t),
          (this.v = (e && e.supportsCrossDomainXhr) || !1),
          (this.u = (e && e.sendRawJson) || !1),
          (e = e && e.httpSessionIdParam) &&
            !g(e) &&
            ((this.g.D = e),
            null !== (t = this.h) &&
              e in t &&
              e in (t = this.h) &&
              delete t[e]),
          (this.j = new kn(this));
      }
      function An(t) {
        vt.call(this),
          t.__headers__ &&
            ((this.headers = t.__headers__),
            (this.statusCode = t.__status__),
            delete t.__headers__,
            delete t.__status__);
        var e = t.__sm__;
        if (e) {
          t: {
            for (const n in e) {
              t = n;
              break t;
            }
            t = void 0;
          }
          (this.i = t) &&
            ((t = this.i), (e = null !== e && t in e ? e[t] : void 0)),
            (this.data = e);
        } else this.data = t;
      }
      function Dn() {
        wt.call(this), (this.status = 1);
      }
      function kn(t) {
        this.g = t;
      }
      ((t = Ge.prototype).Ha = function (t) {
        this.J = t;
      }),
        (t.ea = function (t, e, n, r) {
          if (this.g)
            throw Error(
              "[goog.net.XhrIo] Object is active with another request=" +
                this.D +
                "; newUri=" +
                t,
            );
          (e = e ? e.toUpperCase() : "GET"),
            (this.D = t),
            (this.l = ""),
            (this.m = 0),
            (this.A = !1),
            (this.h = !0),
            (this.g = this.o ? this.o.g() : xt.g()),
            (this.v = this.o ? pt(this.o) : pt(xt)),
            (this.g.onreadystatechange = u(this.Ea, this));
          try {
            (this.B = !0), this.g.open(e, String(t), !0), (this.B = !1);
          } catch (t) {
            return void Xe(this, t);
          }
          if (((t = n || ""), (n = new Map(this.headers)), r))
            if (Object.getPrototypeOf(r) === Object.prototype)
              for (var i in r) n.set(i, r[i]);
            else {
              if ("function" != typeof r.keys || "function" != typeof r.get)
                throw Error("Unknown input type for opt_headers: " + String(r));
              for (const t of r.keys()) n.set(t, r.get(t));
            }
          (r = Array.from(n.keys()).find(
            (t) => "content-type" == t.toLowerCase(),
          )),
            (i = s.FormData && t instanceof s.FormData),
            !(0 <= Array.prototype.indexOf.call(We, e, void 0)) ||
              r ||
              i ||
              n.set(
                "Content-Type",
                "application/x-www-form-urlencoded;charset=utf-8",
              );
          for (const [t, e] of n) this.g.setRequestHeader(t, e);
          this.H && (this.g.responseType = this.H),
            "withCredentials" in this.g &&
              this.g.withCredentials !== this.J &&
              (this.g.withCredentials = this.J);
          try {
            tn(this), (this.u = !0), this.g.send(t), (this.u = !1);
          } catch (t) {
            Xe(this, t);
          }
        }),
        (t.abort = function (t) {
          this.g &&
            this.h &&
            ((this.h = !1),
            (this.j = !0),
            this.g.abort(),
            (this.j = !1),
            (this.m = t || 7),
            rt(this, "complete"),
            rt(this, "abort"),
            Ze(this));
        }),
        (t.N = function () {
          this.g &&
            (this.h &&
              ((this.h = !1), (this.j = !0), this.g.abort(), (this.j = !1)),
            Ze(this, !0)),
            Ge.aa.N.call(this);
        }),
        (t.Ea = function () {
          this.s || (this.B || this.u || this.j ? Je(this) : this.bb());
        }),
        (t.bb = function () {
          Je(this);
        }),
        (t.isActive = function () {
          return !!this.g;
        }),
        (t.Z = function () {
          try {
            return 2 < en(this) ? this.g.status : -1;
          } catch (t) {
            return -1;
          }
        }),
        (t.oa = function () {
          try {
            return this.g ? this.g.responseText : "";
          } catch (t) {
            return "";
          }
        }),
        (t.Oa = function (t) {
          if (this.g) {
            var e = this.g.responseText;
            return t && 0 == e.indexOf(t) && (e = e.substring(t.length)), dt(e);
          }
        }),
        (t.Ba = function () {
          return this.m;
        }),
        (t.Ka = function () {
          return "string" == typeof this.l ? this.l : String(this.l);
        }),
        ((t = sn.prototype).la = 8),
        (t.G = 1),
        (t.connect = function (t, e, n, r) {
          It(0),
            (this.W = t),
            (this.H = e || {}),
            n && void 0 !== r && ((this.H.OSID = n), (this.H.OAID = r)),
            (this.F = this.X),
            (this.I = _n(this, null, this.W)),
            un(this);
        }),
        (t.Ga = function (t) {
          if (this.s)
            if (((this.s = null), 1 == this.G)) {
              if (!t) {
                (this.U = Math.floor(1e5 * Math.random())), (t = this.U++);
                const s = new Mt(this, this.j, t);
                let i = this.o;
                if (
                  (this.S && (i ? ((i = w(i)), E(i, this.S)) : (i = this.S)),
                  null !== this.m || this.O || ((s.H = i), (i = null)),
                  this.P)
                )
                  t: {
                    for (var e = 0, n = 0; n < this.i.length; n++) {
                      var r = this.i[n];
                      if (
                        void 0 ===
                        (r =
                          "__data__" in r.map &&
                          "string" == typeof (r = r.map.__data__)
                            ? r.length
                            : void 0)
                      )
                        break;
                      if (4096 < (e += r)) {
                        e = n;
                        break t;
                      }
                      if (4096 === e || n === this.i.length - 1) {
                        e = n + 1;
                        break t;
                      }
                    }
                    e = 1e3;
                  }
                else e = 1e3;
                (e = dn(this, s, e)),
                  be((n = me(this.I)), "RID", t),
                  be(n, "CVER", 22),
                  this.D && be(n, "X-HTTP-Session-Id", this.D),
                  ln(this, n),
                  i &&
                    (this.O
                      ? (e =
                          "headers=" +
                          encodeURIComponent(String(Ke(i))) +
                          "&" +
                          e)
                      : this.m && He(n, this.m, i)),
                  he(this.h, s),
                  this.Ua && be(n, "TYPE", "init"),
                  this.P
                    ? (be(n, "$req", e),
                      be(n, "SID", "null"),
                      (s.T = !0),
                      Ut(s, n, null))
                    : Ut(s, n, e),
                  (this.G = 2);
              }
            } else
              3 == this.G &&
                (t
                  ? hn(this, t)
                  : 0 == this.i.length || ae(this.h) || hn(this));
        }),
        (t.Fa = function () {
          if (
            ((this.u = null),
            mn(this),
            this.ba && !(this.M || null == this.g || 0 >= this.R))
          ) {
            var t = 2 * this.R;
            this.j.info("BP detection timer enabled: " + t),
              (this.A = Dt(u(this.ab, this), t));
          }
        }),
        (t.ab = function () {
          this.A &&
            ((this.A = null),
            this.j.info("BP detection timeout reached."),
            this.j.info("Buffering proxy detected and switch to long-polling!"),
            (this.F = !1),
            (this.M = !0),
            It(10),
            an(this),
            mn(this));
        }),
        (t.Za = function () {
          null != this.C && ((this.C = null), an(this), gn(this), It(19));
        }),
        (t.fb = function (t) {
          t
            ? (this.j.info("Successfully pinged google.com"), It(2))
            : (this.j.info("Failed to ping google.com"), It(1));
        }),
        (t.isActive = function () {
          return !!this.l && this.l.isActive(this);
        }),
        ((t = Sn.prototype).ua = function () {}),
        (t.ta = function () {}),
        (t.sa = function () {}),
        (t.ra = function () {}),
        (t.isActive = function () {
          return !0;
        }),
        (t.Na = function () {}),
        (Cn.prototype.g = function (t, e) {
          return new In(t, e);
        }),
        l(In, nt),
        (In.prototype.m = function () {
          (this.g.l = this.j),
            this.v && (this.g.J = !0),
            this.g.connect(this.l, this.h || void 0);
        }),
        (In.prototype.close = function () {
          on(this.g);
        }),
        (In.prototype.o = function (t) {
          var e = this.g;
          if ("string" == typeof t) {
            var n = {};
            (n.__data__ = t), (t = n);
          } else this.u && (((n = {}).__data__ = lt(t)), (t = n));
          e.i.push(new ie(e.Ya++, t)), 3 == e.G && un(e);
        }),
        (In.prototype.N = function () {
          (this.g.l = null),
            delete this.j,
            on(this.g),
            delete this.g,
            In.aa.N.call(this);
        }),
        l(An, vt),
        l(Dn, wt),
        l(kn, Sn),
        (kn.prototype.ua = function () {
          rt(this.g, "a");
        }),
        (kn.prototype.ta = function (t) {
          rt(this.g, new An(t));
        }),
        (kn.prototype.sa = function (t) {
          rt(this.g, new Dn());
        }),
        (kn.prototype.ra = function () {
          rt(this.g, "b");
        }),
        (Cn.prototype.createWebChannel = Cn.prototype.g),
        (In.prototype.send = In.prototype.o),
        (In.prototype.open = In.prototype.m),
        (In.prototype.close = In.prototype.close),
        (Wt = Yt.createWebChannelTransport =
          function () {
            return new Cn();
          }),
        (Qt = Yt.getStatEventTarget =
          function () {
            return _t();
          }),
        (Gt = Yt.Event = bt),
        (Ht = Yt.Stat =
          {
            mb: 0,
            pb: 1,
            qb: 2,
            Jb: 3,
            Ob: 4,
            Lb: 5,
            Mb: 6,
            Kb: 7,
            Ib: 8,
            Nb: 9,
            PROXY: 10,
            NOPROXY: 11,
            Gb: 12,
            Cb: 13,
            Db: 14,
            Bb: 15,
            Eb: 16,
            Fb: 17,
            ib: 18,
            hb: 19,
            jb: 20,
          }),
        (Rt.NO_ERROR = 0),
        (Rt.TIMEOUT = 8),
        (Rt.HTTP_ERROR = 6),
        (Kt = Yt.ErrorCode = Rt),
        (Lt.COMPLETE = "complete"),
        (zt = Yt.EventType = Lt),
        (mt.EventType = yt),
        (yt.OPEN = "a"),
        (yt.CLOSE = "b"),
        (yt.ERROR = "c"),
        (yt.MESSAGE = "d"),
        (nt.prototype.listen = nt.prototype.K),
        ($t = Yt.WebChannel = mt),
        (Yt.FetchXmlHttpFactory = Be),
        (Ge.prototype.listenOnce = Ge.prototype.L),
        (Ge.prototype.getLastError = Ge.prototype.Ka),
        (Ge.prototype.getLastErrorCode = Ge.prototype.Ba),
        (Ge.prototype.getStatus = Ge.prototype.Z),
        (Ge.prototype.getResponseJson = Ge.prototype.Oa),
        (Ge.prototype.getResponseText = Ge.prototype.oa),
        (Ge.prototype.send = Ge.prototype.ea),
        (Ge.prototype.setWithCredentials = Ge.prototype.Ha),
        (qt = Yt.XhrIo = Ge);
    }).apply(
      void 0 !== Xt
        ? Xt
        : "undefined" != typeof self
          ? self
          : "undefined" != typeof window
            ? window
            : {},
    );
    const Jt = "@firebase/firestore",
      Zt = "4.7.10";
    class te {
      constructor(t) {
        this.uid = t;
      }
      isAuthenticated() {
        return null != this.uid;
      }
      toKey() {
        return this.isAuthenticated() ? "uid:" + this.uid : "anonymous-user";
      }
      isEqual(t) {
        return t.uid === this.uid;
      }
    }
    (te.UNAUTHENTICATED = new te(null)),
      (te.GOOGLE_CREDENTIALS = new te("google-credentials-uid")),
      (te.FIRST_PARTY = new te("first-party-uid")),
      (te.MOCK_USER = new te("mock-user"));
    let ee = "11.5.0";
    const ne = new C("@firebase/firestore");
    function re() {
      return ne.logLevel;
    }
    function se(t, ...e) {
      if (ne.logLevel <= b.DEBUG) {
        const n = e.map(ae);
        ne.debug(`Firestore (${ee}): ${t}`, ...n);
      }
    }
    function ie(t, ...e) {
      if (ne.logLevel <= b.ERROR) {
        const n = e.map(ae);
        ne.error(`Firestore (${ee}): ${t}`, ...n);
      }
    }
    function oe(t, ...e) {
      if (ne.logLevel <= b.WARN) {
        const n = e.map(ae);
        ne.warn(`Firestore (${ee}): ${t}`, ...n);
      }
    }
    function ae(t) {
      if ("string" == typeof t) return t;
      try {
        return (function (t) {
          return JSON.stringify(t);
        })(t);
      } catch (e) {
        return t;
      }
    }
    function ce(t = "Unexpected state") {
      const e = `FIRESTORE (${ee}) INTERNAL ASSERTION FAILED: ` + t;
      throw (ie(e), new Error(e));
    }
    function ue(t, e) {
      t || ce();
    }
    function he(t, e) {
      return t;
    }
    const le = {
      OK: "ok",
      CANCELLED: "cancelled",
      UNKNOWN: "unknown",
      INVALID_ARGUMENT: "invalid-argument",
      DEADLINE_EXCEEDED: "deadline-exceeded",
      NOT_FOUND: "not-found",
      ALREADY_EXISTS: "already-exists",
      PERMISSION_DENIED: "permission-denied",
      UNAUTHENTICATED: "unauthenticated",
      RESOURCE_EXHAUSTED: "resource-exhausted",
      FAILED_PRECONDITION: "failed-precondition",
      ABORTED: "aborted",
      OUT_OF_RANGE: "out-of-range",
      UNIMPLEMENTED: "unimplemented",
      INTERNAL: "internal",
      UNAVAILABLE: "unavailable",
      DATA_LOSS: "data-loss",
    };
    class de extends u {
      constructor(t, e) {
        super(t, e),
          (this.code = t),
          (this.message = e),
          (this.toString = () =>
            `${this.name}: [code=${this.code}]: ${this.message}`);
      }
    }
    class fe {
      constructor() {
        this.promise = new Promise((t, e) => {
          (this.resolve = t), (this.reject = e);
        });
      }
    }
    class ge {
      constructor(t, e) {
        (this.user = e),
          (this.type = "OAuth"),
          (this.headers = new Map()),
          this.headers.set("Authorization", `Bearer ${t}`);
      }
    }
    class pe {
      getToken() {
        return Promise.resolve(null);
      }
      invalidateToken() {}
      start(t, e) {
        t.enqueueRetryable(() => e(te.UNAUTHENTICATED));
      }
      shutdown() {}
    }
    class me {
      constructor(t) {
        (this.token = t), (this.changeListener = null);
      }
      getToken() {
        return Promise.resolve(this.token);
      }
      invalidateToken() {}
      start(t, e) {
        (this.changeListener = e), t.enqueueRetryable(() => e(this.token.user));
      }
      shutdown() {
        this.changeListener = null;
      }
    }
    class ye {
      constructor(t) {
        (this.t = t),
          (this.currentUser = te.UNAUTHENTICATED),
          (this.i = 0),
          (this.forceRefresh = !1),
          (this.auth = null);
      }
      start(t, e) {
        ue(void 0 === this.o);
        let n = this.i;
        const r = (t) =>
          this.i !== n ? ((n = this.i), e(t)) : Promise.resolve();
        let s = new fe();
        this.o = () => {
          this.i++,
            (this.currentUser = this.u()),
            s.resolve(),
            (s = new fe()),
            t.enqueueRetryable(() => r(this.currentUser));
        };
        const i = () => {
            const e = s;
            t.enqueueRetryable(async () => {
              await e.promise, await r(this.currentUser);
            });
          },
          o = (t) => {
            se("FirebaseAuthCredentialsProvider", "Auth detected"),
              (this.auth = t),
              this.o && (this.auth.addAuthTokenListener(this.o), i());
          };
        this.t.onInit((t) => o(t)),
          setTimeout(() => {
            if (!this.auth) {
              const t = this.t.getImmediate({ optional: !0 });
              t
                ? o(t)
                : (se(
                    "FirebaseAuthCredentialsProvider",
                    "Auth not yet detected",
                  ),
                  s.resolve(),
                  (s = new fe()));
            }
          }, 0),
          i();
      }
      getToken() {
        const t = this.i,
          e = this.forceRefresh;
        return (
          (this.forceRefresh = !1),
          this.auth
            ? this.auth
                .getToken(e)
                .then((e) =>
                  this.i !== t
                    ? (se(
                        "FirebaseAuthCredentialsProvider",
                        "getToken aborted due to token change.",
                      ),
                      this.getToken())
                    : e
                      ? (ue("string" == typeof e.accessToken),
                        new ge(e.accessToken, this.currentUser))
                      : null,
                )
            : Promise.resolve(null)
        );
      }
      invalidateToken() {
        this.forceRefresh = !0;
      }
      shutdown() {
        this.auth && this.o && this.auth.removeAuthTokenListener(this.o),
          (this.o = void 0);
      }
      u() {
        const t = this.auth && this.auth.getUid();
        return ue(null === t || "string" == typeof t), new te(t);
      }
    }
    class ve {
      constructor(t, e, n) {
        (this.l = t),
          (this.h = e),
          (this.P = n),
          (this.type = "FirstParty"),
          (this.user = te.FIRST_PARTY),
          (this.T = new Map());
      }
      I() {
        return this.P ? this.P() : null;
      }
      get headers() {
        this.T.set("X-Goog-AuthUser", this.l);
        const t = this.I();
        return (
          t && this.T.set("Authorization", t),
          this.h && this.T.set("X-Goog-Iam-Authorization-Token", this.h),
          this.T
        );
      }
    }
    class we {
      constructor(t, e, n) {
        (this.l = t), (this.h = e), (this.P = n);
      }
      getToken() {
        return Promise.resolve(new ve(this.l, this.h, this.P));
      }
      start(t, e) {
        t.enqueueRetryable(() => e(te.FIRST_PARTY));
      }
      shutdown() {}
      invalidateToken() {}
    }
    class be {
      constructor(t) {
        (this.value = t),
          (this.type = "AppCheck"),
          (this.headers = new Map()),
          t &&
            t.length > 0 &&
            this.headers.set("x-firebase-appcheck", this.value);
      }
    }
    class Ee {
      constructor(t, e) {
        var n;
        (this.A = e),
          (this.forceRefresh = !1),
          (this.appCheck = null),
          (this.R = null),
          (this.V = null),
          null != (n = t) &&
            void 0 !== n.settings &&
            t.settings.appCheckToken &&
            (this.V = t.settings.appCheckToken);
      }
      start(t, e) {
        ue(void 0 === this.o);
        const n = (t) => {
          null != t.error &&
            se(
              "FirebaseAppCheckTokenProvider",
              `Error getting App Check token; using placeholder token instead. Error: ${t.error.message}`,
            );
          const n = t.token !== this.R;
          return (
            (this.R = t.token),
            se(
              "FirebaseAppCheckTokenProvider",
              `Received ${n ? "new" : "existing"} token.`,
            ),
            n ? e(t.token) : Promise.resolve()
          );
        };
        this.o = (e) => {
          t.enqueueRetryable(() => n(e));
        };
        const r = (t) => {
          se("FirebaseAppCheckTokenProvider", "AppCheck detected"),
            (this.appCheck = t),
            this.o && this.appCheck.addTokenListener(this.o);
        };
        this.A.onInit((t) => r(t)),
          setTimeout(() => {
            if (!this.appCheck) {
              const t = this.A.getImmediate({ optional: !0 });
              t
                ? r(t)
                : se(
                    "FirebaseAppCheckTokenProvider",
                    "AppCheck not yet detected",
                  );
            }
          }, 0);
      }
      getToken() {
        if (this.V) return Promise.resolve(new be(this.V));
        const t = this.forceRefresh;
        return (
          (this.forceRefresh = !1),
          this.appCheck
            ? this.appCheck
                .getToken(t)
                .then((t) =>
                  t
                    ? (ue("string" == typeof t.token),
                      (this.R = t.token),
                      new be(t.token))
                    : null,
                )
            : Promise.resolve(null)
        );
      }
      invalidateToken() {
        this.forceRefresh = !0;
      }
      shutdown() {
        this.appCheck && this.o && this.appCheck.removeTokenListener(this.o),
          (this.o = void 0);
      }
    }
    function _e(t) {
      const e = "undefined" != typeof self && (self.crypto || self.msCrypto),
        n = new Uint8Array(t);
      if (e && "function" == typeof e.getRandomValues) e.getRandomValues(n);
      else for (let e = 0; e < t; e++) n[e] = Math.floor(256 * Math.random());
      return n;
    }
    function Te() {
      return new TextEncoder();
    }
    class Se {
      static newId() {
        const t = 62 * Math.floor(256 / 62);
        let e = "";
        for (; e.length < 20; ) {
          const n = _e(40);
          for (let r = 0; r < n.length; ++r)
            e.length < 20 &&
              n[r] < t &&
              (e +=
                "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".charAt(
                  n[r] % 62,
                ));
        }
        return e;
      }
    }
    function Ce(t, e) {
      return t < e ? -1 : t > e ? 1 : 0;
    }
    function Ie(t, e) {
      let n = 0;
      for (; n < t.length && n < e.length; ) {
        const r = t.codePointAt(n),
          s = e.codePointAt(n);
        if (r !== s) {
          if (r < 128 && s < 128) return Ce(r, s);
          {
            const i = Te(),
              o = De(i.encode(Ae(t, n)), i.encode(Ae(e, n)));
            return 0 !== o ? o : Ce(r, s);
          }
        }
        n += r > 65535 ? 2 : 1;
      }
      return Ce(t.length, e.length);
    }
    function Ae(t, e) {
      return t.codePointAt(e) > 65535
        ? t.substring(e, e + 2)
        : t.substring(e, e + 1);
    }
    function De(t, e) {
      for (let n = 0; n < t.length && n < e.length; ++n)
        if (t[n] !== e[n]) return Ce(t[n], e[n]);
      return Ce(t.length, e.length);
    }
    function ke(t, e, n) {
      return t.length === e.length && t.every((t, r) => n(t, e[r]));
    }
    const Ne = -62135596800,
      xe = 1e6;
    class Re {
      static now() {
        return Re.fromMillis(Date.now());
      }
      static fromDate(t) {
        return Re.fromMillis(t.getTime());
      }
      static fromMillis(t) {
        const e = Math.floor(t / 1e3),
          n = Math.floor((t - 1e3 * e) * xe);
        return new Re(e, n);
      }
      constructor(t, e) {
        if (((this.seconds = t), (this.nanoseconds = e), e < 0))
          throw new de(
            le.INVALID_ARGUMENT,
            "Timestamp nanoseconds out of range: " + e,
          );
        if (e >= 1e9)
          throw new de(
            le.INVALID_ARGUMENT,
            "Timestamp nanoseconds out of range: " + e,
          );
        if (t < Ne)
          throw new de(
            le.INVALID_ARGUMENT,
            "Timestamp seconds out of range: " + t,
          );
        if (t >= 253402300800)
          throw new de(
            le.INVALID_ARGUMENT,
            "Timestamp seconds out of range: " + t,
          );
      }
      toDate() {
        return new Date(this.toMillis());
      }
      toMillis() {
        return 1e3 * this.seconds + this.nanoseconds / xe;
      }
      _compareTo(t) {
        return this.seconds === t.seconds
          ? Ce(this.nanoseconds, t.nanoseconds)
          : Ce(this.seconds, t.seconds);
      }
      isEqual(t) {
        return t.seconds === this.seconds && t.nanoseconds === this.nanoseconds;
      }
      toString() {
        return (
          "Timestamp(seconds=" +
          this.seconds +
          ", nanoseconds=" +
          this.nanoseconds +
          ")"
        );
      }
      toJSON() {
        return { seconds: this.seconds, nanoseconds: this.nanoseconds };
      }
      valueOf() {
        const t = this.seconds - Ne;
        return (
          String(t).padStart(12, "0") +
          "." +
          String(this.nanoseconds).padStart(9, "0")
        );
      }
    }
    class Le {
      static fromTimestamp(t) {
        return new Le(t);
      }
      static min() {
        return new Le(new Re(0, 0));
      }
      static max() {
        return new Le(new Re(253402300799, 999999999));
      }
      constructor(t) {
        this.timestamp = t;
      }
      compareTo(t) {
        return this.timestamp._compareTo(t.timestamp);
      }
      isEqual(t) {
        return this.timestamp.isEqual(t.timestamp);
      }
      toMicroseconds() {
        return 1e6 * this.timestamp.seconds + this.timestamp.nanoseconds / 1e3;
      }
      toString() {
        return "SnapshotVersion(" + this.timestamp.toString() + ")";
      }
      toTimestamp() {
        return this.timestamp;
      }
    }
    const Oe = "__name__";
    class Me {
      constructor(t, e, n) {
        void 0 === e ? (e = 0) : e > t.length && ce(),
          void 0 === n ? (n = t.length - e) : n > t.length - e && ce(),
          (this.segments = t),
          (this.offset = e),
          (this.len = n);
      }
      get length() {
        return this.len;
      }
      isEqual(t) {
        return 0 === Me.comparator(this, t);
      }
      child(t) {
        const e = this.segments.slice(this.offset, this.limit());
        return (
          t instanceof Me
            ? t.forEach((t) => {
                e.push(t);
              })
            : e.push(t),
          this.construct(e)
        );
      }
      limit() {
        return this.offset + this.length;
      }
      popFirst(t) {
        return (
          (t = void 0 === t ? 1 : t),
          this.construct(this.segments, this.offset + t, this.length - t)
        );
      }
      popLast() {
        return this.construct(this.segments, this.offset, this.length - 1);
      }
      firstSegment() {
        return this.segments[this.offset];
      }
      lastSegment() {
        return this.get(this.length - 1);
      }
      get(t) {
        return this.segments[this.offset + t];
      }
      isEmpty() {
        return 0 === this.length;
      }
      isPrefixOf(t) {
        if (t.length < this.length) return !1;
        for (let e = 0; e < this.length; e++)
          if (this.get(e) !== t.get(e)) return !1;
        return !0;
      }
      isImmediateParentOf(t) {
        if (this.length + 1 !== t.length) return !1;
        for (let e = 0; e < this.length; e++)
          if (this.get(e) !== t.get(e)) return !1;
        return !0;
      }
      forEach(t) {
        for (let e = this.offset, n = this.limit(); e < n; e++)
          t(this.segments[e]);
      }
      toArray() {
        return this.segments.slice(this.offset, this.limit());
      }
      static comparator(t, e) {
        const n = Math.min(t.length, e.length);
        for (let r = 0; r < n; r++) {
          const n = Me.compareSegments(t.get(r), e.get(r));
          if (0 !== n) return n;
        }
        return Ce(t.length, e.length);
      }
      static compareSegments(t, e) {
        const n = Me.isNumericId(t),
          r = Me.isNumericId(e);
        return n && !r
          ? -1
          : !n && r
            ? 1
            : n && r
              ? Me.extractNumericId(t).compare(Me.extractNumericId(e))
              : Ie(t, e);
      }
      static isNumericId(t) {
        return t.startsWith("__id") && t.endsWith("__");
      }
      static extractNumericId(t) {
        return Ft.fromString(t.substring(4, t.length - 2));
      }
    }
    class Pe extends Me {
      construct(t, e, n) {
        return new Pe(t, e, n);
      }
      canonicalString() {
        return this.toArray().join("/");
      }
      toString() {
        return this.canonicalString();
      }
      toUriEncodedString() {
        return this.toArray().map(encodeURIComponent).join("/");
      }
      static fromString(...t) {
        const e = [];
        for (const n of t) {
          if (n.indexOf("//") >= 0)
            throw new de(
              le.INVALID_ARGUMENT,
              `Invalid segment (${n}). Paths must not contain // in them.`,
            );
          e.push(...n.split("/").filter((t) => t.length > 0));
        }
        return new Pe(e);
      }
      static emptyPath() {
        return new Pe([]);
      }
    }
    const Ve = /^[_a-zA-Z][_a-zA-Z0-9]*$/;
    class Fe extends Me {
      construct(t, e, n) {
        return new Fe(t, e, n);
      }
      static isValidIdentifier(t) {
        return Ve.test(t);
      }
      canonicalString() {
        return this.toArray()
          .map(
            (t) => (
              (t = t.replace(/\\/g, "\\\\").replace(/`/g, "\\`")),
              Fe.isValidIdentifier(t) || (t = "`" + t + "`"),
              t
            ),
          )
          .join(".");
      }
      toString() {
        return this.canonicalString();
      }
      isKeyField() {
        return 1 === this.length && this.get(0) === Oe;
      }
      static keyField() {
        return new Fe([Oe]);
      }
      static fromServerFormat(t) {
        const e = [];
        let n = "",
          r = 0;
        const s = () => {
          if (0 === n.length)
            throw new de(
              le.INVALID_ARGUMENT,
              `Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,
            );
          e.push(n), (n = "");
        };
        let i = !1;
        for (; r < t.length; ) {
          const e = t[r];
          if ("\\" === e) {
            if (r + 1 === t.length)
              throw new de(
                le.INVALID_ARGUMENT,
                "Path has trailing escape character: " + t,
              );
            const e = t[r + 1];
            if ("\\" !== e && "." !== e && "`" !== e)
              throw new de(
                le.INVALID_ARGUMENT,
                "Path has invalid escape sequence: " + t,
              );
            (n += e), (r += 2);
          } else
            "`" === e
              ? ((i = !i), r++)
              : "." !== e || i
                ? ((n += e), r++)
                : (s(), r++);
        }
        if ((s(), i))
          throw new de(le.INVALID_ARGUMENT, "Unterminated ` in path: " + t);
        return new Fe(e);
      }
      static emptyPath() {
        return new Fe([]);
      }
    }
    class Ue {
      constructor(t) {
        this.path = t;
      }
      static fromPath(t) {
        return new Ue(Pe.fromString(t));
      }
      static fromName(t) {
        return new Ue(Pe.fromString(t).popFirst(5));
      }
      static empty() {
        return new Ue(Pe.emptyPath());
      }
      get collectionGroup() {
        return this.path.popLast().lastSegment();
      }
      hasCollectionId(t) {
        return (
          this.path.length >= 2 && this.path.get(this.path.length - 2) === t
        );
      }
      getCollectionGroup() {
        return this.path.get(this.path.length - 2);
      }
      getCollectionPath() {
        return this.path.popLast();
      }
      isEqual(t) {
        return null !== t && 0 === Pe.comparator(this.path, t.path);
      }
      toString() {
        return this.path.toString();
      }
      static comparator(t, e) {
        return Pe.comparator(t.path, e.path);
      }
      static isDocumentKey(t) {
        return t.length % 2 == 0;
      }
      static fromSegments(t) {
        return new Ue(new Pe(t.slice()));
      }
    }
    function Be(t) {
      return new je(t.readTime, t.key, -1);
    }
    class je {
      constructor(t, e, n) {
        (this.readTime = t), (this.documentKey = e), (this.largestBatchId = n);
      }
      static min() {
        return new je(Le.min(), Ue.empty(), -1);
      }
      static max() {
        return new je(Le.max(), Ue.empty(), -1);
      }
    }
    function qe(t, e) {
      let n = t.readTime.compareTo(e.readTime);
      return 0 !== n
        ? n
        : ((n = Ue.comparator(t.documentKey, e.documentKey)),
          0 !== n ? n : Ce(t.largestBatchId, e.largestBatchId));
    }
    class $e {
      constructor() {
        this.onCommittedListeners = [];
      }
      addOnCommittedListener(t) {
        this.onCommittedListeners.push(t);
      }
      raiseOnCommittedEvent() {
        this.onCommittedListeners.forEach((t) => t());
      }
    }
    async function ze(t) {
      if (
        t.code !== le.FAILED_PRECONDITION ||
        "The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab." !==
          t.message
      )
        throw t;
      se("LocalStore", "Unexpectedly lost primary lease");
    }
    class Ke {
      constructor(t) {
        (this.nextCallback = null),
          (this.catchCallback = null),
          (this.result = void 0),
          (this.error = void 0),
          (this.isDone = !1),
          (this.callbackAttached = !1),
          t(
            (t) => {
              (this.isDone = !0),
                (this.result = t),
                this.nextCallback && this.nextCallback(t);
            },
            (t) => {
              (this.isDone = !0),
                (this.error = t),
                this.catchCallback && this.catchCallback(t);
            },
          );
      }
      catch(t) {
        return this.next(void 0, t);
      }
      next(t, e) {
        return (
          this.callbackAttached && ce(),
          (this.callbackAttached = !0),
          this.isDone
            ? this.error
              ? this.wrapFailure(e, this.error)
              : this.wrapSuccess(t, this.result)
            : new Ke((n, r) => {
                (this.nextCallback = (e) => {
                  this.wrapSuccess(t, e).next(n, r);
                }),
                  (this.catchCallback = (t) => {
                    this.wrapFailure(e, t).next(n, r);
                  });
              })
        );
      }
      toPromise() {
        return new Promise((t, e) => {
          this.next(t, e);
        });
      }
      wrapUserFunction(t) {
        try {
          const e = t();
          return e instanceof Ke ? e : Ke.resolve(e);
        } catch (t) {
          return Ke.reject(t);
        }
      }
      wrapSuccess(t, e) {
        return t ? this.wrapUserFunction(() => t(e)) : Ke.resolve(e);
      }
      wrapFailure(t, e) {
        return t ? this.wrapUserFunction(() => t(e)) : Ke.reject(e);
      }
      static resolve(t) {
        return new Ke((e, n) => {
          e(t);
        });
      }
      static reject(t) {
        return new Ke((e, n) => {
          n(t);
        });
      }
      static waitFor(t) {
        return new Ke((e, n) => {
          let r = 0,
            s = 0,
            i = !1;
          t.forEach((t) => {
            ++r,
              t.next(
                () => {
                  ++s, i && s === r && e();
                },
                (t) => n(t),
              );
          }),
            (i = !0),
            s === r && e();
        });
      }
      static or(t) {
        let e = Ke.resolve(!1);
        for (const n of t) e = e.next((t) => (t ? Ke.resolve(t) : n()));
        return e;
      }
      static forEach(t, e) {
        const n = [];
        return (
          t.forEach((t, r) => {
            n.push(e.call(this, t, r));
          }),
          this.waitFor(n)
        );
      }
      static mapArray(t, e) {
        return new Ke((n, r) => {
          const s = t.length,
            i = new Array(s);
          let o = 0;
          for (let a = 0; a < s; a++) {
            const c = a;
            e(t[c]).next(
              (t) => {
                (i[c] = t), ++o, o === s && n(i);
              },
              (t) => r(t),
            );
          }
        });
      }
      static doWhile(t, e) {
        return new Ke((n, r) => {
          const s = () => {
            !0 === t()
              ? e().next(() => {
                  s();
                }, r)
              : n();
          };
          s();
        });
      }
    }
    function He(t) {
      return "IndexedDbTransactionError" === t.name;
    }
    class Ge {
      constructor(t, e) {
        (this.previousValue = t),
          e &&
            ((e.sequenceNumberHandler = (t) => this.oe(t)),
            (this._e = (t) => e.writeSequenceNumber(t)));
      }
      oe(t) {
        return (
          (this.previousValue = Math.max(t, this.previousValue)),
          this.previousValue
        );
      }
      next() {
        const t = ++this.previousValue;
        return this._e && this._e(t), t;
      }
    }
    Ge.ae = -1;
    function Qe(t) {
      return null == t;
    }
    function We(t) {
      return 0 === t && 1 / t == -1 / 0;
    }
    function Xe(t, e) {
      let n = e;
      const r = t.length;
      for (let e = 0; e < r; e++) {
        const r = t.charAt(e);
        switch (r) {
          case "\0":
            n += "";
            break;
          case "":
            n += "";
            break;
          default:
            n += r;
        }
      }
      return n;
    }
    function Ye(t) {
      return t + "";
    }
    const Je = "owner",
      Ze = "mutationQueues",
      tn = "mutations",
      en = "documentMutations",
      nn = "remoteDocumentGlobal",
      rn = "targets",
      sn = "targetDocuments",
      on = "targetGlobal",
      an = "collectionParents",
      cn = "clientMetadata",
      un = "bundles",
      hn = "namedQueries";
    function ln(t) {
      let e = 0;
      for (const n in t) Object.prototype.hasOwnProperty.call(t, n) && e++;
      return e;
    }
    function dn(t, e) {
      for (const n in t)
        Object.prototype.hasOwnProperty.call(t, n) && e(n, t[n]);
    }
    function fn(t) {
      for (const e in t)
        if (Object.prototype.hasOwnProperty.call(t, e)) return !1;
      return !0;
    }
    class gn {
      constructor(t, e) {
        (this.comparator = t), (this.root = e || mn.EMPTY);
      }
      insert(t, e) {
        return new gn(
          this.comparator,
          this.root
            .insert(t, e, this.comparator)
            .copy(null, null, mn.BLACK, null, null),
        );
      }
      remove(t) {
        return new gn(
          this.comparator,
          this.root
            .remove(t, this.comparator)
            .copy(null, null, mn.BLACK, null, null),
        );
      }
      get(t) {
        let e = this.root;
        for (; !e.isEmpty(); ) {
          const n = this.comparator(t, e.key);
          if (0 === n) return e.value;
          n < 0 ? (e = e.left) : n > 0 && (e = e.right);
        }
        return null;
      }
      indexOf(t) {
        let e = 0,
          n = this.root;
        for (; !n.isEmpty(); ) {
          const r = this.comparator(t, n.key);
          if (0 === r) return e + n.left.size;
          r < 0 ? (n = n.left) : ((e += n.left.size + 1), (n = n.right));
        }
        return -1;
      }
      isEmpty() {
        return this.root.isEmpty();
      }
      get size() {
        return this.root.size;
      }
      minKey() {
        return this.root.minKey();
      }
      maxKey() {
        return this.root.maxKey();
      }
      inorderTraversal(t) {
        return this.root.inorderTraversal(t);
      }
      forEach(t) {
        this.inorderTraversal((e, n) => (t(e, n), !1));
      }
      toString() {
        const t = [];
        return (
          this.inorderTraversal((e, n) => (t.push(`${e}:${n}`), !1)),
          `{${t.join(", ")}}`
        );
      }
      reverseTraversal(t) {
        return this.root.reverseTraversal(t);
      }
      getIterator() {
        return new pn(this.root, null, this.comparator, !1);
      }
      getIteratorFrom(t) {
        return new pn(this.root, t, this.comparator, !1);
      }
      getReverseIterator() {
        return new pn(this.root, null, this.comparator, !0);
      }
      getReverseIteratorFrom(t) {
        return new pn(this.root, t, this.comparator, !0);
      }
    }
    class pn {
      constructor(t, e, n, r) {
        (this.isReverse = r), (this.nodeStack = []);
        let s = 1;
        for (; !t.isEmpty(); )
          if (((s = e ? n(t.key, e) : 1), e && r && (s *= -1), s < 0))
            t = this.isReverse ? t.left : t.right;
          else {
            if (0 === s) {
              this.nodeStack.push(t);
              break;
            }
            this.nodeStack.push(t), (t = this.isReverse ? t.right : t.left);
          }
      }
      getNext() {
        let t = this.nodeStack.pop();
        const e = { key: t.key, value: t.value };
        if (this.isReverse)
          for (t = t.left; !t.isEmpty(); )
            this.nodeStack.push(t), (t = t.right);
        else
          for (t = t.right; !t.isEmpty(); )
            this.nodeStack.push(t), (t = t.left);
        return e;
      }
      hasNext() {
        return this.nodeStack.length > 0;
      }
      peek() {
        if (0 === this.nodeStack.length) return null;
        const t = this.nodeStack[this.nodeStack.length - 1];
        return { key: t.key, value: t.value };
      }
    }
    class mn {
      constructor(t, e, n, r, s) {
        (this.key = t),
          (this.value = e),
          (this.color = null != n ? n : mn.RED),
          (this.left = null != r ? r : mn.EMPTY),
          (this.right = null != s ? s : mn.EMPTY),
          (this.size = this.left.size + 1 + this.right.size);
      }
      copy(t, e, n, r, s) {
        return new mn(
          null != t ? t : this.key,
          null != e ? e : this.value,
          null != n ? n : this.color,
          null != r ? r : this.left,
          null != s ? s : this.right,
        );
      }
      isEmpty() {
        return !1;
      }
      inorderTraversal(t) {
        return (
          this.left.inorderTraversal(t) ||
          t(this.key, this.value) ||
          this.right.inorderTraversal(t)
        );
      }
      reverseTraversal(t) {
        return (
          this.right.reverseTraversal(t) ||
          t(this.key, this.value) ||
          this.left.reverseTraversal(t)
        );
      }
      min() {
        return this.left.isEmpty() ? this : this.left.min();
      }
      minKey() {
        return this.min().key;
      }
      maxKey() {
        return this.right.isEmpty() ? this.key : this.right.maxKey();
      }
      insert(t, e, n) {
        let r = this;
        const s = n(t, r.key);
        return (
          (r =
            s < 0
              ? r.copy(null, null, null, r.left.insert(t, e, n), null)
              : 0 === s
                ? r.copy(null, e, null, null, null)
                : r.copy(null, null, null, null, r.right.insert(t, e, n))),
          r.fixUp()
        );
      }
      removeMin() {
        if (this.left.isEmpty()) return mn.EMPTY;
        let t = this;
        return (
          t.left.isRed() || t.left.left.isRed() || (t = t.moveRedLeft()),
          (t = t.copy(null, null, null, t.left.removeMin(), null)),
          t.fixUp()
        );
      }
      remove(t, e) {
        let n,
          r = this;
        if (e(t, r.key) < 0)
          r.left.isEmpty() ||
            r.left.isRed() ||
            r.left.left.isRed() ||
            (r = r.moveRedLeft()),
            (r = r.copy(null, null, null, r.left.remove(t, e), null));
        else {
          if (
            (r.left.isRed() && (r = r.rotateRight()),
            r.right.isEmpty() ||
              r.right.isRed() ||
              r.right.left.isRed() ||
              (r = r.moveRedRight()),
            0 === e(t, r.key))
          ) {
            if (r.right.isEmpty()) return mn.EMPTY;
            (n = r.right.min()),
              (r = r.copy(n.key, n.value, null, null, r.right.removeMin()));
          }
          r = r.copy(null, null, null, null, r.right.remove(t, e));
        }
        return r.fixUp();
      }
      isRed() {
        return this.color;
      }
      fixUp() {
        let t = this;
        return (
          t.right.isRed() && !t.left.isRed() && (t = t.rotateLeft()),
          t.left.isRed() && t.left.left.isRed() && (t = t.rotateRight()),
          t.left.isRed() && t.right.isRed() && (t = t.colorFlip()),
          t
        );
      }
      moveRedLeft() {
        let t = this.colorFlip();
        return (
          t.right.left.isRed() &&
            ((t = t.copy(null, null, null, null, t.right.rotateRight())),
            (t = t.rotateLeft()),
            (t = t.colorFlip())),
          t
        );
      }
      moveRedRight() {
        let t = this.colorFlip();
        return (
          t.left.left.isRed() && ((t = t.rotateRight()), (t = t.colorFlip())), t
        );
      }
      rotateLeft() {
        const t = this.copy(null, null, mn.RED, null, this.right.left);
        return this.right.copy(null, null, this.color, t, null);
      }
      rotateRight() {
        const t = this.copy(null, null, mn.RED, this.left.right, null);
        return this.left.copy(null, null, this.color, null, t);
      }
      colorFlip() {
        const t = this.left.copy(null, null, !this.left.color, null, null),
          e = this.right.copy(null, null, !this.right.color, null, null);
        return this.copy(null, null, !this.color, t, e);
      }
      checkMaxDepth() {
        const t = this.check();
        return Math.pow(2, t) <= this.size + 1;
      }
      check() {
        if (this.isRed() && this.left.isRed()) throw ce();
        if (this.right.isRed()) throw ce();
        const t = this.left.check();
        if (t !== this.right.check()) throw ce();
        return t + (this.isRed() ? 0 : 1);
      }
    }
    (mn.EMPTY = null),
      (mn.RED = !0),
      (mn.BLACK = !1),
      (mn.EMPTY = new (class {
        constructor() {
          this.size = 0;
        }
        get key() {
          throw ce();
        }
        get value() {
          throw ce();
        }
        get color() {
          throw ce();
        }
        get left() {
          throw ce();
        }
        get right() {
          throw ce();
        }
        copy(t, e, n, r, s) {
          return this;
        }
        insert(t, e, n) {
          return new mn(t, e);
        }
        remove(t, e) {
          return this;
        }
        isEmpty() {
          return !0;
        }
        inorderTraversal(t) {
          return !1;
        }
        reverseTraversal(t) {
          return !1;
        }
        minKey() {
          return null;
        }
        maxKey() {
          return null;
        }
        isRed() {
          return !1;
        }
        checkMaxDepth() {
          return !0;
        }
        check() {
          return 0;
        }
      })());
    class yn {
      constructor(t) {
        (this.comparator = t), (this.data = new gn(this.comparator));
      }
      has(t) {
        return null !== this.data.get(t);
      }
      first() {
        return this.data.minKey();
      }
      last() {
        return this.data.maxKey();
      }
      get size() {
        return this.data.size;
      }
      indexOf(t) {
        return this.data.indexOf(t);
      }
      forEach(t) {
        this.data.inorderTraversal((e, n) => (t(e), !1));
      }
      forEachInRange(t, e) {
        const n = this.data.getIteratorFrom(t[0]);
        for (; n.hasNext(); ) {
          const r = n.getNext();
          if (this.comparator(r.key, t[1]) >= 0) return;
          e(r.key);
        }
      }
      forEachWhile(t, e) {
        let n;
        for (
          n =
            void 0 !== e
              ? this.data.getIteratorFrom(e)
              : this.data.getIterator();
          n.hasNext();

        )
          if (!t(n.getNext().key)) return;
      }
      firstAfterOrEqual(t) {
        const e = this.data.getIteratorFrom(t);
        return e.hasNext() ? e.getNext().key : null;
      }
      getIterator() {
        return new vn(this.data.getIterator());
      }
      getIteratorFrom(t) {
        return new vn(this.data.getIteratorFrom(t));
      }
      add(t) {
        return this.copy(this.data.remove(t).insert(t, !0));
      }
      delete(t) {
        return this.has(t) ? this.copy(this.data.remove(t)) : this;
      }
      isEmpty() {
        return this.data.isEmpty();
      }
      unionWith(t) {
        let e = this;
        return (
          e.size < t.size && ((e = t), (t = this)),
          t.forEach((t) => {
            e = e.add(t);
          }),
          e
        );
      }
      isEqual(t) {
        if (!(t instanceof yn)) return !1;
        if (this.size !== t.size) return !1;
        const e = this.data.getIterator(),
          n = t.data.getIterator();
        for (; e.hasNext(); ) {
          const t = e.getNext().key,
            r = n.getNext().key;
          if (0 !== this.comparator(t, r)) return !1;
        }
        return !0;
      }
      toArray() {
        const t = [];
        return (
          this.forEach((e) => {
            t.push(e);
          }),
          t
        );
      }
      toString() {
        const t = [];
        return (
          this.forEach((e) => t.push(e)), "SortedSet(" + t.toString() + ")"
        );
      }
      copy(t) {
        const e = new yn(this.comparator);
        return (e.data = t), e;
      }
    }
    class vn {
      constructor(t) {
        this.iter = t;
      }
      getNext() {
        return this.iter.getNext().key;
      }
      hasNext() {
        return this.iter.hasNext();
      }
    }
    class wn {
      constructor(t) {
        (this.fields = t), t.sort(Fe.comparator);
      }
      static empty() {
        return new wn([]);
      }
      unionWith(t) {
        let e = new yn(Fe.comparator);
        for (const t of this.fields) e = e.add(t);
        for (const n of t) e = e.add(n);
        return new wn(e.toArray());
      }
      covers(t) {
        for (const e of this.fields) if (e.isPrefixOf(t)) return !0;
        return !1;
      }
      isEqual(t) {
        return ke(this.fields, t.fields, (t, e) => t.isEqual(e));
      }
    }
    class bn extends Error {
      constructor() {
        super(...arguments), (this.name = "Base64DecodeError");
      }
    }
    class En {
      constructor(t) {
        this.binaryString = t;
      }
      static fromBase64String(t) {
        const e = (function (t) {
          try {
            return atob(t);
          } catch (t) {
            throw "undefined" != typeof DOMException &&
              t instanceof DOMException
              ? new bn("Invalid base64 string: " + t)
              : t;
          }
        })(t);
        return new En(e);
      }
      static fromUint8Array(t) {
        const e = (function (t) {
          let e = "";
          for (let n = 0; n < t.length; ++n) e += String.fromCharCode(t[n]);
          return e;
        })(t);
        return new En(e);
      }
      [Symbol.iterator]() {
        let t = 0;
        return {
          next: () =>
            t < this.binaryString.length
              ? { value: this.binaryString.charCodeAt(t++), done: !1 }
              : { value: void 0, done: !0 },
        };
      }
      toBase64() {
        return (t = this.binaryString), btoa(t);
        var t;
      }
      toUint8Array() {
        return (function (t) {
          const e = new Uint8Array(t.length);
          for (let n = 0; n < t.length; n++) e[n] = t.charCodeAt(n);
          return e;
        })(this.binaryString);
      }
      approximateByteSize() {
        return 2 * this.binaryString.length;
      }
      compareTo(t) {
        return Ce(this.binaryString, t.binaryString);
      }
      isEqual(t) {
        return this.binaryString === t.binaryString;
      }
    }
    En.EMPTY_BYTE_STRING = new En("");
    const _n = new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);
    function Tn(t) {
      if ((ue(!!t), "string" == typeof t)) {
        let e = 0;
        const n = _n.exec(t);
        if ((ue(!!n), n[1])) {
          let t = n[1];
          (t = (t + "000000000").substr(0, 9)), (e = Number(t));
        }
        const r = new Date(t);
        return { seconds: Math.floor(r.getTime() / 1e3), nanos: e };
      }
      return { seconds: Sn(t.seconds), nanos: Sn(t.nanos) };
    }
    function Sn(t) {
      return "number" == typeof t ? t : "string" == typeof t ? Number(t) : 0;
    }
    function Cn(t) {
      return "string" == typeof t
        ? En.fromBase64String(t)
        : En.fromUint8Array(t);
    }
    const In = "server_timestamp",
      An = "__type__",
      Dn = "__previous_value__",
      kn = "__local_write_time__";
    function Nn(t) {
      var e, n;
      return (
        (null ===
          (n = ((null === (e = null == t ? void 0 : t.mapValue) || void 0 === e
            ? void 0
            : e.fields) || {})[An]) || void 0 === n
          ? void 0
          : n.stringValue) === In
      );
    }
    function xn(t) {
      const e = t.mapValue.fields[Dn];
      return Nn(e) ? xn(e) : e;
    }
    function Rn(t) {
      const e = Tn(t.mapValue.fields[kn].timestampValue);
      return new Re(e.seconds, e.nanos);
    }
    class Ln {
      constructor(t, e, n, r, s, i, o, a, c) {
        (this.databaseId = t),
          (this.appId = e),
          (this.persistenceKey = n),
          (this.host = r),
          (this.ssl = s),
          (this.forceLongPolling = i),
          (this.autoDetectLongPolling = o),
          (this.longPollingOptions = a),
          (this.useFetchStreams = c);
      }
    }
    const On = "(default)";
    class Mn {
      constructor(t, e) {
        (this.projectId = t), (this.database = e || On);
      }
      static empty() {
        return new Mn("", "");
      }
      get isDefaultDatabase() {
        return this.database === On;
      }
      isEqual(t) {
        return (
          t instanceof Mn &&
          t.projectId === this.projectId &&
          t.database === this.database
        );
      }
    }
    const Pn = "__type__",
      Vn = "__max__",
      Fn = { fields: { __type__: { stringValue: Vn } } },
      Un = "__vector__",
      Bn = "value";
    function jn(t) {
      return "nullValue" in t
        ? 0
        : "booleanValue" in t
          ? 1
          : "integerValue" in t || "doubleValue" in t
            ? 2
            : "timestampValue" in t
              ? 3
              : "stringValue" in t
                ? 5
                : "bytesValue" in t
                  ? 6
                  : "referenceValue" in t
                    ? 7
                    : "geoPointValue" in t
                      ? 8
                      : "arrayValue" in t
                        ? 9
                        : "mapValue" in t
                          ? Nn(t)
                            ? 4
                            : rr(t)
                              ? 9007199254740991
                              : er(t)
                                ? 10
                                : 11
                          : ce();
    }
    function qn(t, e) {
      if (t === e) return !0;
      const n = jn(t);
      if (n !== jn(e)) return !1;
      switch (n) {
        case 0:
        case 9007199254740991:
          return !0;
        case 1:
          return t.booleanValue === e.booleanValue;
        case 4:
          return Rn(t).isEqual(Rn(e));
        case 3:
          return (function (t, e) {
            if (
              "string" == typeof t.timestampValue &&
              "string" == typeof e.timestampValue &&
              t.timestampValue.length === e.timestampValue.length
            )
              return t.timestampValue === e.timestampValue;
            const n = Tn(t.timestampValue),
              r = Tn(e.timestampValue);
            return n.seconds === r.seconds && n.nanos === r.nanos;
          })(t, e);
        case 5:
          return t.stringValue === e.stringValue;
        case 6:
          return (function (t, e) {
            return Cn(t.bytesValue).isEqual(Cn(e.bytesValue));
          })(t, e);
        case 7:
          return t.referenceValue === e.referenceValue;
        case 8:
          return (function (t, e) {
            return (
              Sn(t.geoPointValue.latitude) === Sn(e.geoPointValue.latitude) &&
              Sn(t.geoPointValue.longitude) === Sn(e.geoPointValue.longitude)
            );
          })(t, e);
        case 2:
          return (function (t, e) {
            if ("integerValue" in t && "integerValue" in e)
              return Sn(t.integerValue) === Sn(e.integerValue);
            if ("doubleValue" in t && "doubleValue" in e) {
              const n = Sn(t.doubleValue),
                r = Sn(e.doubleValue);
              return n === r ? We(n) === We(r) : isNaN(n) && isNaN(r);
            }
            return !1;
          })(t, e);
        case 9:
          return ke(t.arrayValue.values || [], e.arrayValue.values || [], qn);
        case 10:
        case 11:
          return (function (t, e) {
            const n = t.mapValue.fields || {},
              r = e.mapValue.fields || {};
            if (ln(n) !== ln(r)) return !1;
            for (const t in n)
              if (n.hasOwnProperty(t) && (void 0 === r[t] || !qn(n[t], r[t])))
                return !1;
            return !0;
          })(t, e);
        default:
          return ce();
      }
    }
    function $n(t, e) {
      return void 0 !== (t.values || []).find((t) => qn(t, e));
    }
    function zn(t, e) {
      if (t === e) return 0;
      const n = jn(t),
        r = jn(e);
      if (n !== r) return Ce(n, r);
      switch (n) {
        case 0:
        case 9007199254740991:
          return 0;
        case 1:
          return Ce(t.booleanValue, e.booleanValue);
        case 2:
          return (function (t, e) {
            const n = Sn(t.integerValue || t.doubleValue),
              r = Sn(e.integerValue || e.doubleValue);
            return n < r
              ? -1
              : n > r
                ? 1
                : n === r
                  ? 0
                  : isNaN(n)
                    ? isNaN(r)
                      ? 0
                      : -1
                    : 1;
          })(t, e);
        case 3:
          return Kn(t.timestampValue, e.timestampValue);
        case 4:
          return Kn(Rn(t), Rn(e));
        case 5:
          return Ie(t.stringValue, e.stringValue);
        case 6:
          return (function (t, e) {
            const n = Cn(t),
              r = Cn(e);
            return n.compareTo(r);
          })(t.bytesValue, e.bytesValue);
        case 7:
          return (function (t, e) {
            const n = t.split("/"),
              r = e.split("/");
            for (let t = 0; t < n.length && t < r.length; t++) {
              const e = Ce(n[t], r[t]);
              if (0 !== e) return e;
            }
            return Ce(n.length, r.length);
          })(t.referenceValue, e.referenceValue);
        case 8:
          return (function (t, e) {
            const n = Ce(Sn(t.latitude), Sn(e.latitude));
            return 0 !== n ? n : Ce(Sn(t.longitude), Sn(e.longitude));
          })(t.geoPointValue, e.geoPointValue);
        case 9:
          return Hn(t.arrayValue, e.arrayValue);
        case 10:
          return (function (t, e) {
            var n, r, s, i;
            const o = t.fields || {},
              a = e.fields || {},
              c = null === (n = o[Bn]) || void 0 === n ? void 0 : n.arrayValue,
              u = null === (r = a[Bn]) || void 0 === r ? void 0 : r.arrayValue,
              h = Ce(
                (null === (s = null == c ? void 0 : c.values) || void 0 === s
                  ? void 0
                  : s.length) || 0,
                (null === (i = null == u ? void 0 : u.values) || void 0 === i
                  ? void 0
                  : i.length) || 0,
              );
            return 0 !== h ? h : Hn(c, u);
          })(t.mapValue, e.mapValue);
        case 11:
          return (function (t, e) {
            if (t === Fn && e === Fn) return 0;
            if (t === Fn) return 1;
            if (e === Fn) return -1;
            const n = t.fields || {},
              r = Object.keys(n),
              s = e.fields || {},
              i = Object.keys(s);
            r.sort(), i.sort();
            for (let t = 0; t < r.length && t < i.length; ++t) {
              const e = Ie(r[t], i[t]);
              if (0 !== e) return e;
              const o = zn(n[r[t]], s[i[t]]);
              if (0 !== o) return o;
            }
            return Ce(r.length, i.length);
          })(t.mapValue, e.mapValue);
        default:
          throw ce();
      }
    }
    function Kn(t, e) {
      if ("string" == typeof t && "string" == typeof e && t.length === e.length)
        return Ce(t, e);
      const n = Tn(t),
        r = Tn(e),
        s = Ce(n.seconds, r.seconds);
      return 0 !== s ? s : Ce(n.nanos, r.nanos);
    }
    function Hn(t, e) {
      const n = t.values || [],
        r = e.values || [];
      for (let t = 0; t < n.length && t < r.length; ++t) {
        const e = zn(n[t], r[t]);
        if (e) return e;
      }
      return Ce(n.length, r.length);
    }
    function Gn(t) {
      return Qn(t);
    }
    function Qn(t) {
      return "nullValue" in t
        ? "null"
        : "booleanValue" in t
          ? "" + t.booleanValue
          : "integerValue" in t
            ? "" + t.integerValue
            : "doubleValue" in t
              ? "" + t.doubleValue
              : "timestampValue" in t
                ? (function (t) {
                    const e = Tn(t);
                    return `time(${e.seconds},${e.nanos})`;
                  })(t.timestampValue)
                : "stringValue" in t
                  ? t.stringValue
                  : "bytesValue" in t
                    ? (function (t) {
                        return Cn(t).toBase64();
                      })(t.bytesValue)
                    : "referenceValue" in t
                      ? (function (t) {
                          return Ue.fromName(t).toString();
                        })(t.referenceValue)
                      : "geoPointValue" in t
                        ? (function (t) {
                            return `geo(${t.latitude},${t.longitude})`;
                          })(t.geoPointValue)
                        : "arrayValue" in t
                          ? (function (t) {
                              let e = "[",
                                n = !0;
                              for (const r of t.values || [])
                                n ? (n = !1) : (e += ","), (e += Qn(r));
                              return e + "]";
                            })(t.arrayValue)
                          : "mapValue" in t
                            ? (function (t) {
                                const e = Object.keys(t.fields || {}).sort();
                                let n = "{",
                                  r = !0;
                                for (const s of e)
                                  r ? (r = !1) : (n += ","),
                                    (n += `${s}:${Qn(t.fields[s])}`);
                                return n + "}";
                              })(t.mapValue)
                            : ce();
    }
    function Wn(t) {
      switch (jn(t)) {
        case 0:
        case 1:
          return 4;
        case 2:
          return 8;
        case 3:
        case 8:
          return 16;
        case 4:
          const e = xn(t);
          return e ? 16 + Wn(e) : 16;
        case 5:
          return 2 * t.stringValue.length;
        case 6:
          return Cn(t.bytesValue).approximateByteSize();
        case 7:
          return t.referenceValue.length;
        case 9:
          return (function (t) {
            return (t.values || []).reduce((t, e) => t + Wn(e), 0);
          })(t.arrayValue);
        case 10:
        case 11:
          return (function (t) {
            let e = 0;
            return (
              dn(t.fields, (t, n) => {
                e += t.length + Wn(n);
              }),
              e
            );
          })(t.mapValue);
        default:
          throw ce();
      }
    }
    function Xn(t) {
      return !!t && "integerValue" in t;
    }
    function Yn(t) {
      return !!t && "arrayValue" in t;
    }
    function Jn(t) {
      return !!t && "nullValue" in t;
    }
    function Zn(t) {
      return !!t && "doubleValue" in t && isNaN(Number(t.doubleValue));
    }
    function tr(t) {
      return !!t && "mapValue" in t;
    }
    function er(t) {
      var e, n;
      return (
        (null ===
          (n = ((null === (e = null == t ? void 0 : t.mapValue) || void 0 === e
            ? void 0
            : e.fields) || {})[Pn]) || void 0 === n
          ? void 0
          : n.stringValue) === Un
      );
    }
    function nr(t) {
      if (t.geoPointValue)
        return { geoPointValue: Object.assign({}, t.geoPointValue) };
      if (t.timestampValue && "object" == typeof t.timestampValue)
        return { timestampValue: Object.assign({}, t.timestampValue) };
      if (t.mapValue) {
        const e = { mapValue: { fields: {} } };
        return (
          dn(t.mapValue.fields, (t, n) => (e.mapValue.fields[t] = nr(n))), e
        );
      }
      if (t.arrayValue) {
        const e = { arrayValue: { values: [] } };
        for (let n = 0; n < (t.arrayValue.values || []).length; ++n)
          e.arrayValue.values[n] = nr(t.arrayValue.values[n]);
        return e;
      }
      return Object.assign({}, t);
    }
    function rr(t) {
      return (
        (((t.mapValue || {}).fields || {}).__type__ || {}).stringValue === Vn
      );
    }
    class sr {
      constructor(t) {
        this.value = t;
      }
      static empty() {
        return new sr({ mapValue: {} });
      }
      field(t) {
        if (t.isEmpty()) return this.value;
        {
          let e = this.value;
          for (let n = 0; n < t.length - 1; ++n)
            if (((e = (e.mapValue.fields || {})[t.get(n)]), !tr(e)))
              return null;
          return (e = (e.mapValue.fields || {})[t.lastSegment()]), e || null;
        }
      }
      set(t, e) {
        this.getFieldsMap(t.popLast())[t.lastSegment()] = nr(e);
      }
      setAll(t) {
        let e = Fe.emptyPath(),
          n = {},
          r = [];
        t.forEach((t, s) => {
          if (!e.isImmediateParentOf(s)) {
            const t = this.getFieldsMap(e);
            this.applyChanges(t, n, r), (n = {}), (r = []), (e = s.popLast());
          }
          t ? (n[s.lastSegment()] = nr(t)) : r.push(s.lastSegment());
        });
        const s = this.getFieldsMap(e);
        this.applyChanges(s, n, r);
      }
      delete(t) {
        const e = this.field(t.popLast());
        tr(e) && e.mapValue.fields && delete e.mapValue.fields[t.lastSegment()];
      }
      isEqual(t) {
        return qn(this.value, t.value);
      }
      getFieldsMap(t) {
        let e = this.value;
        e.mapValue.fields || (e.mapValue = { fields: {} });
        for (let n = 0; n < t.length; ++n) {
          let r = e.mapValue.fields[t.get(n)];
          (tr(r) && r.mapValue.fields) ||
            ((r = { mapValue: { fields: {} } }),
            (e.mapValue.fields[t.get(n)] = r)),
            (e = r);
        }
        return e.mapValue.fields;
      }
      applyChanges(t, e, n) {
        dn(e, (e, n) => (t[e] = n));
        for (const e of n) delete t[e];
      }
      clone() {
        return new sr(nr(this.value));
      }
    }
    function ir(t) {
      const e = [];
      return (
        dn(t.fields, (t, n) => {
          const r = new Fe([t]);
          if (tr(n)) {
            const t = ir(n.mapValue).fields;
            if (0 === t.length) e.push(r);
            else for (const n of t) e.push(r.child(n));
          } else e.push(r);
        }),
        new wn(e)
      );
    }
    class or {
      constructor(t, e, n, r, s, i, o) {
        (this.key = t),
          (this.documentType = e),
          (this.version = n),
          (this.readTime = r),
          (this.createTime = s),
          (this.data = i),
          (this.documentState = o);
      }
      static newInvalidDocument(t) {
        return new or(t, 0, Le.min(), Le.min(), Le.min(), sr.empty(), 0);
      }
      static newFoundDocument(t, e, n, r) {
        return new or(t, 1, e, Le.min(), n, r, 0);
      }
      static newNoDocument(t, e) {
        return new or(t, 2, e, Le.min(), Le.min(), sr.empty(), 0);
      }
      static newUnknownDocument(t, e) {
        return new or(t, 3, e, Le.min(), Le.min(), sr.empty(), 2);
      }
      convertToFoundDocument(t, e) {
        return (
          !this.createTime.isEqual(Le.min()) ||
            (2 !== this.documentType && 0 !== this.documentType) ||
            (this.createTime = t),
          (this.version = t),
          (this.documentType = 1),
          (this.data = e),
          (this.documentState = 0),
          this
        );
      }
      convertToNoDocument(t) {
        return (
          (this.version = t),
          (this.documentType = 2),
          (this.data = sr.empty()),
          (this.documentState = 0),
          this
        );
      }
      convertToUnknownDocument(t) {
        return (
          (this.version = t),
          (this.documentType = 3),
          (this.data = sr.empty()),
          (this.documentState = 2),
          this
        );
      }
      setHasCommittedMutations() {
        return (this.documentState = 2), this;
      }
      setHasLocalMutations() {
        return (this.documentState = 1), (this.version = Le.min()), this;
      }
      setReadTime(t) {
        return (this.readTime = t), this;
      }
      get hasLocalMutations() {
        return 1 === this.documentState;
      }
      get hasCommittedMutations() {
        return 2 === this.documentState;
      }
      get hasPendingWrites() {
        return this.hasLocalMutations || this.hasCommittedMutations;
      }
      isValidDocument() {
        return 0 !== this.documentType;
      }
      isFoundDocument() {
        return 1 === this.documentType;
      }
      isNoDocument() {
        return 2 === this.documentType;
      }
      isUnknownDocument() {
        return 3 === this.documentType;
      }
      isEqual(t) {
        return (
          t instanceof or &&
          this.key.isEqual(t.key) &&
          this.version.isEqual(t.version) &&
          this.documentType === t.documentType &&
          this.documentState === t.documentState &&
          this.data.isEqual(t.data)
        );
      }
      mutableCopy() {
        return new or(
          this.key,
          this.documentType,
          this.version,
          this.readTime,
          this.createTime,
          this.data.clone(),
          this.documentState,
        );
      }
      toString() {
        return `Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`;
      }
    }
    class ar {
      constructor(t, e) {
        (this.position = t), (this.inclusive = e);
      }
    }
    function cr(t, e, n) {
      let r = 0;
      for (let s = 0; s < t.position.length; s++) {
        const i = e[s],
          o = t.position[s];
        if (
          ((r = i.field.isKeyField()
            ? Ue.comparator(Ue.fromName(o.referenceValue), n.key)
            : zn(o, n.data.field(i.field))),
          "desc" === i.dir && (r *= -1),
          0 !== r)
        )
          break;
      }
      return r;
    }
    function ur(t, e) {
      if (null === t) return null === e;
      if (null === e) return !1;
      if (
        t.inclusive !== e.inclusive ||
        t.position.length !== e.position.length
      )
        return !1;
      for (let n = 0; n < t.position.length; n++)
        if (!qn(t.position[n], e.position[n])) return !1;
      return !0;
    }
    class hr {
      constructor(t, e = "asc") {
        (this.field = t), (this.dir = e);
      }
    }
    function lr(t, e) {
      return t.dir === e.dir && t.field.isEqual(e.field);
    }
    class dr {}
    class fr extends dr {
      constructor(t, e, n) {
        super(), (this.field = t), (this.op = e), (this.value = n);
      }
      static create(t, e, n) {
        return t.isKeyField()
          ? "in" === e || "not-in" === e
            ? this.createKeyFieldInFilter(t, e, n)
            : new br(t, e, n)
          : "array-contains" === e
            ? new Sr(t, n)
            : "in" === e
              ? new Cr(t, n)
              : "not-in" === e
                ? new Ir(t, n)
                : "array-contains-any" === e
                  ? new Ar(t, n)
                  : new fr(t, e, n);
      }
      static createKeyFieldInFilter(t, e, n) {
        return "in" === e ? new Er(t, n) : new _r(t, n);
      }
      matches(t) {
        const e = t.data.field(this.field);
        return "!=" === this.op
          ? null !== e && this.matchesComparison(zn(e, this.value))
          : null !== e &&
              jn(this.value) === jn(e) &&
              this.matchesComparison(zn(e, this.value));
      }
      matchesComparison(t) {
        switch (this.op) {
          case "<":
            return t < 0;
          case "<=":
            return t <= 0;
          case "==":
            return 0 === t;
          case "!=":
            return 0 !== t;
          case ">":
            return t > 0;
          case ">=":
            return t >= 0;
          default:
            return ce();
        }
      }
      isInequality() {
        return ["<", "<=", ">", ">=", "!=", "not-in"].indexOf(this.op) >= 0;
      }
      getFlattenedFilters() {
        return [this];
      }
      getFilters() {
        return [this];
      }
    }
    class gr extends dr {
      constructor(t, e) {
        super(), (this.filters = t), (this.op = e), (this.ce = null);
      }
      static create(t, e) {
        return new gr(t, e);
      }
      matches(t) {
        return pr(this)
          ? void 0 === this.filters.find((e) => !e.matches(t))
          : void 0 !== this.filters.find((e) => e.matches(t));
      }
      getFlattenedFilters() {
        return (
          null !== this.ce ||
            (this.ce = this.filters.reduce(
              (t, e) => t.concat(e.getFlattenedFilters()),
              [],
            )),
          this.ce
        );
      }
      getFilters() {
        return Object.assign([], this.filters);
      }
    }
    function pr(t) {
      return "and" === t.op;
    }
    function mr(t) {
      return (
        (function (t) {
          for (const e of t.filters) if (e instanceof gr) return !1;
          return !0;
        })(t) && pr(t)
      );
    }
    function yr(t) {
      if (t instanceof fr)
        return t.field.canonicalString() + t.op.toString() + Gn(t.value);
      if (mr(t)) return t.filters.map((t) => yr(t)).join(",");
      {
        const e = t.filters.map((t) => yr(t)).join(",");
        return `${t.op}(${e})`;
      }
    }
    function vr(t, e) {
      return t instanceof fr
        ? (function (t, e) {
            return (
              e instanceof fr &&
              t.op === e.op &&
              t.field.isEqual(e.field) &&
              qn(t.value, e.value)
            );
          })(t, e)
        : t instanceof gr
          ? (function (t, e) {
              return (
                e instanceof gr &&
                t.op === e.op &&
                t.filters.length === e.filters.length &&
                t.filters.reduce((t, n, r) => t && vr(n, e.filters[r]), !0)
              );
            })(t, e)
          : void ce();
    }
    function wr(t) {
      return t instanceof fr
        ? (function (t) {
            return `${t.field.canonicalString()} ${t.op} ${Gn(t.value)}`;
          })(t)
        : t instanceof gr
          ? (function (t) {
              return (
                t.op.toString() + " {" + t.getFilters().map(wr).join(" ,") + "}"
              );
            })(t)
          : "Filter";
    }
    class br extends fr {
      constructor(t, e, n) {
        super(t, e, n), (this.key = Ue.fromName(n.referenceValue));
      }
      matches(t) {
        const e = Ue.comparator(t.key, this.key);
        return this.matchesComparison(e);
      }
    }
    class Er extends fr {
      constructor(t, e) {
        super(t, "in", e), (this.keys = Tr(0, e));
      }
      matches(t) {
        return this.keys.some((e) => e.isEqual(t.key));
      }
    }
    class _r extends fr {
      constructor(t, e) {
        super(t, "not-in", e), (this.keys = Tr(0, e));
      }
      matches(t) {
        return !this.keys.some((e) => e.isEqual(t.key));
      }
    }
    function Tr(t, e) {
      var n;
      return (
        (null === (n = e.arrayValue) || void 0 === n ? void 0 : n.values) || []
      ).map((t) => Ue.fromName(t.referenceValue));
    }
    class Sr extends fr {
      constructor(t, e) {
        super(t, "array-contains", e);
      }
      matches(t) {
        const e = t.data.field(this.field);
        return Yn(e) && $n(e.arrayValue, this.value);
      }
    }
    class Cr extends fr {
      constructor(t, e) {
        super(t, "in", e);
      }
      matches(t) {
        const e = t.data.field(this.field);
        return null !== e && $n(this.value.arrayValue, e);
      }
    }
    class Ir extends fr {
      constructor(t, e) {
        super(t, "not-in", e);
      }
      matches(t) {
        if ($n(this.value.arrayValue, { nullValue: "NULL_VALUE" })) return !1;
        const e = t.data.field(this.field);
        return null !== e && !$n(this.value.arrayValue, e);
      }
    }
    class Ar extends fr {
      constructor(t, e) {
        super(t, "array-contains-any", e);
      }
      matches(t) {
        const e = t.data.field(this.field);
        return (
          !(!Yn(e) || !e.arrayValue.values) &&
          e.arrayValue.values.some((t) => $n(this.value.arrayValue, t))
        );
      }
    }
    class Dr {
      constructor(t, e = null, n = [], r = [], s = null, i = null, o = null) {
        (this.path = t),
          (this.collectionGroup = e),
          (this.orderBy = n),
          (this.filters = r),
          (this.limit = s),
          (this.startAt = i),
          (this.endAt = o),
          (this.le = null);
      }
    }
    function kr(t, e = null, n = [], r = [], s = null, i = null, o = null) {
      return new Dr(t, e, n, r, s, i, o);
    }
    function Nr(t) {
      const e = he(t);
      if (null === e.le) {
        let t = e.path.canonicalString();
        null !== e.collectionGroup && (t += "|cg:" + e.collectionGroup),
          (t += "|f:"),
          (t += e.filters.map((t) => yr(t)).join(",")),
          (t += "|ob:"),
          (t += e.orderBy
            .map((t) =>
              (function (t) {
                return t.field.canonicalString() + t.dir;
              })(t),
            )
            .join(",")),
          Qe(e.limit) || ((t += "|l:"), (t += e.limit)),
          e.startAt &&
            ((t += "|lb:"),
            (t += e.startAt.inclusive ? "b:" : "a:"),
            (t += e.startAt.position.map((t) => Gn(t)).join(","))),
          e.endAt &&
            ((t += "|ub:"),
            (t += e.endAt.inclusive ? "a:" : "b:"),
            (t += e.endAt.position.map((t) => Gn(t)).join(","))),
          (e.le = t);
      }
      return e.le;
    }
    function xr(t, e) {
      if (t.limit !== e.limit) return !1;
      if (t.orderBy.length !== e.orderBy.length) return !1;
      for (let n = 0; n < t.orderBy.length; n++)
        if (!lr(t.orderBy[n], e.orderBy[n])) return !1;
      if (t.filters.length !== e.filters.length) return !1;
      for (let n = 0; n < t.filters.length; n++)
        if (!vr(t.filters[n], e.filters[n])) return !1;
      return (
        t.collectionGroup === e.collectionGroup &&
        !!t.path.isEqual(e.path) &&
        !!ur(t.startAt, e.startAt) &&
        ur(t.endAt, e.endAt)
      );
    }
    function Rr(t) {
      return (
        Ue.isDocumentKey(t.path) &&
        null === t.collectionGroup &&
        0 === t.filters.length
      );
    }
    class Lr {
      constructor(
        t,
        e = null,
        n = [],
        r = [],
        s = null,
        i = "F",
        o = null,
        a = null,
      ) {
        (this.path = t),
          (this.collectionGroup = e),
          (this.explicitOrderBy = n),
          (this.filters = r),
          (this.limit = s),
          (this.limitType = i),
          (this.startAt = o),
          (this.endAt = a),
          (this.he = null),
          (this.Pe = null),
          (this.Te = null),
          this.startAt,
          this.endAt;
      }
    }
    function Or(t) {
      return new Lr(t);
    }
    function Mr(t) {
      return (
        0 === t.filters.length &&
        null === t.limit &&
        null == t.startAt &&
        null == t.endAt &&
        (0 === t.explicitOrderBy.length ||
          (1 === t.explicitOrderBy.length &&
            t.explicitOrderBy[0].field.isKeyField()))
      );
    }
    function Pr(t) {
      const e = he(t);
      if (null === e.he) {
        e.he = [];
        const t = new Set();
        for (const n of e.explicitOrderBy)
          e.he.push(n), t.add(n.field.canonicalString());
        const n =
            e.explicitOrderBy.length > 0
              ? e.explicitOrderBy[e.explicitOrderBy.length - 1].dir
              : "asc",
          r = (function (t) {
            let e = new yn(Fe.comparator);
            return (
              t.filters.forEach((t) => {
                t.getFlattenedFilters().forEach((t) => {
                  t.isInequality() && (e = e.add(t.field));
                });
              }),
              e
            );
          })(e);
        r.forEach((r) => {
          t.has(r.canonicalString()) ||
            r.isKeyField() ||
            e.he.push(new hr(r, n));
        }),
          t.has(Fe.keyField().canonicalString()) ||
            e.he.push(new hr(Fe.keyField(), n));
      }
      return e.he;
    }
    function Vr(t) {
      const e = he(t);
      return (
        e.Pe ||
          (e.Pe = (function (t, e) {
            if ("F" === t.limitType)
              return kr(
                t.path,
                t.collectionGroup,
                e,
                t.filters,
                t.limit,
                t.startAt,
                t.endAt,
              );
            {
              e = e.map((t) => {
                const e = "desc" === t.dir ? "asc" : "desc";
                return new hr(t.field, e);
              });
              const n = t.endAt
                  ? new ar(t.endAt.position, t.endAt.inclusive)
                  : null,
                r = t.startAt
                  ? new ar(t.startAt.position, t.startAt.inclusive)
                  : null;
              return kr(t.path, t.collectionGroup, e, t.filters, t.limit, n, r);
            }
          })(e, Pr(t))),
        e.Pe
      );
    }
    function Fr(t, e, n) {
      return new Lr(
        t.path,
        t.collectionGroup,
        t.explicitOrderBy.slice(),
        t.filters.slice(),
        e,
        n,
        t.startAt,
        t.endAt,
      );
    }
    function Ur(t, e) {
      return xr(Vr(t), Vr(e)) && t.limitType === e.limitType;
    }
    function Br(t) {
      return `${Nr(Vr(t))}|lt:${t.limitType}`;
    }
    function jr(t) {
      return `Query(target=${(function (t) {
        let e = t.path.canonicalString();
        return (
          null !== t.collectionGroup &&
            (e += " collectionGroup=" + t.collectionGroup),
          t.filters.length > 0 &&
            (e += `, filters: [${t.filters.map((t) => wr(t)).join(", ")}]`),
          Qe(t.limit) || (e += ", limit: " + t.limit),
          t.orderBy.length > 0 &&
            (e += `, orderBy: [${t.orderBy
              .map((t) =>
                (function (t) {
                  return `${t.field.canonicalString()} (${t.dir})`;
                })(t),
              )
              .join(", ")}]`),
          t.startAt &&
            ((e += ", startAt: "),
            (e += t.startAt.inclusive ? "b:" : "a:"),
            (e += t.startAt.position.map((t) => Gn(t)).join(","))),
          t.endAt &&
            ((e += ", endAt: "),
            (e += t.endAt.inclusive ? "a:" : "b:"),
            (e += t.endAt.position.map((t) => Gn(t)).join(","))),
          `Target(${e})`
        );
      })(Vr(t))}; limitType=${t.limitType})`;
    }
    function qr(t, e) {
      return (
        e.isFoundDocument() &&
        (function (t, e) {
          const n = e.key.path;
          return null !== t.collectionGroup
            ? e.key.hasCollectionId(t.collectionGroup) && t.path.isPrefixOf(n)
            : Ue.isDocumentKey(t.path)
              ? t.path.isEqual(n)
              : t.path.isImmediateParentOf(n);
        })(t, e) &&
        (function (t, e) {
          for (const n of Pr(t))
            if (!n.field.isKeyField() && null === e.data.field(n.field))
              return !1;
          return !0;
        })(t, e) &&
        (function (t, e) {
          for (const n of t.filters) if (!n.matches(e)) return !1;
          return !0;
        })(t, e) &&
        (function (t, e) {
          return !(
            (t.startAt &&
              !(function (t, e, n) {
                const r = cr(t, e, n);
                return t.inclusive ? r <= 0 : r < 0;
              })(t.startAt, Pr(t), e)) ||
            (t.endAt &&
              !(function (t, e, n) {
                const r = cr(t, e, n);
                return t.inclusive ? r >= 0 : r > 0;
              })(t.endAt, Pr(t), e))
          );
        })(t, e)
      );
    }
    function $r(t) {
      return (e, n) => {
        let r = !1;
        for (const s of Pr(t)) {
          const t = zr(s, e, n);
          if (0 !== t) return t;
          r = r || s.field.isKeyField();
        }
        return 0;
      };
    }
    function zr(t, e, n) {
      const r = t.field.isKeyField()
        ? Ue.comparator(e.key, n.key)
        : (function (t, e, n) {
            const r = e.data.field(t),
              s = n.data.field(t);
            return null !== r && null !== s ? zn(r, s) : ce();
          })(t.field, e, n);
      switch (t.dir) {
        case "asc":
          return r;
        case "desc":
          return -1 * r;
        default:
          return ce();
      }
    }
    class Kr {
      constructor(t, e) {
        (this.mapKeyFn = t),
          (this.equalsFn = e),
          (this.inner = {}),
          (this.innerSize = 0);
      }
      get(t) {
        const e = this.mapKeyFn(t),
          n = this.inner[e];
        if (void 0 !== n)
          for (const [e, r] of n) if (this.equalsFn(e, t)) return r;
      }
      has(t) {
        return void 0 !== this.get(t);
      }
      set(t, e) {
        const n = this.mapKeyFn(t),
          r = this.inner[n];
        if (void 0 === r)
          return (this.inner[n] = [[t, e]]), void this.innerSize++;
        for (let n = 0; n < r.length; n++)
          if (this.equalsFn(r[n][0], t)) return void (r[n] = [t, e]);
        r.push([t, e]), this.innerSize++;
      }
      delete(t) {
        const e = this.mapKeyFn(t),
          n = this.inner[e];
        if (void 0 === n) return !1;
        for (let r = 0; r < n.length; r++)
          if (this.equalsFn(n[r][0], t))
            return (
              1 === n.length ? delete this.inner[e] : n.splice(r, 1),
              this.innerSize--,
              !0
            );
        return !1;
      }
      forEach(t) {
        dn(this.inner, (e, n) => {
          for (const [e, r] of n) t(e, r);
        });
      }
      isEmpty() {
        return fn(this.inner);
      }
      size() {
        return this.innerSize;
      }
    }
    const Hr = new gn(Ue.comparator);
    function Gr() {
      return Hr;
    }
    const Qr = new gn(Ue.comparator);
    function Wr(...t) {
      let e = Qr;
      for (const n of t) e = e.insert(n.key, n);
      return e;
    }
    function Xr(t) {
      let e = Qr;
      return t.forEach((t, n) => (e = e.insert(t, n.overlayedDocument))), e;
    }
    function Yr() {
      return Zr();
    }
    function Jr() {
      return Zr();
    }
    function Zr() {
      return new Kr(
        (t) => t.toString(),
        (t, e) => t.isEqual(e),
      );
    }
    const ts = new gn(Ue.comparator),
      es = new yn(Ue.comparator);
    function ns(...t) {
      let e = es;
      for (const n of t) e = e.add(n);
      return e;
    }
    const rs = new yn(Ce);
    function ss(t, e) {
      if (t.useProto3Json) {
        if (isNaN(e)) return { doubleValue: "NaN" };
        if (e === 1 / 0) return { doubleValue: "Infinity" };
        if (e === -1 / 0) return { doubleValue: "-Infinity" };
      }
      return { doubleValue: We(e) ? "-0" : e };
    }
    function is(t) {
      return { integerValue: "" + t };
    }
    function os(t, e) {
      return (function (t) {
        return (
          "number" == typeof t &&
          Number.isInteger(t) &&
          !We(t) &&
          t <= Number.MAX_SAFE_INTEGER &&
          t >= Number.MIN_SAFE_INTEGER
        );
      })(e)
        ? is(e)
        : ss(t, e);
    }
    class as {
      constructor() {
        this._ = void 0;
      }
    }
    function cs(t, e, n) {
      return t instanceof ls
        ? (function (t, e) {
            const n = {
              fields: {
                [An]: { stringValue: In },
                [kn]: {
                  timestampValue: { seconds: t.seconds, nanos: t.nanoseconds },
                },
              },
            };
            return (
              e && Nn(e) && (e = xn(e)),
              e && (n.fields[Dn] = e),
              { mapValue: n }
            );
          })(n, e)
        : t instanceof ds
          ? fs(t, e)
          : t instanceof gs
            ? ps(t, e)
            : (function (t, e) {
                const n = hs(t, e),
                  r = ys(n) + ys(t.Ie);
                return Xn(n) && Xn(t.Ie) ? is(r) : ss(t.serializer, r);
              })(t, e);
    }
    function us(t, e, n) {
      return t instanceof ds ? fs(t, e) : t instanceof gs ? ps(t, e) : n;
    }
    function hs(t, e) {
      return t instanceof ms
        ? (function (t) {
            return (
              Xn(t) ||
              (function (t) {
                return !!t && "doubleValue" in t;
              })(t)
            );
          })(e)
          ? e
          : { integerValue: 0 }
        : null;
    }
    class ls extends as {}
    class ds extends as {
      constructor(t) {
        super(), (this.elements = t);
      }
    }
    function fs(t, e) {
      const n = vs(e);
      for (const e of t.elements) n.some((t) => qn(t, e)) || n.push(e);
      return { arrayValue: { values: n } };
    }
    class gs extends as {
      constructor(t) {
        super(), (this.elements = t);
      }
    }
    function ps(t, e) {
      let n = vs(e);
      for (const e of t.elements) n = n.filter((t) => !qn(t, e));
      return { arrayValue: { values: n } };
    }
    class ms extends as {
      constructor(t, e) {
        super(), (this.serializer = t), (this.Ie = e);
      }
    }
    function ys(t) {
      return Sn(t.integerValue || t.doubleValue);
    }
    function vs(t) {
      return Yn(t) && t.arrayValue.values ? t.arrayValue.values.slice() : [];
    }
    class ws {
      constructor(t, e) {
        (this.version = t), (this.transformResults = e);
      }
    }
    class bs {
      constructor(t, e) {
        (this.updateTime = t), (this.exists = e);
      }
      static none() {
        return new bs();
      }
      static exists(t) {
        return new bs(void 0, t);
      }
      static updateTime(t) {
        return new bs(t);
      }
      get isNone() {
        return void 0 === this.updateTime && void 0 === this.exists;
      }
      isEqual(t) {
        return (
          this.exists === t.exists &&
          (this.updateTime
            ? !!t.updateTime && this.updateTime.isEqual(t.updateTime)
            : !t.updateTime)
        );
      }
    }
    function Es(t, e) {
      return void 0 !== t.updateTime
        ? e.isFoundDocument() && e.version.isEqual(t.updateTime)
        : void 0 === t.exists || t.exists === e.isFoundDocument();
    }
    class _s {}
    function Ts(t, e) {
      if (!t.hasLocalMutations || (e && 0 === e.fields.length)) return null;
      if (null === e)
        return t.isNoDocument()
          ? new Ls(t.key, bs.none())
          : new Ds(t.key, t.data, bs.none());
      {
        const n = t.data,
          r = sr.empty();
        let s = new yn(Fe.comparator);
        for (let t of e.fields)
          if (!s.has(t)) {
            let e = n.field(t);
            null === e && t.length > 1 && ((t = t.popLast()), (e = n.field(t))),
              null === e ? r.delete(t) : r.set(t, e),
              (s = s.add(t));
          }
        return new ks(t.key, r, new wn(s.toArray()), bs.none());
      }
    }
    function Ss(t, e, n) {
      t instanceof Ds
        ? (function (t, e, n) {
            const r = t.value.clone(),
              s = xs(t.fieldTransforms, e, n.transformResults);
            r.setAll(s),
              e.convertToFoundDocument(n.version, r).setHasCommittedMutations();
          })(t, e, n)
        : t instanceof ks
          ? (function (t, e, n) {
              if (!Es(t.precondition, e))
                return void e.convertToUnknownDocument(n.version);
              const r = xs(t.fieldTransforms, e, n.transformResults),
                s = e.data;
              s.setAll(Ns(t)),
                s.setAll(r),
                e
                  .convertToFoundDocument(n.version, s)
                  .setHasCommittedMutations();
            })(t, e, n)
          : (function (t, e, n) {
              e.convertToNoDocument(n.version).setHasCommittedMutations();
            })(0, e, n);
    }
    function Cs(t, e, n, r) {
      return t instanceof Ds
        ? (function (t, e, n, r) {
            if (!Es(t.precondition, e)) return n;
            const s = t.value.clone(),
              i = Rs(t.fieldTransforms, r, e);
            return (
              s.setAll(i),
              e.convertToFoundDocument(e.version, s).setHasLocalMutations(),
              null
            );
          })(t, e, n, r)
        : t instanceof ks
          ? (function (t, e, n, r) {
              if (!Es(t.precondition, e)) return n;
              const s = Rs(t.fieldTransforms, r, e),
                i = e.data;
              return (
                i.setAll(Ns(t)),
                i.setAll(s),
                e.convertToFoundDocument(e.version, i).setHasLocalMutations(),
                null === n
                  ? null
                  : n
                      .unionWith(t.fieldMask.fields)
                      .unionWith(t.fieldTransforms.map((t) => t.field))
              );
            })(t, e, n, r)
          : (function (t, e, n) {
              return Es(t.precondition, e)
                ? (e.convertToNoDocument(e.version).setHasLocalMutations(),
                  null)
                : n;
            })(t, e, n);
    }
    function Is(t, e) {
      let n = null;
      for (const r of t.fieldTransforms) {
        const t = e.data.field(r.field),
          s = hs(r.transform, t || null);
        null != s && (null === n && (n = sr.empty()), n.set(r.field, s));
      }
      return n || null;
    }
    function As(t, e) {
      return (
        t.type === e.type &&
        !!t.key.isEqual(e.key) &&
        !!t.precondition.isEqual(e.precondition) &&
        !!(function (t, e) {
          return (
            (void 0 === t && void 0 === e) ||
            (!(!t || !e) &&
              ke(t, e, (t, e) =>
                (function (t, e) {
                  return (
                    t.field.isEqual(e.field) &&
                    (function (t, e) {
                      return (t instanceof ds && e instanceof ds) ||
                        (t instanceof gs && e instanceof gs)
                        ? ke(t.elements, e.elements, qn)
                        : t instanceof ms && e instanceof ms
                          ? qn(t.Ie, e.Ie)
                          : t instanceof ls && e instanceof ls;
                    })(t.transform, e.transform)
                  );
                })(t, e),
              ))
          );
        })(t.fieldTransforms, e.fieldTransforms) &&
        (0 === t.type
          ? t.value.isEqual(e.value)
          : 1 !== t.type ||
            (t.data.isEqual(e.data) && t.fieldMask.isEqual(e.fieldMask)))
      );
    }
    class Ds extends _s {
      constructor(t, e, n, r = []) {
        super(),
          (this.key = t),
          (this.value = e),
          (this.precondition = n),
          (this.fieldTransforms = r),
          (this.type = 0);
      }
      getFieldMask() {
        return null;
      }
    }
    class ks extends _s {
      constructor(t, e, n, r, s = []) {
        super(),
          (this.key = t),
          (this.data = e),
          (this.fieldMask = n),
          (this.precondition = r),
          (this.fieldTransforms = s),
          (this.type = 1);
      }
      getFieldMask() {
        return this.fieldMask;
      }
    }
    function Ns(t) {
      const e = new Map();
      return (
        t.fieldMask.fields.forEach((n) => {
          if (!n.isEmpty()) {
            const r = t.data.field(n);
            e.set(n, r);
          }
        }),
        e
      );
    }
    function xs(t, e, n) {
      const r = new Map();
      ue(t.length === n.length);
      for (let s = 0; s < n.length; s++) {
        const i = t[s],
          o = i.transform,
          a = e.data.field(i.field);
        r.set(i.field, us(o, a, n[s]));
      }
      return r;
    }
    function Rs(t, e, n) {
      const r = new Map();
      for (const s of t) {
        const t = s.transform,
          i = n.data.field(s.field);
        r.set(s.field, cs(t, i, e));
      }
      return r;
    }
    class Ls extends _s {
      constructor(t, e) {
        super(),
          (this.key = t),
          (this.precondition = e),
          (this.type = 2),
          (this.fieldTransforms = []);
      }
      getFieldMask() {
        return null;
      }
    }
    class Os extends _s {
      constructor(t, e) {
        super(),
          (this.key = t),
          (this.precondition = e),
          (this.type = 3),
          (this.fieldTransforms = []);
      }
      getFieldMask() {
        return null;
      }
    }
    class Ms {
      constructor(t, e, n, r) {
        (this.batchId = t),
          (this.localWriteTime = e),
          (this.baseMutations = n),
          (this.mutations = r);
      }
      applyToRemoteDocument(t, e) {
        const n = e.mutationResults;
        for (let e = 0; e < this.mutations.length; e++) {
          const r = this.mutations[e];
          r.key.isEqual(t.key) && Ss(r, t, n[e]);
        }
      }
      applyToLocalView(t, e) {
        for (const n of this.baseMutations)
          n.key.isEqual(t.key) && (e = Cs(n, t, e, this.localWriteTime));
        for (const n of this.mutations)
          n.key.isEqual(t.key) && (e = Cs(n, t, e, this.localWriteTime));
        return e;
      }
      applyToLocalDocumentSet(t, e) {
        const n = Jr();
        return (
          this.mutations.forEach((r) => {
            const s = t.get(r.key),
              i = s.overlayedDocument;
            let o = this.applyToLocalView(i, s.mutatedFields);
            o = e.has(r.key) ? null : o;
            const a = Ts(i, o);
            null !== a && n.set(r.key, a),
              i.isValidDocument() || i.convertToNoDocument(Le.min());
          }),
          n
        );
      }
      keys() {
        return this.mutations.reduce((t, e) => t.add(e.key), ns());
      }
      isEqual(t) {
        return (
          this.batchId === t.batchId &&
          ke(this.mutations, t.mutations, (t, e) => As(t, e)) &&
          ke(this.baseMutations, t.baseMutations, (t, e) => As(t, e))
        );
      }
    }
    class Ps {
      constructor(t, e, n, r) {
        (this.batch = t),
          (this.commitVersion = e),
          (this.mutationResults = n),
          (this.docVersions = r);
      }
      static from(t, e, n) {
        ue(t.mutations.length === n.length);
        let r = ts;
        const s = t.mutations;
        for (let t = 0; t < s.length; t++) r = r.insert(s[t].key, n[t].version);
        return new Ps(t, e, n, r);
      }
    }
    class Vs {
      constructor(t, e) {
        (this.largestBatchId = t), (this.mutation = e);
      }
      getKey() {
        return this.mutation.key;
      }
      isEqual(t) {
        return null !== t && this.mutation === t.mutation;
      }
      toString() {
        return `Overlay{\n      largestBatchId: ${this.largestBatchId},\n      mutation: ${this.mutation.toString()}\n    }`;
      }
    }
    class Fs {
      constructor(t, e) {
        (this.count = t), (this.unchangedNames = e);
      }
    }
    var Us, Bs;
    function js(t) {
      if (void 0 === t) return ie("GRPC error has no .code"), le.UNKNOWN;
      switch (t) {
        case Us.OK:
          return le.OK;
        case Us.CANCELLED:
          return le.CANCELLED;
        case Us.UNKNOWN:
          return le.UNKNOWN;
        case Us.DEADLINE_EXCEEDED:
          return le.DEADLINE_EXCEEDED;
        case Us.RESOURCE_EXHAUSTED:
          return le.RESOURCE_EXHAUSTED;
        case Us.INTERNAL:
          return le.INTERNAL;
        case Us.UNAVAILABLE:
          return le.UNAVAILABLE;
        case Us.UNAUTHENTICATED:
          return le.UNAUTHENTICATED;
        case Us.INVALID_ARGUMENT:
          return le.INVALID_ARGUMENT;
        case Us.NOT_FOUND:
          return le.NOT_FOUND;
        case Us.ALREADY_EXISTS:
          return le.ALREADY_EXISTS;
        case Us.PERMISSION_DENIED:
          return le.PERMISSION_DENIED;
        case Us.FAILED_PRECONDITION:
          return le.FAILED_PRECONDITION;
        case Us.ABORTED:
          return le.ABORTED;
        case Us.OUT_OF_RANGE:
          return le.OUT_OF_RANGE;
        case Us.UNIMPLEMENTED:
          return le.UNIMPLEMENTED;
        case Us.DATA_LOSS:
          return le.DATA_LOSS;
        default:
          return ce();
      }
    }
    ((Bs = Us || (Us = {}))[(Bs.OK = 0)] = "OK"),
      (Bs[(Bs.CANCELLED = 1)] = "CANCELLED"),
      (Bs[(Bs.UNKNOWN = 2)] = "UNKNOWN"),
      (Bs[(Bs.INVALID_ARGUMENT = 3)] = "INVALID_ARGUMENT"),
      (Bs[(Bs.DEADLINE_EXCEEDED = 4)] = "DEADLINE_EXCEEDED"),
      (Bs[(Bs.NOT_FOUND = 5)] = "NOT_FOUND"),
      (Bs[(Bs.ALREADY_EXISTS = 6)] = "ALREADY_EXISTS"),
      (Bs[(Bs.PERMISSION_DENIED = 7)] = "PERMISSION_DENIED"),
      (Bs[(Bs.UNAUTHENTICATED = 16)] = "UNAUTHENTICATED"),
      (Bs[(Bs.RESOURCE_EXHAUSTED = 8)] = "RESOURCE_EXHAUSTED"),
      (Bs[(Bs.FAILED_PRECONDITION = 9)] = "FAILED_PRECONDITION"),
      (Bs[(Bs.ABORTED = 10)] = "ABORTED"),
      (Bs[(Bs.OUT_OF_RANGE = 11)] = "OUT_OF_RANGE"),
      (Bs[(Bs.UNIMPLEMENTED = 12)] = "UNIMPLEMENTED"),
      (Bs[(Bs.INTERNAL = 13)] = "INTERNAL"),
      (Bs[(Bs.UNAVAILABLE = 14)] = "UNAVAILABLE"),
      (Bs[(Bs.DATA_LOSS = 15)] = "DATA_LOSS");
    const qs = new Ft([4294967295, 4294967295], 0);
    function $s(t) {
      const e = Te().encode(t),
        n = new Ut();
      return n.update(e), new Uint8Array(n.digest());
    }
    function zs(t) {
      const e = new DataView(t.buffer),
        n = e.getUint32(0, !0),
        r = e.getUint32(4, !0),
        s = e.getUint32(8, !0),
        i = e.getUint32(12, !0);
      return [new Ft([n, r], 0), new Ft([s, i], 0)];
    }
    class Ks {
      constructor(t, e, n) {
        if (
          ((this.bitmap = t),
          (this.padding = e),
          (this.hashCount = n),
          e < 0 || e >= 8)
        )
          throw new Hs(`Invalid padding: ${e}`);
        if (n < 0) throw new Hs(`Invalid hash count: ${n}`);
        if (t.length > 0 && 0 === this.hashCount)
          throw new Hs(`Invalid hash count: ${n}`);
        if (0 === t.length && 0 !== e)
          throw new Hs(`Invalid padding when bitmap length is 0: ${e}`);
        (this.Ee = 8 * t.length - e), (this.de = Ft.fromNumber(this.Ee));
      }
      Ae(t, e, n) {
        let r = t.add(e.multiply(Ft.fromNumber(n)));
        return (
          1 === r.compare(qs) && (r = new Ft([r.getBits(0), r.getBits(1)], 0)),
          r.modulo(this.de).toNumber()
        );
      }
      Re(t) {
        return !!(this.bitmap[Math.floor(t / 8)] & (1 << t % 8));
      }
      mightContain(t) {
        if (0 === this.Ee) return !1;
        const e = $s(t),
          [n, r] = zs(e);
        for (let t = 0; t < this.hashCount; t++) {
          const e = this.Ae(n, r, t);
          if (!this.Re(e)) return !1;
        }
        return !0;
      }
      static create(t, e, n) {
        const r = t % 8 == 0 ? 0 : 8 - (t % 8),
          s = new Uint8Array(Math.ceil(t / 8)),
          i = new Ks(s, r, e);
        return n.forEach((t) => i.insert(t)), i;
      }
      insert(t) {
        if (0 === this.Ee) return;
        const e = $s(t),
          [n, r] = zs(e);
        for (let t = 0; t < this.hashCount; t++) {
          const e = this.Ae(n, r, t);
          this.Ve(e);
        }
      }
      Ve(t) {
        const e = Math.floor(t / 8),
          n = t % 8;
        this.bitmap[e] |= 1 << n;
      }
    }
    class Hs extends Error {
      constructor() {
        super(...arguments), (this.name = "BloomFilterError");
      }
    }
    class Gs {
      constructor(t, e, n, r, s) {
        (this.snapshotVersion = t),
          (this.targetChanges = e),
          (this.targetMismatches = n),
          (this.documentUpdates = r),
          (this.resolvedLimboDocuments = s);
      }
      static createSynthesizedRemoteEventForCurrentChange(t, e, n) {
        const r = new Map();
        return (
          r.set(t, Qs.createSynthesizedTargetChangeForCurrentChange(t, e, n)),
          new Gs(Le.min(), r, new gn(Ce), Gr(), ns())
        );
      }
    }
    class Qs {
      constructor(t, e, n, r, s) {
        (this.resumeToken = t),
          (this.current = e),
          (this.addedDocuments = n),
          (this.modifiedDocuments = r),
          (this.removedDocuments = s);
      }
      static createSynthesizedTargetChangeForCurrentChange(t, e, n) {
        return new Qs(n, e, ns(), ns(), ns());
      }
    }
    class Ws {
      constructor(t, e, n, r) {
        (this.me = t),
          (this.removedTargetIds = e),
          (this.key = n),
          (this.fe = r);
      }
    }
    class Xs {
      constructor(t, e) {
        (this.targetId = t), (this.ge = e);
      }
    }
    class Ys {
      constructor(t, e, n = En.EMPTY_BYTE_STRING, r = null) {
        (this.state = t),
          (this.targetIds = e),
          (this.resumeToken = n),
          (this.cause = r);
      }
    }
    class Js {
      constructor() {
        (this.pe = 0),
          (this.ye = ei()),
          (this.we = En.EMPTY_BYTE_STRING),
          (this.Se = !1),
          (this.be = !0);
      }
      get current() {
        return this.Se;
      }
      get resumeToken() {
        return this.we;
      }
      get De() {
        return 0 !== this.pe;
      }
      get ve() {
        return this.be;
      }
      Ce(t) {
        t.approximateByteSize() > 0 && ((this.be = !0), (this.we = t));
      }
      Fe() {
        let t = ns(),
          e = ns(),
          n = ns();
        return (
          this.ye.forEach((r, s) => {
            switch (s) {
              case 0:
                t = t.add(r);
                break;
              case 2:
                e = e.add(r);
                break;
              case 1:
                n = n.add(r);
                break;
              default:
                ce();
            }
          }),
          new Qs(this.we, this.Se, t, e, n)
        );
      }
      Me() {
        (this.be = !1), (this.ye = ei());
      }
      xe(t, e) {
        (this.be = !0), (this.ye = this.ye.insert(t, e));
      }
      Oe(t) {
        (this.be = !0), (this.ye = this.ye.remove(t));
      }
      Ne() {
        this.pe += 1;
      }
      Be() {
        (this.pe -= 1), ue(this.pe >= 0);
      }
      Le() {
        (this.be = !0), (this.Se = !0);
      }
    }
    class Zs {
      constructor(t) {
        (this.ke = t),
          (this.qe = new Map()),
          (this.Qe = Gr()),
          (this.$e = ti()),
          (this.Ue = ti()),
          (this.Ke = new gn(Ce));
      }
      We(t) {
        for (const e of t.me)
          t.fe && t.fe.isFoundDocument()
            ? this.Ge(e, t.fe)
            : this.ze(e, t.key, t.fe);
        for (const e of t.removedTargetIds) this.ze(e, t.key, t.fe);
      }
      je(t) {
        this.forEachTarget(t, (e) => {
          const n = this.He(e);
          switch (t.state) {
            case 0:
              this.Je(e) && n.Ce(t.resumeToken);
              break;
            case 1:
              n.Be(), n.De || n.Me(), n.Ce(t.resumeToken);
              break;
            case 2:
              n.Be(), n.De || this.removeTarget(e);
              break;
            case 3:
              this.Je(e) && (n.Le(), n.Ce(t.resumeToken));
              break;
            case 4:
              this.Je(e) && (this.Ye(e), n.Ce(t.resumeToken));
              break;
            default:
              ce();
          }
        });
      }
      forEachTarget(t, e) {
        t.targetIds.length > 0
          ? t.targetIds.forEach(e)
          : this.qe.forEach((t, n) => {
              this.Je(n) && e(n);
            });
      }
      Ze(t) {
        const e = t.targetId,
          n = t.ge.count,
          r = this.Xe(e);
        if (r) {
          const s = r.target;
          if (Rr(s))
            if (0 === n) {
              const t = new Ue(s.path);
              this.ze(e, t, or.newNoDocument(t, Le.min()));
            } else ue(1 === n);
          else {
            const r = this.et(e);
            if (r !== n) {
              const n = this.tt(t),
                s = n ? this.nt(n, t, r) : 1;
              if (0 !== s) {
                this.Ye(e);
                const t =
                  2 === s
                    ? "TargetPurposeExistenceFilterMismatchBloom"
                    : "TargetPurposeExistenceFilterMismatch";
                this.Ke = this.Ke.insert(e, t);
              }
            }
          }
        }
      }
      tt(t) {
        const e = t.ge.unchangedNames;
        if (!e || !e.bits) return null;
        const {
          bits: { bitmap: n = "", padding: r = 0 },
          hashCount: s = 0,
        } = e;
        let i, o;
        try {
          i = Cn(n).toUint8Array();
        } catch (t) {
          if (t instanceof bn)
            return (
              oe(
                "Decoding the base64 bloom filter in existence filter failed (" +
                  t.message +
                  "); ignoring the bloom filter and falling back to full re-query.",
              ),
              null
            );
          throw t;
        }
        try {
          o = new Ks(i, r, s);
        } catch (t) {
          return (
            oe(
              t instanceof Hs
                ? "BloomFilter error: "
                : "Applying bloom filter failed: ",
              t,
            ),
            null
          );
        }
        return 0 === o.Ee ? null : o;
      }
      nt(t, e, n) {
        return e.ge.count === n - this.st(t, e.targetId) ? 0 : 2;
      }
      st(t, e) {
        const n = this.ke.getRemoteKeysForTarget(e);
        let r = 0;
        return (
          n.forEach((n) => {
            const s = this.ke.it(),
              i = `projects/${s.projectId}/databases/${s.database}/documents/${n.path.canonicalString()}`;
            t.mightContain(i) || (this.ze(e, n, null), r++);
          }),
          r
        );
      }
      ot(t) {
        const e = new Map();
        this.qe.forEach((n, r) => {
          const s = this.Xe(r);
          if (s) {
            if (n.current && Rr(s.target)) {
              const e = new Ue(s.target.path);
              this._t(e).has(r) ||
                this.ut(r, e) ||
                this.ze(r, e, or.newNoDocument(e, t));
            }
            n.ve && (e.set(r, n.Fe()), n.Me());
          }
        });
        let n = ns();
        this.Ue.forEach((t, e) => {
          let r = !0;
          e.forEachWhile((t) => {
            const e = this.Xe(t);
            return (
              !e ||
              "TargetPurposeLimboResolution" === e.purpose ||
              ((r = !1), !1)
            );
          }),
            r && (n = n.add(t));
        }),
          this.Qe.forEach((e, n) => n.setReadTime(t));
        const r = new Gs(t, e, this.Ke, this.Qe, n);
        return (
          (this.Qe = Gr()),
          (this.$e = ti()),
          (this.Ue = ti()),
          (this.Ke = new gn(Ce)),
          r
        );
      }
      Ge(t, e) {
        if (!this.Je(t)) return;
        const n = this.ut(t, e.key) ? 2 : 0;
        this.He(t).xe(e.key, n),
          (this.Qe = this.Qe.insert(e.key, e)),
          (this.$e = this.$e.insert(e.key, this._t(e.key).add(t))),
          (this.Ue = this.Ue.insert(e.key, this.ct(e.key).add(t)));
      }
      ze(t, e, n) {
        if (!this.Je(t)) return;
        const r = this.He(t);
        this.ut(t, e) ? r.xe(e, 1) : r.Oe(e),
          (this.Ue = this.Ue.insert(e, this.ct(e).delete(t))),
          (this.Ue = this.Ue.insert(e, this.ct(e).add(t))),
          n && (this.Qe = this.Qe.insert(e, n));
      }
      removeTarget(t) {
        this.qe.delete(t);
      }
      et(t) {
        const e = this.He(t).Fe();
        return (
          this.ke.getRemoteKeysForTarget(t).size +
          e.addedDocuments.size -
          e.removedDocuments.size
        );
      }
      Ne(t) {
        this.He(t).Ne();
      }
      He(t) {
        let e = this.qe.get(t);
        return e || ((e = new Js()), this.qe.set(t, e)), e;
      }
      ct(t) {
        let e = this.Ue.get(t);
        return e || ((e = new yn(Ce)), (this.Ue = this.Ue.insert(t, e))), e;
      }
      _t(t) {
        let e = this.$e.get(t);
        return e || ((e = new yn(Ce)), (this.$e = this.$e.insert(t, e))), e;
      }
      Je(t) {
        const e = null !== this.Xe(t);
        return (
          e || se("WatchChangeAggregator", "Detected inactive target", t), e
        );
      }
      Xe(t) {
        const e = this.qe.get(t);
        return e && e.De ? null : this.ke.lt(t);
      }
      Ye(t) {
        this.qe.set(t, new Js()),
          this.ke.getRemoteKeysForTarget(t).forEach((e) => {
            this.ze(t, e, null);
          });
      }
      ut(t, e) {
        return this.ke.getRemoteKeysForTarget(t).has(e);
      }
    }
    function ti() {
      return new gn(Ue.comparator);
    }
    function ei() {
      return new gn(Ue.comparator);
    }
    const ni = { asc: "ASCENDING", desc: "DESCENDING" },
      ri = {
        "<": "LESS_THAN",
        "<=": "LESS_THAN_OR_EQUAL",
        ">": "GREATER_THAN",
        ">=": "GREATER_THAN_OR_EQUAL",
        "==": "EQUAL",
        "!=": "NOT_EQUAL",
        "array-contains": "ARRAY_CONTAINS",
        in: "IN",
        "not-in": "NOT_IN",
        "array-contains-any": "ARRAY_CONTAINS_ANY",
      },
      si = { and: "AND", or: "OR" };
    class ii {
      constructor(t, e) {
        (this.databaseId = t), (this.useProto3Json = e);
      }
    }
    function oi(t, e) {
      return t.useProto3Json || Qe(e) ? e : { value: e };
    }
    function ai(t, e) {
      return t.useProto3Json
        ? `${new Date(1e3 * e.seconds).toISOString().replace(/\.\d*/, "").replace("Z", "")}.${("000000000" + e.nanoseconds).slice(-9)}Z`
        : { seconds: "" + e.seconds, nanos: e.nanoseconds };
    }
    function ci(t, e) {
      return t.useProto3Json ? e.toBase64() : e.toUint8Array();
    }
    function ui(t, e) {
      return ai(t, e.toTimestamp());
    }
    function hi(t) {
      return (
        ue(!!t),
        Le.fromTimestamp(
          (function (t) {
            const e = Tn(t);
            return new Re(e.seconds, e.nanos);
          })(t),
        )
      );
    }
    function li(t, e) {
      return di(t, e).canonicalString();
    }
    function di(t, e) {
      const n = (function (t) {
        return new Pe(["projects", t.projectId, "databases", t.database]);
      })(t).child("documents");
      return void 0 === e ? n : n.child(e);
    }
    function fi(t) {
      const e = Pe.fromString(t);
      return ue(xi(e)), e;
    }
    function gi(t, e) {
      return li(t.databaseId, e.path);
    }
    function pi(t, e) {
      const n = fi(e);
      if (n.get(1) !== t.databaseId.projectId)
        throw new de(
          le.INVALID_ARGUMENT,
          "Tried to deserialize key from different project: " +
            n.get(1) +
            " vs " +
            t.databaseId.projectId,
        );
      if (n.get(3) !== t.databaseId.database)
        throw new de(
          le.INVALID_ARGUMENT,
          "Tried to deserialize key from different database: " +
            n.get(3) +
            " vs " +
            t.databaseId.database,
        );
      return new Ue(vi(n));
    }
    function mi(t, e) {
      return li(t.databaseId, e);
    }
    function yi(t) {
      return new Pe([
        "projects",
        t.databaseId.projectId,
        "databases",
        t.databaseId.database,
      ]).canonicalString();
    }
    function vi(t) {
      return ue(t.length > 4 && "documents" === t.get(4)), t.popFirst(5);
    }
    function wi(t, e, n) {
      return { name: gi(t, e), fields: n.value.mapValue.fields };
    }
    function bi(t, e) {
      return { documents: [mi(t, e.path)] };
    }
    function Ei(t, e) {
      const n = { structuredQuery: {} },
        r = e.path;
      let s;
      null !== e.collectionGroup
        ? ((s = r),
          (n.structuredQuery.from = [
            { collectionId: e.collectionGroup, allDescendants: !0 },
          ]))
        : ((s = r.popLast()),
          (n.structuredQuery.from = [{ collectionId: r.lastSegment() }])),
        (n.parent = mi(t, s));
      const i = (function (t) {
        if (0 !== t.length) return ki(gr.create(t, "and"));
      })(e.filters);
      i && (n.structuredQuery.where = i);
      const o = (function (t) {
        if (0 !== t.length)
          return t.map((t) =>
            (function (t) {
              return { field: Ai(t.field), direction: Si(t.dir) };
            })(t),
          );
      })(e.orderBy);
      o && (n.structuredQuery.orderBy = o);
      const a = oi(t, e.limit);
      return (
        null !== a && (n.structuredQuery.limit = a),
        e.startAt &&
          (n.structuredQuery.startAt = (function (t) {
            return { before: t.inclusive, values: t.position };
          })(e.startAt)),
        e.endAt &&
          (n.structuredQuery.endAt = (function (t) {
            return { before: !t.inclusive, values: t.position };
          })(e.endAt)),
        { ht: n, parent: s }
      );
    }
    function _i(t) {
      let e = (function (t) {
        const e = fi(t);
        return 4 === e.length ? Pe.emptyPath() : vi(e);
      })(t.parent);
      const n = t.structuredQuery,
        r = n.from ? n.from.length : 0;
      let s = null;
      if (r > 0) {
        ue(1 === r);
        const t = n.from[0];
        t.allDescendants ? (s = t.collectionId) : (e = e.child(t.collectionId));
      }
      let i = [];
      n.where &&
        (i = (function (t) {
          const e = Ti(t);
          return e instanceof gr && mr(e) ? e.getFilters() : [e];
        })(n.where));
      let o = [];
      n.orderBy &&
        (o = (function (t) {
          return t.map((t) =>
            (function (t) {
              return new hr(
                Di(t.field),
                (function (t) {
                  switch (t) {
                    case "ASCENDING":
                      return "asc";
                    case "DESCENDING":
                      return "desc";
                    default:
                      return;
                  }
                })(t.direction),
              );
            })(t),
          );
        })(n.orderBy));
      let a = null;
      n.limit &&
        (a = (function (t) {
          let e;
          return (e = "object" == typeof t ? t.value : t), Qe(e) ? null : e;
        })(n.limit));
      let c = null;
      n.startAt &&
        (c = (function (t) {
          const e = !!t.before,
            n = t.values || [];
          return new ar(n, e);
        })(n.startAt));
      let u = null;
      return (
        n.endAt &&
          (u = (function (t) {
            const e = !t.before,
              n = t.values || [];
            return new ar(n, e);
          })(n.endAt)),
        (function (t, e, n, r, s, i, o, a) {
          return new Lr(t, e, n, r, s, i, o, a);
        })(e, s, o, i, a, "F", c, u)
      );
    }
    function Ti(t) {
      return void 0 !== t.unaryFilter
        ? (function (t) {
            switch (t.unaryFilter.op) {
              case "IS_NAN":
                const e = Di(t.unaryFilter.field);
                return fr.create(e, "==", { doubleValue: NaN });
              case "IS_NULL":
                const n = Di(t.unaryFilter.field);
                return fr.create(n, "==", { nullValue: "NULL_VALUE" });
              case "IS_NOT_NAN":
                const r = Di(t.unaryFilter.field);
                return fr.create(r, "!=", { doubleValue: NaN });
              case "IS_NOT_NULL":
                const s = Di(t.unaryFilter.field);
                return fr.create(s, "!=", { nullValue: "NULL_VALUE" });
              default:
                return ce();
            }
          })(t)
        : void 0 !== t.fieldFilter
          ? (function (t) {
              return fr.create(
                Di(t.fieldFilter.field),
                (function (t) {
                  switch (t) {
                    case "EQUAL":
                      return "==";
                    case "NOT_EQUAL":
                      return "!=";
                    case "GREATER_THAN":
                      return ">";
                    case "GREATER_THAN_OR_EQUAL":
                      return ">=";
                    case "LESS_THAN":
                      return "<";
                    case "LESS_THAN_OR_EQUAL":
                      return "<=";
                    case "ARRAY_CONTAINS":
                      return "array-contains";
                    case "IN":
                      return "in";
                    case "NOT_IN":
                      return "not-in";
                    case "ARRAY_CONTAINS_ANY":
                      return "array-contains-any";
                    default:
                      return ce();
                  }
                })(t.fieldFilter.op),
                t.fieldFilter.value,
              );
            })(t)
          : void 0 !== t.compositeFilter
            ? (function (t) {
                return gr.create(
                  t.compositeFilter.filters.map((t) => Ti(t)),
                  (function (t) {
                    switch (t) {
                      case "AND":
                        return "and";
                      case "OR":
                        return "or";
                      default:
                        return ce();
                    }
                  })(t.compositeFilter.op),
                );
              })(t)
            : ce();
    }
    function Si(t) {
      return ni[t];
    }
    function Ci(t) {
      return ri[t];
    }
    function Ii(t) {
      return si[t];
    }
    function Ai(t) {
      return { fieldPath: t.canonicalString() };
    }
    function Di(t) {
      return Fe.fromServerFormat(t.fieldPath);
    }
    function ki(t) {
      return t instanceof fr
        ? (function (t) {
            if ("==" === t.op) {
              if (Zn(t.value))
                return { unaryFilter: { field: Ai(t.field), op: "IS_NAN" } };
              if (Jn(t.value))
                return { unaryFilter: { field: Ai(t.field), op: "IS_NULL" } };
            } else if ("!=" === t.op) {
              if (Zn(t.value))
                return {
                  unaryFilter: { field: Ai(t.field), op: "IS_NOT_NAN" },
                };
              if (Jn(t.value))
                return {
                  unaryFilter: { field: Ai(t.field), op: "IS_NOT_NULL" },
                };
            }
            return {
              fieldFilter: { field: Ai(t.field), op: Ci(t.op), value: t.value },
            };
          })(t)
        : t instanceof gr
          ? (function (t) {
              const e = t.getFilters().map((t) => ki(t));
              return 1 === e.length
                ? e[0]
                : { compositeFilter: { op: Ii(t.op), filters: e } };
            })(t)
          : ce();
    }
    function Ni(t) {
      const e = [];
      return (
        t.fields.forEach((t) => e.push(t.canonicalString())), { fieldPaths: e }
      );
    }
    function xi(t) {
      return (
        t.length >= 4 && "projects" === t.get(0) && "databases" === t.get(2)
      );
    }
    class Ri {
      constructor(
        t,
        e,
        n,
        r,
        s = Le.min(),
        i = Le.min(),
        o = En.EMPTY_BYTE_STRING,
        a = null,
      ) {
        (this.target = t),
          (this.targetId = e),
          (this.purpose = n),
          (this.sequenceNumber = r),
          (this.snapshotVersion = s),
          (this.lastLimboFreeSnapshotVersion = i),
          (this.resumeToken = o),
          (this.expectedCount = a);
      }
      withSequenceNumber(t) {
        return new Ri(
          this.target,
          this.targetId,
          this.purpose,
          t,
          this.snapshotVersion,
          this.lastLimboFreeSnapshotVersion,
          this.resumeToken,
          this.expectedCount,
        );
      }
      withResumeToken(t, e) {
        return new Ri(
          this.target,
          this.targetId,
          this.purpose,
          this.sequenceNumber,
          e,
          this.lastLimboFreeSnapshotVersion,
          t,
          null,
        );
      }
      withExpectedCount(t) {
        return new Ri(
          this.target,
          this.targetId,
          this.purpose,
          this.sequenceNumber,
          this.snapshotVersion,
          this.lastLimboFreeSnapshotVersion,
          this.resumeToken,
          t,
        );
      }
      withLastLimboFreeSnapshotVersion(t) {
        return new Ri(
          this.target,
          this.targetId,
          this.purpose,
          this.sequenceNumber,
          this.snapshotVersion,
          t,
          this.resumeToken,
          this.expectedCount,
        );
      }
    }
    class Li {
      constructor(t) {
        this.Tt = t;
      }
    }
    function Oi(t) {
      const e = _i({ parent: t.parent, structuredQuery: t.structuredQuery });
      return "LAST" === t.limitType ? Fr(e, e.limit, "L") : e;
    }
    class Mi {
      constructor() {}
      At(t, e) {
        this.Rt(t, e), e.Vt();
      }
      Rt(t, e) {
        if ("nullValue" in t) this.ft(e, 5);
        else if ("booleanValue" in t)
          this.ft(e, 10), e.gt(t.booleanValue ? 1 : 0);
        else if ("integerValue" in t) this.ft(e, 15), e.gt(Sn(t.integerValue));
        else if ("doubleValue" in t) {
          const n = Sn(t.doubleValue);
          isNaN(n)
            ? this.ft(e, 13)
            : (this.ft(e, 15), We(n) ? e.gt(0) : e.gt(n));
        } else if ("timestampValue" in t) {
          let n = t.timestampValue;
          this.ft(e, 20),
            "string" == typeof n && (n = Tn(n)),
            e.yt(`${n.seconds || ""}`),
            e.gt(n.nanos || 0);
        } else if ("stringValue" in t) this.wt(t.stringValue, e), this.St(e);
        else if ("bytesValue" in t)
          this.ft(e, 30), e.bt(Cn(t.bytesValue)), this.St(e);
        else if ("referenceValue" in t) this.Dt(t.referenceValue, e);
        else if ("geoPointValue" in t) {
          const n = t.geoPointValue;
          this.ft(e, 45), e.gt(n.latitude || 0), e.gt(n.longitude || 0);
        } else
          "mapValue" in t
            ? rr(t)
              ? this.ft(e, Number.MAX_SAFE_INTEGER)
              : er(t)
                ? this.vt(t.mapValue, e)
                : (this.Ct(t.mapValue, e), this.St(e))
            : "arrayValue" in t
              ? (this.Ft(t.arrayValue, e), this.St(e))
              : ce();
      }
      wt(t, e) {
        this.ft(e, 25), this.Mt(t, e);
      }
      Mt(t, e) {
        e.yt(t);
      }
      Ct(t, e) {
        const n = t.fields || {};
        this.ft(e, 55);
        for (const t of Object.keys(n)) this.wt(t, e), this.Rt(n[t], e);
      }
      vt(t, e) {
        var n, r;
        const s = t.fields || {};
        this.ft(e, 53);
        const i = Bn,
          o =
            (null ===
              (r =
                null === (n = s[i].arrayValue) || void 0 === n
                  ? void 0
                  : n.values) || void 0 === r
              ? void 0
              : r.length) || 0;
        this.ft(e, 15), e.gt(Sn(o)), this.wt(i, e), this.Rt(s[i], e);
      }
      Ft(t, e) {
        const n = t.values || [];
        this.ft(e, 50);
        for (const t of n) this.Rt(t, e);
      }
      Dt(t, e) {
        this.ft(e, 37),
          Ue.fromName(t).path.forEach((t) => {
            this.ft(e, 60), this.Mt(t, e);
          });
      }
      ft(t, e) {
        t.gt(e);
      }
      St(t) {
        t.gt(2);
      }
    }
    Mi.xt = new Mi();
    class Pi {
      constructor() {
        this.Tn = new Vi();
      }
      addToCollectionParentIndex(t, e) {
        return this.Tn.add(e), Ke.resolve();
      }
      getCollectionParents(t, e) {
        return Ke.resolve(this.Tn.getEntries(e));
      }
      addFieldIndex(t, e) {
        return Ke.resolve();
      }
      deleteFieldIndex(t, e) {
        return Ke.resolve();
      }
      deleteAllFieldIndexes(t) {
        return Ke.resolve();
      }
      createTargetIndexes(t, e) {
        return Ke.resolve();
      }
      getDocumentsMatchingTarget(t, e) {
        return Ke.resolve(null);
      }
      getIndexType(t, e) {
        return Ke.resolve(0);
      }
      getFieldIndexes(t, e) {
        return Ke.resolve([]);
      }
      getNextCollectionGroupToUpdate(t) {
        return Ke.resolve(null);
      }
      getMinOffset(t, e) {
        return Ke.resolve(je.min());
      }
      getMinOffsetFromCollectionGroup(t, e) {
        return Ke.resolve(je.min());
      }
      updateCollectionGroup(t, e, n) {
        return Ke.resolve();
      }
      updateIndexEntries(t, e) {
        return Ke.resolve();
      }
    }
    class Vi {
      constructor() {
        this.index = {};
      }
      add(t) {
        const e = t.lastSegment(),
          n = t.popLast(),
          r = this.index[e] || new yn(Pe.comparator),
          s = !r.has(n);
        return (this.index[e] = r.add(n)), s;
      }
      has(t) {
        const e = t.lastSegment(),
          n = t.popLast(),
          r = this.index[e];
        return r && r.has(n);
      }
      getEntries(t) {
        return (this.index[t] || new yn(Pe.comparator)).toArray();
      }
    }
    new Uint8Array(0);
    const Fi = {
        didRun: !1,
        sequenceNumbersCollected: 0,
        targetsRemoved: 0,
        documentsRemoved: 0,
      },
      Ui = 41943040;
    class Bi {
      static withCacheSize(t) {
        return new Bi(
          t,
          Bi.DEFAULT_COLLECTION_PERCENTILE,
          Bi.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT,
        );
      }
      constructor(t, e, n) {
        (this.cacheSizeCollectionThreshold = t),
          (this.percentileToCollect = e),
          (this.maximumSequenceNumbersToCollect = n);
      }
    }
    (Bi.DEFAULT_COLLECTION_PERCENTILE = 10),
      (Bi.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT = 1e3),
      (Bi.DEFAULT = new Bi(
        Ui,
        Bi.DEFAULT_COLLECTION_PERCENTILE,
        Bi.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT,
      )),
      (Bi.DISABLED = new Bi(-1, 0, 0));
    class ji {
      constructor(t) {
        this.$n = t;
      }
      next() {
        return (this.$n += 2), this.$n;
      }
      static Un() {
        return new ji(0);
      }
      static Kn() {
        return new ji(-1);
      }
    }
    const qi = "LruGarbageCollector";
    function $i([t, e], [n, r]) {
      const s = Ce(t, n);
      return 0 === s ? Ce(e, r) : s;
    }
    class zi {
      constructor(t) {
        (this.Hn = t), (this.buffer = new yn($i)), (this.Jn = 0);
      }
      Yn() {
        return ++this.Jn;
      }
      Zn(t) {
        const e = [t, this.Yn()];
        if (this.buffer.size < this.Hn) this.buffer = this.buffer.add(e);
        else {
          const t = this.buffer.last();
          $i(e, t) < 0 && (this.buffer = this.buffer.delete(t).add(e));
        }
      }
      get maxValue() {
        return this.buffer.last()[0];
      }
    }
    class Ki {
      constructor(t, e, n) {
        (this.garbageCollector = t),
          (this.asyncQueue = e),
          (this.localStore = n),
          (this.Xn = null);
      }
      start() {
        -1 !== this.garbageCollector.params.cacheSizeCollectionThreshold &&
          this.er(6e4);
      }
      stop() {
        this.Xn && (this.Xn.cancel(), (this.Xn = null));
      }
      get started() {
        return null !== this.Xn;
      }
      er(t) {
        se(qi, `Garbage collection scheduled in ${t}ms`),
          (this.Xn = this.asyncQueue.enqueueAfterDelay(
            "lru_garbage_collection",
            t,
            async () => {
              this.Xn = null;
              try {
                await this.localStore.collectGarbage(this.garbageCollector);
              } catch (t) {
                He(t)
                  ? se(
                      qi,
                      "Ignoring IndexedDB error during garbage collection: ",
                      t,
                    )
                  : await ze(t);
              }
              await this.er(3e5);
            },
          ));
      }
    }
    class Hi {
      constructor(t, e) {
        (this.tr = t), (this.params = e);
      }
      calculateTargetCount(t, e) {
        return this.tr.nr(t).next((t) => Math.floor((e / 100) * t));
      }
      nthSequenceNumber(t, e) {
        if (0 === e) return Ke.resolve(Ge.ae);
        const n = new zi(e);
        return this.tr
          .forEachTarget(t, (t) => n.Zn(t.sequenceNumber))
          .next(() => this.tr.rr(t, (t) => n.Zn(t)))
          .next(() => n.maxValue);
      }
      removeTargets(t, e, n) {
        return this.tr.removeTargets(t, e, n);
      }
      removeOrphanedDocuments(t, e) {
        return this.tr.removeOrphanedDocuments(t, e);
      }
      collect(t, e) {
        return -1 === this.params.cacheSizeCollectionThreshold
          ? (se("LruGarbageCollector", "Garbage collection skipped; disabled"),
            Ke.resolve(Fi))
          : this.getCacheSize(t).next((n) =>
              n < this.params.cacheSizeCollectionThreshold
                ? (se(
                    "LruGarbageCollector",
                    `Garbage collection skipped; Cache size ${n} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`,
                  ),
                  Fi)
                : this.ir(t, e),
            );
      }
      getCacheSize(t) {
        return this.tr.getCacheSize(t);
      }
      ir(t, e) {
        let n, r, s, i, o, a, c;
        const u = Date.now();
        return this.calculateTargetCount(t, this.params.percentileToCollect)
          .next(
            (e) => (
              e > this.params.maximumSequenceNumbersToCollect
                ? (se(
                    "LruGarbageCollector",
                    `Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${e}`,
                  ),
                  (r = this.params.maximumSequenceNumbersToCollect))
                : (r = e),
              (i = Date.now()),
              this.nthSequenceNumber(t, r)
            ),
          )
          .next((r) => ((n = r), (o = Date.now()), this.removeTargets(t, n, e)))
          .next(
            (e) => (
              (s = e), (a = Date.now()), this.removeOrphanedDocuments(t, n)
            ),
          )
          .next(
            (t) => (
              (c = Date.now()),
              re() <= b.DEBUG &&
                se(
                  "LruGarbageCollector",
                  `LRU Garbage Collection\n\tCounted targets in ${i - u}ms\n\tDetermined least recently used ${r} in ` +
                    (o - i) +
                    "ms\n" +
                    `\tRemoved ${s} targets in ` +
                    (a - o) +
                    "ms\n" +
                    `\tRemoved ${t} documents in ` +
                    (c - a) +
                    "ms\n" +
                    `Total Duration: ${c - u}ms`,
                ),
              Ke.resolve({
                didRun: !0,
                sequenceNumbersCollected: r,
                targetsRemoved: s,
                documentsRemoved: t,
              })
            ),
          );
      }
    }
    class Gi {
      constructor() {
        (this.changes = new Kr(
          (t) => t.toString(),
          (t, e) => t.isEqual(e),
        )),
          (this.changesApplied = !1);
      }
      addEntry(t) {
        this.assertNotApplied(), this.changes.set(t.key, t);
      }
      removeEntry(t, e) {
        this.assertNotApplied(),
          this.changes.set(t, or.newInvalidDocument(t).setReadTime(e));
      }
      getEntry(t, e) {
        this.assertNotApplied();
        const n = this.changes.get(e);
        return void 0 !== n ? Ke.resolve(n) : this.getFromCache(t, e);
      }
      getEntries(t, e) {
        return this.getAllFromCache(t, e);
      }
      apply(t) {
        return (
          this.assertNotApplied(),
          (this.changesApplied = !0),
          this.applyChanges(t)
        );
      }
      assertNotApplied() {}
    }
    class Qi {
      constructor(t, e) {
        (this.overlayedDocument = t), (this.mutatedFields = e);
      }
    }
    class Wi {
      constructor(t, e, n, r) {
        (this.remoteDocumentCache = t),
          (this.mutationQueue = e),
          (this.documentOverlayCache = n),
          (this.indexManager = r);
      }
      getDocument(t, e) {
        let n = null;
        return this.documentOverlayCache
          .getOverlay(t, e)
          .next((r) => ((n = r), this.remoteDocumentCache.getEntry(t, e)))
          .next(
            (t) => (null !== n && Cs(n.mutation, t, wn.empty(), Re.now()), t),
          );
      }
      getDocuments(t, e) {
        return this.remoteDocumentCache
          .getEntries(t, e)
          .next((e) => this.getLocalViewOfDocuments(t, e, ns()).next(() => e));
      }
      getLocalViewOfDocuments(t, e, n = ns()) {
        const r = Yr();
        return this.populateOverlays(t, r, e).next(() =>
          this.computeViews(t, e, r, n).next((t) => {
            let e = Wr();
            return (
              t.forEach((t, n) => {
                e = e.insert(t, n.overlayedDocument);
              }),
              e
            );
          }),
        );
      }
      getOverlayedDocuments(t, e) {
        const n = Yr();
        return this.populateOverlays(t, n, e).next(() =>
          this.computeViews(t, e, n, ns()),
        );
      }
      populateOverlays(t, e, n) {
        const r = [];
        return (
          n.forEach((t) => {
            e.has(t) || r.push(t);
          }),
          this.documentOverlayCache.getOverlays(t, r).next((t) => {
            t.forEach((t, n) => {
              e.set(t, n);
            });
          })
        );
      }
      computeViews(t, e, n, r) {
        let s = Gr();
        const i = Zr(),
          o = Zr();
        return (
          e.forEach((t, e) => {
            const o = n.get(e.key);
            r.has(e.key) && (void 0 === o || o.mutation instanceof ks)
              ? (s = s.insert(e.key, e))
              : void 0 !== o
                ? (i.set(e.key, o.mutation.getFieldMask()),
                  Cs(o.mutation, e, o.mutation.getFieldMask(), Re.now()))
                : i.set(e.key, wn.empty());
          }),
          this.recalculateAndSaveOverlays(t, s).next(
            (t) => (
              t.forEach((t, e) => i.set(t, e)),
              e.forEach((t, e) => {
                var n;
                return o.set(
                  t,
                  new Qi(e, null !== (n = i.get(t)) && void 0 !== n ? n : null),
                );
              }),
              o
            ),
          )
        );
      }
      recalculateAndSaveOverlays(t, e) {
        const n = Zr();
        let r = new gn((t, e) => t - e),
          s = ns();
        return this.mutationQueue
          .getAllMutationBatchesAffectingDocumentKeys(t, e)
          .next((t) => {
            for (const s of t)
              s.keys().forEach((t) => {
                const i = e.get(t);
                if (null === i) return;
                let o = n.get(t) || wn.empty();
                (o = s.applyToLocalView(i, o)), n.set(t, o);
                const a = (r.get(s.batchId) || ns()).add(t);
                r = r.insert(s.batchId, a);
              });
          })
          .next(() => {
            const i = [],
              o = r.getReverseIterator();
            for (; o.hasNext(); ) {
              const r = o.getNext(),
                a = r.key,
                c = r.value,
                u = Jr();
              c.forEach((t) => {
                if (!s.has(t)) {
                  const r = Ts(e.get(t), n.get(t));
                  null !== r && u.set(t, r), (s = s.add(t));
                }
              }),
                i.push(this.documentOverlayCache.saveOverlays(t, a, u));
            }
            return Ke.waitFor(i);
          })
          .next(() => n);
      }
      recalculateAndSaveOverlaysForDocumentKeys(t, e) {
        return this.remoteDocumentCache
          .getEntries(t, e)
          .next((e) => this.recalculateAndSaveOverlays(t, e));
      }
      getDocumentsMatchingQuery(t, e, n, r) {
        return (function (t) {
          return (
            Ue.isDocumentKey(t.path) &&
            null === t.collectionGroup &&
            0 === t.filters.length
          );
        })(e)
          ? this.getDocumentsMatchingDocumentQuery(t, e.path)
          : (function (t) {
                return null !== t.collectionGroup;
              })(e)
            ? this.getDocumentsMatchingCollectionGroupQuery(t, e, n, r)
            : this.getDocumentsMatchingCollectionQuery(t, e, n, r);
      }
      getNextDocuments(t, e, n, r) {
        return this.remoteDocumentCache
          .getAllFromCollectionGroup(t, e, n, r)
          .next((s) => {
            const i =
              r - s.size > 0
                ? this.documentOverlayCache.getOverlaysForCollectionGroup(
                    t,
                    e,
                    n.largestBatchId,
                    r - s.size,
                  )
                : Ke.resolve(Yr());
            let o = -1,
              a = s;
            return i.next((e) =>
              Ke.forEach(
                e,
                (e, n) => (
                  o < n.largestBatchId && (o = n.largestBatchId),
                  s.get(e)
                    ? Ke.resolve()
                    : this.remoteDocumentCache.getEntry(t, e).next((t) => {
                        a = a.insert(e, t);
                      })
                ),
              )
                .next(() => this.populateOverlays(t, e, s))
                .next(() => this.computeViews(t, a, e, ns()))
                .next((t) => ({ batchId: o, changes: Xr(t) })),
            );
          });
      }
      getDocumentsMatchingDocumentQuery(t, e) {
        return this.getDocument(t, new Ue(e)).next((t) => {
          let e = Wr();
          return t.isFoundDocument() && (e = e.insert(t.key, t)), e;
        });
      }
      getDocumentsMatchingCollectionGroupQuery(t, e, n, r) {
        const s = e.collectionGroup;
        let i = Wr();
        return this.indexManager.getCollectionParents(t, s).next((o) =>
          Ke.forEach(o, (o) => {
            const a = (function (t, e) {
              return new Lr(
                e,
                null,
                t.explicitOrderBy.slice(),
                t.filters.slice(),
                t.limit,
                t.limitType,
                t.startAt,
                t.endAt,
              );
            })(e, o.child(s));
            return this.getDocumentsMatchingCollectionQuery(t, a, n, r).next(
              (t) => {
                t.forEach((t, e) => {
                  i = i.insert(t, e);
                });
              },
            );
          }).next(() => i),
        );
      }
      getDocumentsMatchingCollectionQuery(t, e, n, r) {
        let s;
        return this.documentOverlayCache
          .getOverlaysForCollection(t, e.path, n.largestBatchId)
          .next(
            (i) => (
              (s = i),
              this.remoteDocumentCache.getDocumentsMatchingQuery(t, e, n, s, r)
            ),
          )
          .next((t) => {
            s.forEach((e, n) => {
              const r = n.getKey();
              null === t.get(r) && (t = t.insert(r, or.newInvalidDocument(r)));
            });
            let n = Wr();
            return (
              t.forEach((t, r) => {
                const i = s.get(t);
                void 0 !== i && Cs(i.mutation, r, wn.empty(), Re.now()),
                  qr(e, r) && (n = n.insert(t, r));
              }),
              n
            );
          });
      }
    }
    class Xi {
      constructor(t) {
        (this.serializer = t), (this.dr = new Map()), (this.Ar = new Map());
      }
      getBundleMetadata(t, e) {
        return Ke.resolve(this.dr.get(e));
      }
      saveBundleMetadata(t, e) {
        return (
          this.dr.set(
            e.id,
            (function (t) {
              return {
                id: t.id,
                version: t.version,
                createTime: hi(t.createTime),
              };
            })(e),
          ),
          Ke.resolve()
        );
      }
      getNamedQuery(t, e) {
        return Ke.resolve(this.Ar.get(e));
      }
      saveNamedQuery(t, e) {
        return (
          this.Ar.set(
            e.name,
            (function (t) {
              return {
                name: t.name,
                query: Oi(t.bundledQuery),
                readTime: hi(t.readTime),
              };
            })(e),
          ),
          Ke.resolve()
        );
      }
    }
    class Yi {
      constructor() {
        (this.overlays = new gn(Ue.comparator)), (this.Rr = new Map());
      }
      getOverlay(t, e) {
        return Ke.resolve(this.overlays.get(e));
      }
      getOverlays(t, e) {
        const n = Yr();
        return Ke.forEach(e, (e) =>
          this.getOverlay(t, e).next((t) => {
            null !== t && n.set(e, t);
          }),
        ).next(() => n);
      }
      saveOverlays(t, e, n) {
        return (
          n.forEach((n, r) => {
            this.Et(t, e, r);
          }),
          Ke.resolve()
        );
      }
      removeOverlaysForBatchId(t, e, n) {
        const r = this.Rr.get(n);
        return (
          void 0 !== r &&
            (r.forEach((t) => (this.overlays = this.overlays.remove(t))),
            this.Rr.delete(n)),
          Ke.resolve()
        );
      }
      getOverlaysForCollection(t, e, n) {
        const r = Yr(),
          s = e.length + 1,
          i = new Ue(e.child("")),
          o = this.overlays.getIteratorFrom(i);
        for (; o.hasNext(); ) {
          const t = o.getNext().value,
            i = t.getKey();
          if (!e.isPrefixOf(i.path)) break;
          i.path.length === s && t.largestBatchId > n && r.set(t.getKey(), t);
        }
        return Ke.resolve(r);
      }
      getOverlaysForCollectionGroup(t, e, n, r) {
        let s = new gn((t, e) => t - e);
        const i = this.overlays.getIterator();
        for (; i.hasNext(); ) {
          const t = i.getNext().value;
          if (t.getKey().getCollectionGroup() === e && t.largestBatchId > n) {
            let e = s.get(t.largestBatchId);
            null === e && ((e = Yr()), (s = s.insert(t.largestBatchId, e))),
              e.set(t.getKey(), t);
          }
        }
        const o = Yr(),
          a = s.getIterator();
        for (
          ;
          a.hasNext() &&
          (a.getNext().value.forEach((t, e) => o.set(t, e)), !(o.size() >= r));

        );
        return Ke.resolve(o);
      }
      Et(t, e, n) {
        const r = this.overlays.get(n.key);
        if (null !== r) {
          const t = this.Rr.get(r.largestBatchId).delete(n.key);
          this.Rr.set(r.largestBatchId, t);
        }
        this.overlays = this.overlays.insert(n.key, new Vs(e, n));
        let s = this.Rr.get(e);
        void 0 === s && ((s = ns()), this.Rr.set(e, s)),
          this.Rr.set(e, s.add(n.key));
      }
    }
    class Ji {
      constructor() {
        this.sessionToken = En.EMPTY_BYTE_STRING;
      }
      getSessionToken(t) {
        return Ke.resolve(this.sessionToken);
      }
      setSessionToken(t, e) {
        return (this.sessionToken = e), Ke.resolve();
      }
    }
    class Zi {
      constructor() {
        (this.Vr = new yn(to.mr)), (this.gr = new yn(to.pr));
      }
      isEmpty() {
        return this.Vr.isEmpty();
      }
      addReference(t, e) {
        const n = new to(t, e);
        (this.Vr = this.Vr.add(n)), (this.gr = this.gr.add(n));
      }
      yr(t, e) {
        t.forEach((t) => this.addReference(t, e));
      }
      removeReference(t, e) {
        this.wr(new to(t, e));
      }
      Sr(t, e) {
        t.forEach((t) => this.removeReference(t, e));
      }
      br(t) {
        const e = new Ue(new Pe([])),
          n = new to(e, t),
          r = new to(e, t + 1),
          s = [];
        return (
          this.gr.forEachInRange([n, r], (t) => {
            this.wr(t), s.push(t.key);
          }),
          s
        );
      }
      Dr() {
        this.Vr.forEach((t) => this.wr(t));
      }
      wr(t) {
        (this.Vr = this.Vr.delete(t)), (this.gr = this.gr.delete(t));
      }
      vr(t) {
        const e = new Ue(new Pe([])),
          n = new to(e, t),
          r = new to(e, t + 1);
        let s = ns();
        return (
          this.gr.forEachInRange([n, r], (t) => {
            s = s.add(t.key);
          }),
          s
        );
      }
      containsKey(t) {
        const e = new to(t, 0),
          n = this.Vr.firstAfterOrEqual(e);
        return null !== n && t.isEqual(n.key);
      }
    }
    class to {
      constructor(t, e) {
        (this.key = t), (this.Cr = e);
      }
      static mr(t, e) {
        return Ue.comparator(t.key, e.key) || Ce(t.Cr, e.Cr);
      }
      static pr(t, e) {
        return Ce(t.Cr, e.Cr) || Ue.comparator(t.key, e.key);
      }
    }
    class eo {
      constructor(t, e) {
        (this.indexManager = t),
          (this.referenceDelegate = e),
          (this.mutationQueue = []),
          (this.Fr = 1),
          (this.Mr = new yn(to.mr));
      }
      checkEmpty(t) {
        return Ke.resolve(0 === this.mutationQueue.length);
      }
      addMutationBatch(t, e, n, r) {
        const s = this.Fr;
        this.Fr++,
          this.mutationQueue.length > 0 &&
            this.mutationQueue[this.mutationQueue.length - 1];
        const i = new Ms(s, e, n, r);
        this.mutationQueue.push(i);
        for (const e of r)
          (this.Mr = this.Mr.add(new to(e.key, s))),
            this.indexManager.addToCollectionParentIndex(
              t,
              e.key.path.popLast(),
            );
        return Ke.resolve(i);
      }
      lookupMutationBatch(t, e) {
        return Ke.resolve(this.Or(e));
      }
      getNextMutationBatchAfterBatchId(t, e) {
        const n = e + 1,
          r = this.Nr(n),
          s = r < 0 ? 0 : r;
        return Ke.resolve(
          this.mutationQueue.length > s ? this.mutationQueue[s] : null,
        );
      }
      getHighestUnacknowledgedBatchId() {
        return Ke.resolve(0 === this.mutationQueue.length ? -1 : this.Fr - 1);
      }
      getAllMutationBatches(t) {
        return Ke.resolve(this.mutationQueue.slice());
      }
      getAllMutationBatchesAffectingDocumentKey(t, e) {
        const n = new to(e, 0),
          r = new to(e, Number.POSITIVE_INFINITY),
          s = [];
        return (
          this.Mr.forEachInRange([n, r], (t) => {
            const e = this.Or(t.Cr);
            s.push(e);
          }),
          Ke.resolve(s)
        );
      }
      getAllMutationBatchesAffectingDocumentKeys(t, e) {
        let n = new yn(Ce);
        return (
          e.forEach((t) => {
            const e = new to(t, 0),
              r = new to(t, Number.POSITIVE_INFINITY);
            this.Mr.forEachInRange([e, r], (t) => {
              n = n.add(t.Cr);
            });
          }),
          Ke.resolve(this.Br(n))
        );
      }
      getAllMutationBatchesAffectingQuery(t, e) {
        const n = e.path,
          r = n.length + 1;
        let s = n;
        Ue.isDocumentKey(s) || (s = s.child(""));
        const i = new to(new Ue(s), 0);
        let o = new yn(Ce);
        return (
          this.Mr.forEachWhile((t) => {
            const e = t.key.path;
            return (
              !!n.isPrefixOf(e) && (e.length === r && (o = o.add(t.Cr)), !0)
            );
          }, i),
          Ke.resolve(this.Br(o))
        );
      }
      Br(t) {
        const e = [];
        return (
          t.forEach((t) => {
            const n = this.Or(t);
            null !== n && e.push(n);
          }),
          e
        );
      }
      removeMutationBatch(t, e) {
        ue(0 === this.Lr(e.batchId, "removed")), this.mutationQueue.shift();
        let n = this.Mr;
        return Ke.forEach(e.mutations, (r) => {
          const s = new to(r.key, e.batchId);
          return (
            (n = n.delete(s)),
            this.referenceDelegate.markPotentiallyOrphaned(t, r.key)
          );
        }).next(() => {
          this.Mr = n;
        });
      }
      qn(t) {}
      containsKey(t, e) {
        const n = new to(e, 0),
          r = this.Mr.firstAfterOrEqual(n);
        return Ke.resolve(e.isEqual(r && r.key));
      }
      performConsistencyCheck(t) {
        return this.mutationQueue.length, Ke.resolve();
      }
      Lr(t, e) {
        return this.Nr(t);
      }
      Nr(t) {
        return 0 === this.mutationQueue.length
          ? 0
          : t - this.mutationQueue[0].batchId;
      }
      Or(t) {
        const e = this.Nr(t);
        return e < 0 || e >= this.mutationQueue.length
          ? null
          : this.mutationQueue[e];
      }
    }
    class no {
      constructor(t) {
        (this.kr = t), (this.docs = new gn(Ue.comparator)), (this.size = 0);
      }
      setIndexManager(t) {
        this.indexManager = t;
      }
      addEntry(t, e) {
        const n = e.key,
          r = this.docs.get(n),
          s = r ? r.size : 0,
          i = this.kr(e);
        return (
          (this.docs = this.docs.insert(n, {
            document: e.mutableCopy(),
            size: i,
          })),
          (this.size += i - s),
          this.indexManager.addToCollectionParentIndex(t, n.path.popLast())
        );
      }
      removeEntry(t) {
        const e = this.docs.get(t);
        e && ((this.docs = this.docs.remove(t)), (this.size -= e.size));
      }
      getEntry(t, e) {
        const n = this.docs.get(e);
        return Ke.resolve(
          n ? n.document.mutableCopy() : or.newInvalidDocument(e),
        );
      }
      getEntries(t, e) {
        let n = Gr();
        return (
          e.forEach((t) => {
            const e = this.docs.get(t);
            n = n.insert(
              t,
              e ? e.document.mutableCopy() : or.newInvalidDocument(t),
            );
          }),
          Ke.resolve(n)
        );
      }
      getDocumentsMatchingQuery(t, e, n, r) {
        let s = Gr();
        const i = e.path,
          o = new Ue(i.child("__id-9223372036854775808__")),
          a = this.docs.getIteratorFrom(o);
        for (; a.hasNext(); ) {
          const {
            key: t,
            value: { document: o },
          } = a.getNext();
          if (!i.isPrefixOf(t.path)) break;
          t.path.length > i.length + 1 ||
            qe(Be(o), n) <= 0 ||
            ((r.has(o.key) || qr(e, o)) &&
              (s = s.insert(o.key, o.mutableCopy())));
        }
        return Ke.resolve(s);
      }
      getAllFromCollectionGroup(t, e, n, r) {
        ce();
      }
      qr(t, e) {
        return Ke.forEach(this.docs, (t) => e(t));
      }
      newChangeBuffer(t) {
        return new ro(this);
      }
      getSize(t) {
        return Ke.resolve(this.size);
      }
    }
    class ro extends Gi {
      constructor(t) {
        super(), (this.Ir = t);
      }
      applyChanges(t) {
        const e = [];
        return (
          this.changes.forEach((n, r) => {
            r.isValidDocument()
              ? e.push(this.Ir.addEntry(t, r))
              : this.Ir.removeEntry(n);
          }),
          Ke.waitFor(e)
        );
      }
      getFromCache(t, e) {
        return this.Ir.getEntry(t, e);
      }
      getAllFromCache(t, e) {
        return this.Ir.getEntries(t, e);
      }
    }
    class so {
      constructor(t) {
        (this.persistence = t),
          (this.Qr = new Kr((t) => Nr(t), xr)),
          (this.lastRemoteSnapshotVersion = Le.min()),
          (this.highestTargetId = 0),
          (this.$r = 0),
          (this.Ur = new Zi()),
          (this.targetCount = 0),
          (this.Kr = ji.Un());
      }
      forEachTarget(t, e) {
        return this.Qr.forEach((t, n) => e(n)), Ke.resolve();
      }
      getLastRemoteSnapshotVersion(t) {
        return Ke.resolve(this.lastRemoteSnapshotVersion);
      }
      getHighestSequenceNumber(t) {
        return Ke.resolve(this.$r);
      }
      allocateTargetId(t) {
        return (
          (this.highestTargetId = this.Kr.next()),
          Ke.resolve(this.highestTargetId)
        );
      }
      setTargetsMetadata(t, e, n) {
        return (
          n && (this.lastRemoteSnapshotVersion = n),
          e > this.$r && (this.$r = e),
          Ke.resolve()
        );
      }
      zn(t) {
        this.Qr.set(t.target, t);
        const e = t.targetId;
        e > this.highestTargetId &&
          ((this.Kr = new ji(e)), (this.highestTargetId = e)),
          t.sequenceNumber > this.$r && (this.$r = t.sequenceNumber);
      }
      addTargetData(t, e) {
        return this.zn(e), (this.targetCount += 1), Ke.resolve();
      }
      updateTargetData(t, e) {
        return this.zn(e), Ke.resolve();
      }
      removeTargetData(t, e) {
        return (
          this.Qr.delete(e.target),
          this.Ur.br(e.targetId),
          (this.targetCount -= 1),
          Ke.resolve()
        );
      }
      removeTargets(t, e, n) {
        let r = 0;
        const s = [];
        return (
          this.Qr.forEach((i, o) => {
            o.sequenceNumber <= e &&
              null === n.get(o.targetId) &&
              (this.Qr.delete(i),
              s.push(this.removeMatchingKeysForTargetId(t, o.targetId)),
              r++);
          }),
          Ke.waitFor(s).next(() => r)
        );
      }
      getTargetCount(t) {
        return Ke.resolve(this.targetCount);
      }
      getTargetData(t, e) {
        const n = this.Qr.get(e) || null;
        return Ke.resolve(n);
      }
      addMatchingKeys(t, e, n) {
        return this.Ur.yr(e, n), Ke.resolve();
      }
      removeMatchingKeys(t, e, n) {
        this.Ur.Sr(e, n);
        const r = this.persistence.referenceDelegate,
          s = [];
        return (
          r &&
            e.forEach((e) => {
              s.push(r.markPotentiallyOrphaned(t, e));
            }),
          Ke.waitFor(s)
        );
      }
      removeMatchingKeysForTargetId(t, e) {
        return this.Ur.br(e), Ke.resolve();
      }
      getMatchingKeysForTargetId(t, e) {
        const n = this.Ur.vr(e);
        return Ke.resolve(n);
      }
      containsKey(t, e) {
        return Ke.resolve(this.Ur.containsKey(e));
      }
    }
    class io {
      constructor(t, e) {
        (this.Wr = {}),
          (this.overlays = {}),
          (this.Gr = new Ge(0)),
          (this.zr = !1),
          (this.zr = !0),
          (this.jr = new Ji()),
          (this.referenceDelegate = t(this)),
          (this.Hr = new so(this)),
          (this.indexManager = new Pi()),
          (this.remoteDocumentCache = (function (t) {
            return new no(t);
          })((t) => this.referenceDelegate.Jr(t))),
          (this.serializer = new Li(e)),
          (this.Yr = new Xi(this.serializer));
      }
      start() {
        return Promise.resolve();
      }
      shutdown() {
        return (this.zr = !1), Promise.resolve();
      }
      get started() {
        return this.zr;
      }
      setDatabaseDeletedListener() {}
      setNetworkEnabled() {}
      getIndexManager(t) {
        return this.indexManager;
      }
      getDocumentOverlayCache(t) {
        let e = this.overlays[t.toKey()];
        return e || ((e = new Yi()), (this.overlays[t.toKey()] = e)), e;
      }
      getMutationQueue(t, e) {
        let n = this.Wr[t.toKey()];
        return (
          n ||
            ((n = new eo(e, this.referenceDelegate)), (this.Wr[t.toKey()] = n)),
          n
        );
      }
      getGlobalsCache() {
        return this.jr;
      }
      getTargetCache() {
        return this.Hr;
      }
      getRemoteDocumentCache() {
        return this.remoteDocumentCache;
      }
      getBundleCache() {
        return this.Yr;
      }
      runTransaction(t, e, n) {
        se("MemoryPersistence", "Starting transaction:", t);
        const r = new oo(this.Gr.next());
        return (
          this.referenceDelegate.Zr(),
          n(r)
            .next((t) => this.referenceDelegate.Xr(r).next(() => t))
            .toPromise()
            .then((t) => (r.raiseOnCommittedEvent(), t))
        );
      }
      ei(t, e) {
        return Ke.or(
          Object.values(this.Wr).map((n) => () => n.containsKey(t, e)),
        );
      }
    }
    class oo extends $e {
      constructor(t) {
        super(), (this.currentSequenceNumber = t);
      }
    }
    class ao {
      constructor(t) {
        (this.persistence = t), (this.ti = new Zi()), (this.ni = null);
      }
      static ri(t) {
        return new ao(t);
      }
      get ii() {
        if (this.ni) return this.ni;
        throw ce();
      }
      addReference(t, e, n) {
        return (
          this.ti.addReference(n, e), this.ii.delete(n.toString()), Ke.resolve()
        );
      }
      removeReference(t, e, n) {
        return (
          this.ti.removeReference(n, e), this.ii.add(n.toString()), Ke.resolve()
        );
      }
      markPotentiallyOrphaned(t, e) {
        return this.ii.add(e.toString()), Ke.resolve();
      }
      removeTarget(t, e) {
        this.ti.br(e.targetId).forEach((t) => this.ii.add(t.toString()));
        const n = this.persistence.getTargetCache();
        return n
          .getMatchingKeysForTargetId(t, e.targetId)
          .next((t) => {
            t.forEach((t) => this.ii.add(t.toString()));
          })
          .next(() => n.removeTargetData(t, e));
      }
      Zr() {
        this.ni = new Set();
      }
      Xr(t) {
        const e = this.persistence.getRemoteDocumentCache().newChangeBuffer();
        return Ke.forEach(this.ii, (n) => {
          const r = Ue.fromPath(n);
          return this.si(t, r).next((t) => {
            t || e.removeEntry(r, Le.min());
          });
        }).next(() => ((this.ni = null), e.apply(t)));
      }
      updateLimboDocument(t, e) {
        return this.si(t, e).next((t) => {
          t ? this.ii.delete(e.toString()) : this.ii.add(e.toString());
        });
      }
      Jr(t) {
        return 0;
      }
      si(t, e) {
        return Ke.or([
          () => Ke.resolve(this.ti.containsKey(e)),
          () => this.persistence.getTargetCache().containsKey(t, e),
          () => this.persistence.ei(t, e),
        ]);
      }
    }
    class co {
      constructor(t, e) {
        (this.persistence = t),
          (this.oi = new Kr(
            (t) =>
              (function (t) {
                let e = "";
                for (let n = 0; n < t.length; n++)
                  e.length > 0 && (e = Ye(e)), (e = Xe(t.get(n), e));
                return Ye(e);
              })(t.path),
            (t, e) => t.isEqual(e),
          )),
          (this.garbageCollector = (function (t, e) {
            return new Hi(t, e);
          })(this, e));
      }
      static ri(t, e) {
        return new co(t, e);
      }
      Zr() {}
      Xr(t) {
        return Ke.resolve();
      }
      forEachTarget(t, e) {
        return this.persistence.getTargetCache().forEachTarget(t, e);
      }
      nr(t) {
        const e = this.sr(t);
        return this.persistence
          .getTargetCache()
          .getTargetCount(t)
          .next((t) => e.next((e) => t + e));
      }
      sr(t) {
        let e = 0;
        return this.rr(t, (t) => {
          e++;
        }).next(() => e);
      }
      rr(t, e) {
        return Ke.forEach(this.oi, (n, r) =>
          this.ar(t, n, r).next((t) => (t ? Ke.resolve() : e(r))),
        );
      }
      removeTargets(t, e, n) {
        return this.persistence.getTargetCache().removeTargets(t, e, n);
      }
      removeOrphanedDocuments(t, e) {
        let n = 0;
        const r = this.persistence.getRemoteDocumentCache(),
          s = r.newChangeBuffer();
        return r
          .qr(t, (r) =>
            this.ar(t, r, e).next((t) => {
              t || (n++, s.removeEntry(r, Le.min()));
            }),
          )
          .next(() => s.apply(t))
          .next(() => n);
      }
      markPotentiallyOrphaned(t, e) {
        return this.oi.set(e, t.currentSequenceNumber), Ke.resolve();
      }
      removeTarget(t, e) {
        const n = e.withSequenceNumber(t.currentSequenceNumber);
        return this.persistence.getTargetCache().updateTargetData(t, n);
      }
      addReference(t, e, n) {
        return this.oi.set(n, t.currentSequenceNumber), Ke.resolve();
      }
      removeReference(t, e, n) {
        return this.oi.set(n, t.currentSequenceNumber), Ke.resolve();
      }
      updateLimboDocument(t, e) {
        return this.oi.set(e, t.currentSequenceNumber), Ke.resolve();
      }
      Jr(t) {
        let e = t.key.toString().length;
        return t.isFoundDocument() && (e += Wn(t.data.value)), e;
      }
      ar(t, e, n) {
        return Ke.or([
          () => this.persistence.ei(t, e),
          () => this.persistence.getTargetCache().containsKey(t, e),
          () => {
            const t = this.oi.get(e);
            return Ke.resolve(void 0 !== t && t > n);
          },
        ]);
      }
      getCacheSize(t) {
        return this.persistence.getRemoteDocumentCache().getSize(t);
      }
    }
    class uo {
      constructor(t, e, n, r) {
        (this.targetId = t), (this.fromCache = e), (this.Hi = n), (this.Ji = r);
      }
      static Yi(t, e) {
        let n = ns(),
          r = ns();
        for (const t of e.docChanges)
          switch (t.type) {
            case 0:
              n = n.add(t.doc.key);
              break;
            case 1:
              r = r.add(t.doc.key);
          }
        return new uo(t, e.fromCache, n, r);
      }
    }
    class ho {
      constructor() {
        this._documentReadCount = 0;
      }
      get documentReadCount() {
        return this._documentReadCount;
      }
      incrementDocumentReadCount(t) {
        this._documentReadCount += t;
      }
    }
    class lo {
      constructor() {
        (this.Zi = !1),
          (this.Xi = !1),
          (this.es = 100),
          (this.ts =
            !(function () {
              var e;
              const n =
                null === (e = o()) || void 0 === e
                  ? void 0
                  : e.forceEnvironment;
              if ("node" === n) return !0;
              if ("browser" === n) return !1;
              try {
                return (
                  "[object process]" ===
                  Object.prototype.toString.call(t.g.process)
                );
              } catch (t) {
                return !1;
              }
            })() &&
            navigator.userAgent &&
            navigator.userAgent.includes("Safari") &&
            !navigator.userAgent.includes("Chrome")
              ? 8
              : (function (t) {
                    const e = t.match(/Android ([\d.]+)/i),
                      n = e ? e[1].split(".").slice(0, 2).join(".") : "-1";
                    return Number(n);
                  })(
                    "undefined" != typeof navigator &&
                      "string" == typeof navigator.userAgent
                      ? navigator.userAgent
                      : "",
                  ) > 0
                ? 6
                : 4);
      }
      initialize(t, e) {
        (this.ns = t), (this.indexManager = e), (this.Zi = !0);
      }
      getDocumentsMatchingQuery(t, e, n, r) {
        const s = { result: null };
        return this.rs(t, e)
          .next((t) => {
            s.result = t;
          })
          .next(() => {
            if (!s.result)
              return this.ss(t, e, r, n).next((t) => {
                s.result = t;
              });
          })
          .next(() => {
            if (s.result) return;
            const n = new ho();
            return this._s(t, e, n).next((r) => {
              if (((s.result = r), this.Xi)) return this.us(t, e, n, r.size);
            });
          })
          .next(() => s.result);
      }
      us(t, e, n, r) {
        return n.documentReadCount < this.es
          ? (re() <= b.DEBUG &&
              se(
                "QueryEngine",
                "SDK will not create cache indexes for query:",
                jr(e),
                "since it only creates cache indexes for collection contains",
                "more than or equal to",
                this.es,
                "documents",
              ),
            Ke.resolve())
          : (re() <= b.DEBUG &&
              se(
                "QueryEngine",
                "Query:",
                jr(e),
                "scans",
                n.documentReadCount,
                "local documents and returns",
                r,
                "documents as results.",
              ),
            n.documentReadCount > this.ts * r
              ? (re() <= b.DEBUG &&
                  se(
                    "QueryEngine",
                    "The SDK decides to create cache indexes for query:",
                    jr(e),
                    "as using cache indexes may help improve performance.",
                  ),
                this.indexManager.createTargetIndexes(t, Vr(e)))
              : Ke.resolve());
      }
      rs(t, e) {
        if (Mr(e)) return Ke.resolve(null);
        let n = Vr(e);
        return this.indexManager.getIndexType(t, n).next((r) =>
          0 === r
            ? null
            : (null !== e.limit &&
                1 === r &&
                ((e = Fr(e, null, "F")), (n = Vr(e))),
              this.indexManager.getDocumentsMatchingTarget(t, n).next((r) => {
                const s = ns(...r);
                return this.ns.getDocuments(t, s).next((r) =>
                  this.indexManager.getMinOffset(t, n).next((n) => {
                    const i = this.cs(e, r);
                    return this.ls(e, i, s, n.readTime)
                      ? this.rs(t, Fr(e, null, "F"))
                      : this.hs(t, i, e, n);
                  }),
                );
              })),
        );
      }
      ss(t, e, n, r) {
        return Mr(e) || r.isEqual(Le.min())
          ? Ke.resolve(null)
          : this.ns.getDocuments(t, n).next((s) => {
              const i = this.cs(e, s);
              return this.ls(e, i, n, r)
                ? Ke.resolve(null)
                : (re() <= b.DEBUG &&
                    se(
                      "QueryEngine",
                      "Re-using previous result from %s to execute query: %s",
                      r.toString(),
                      jr(e),
                    ),
                  this.hs(
                    t,
                    i,
                    e,
                    (function (t, e) {
                      const n = t.toTimestamp().seconds,
                        r = t.toTimestamp().nanoseconds + 1,
                        s = Le.fromTimestamp(
                          1e9 === r ? new Re(n + 1, 0) : new Re(n, r),
                        );
                      return new je(s, Ue.empty(), e);
                    })(r, -1),
                  ).next((t) => t));
            });
      }
      cs(t, e) {
        let n = new yn($r(t));
        return (
          e.forEach((e, r) => {
            qr(t, r) && (n = n.add(r));
          }),
          n
        );
      }
      ls(t, e, n, r) {
        if (null === t.limit) return !1;
        if (n.size !== e.size) return !0;
        const s = "F" === t.limitType ? e.last() : e.first();
        return !!s && (s.hasPendingWrites || s.version.compareTo(r) > 0);
      }
      _s(t, e, n) {
        return (
          re() <= b.DEBUG &&
            se(
              "QueryEngine",
              "Using full collection scan to execute query:",
              jr(e),
            ),
          this.ns.getDocumentsMatchingQuery(t, e, je.min(), n)
        );
      }
      hs(t, e, n, r) {
        return this.ns.getDocumentsMatchingQuery(t, n, r).next(
          (t) => (
            e.forEach((e) => {
              t = t.insert(e.key, e);
            }),
            t
          ),
        );
      }
    }
    const fo = "LocalStore";
    class go {
      constructor(t, e, n, r) {
        (this.persistence = t),
          (this.Ps = e),
          (this.serializer = r),
          (this.Ts = new gn(Ce)),
          (this.Is = new Kr((t) => Nr(t), xr)),
          (this.Es = new Map()),
          (this.ds = t.getRemoteDocumentCache()),
          (this.Hr = t.getTargetCache()),
          (this.Yr = t.getBundleCache()),
          this.As(n);
      }
      As(t) {
        (this.documentOverlayCache =
          this.persistence.getDocumentOverlayCache(t)),
          (this.indexManager = this.persistence.getIndexManager(t)),
          (this.mutationQueue = this.persistence.getMutationQueue(
            t,
            this.indexManager,
          )),
          (this.localDocuments = new Wi(
            this.ds,
            this.mutationQueue,
            this.documentOverlayCache,
            this.indexManager,
          )),
          this.ds.setIndexManager(this.indexManager),
          this.Ps.initialize(this.localDocuments, this.indexManager);
      }
      collectGarbage(t) {
        return this.persistence.runTransaction(
          "Collect garbage",
          "readwrite-primary",
          (e) => t.collect(e, this.Ts),
        );
      }
    }
    async function po(t, e) {
      const n = he(t);
      return await n.persistence.runTransaction(
        "Handle user change",
        "readonly",
        (t) => {
          let r;
          return n.mutationQueue
            .getAllMutationBatches(t)
            .next(
              (s) => (
                (r = s), n.As(e), n.mutationQueue.getAllMutationBatches(t)
              ),
            )
            .next((e) => {
              const s = [],
                i = [];
              let o = ns();
              for (const t of r) {
                s.push(t.batchId);
                for (const e of t.mutations) o = o.add(e.key);
              }
              for (const t of e) {
                i.push(t.batchId);
                for (const e of t.mutations) o = o.add(e.key);
              }
              return n.localDocuments
                .getDocuments(t, o)
                .next((t) => ({ Rs: t, removedBatchIds: s, addedBatchIds: i }));
            });
        },
      );
    }
    function mo(t) {
      const e = he(t);
      return e.persistence.runTransaction(
        "Get last remote snapshot version",
        "readonly",
        (t) => e.Hr.getLastRemoteSnapshotVersion(t),
      );
    }
    function yo(t, e) {
      const n = he(t);
      return n.persistence.runTransaction(
        "Get next mutation batch",
        "readonly",
        (t) => (
          void 0 === e && (e = -1),
          n.mutationQueue.getNextMutationBatchAfterBatchId(t, e)
        ),
      );
    }
    async function vo(t, e, n) {
      const r = he(t),
        s = r.Ts.get(e),
        i = n ? "readwrite" : "readwrite-primary";
      try {
        n ||
          (await r.persistence.runTransaction("Release target", i, (t) =>
            r.persistence.referenceDelegate.removeTarget(t, s),
          ));
      } catch (t) {
        if (!He(t)) throw t;
        se(fo, `Failed to update sequence numbers for target ${e}: ${t}`);
      }
      (r.Ts = r.Ts.remove(e)), r.Is.delete(s.target);
    }
    function wo(t, e, n) {
      const r = he(t);
      let s = Le.min(),
        i = ns();
      return r.persistence.runTransaction("Execute query", "readwrite", (t) =>
        (function (t, e, n) {
          const r = he(t),
            s = r.Is.get(n);
          return void 0 !== s
            ? Ke.resolve(r.Ts.get(s))
            : r.Hr.getTargetData(e, n);
        })(r, t, Vr(e))
          .next((e) => {
            if (e)
              return (
                (s = e.lastLimboFreeSnapshotVersion),
                r.Hr.getMatchingKeysForTargetId(t, e.targetId).next((t) => {
                  i = t;
                })
              );
          })
          .next(() =>
            r.Ps.getDocumentsMatchingQuery(
              t,
              e,
              n ? s : Le.min(),
              n ? i : ns(),
            ),
          )
          .next(
            (t) => (
              (function (t, e, n) {
                let r = t.Es.get(e) || Le.min();
                n.forEach((t, e) => {
                  e.readTime.compareTo(r) > 0 && (r = e.readTime);
                }),
                  t.Es.set(e, r);
              })(
                r,
                (function (t) {
                  return (
                    t.collectionGroup ||
                    (t.path.length % 2 == 1
                      ? t.path.lastSegment()
                      : t.path.get(t.path.length - 2))
                  );
                })(e),
                t,
              ),
              { documents: t, gs: i }
            ),
          ),
      );
    }
    class bo {
      constructor() {
        this.activeTargetIds = rs;
      }
      Ds(t) {
        this.activeTargetIds = this.activeTargetIds.add(t);
      }
      vs(t) {
        this.activeTargetIds = this.activeTargetIds.delete(t);
      }
      bs() {
        const t = {
          activeTargetIds: this.activeTargetIds.toArray(),
          updateTimeMs: Date.now(),
        };
        return JSON.stringify(t);
      }
    }
    class Eo {
      constructor() {
        (this.ho = new bo()),
          (this.Po = {}),
          (this.onlineStateHandler = null),
          (this.sequenceNumberHandler = null);
      }
      addPendingMutation(t) {}
      updateMutationState(t, e, n) {}
      addLocalQueryTarget(t, e = !0) {
        return e && this.ho.Ds(t), this.Po[t] || "not-current";
      }
      updateQueryState(t, e, n) {
        this.Po[t] = e;
      }
      removeLocalQueryTarget(t) {
        this.ho.vs(t);
      }
      isLocalQueryTarget(t) {
        return this.ho.activeTargetIds.has(t);
      }
      clearQueryState(t) {
        delete this.Po[t];
      }
      getAllActiveQueryTargets() {
        return this.ho.activeTargetIds;
      }
      isActiveQueryTarget(t) {
        return this.ho.activeTargetIds.has(t);
      }
      start() {
        return (this.ho = new bo()), Promise.resolve();
      }
      handleUserChange(t, e, n) {}
      setOnlineState(t) {}
      shutdown() {}
      writeSequenceNumber(t) {}
      notifyBundleLoaded(t) {}
    }
    class _o {
      To(t) {}
      shutdown() {}
    }
    const To = "ConnectivityMonitor";
    class So {
      constructor() {
        (this.Io = () => this.Eo()),
          (this.Ao = () => this.Ro()),
          (this.Vo = []),
          this.mo();
      }
      To(t) {
        this.Vo.push(t);
      }
      shutdown() {
        window.removeEventListener("online", this.Io),
          window.removeEventListener("offline", this.Ao);
      }
      mo() {
        window.addEventListener("online", this.Io),
          window.addEventListener("offline", this.Ao);
      }
      Eo() {
        se(To, "Network connectivity changed: AVAILABLE");
        for (const t of this.Vo) t(0);
      }
      Ro() {
        se(To, "Network connectivity changed: UNAVAILABLE");
        for (const t of this.Vo) t(1);
      }
      static D() {
        return (
          "undefined" != typeof window &&
          void 0 !== window.addEventListener &&
          void 0 !== window.removeEventListener
        );
      }
    }
    let Co = null;
    function Io() {
      return (
        null === Co
          ? (Co = 268435456 + Math.round(2147483648 * Math.random()))
          : Co++,
        "0x" + Co.toString(16)
      );
    }
    const Ao = "RestConnection",
      Do = {
        BatchGetDocuments: "batchGet",
        Commit: "commit",
        RunQuery: "runQuery",
        RunAggregationQuery: "runAggregationQuery",
      };
    class ko {
      get fo() {
        return !1;
      }
      constructor(t) {
        (this.databaseInfo = t), (this.databaseId = t.databaseId);
        const e = t.ssl ? "https" : "http",
          n = encodeURIComponent(this.databaseId.projectId),
          r = encodeURIComponent(this.databaseId.database);
        (this.po = e + "://" + t.host),
          (this.yo = `projects/${n}/databases/${r}`),
          (this.wo =
            this.databaseId.database === On
              ? `project_id=${n}`
              : `project_id=${n}&database_id=${r}`);
      }
      So(t, e, n, r, s) {
        const i = Io(),
          o = this.bo(t, e.toUriEncodedString());
        se(Ao, `Sending RPC '${t}' ${i}:`, o, n);
        const a = {
          "google-cloud-resource-prefix": this.yo,
          "x-goog-request-params": this.wo,
        };
        return (
          this.Do(a, r, s),
          this.vo(t, o, a, n).then(
            (e) => (se(Ao, `Received RPC '${t}' ${i}: `, e), e),
            (e) => {
              throw (
                (oe(
                  Ao,
                  `RPC '${t}' ${i} failed with error: `,
                  e,
                  "url: ",
                  o,
                  "request:",
                  n,
                ),
                e)
              );
            },
          )
        );
      }
      Co(t, e, n, r, s, i) {
        return this.So(t, e, n, r, s);
      }
      Do(t, e, n) {
        (t["X-Goog-Api-Client"] = "gl-js/ fire/" + ee),
          (t["Content-Type"] = "text/plain"),
          this.databaseInfo.appId &&
            (t["X-Firebase-GMPID"] = this.databaseInfo.appId),
          e && e.headers.forEach((e, n) => (t[n] = e)),
          n && n.headers.forEach((e, n) => (t[n] = e));
      }
      bo(t, e) {
        const n = Do[t];
        return `${this.po}/v1/${e}:${n}`;
      }
      terminate() {}
    }
    class No {
      constructor(t) {
        (this.Fo = t.Fo), (this.Mo = t.Mo);
      }
      xo(t) {
        this.Oo = t;
      }
      No(t) {
        this.Bo = t;
      }
      Lo(t) {
        this.ko = t;
      }
      onMessage(t) {
        this.qo = t;
      }
      close() {
        this.Mo();
      }
      send(t) {
        this.Fo(t);
      }
      Qo() {
        this.Oo();
      }
      $o() {
        this.Bo();
      }
      Uo(t) {
        this.ko(t);
      }
      Ko(t) {
        this.qo(t);
      }
    }
    const xo = "WebChannelConnection";
    class Ro extends ko {
      constructor(t) {
        super(t),
          (this.forceLongPolling = t.forceLongPolling),
          (this.autoDetectLongPolling = t.autoDetectLongPolling),
          (this.useFetchStreams = t.useFetchStreams),
          (this.longPollingOptions = t.longPollingOptions);
      }
      vo(t, e, n, r) {
        const s = Io();
        return new Promise((i, o) => {
          const a = new qt();
          a.setWithCredentials(!0),
            a.listenOnce(zt.COMPLETE, () => {
              try {
                switch (a.getLastErrorCode()) {
                  case Kt.NO_ERROR:
                    const e = a.getResponseJson();
                    se(
                      xo,
                      `XHR for RPC '${t}' ${s} received:`,
                      JSON.stringify(e),
                    ),
                      i(e);
                    break;
                  case Kt.TIMEOUT:
                    se(xo, `RPC '${t}' ${s} timed out`),
                      o(new de(le.DEADLINE_EXCEEDED, "Request time out"));
                    break;
                  case Kt.HTTP_ERROR:
                    const n = a.getStatus();
                    if (
                      (se(
                        xo,
                        `RPC '${t}' ${s} failed with status:`,
                        n,
                        "response text:",
                        a.getResponseText(),
                      ),
                      n > 0)
                    ) {
                      let t = a.getResponseJson();
                      Array.isArray(t) && (t = t[0]);
                      const e = null == t ? void 0 : t.error;
                      if (e && e.status && e.message) {
                        const t = (function (t) {
                          const e = t.toLowerCase().replace(/_/g, "-");
                          return Object.values(le).indexOf(e) >= 0
                            ? e
                            : le.UNKNOWN;
                        })(e.status);
                        o(new de(t, e.message));
                      } else
                        o(
                          new de(
                            le.UNKNOWN,
                            "Server responded with status " + a.getStatus(),
                          ),
                        );
                    } else o(new de(le.UNAVAILABLE, "Connection failed."));
                    break;
                  default:
                    ce();
                }
              } finally {
                se(xo, `RPC '${t}' ${s} completed.`);
              }
            });
          const c = JSON.stringify(r);
          se(xo, `RPC '${t}' ${s} sending request:`, r),
            a.send(e, "POST", c, n, 15);
        });
      }
      Wo(t, e, n) {
        const r = Io(),
          s = [
            this.po,
            "/",
            "google.firestore.v1.Firestore",
            "/",
            t,
            "/channel",
          ],
          i = Wt(),
          o = Qt(),
          a = {
            httpSessionIdParam: "gsessionid",
            initMessageHeaders: {},
            messageUrlParams: {
              database: `projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`,
            },
            sendRawJson: !0,
            supportsCrossDomainXhr: !0,
            internalChannelParams: { forwardChannelRequestTimeoutMs: 6e5 },
            forceLongPolling: this.forceLongPolling,
            detectBufferingProxy: this.autoDetectLongPolling,
          },
          c = this.longPollingOptions.timeoutSeconds;
        void 0 !== c && (a.longPollingTimeout = Math.round(1e3 * c)),
          this.useFetchStreams && (a.useFetchStreams = !0),
          this.Do(a.initMessageHeaders, e, n),
          (a.encodeInitMessageHeaders = !0);
        const u = s.join("");
        se(xo, `Creating RPC '${t}' stream ${r}: ${u}`, a);
        const h = i.createWebChannel(u, a);
        let l = !1,
          d = !1;
        const f = new No({
            Fo: (e) => {
              d
                ? se(
                    xo,
                    `Not sending because RPC '${t}' stream ${r} is closed:`,
                    e,
                  )
                : (l ||
                    (se(xo, `Opening RPC '${t}' stream ${r} transport.`),
                    h.open(),
                    (l = !0)),
                  se(xo, `RPC '${t}' stream ${r} sending:`, e),
                  h.send(e));
            },
            Mo: () => h.close(),
          }),
          g = (t, e, n) => {
            t.listen(e, (t) => {
              try {
                n(t);
              } catch (t) {
                setTimeout(() => {
                  throw t;
                }, 0);
              }
            });
          };
        return (
          g(h, $t.EventType.OPEN, () => {
            d || (se(xo, `RPC '${t}' stream ${r} transport opened.`), f.Qo());
          }),
          g(h, $t.EventType.CLOSE, () => {
            d ||
              ((d = !0),
              se(xo, `RPC '${t}' stream ${r} transport closed`),
              f.Uo());
          }),
          g(h, $t.EventType.ERROR, (e) => {
            d ||
              ((d = !0),
              oe(xo, `RPC '${t}' stream ${r} transport errored:`, e),
              f.Uo(
                new de(le.UNAVAILABLE, "The operation could not be completed"),
              ));
          }),
          g(h, $t.EventType.MESSAGE, (e) => {
            var n;
            if (!d) {
              const s = e.data[0];
              ue(!!s);
              const i = s,
                o =
                  (null == i ? void 0 : i.error) ||
                  (null === (n = i[0]) || void 0 === n ? void 0 : n.error);
              if (o) {
                se(xo, `RPC '${t}' stream ${r} received error:`, o);
                const e = o.status;
                let n = (function (t) {
                    const e = Us[t];
                    if (void 0 !== e) return js(e);
                  })(e),
                  s = o.message;
                void 0 === n &&
                  ((n = le.INTERNAL),
                  (s =
                    "Unknown error status: " +
                    e +
                    " with message " +
                    o.message)),
                  (d = !0),
                  f.Uo(new de(n, s)),
                  h.close();
              } else se(xo, `RPC '${t}' stream ${r} received:`, s), f.Ko(s);
            }
          }),
          g(o, Gt.STAT_EVENT, (e) => {
            e.stat === Ht.PROXY
              ? se(xo, `RPC '${t}' stream ${r} detected buffering proxy`)
              : e.stat === Ht.NOPROXY &&
                se(xo, `RPC '${t}' stream ${r} detected no buffering proxy`);
          }),
          setTimeout(() => {
            f.$o();
          }, 0),
          f
        );
      }
    }
    function Lo() {
      return "undefined" != typeof document ? document : null;
    }
    function Oo(t) {
      return new ii(t, !0);
    }
    class Mo {
      constructor(t, e, n = 1e3, r = 1.5, s = 6e4) {
        (this.Ti = t),
          (this.timerId = e),
          (this.Go = n),
          (this.zo = r),
          (this.jo = s),
          (this.Ho = 0),
          (this.Jo = null),
          (this.Yo = Date.now()),
          this.reset();
      }
      reset() {
        this.Ho = 0;
      }
      Zo() {
        this.Ho = this.jo;
      }
      Xo(t) {
        this.cancel();
        const e = Math.floor(this.Ho + this.e_()),
          n = Math.max(0, Date.now() - this.Yo),
          r = Math.max(0, e - n);
        r > 0 &&
          se(
            "ExponentialBackoff",
            `Backing off for ${r} ms (base delay: ${this.Ho} ms, delay with jitter: ${e} ms, last attempt: ${n} ms ago)`,
          ),
          (this.Jo = this.Ti.enqueueAfterDelay(
            this.timerId,
            r,
            () => ((this.Yo = Date.now()), t()),
          )),
          (this.Ho *= this.zo),
          this.Ho < this.Go && (this.Ho = this.Go),
          this.Ho > this.jo && (this.Ho = this.jo);
      }
      t_() {
        null !== this.Jo && (this.Jo.skipDelay(), (this.Jo = null));
      }
      cancel() {
        null !== this.Jo && (this.Jo.cancel(), (this.Jo = null));
      }
      e_() {
        return (Math.random() - 0.5) * this.Ho;
      }
    }
    const Po = "PersistentStream";
    class Vo {
      constructor(t, e, n, r, s, i, o, a) {
        (this.Ti = t),
          (this.n_ = n),
          (this.r_ = r),
          (this.connection = s),
          (this.authCredentialsProvider = i),
          (this.appCheckCredentialsProvider = o),
          (this.listener = a),
          (this.state = 0),
          (this.i_ = 0),
          (this.s_ = null),
          (this.o_ = null),
          (this.stream = null),
          (this.__ = 0),
          (this.a_ = new Mo(t, e));
      }
      u_() {
        return 1 === this.state || 5 === this.state || this.c_();
      }
      c_() {
        return 2 === this.state || 3 === this.state;
      }
      start() {
        (this.__ = 0), 4 !== this.state ? this.auth() : this.l_();
      }
      async stop() {
        this.u_() && (await this.close(0));
      }
      h_() {
        (this.state = 0), this.a_.reset();
      }
      P_() {
        this.c_() &&
          null === this.s_ &&
          (this.s_ = this.Ti.enqueueAfterDelay(this.n_, 6e4, () => this.T_()));
      }
      I_(t) {
        this.E_(), this.stream.send(t);
      }
      async T_() {
        if (this.c_()) return this.close(0);
      }
      E_() {
        this.s_ && (this.s_.cancel(), (this.s_ = null));
      }
      d_() {
        this.o_ && (this.o_.cancel(), (this.o_ = null));
      }
      async close(t, e) {
        this.E_(),
          this.d_(),
          this.a_.cancel(),
          this.i_++,
          4 !== t
            ? this.a_.reset()
            : e && e.code === le.RESOURCE_EXHAUSTED
              ? (ie(e.toString()),
                ie(
                  "Using maximum backoff delay to prevent overloading the backend.",
                ),
                this.a_.Zo())
              : e &&
                e.code === le.UNAUTHENTICATED &&
                3 !== this.state &&
                (this.authCredentialsProvider.invalidateToken(),
                this.appCheckCredentialsProvider.invalidateToken()),
          null !== this.stream &&
            (this.A_(), this.stream.close(), (this.stream = null)),
          (this.state = t),
          await this.listener.Lo(e);
      }
      A_() {}
      auth() {
        this.state = 1;
        const t = this.R_(this.i_),
          e = this.i_;
        Promise.all([
          this.authCredentialsProvider.getToken(),
          this.appCheckCredentialsProvider.getToken(),
        ]).then(
          ([t, n]) => {
            this.i_ === e && this.V_(t, n);
          },
          (e) => {
            t(() => {
              const t = new de(
                le.UNKNOWN,
                "Fetching auth token failed: " + e.message,
              );
              return this.m_(t);
            });
          },
        );
      }
      V_(t, e) {
        const n = this.R_(this.i_);
        (this.stream = this.f_(t, e)),
          this.stream.xo(() => {
            n(() => this.listener.xo());
          }),
          this.stream.No(() => {
            n(
              () => (
                (this.state = 2),
                (this.o_ = this.Ti.enqueueAfterDelay(
                  this.r_,
                  1e4,
                  () => (this.c_() && (this.state = 3), Promise.resolve()),
                )),
                this.listener.No()
              ),
            );
          }),
          this.stream.Lo((t) => {
            n(() => this.m_(t));
          }),
          this.stream.onMessage((t) => {
            n(() => (1 == ++this.__ ? this.g_(t) : this.onNext(t)));
          });
      }
      l_() {
        (this.state = 5),
          this.a_.Xo(async () => {
            (this.state = 0), this.start();
          });
      }
      m_(t) {
        return (
          se(Po, `close with error: ${t}`),
          (this.stream = null),
          this.close(4, t)
        );
      }
      R_(t) {
        return (e) => {
          this.Ti.enqueueAndForget(() =>
            this.i_ === t
              ? e()
              : (se(
                  Po,
                  "stream callback skipped by getCloseGuardedDispatcher.",
                ),
                Promise.resolve()),
          );
        };
      }
    }
    class Fo extends Vo {
      constructor(t, e, n, r, s, i) {
        super(
          t,
          "listen_stream_connection_backoff",
          "listen_stream_idle",
          "health_check_timeout",
          e,
          n,
          r,
          i,
        ),
          (this.serializer = s);
      }
      f_(t, e) {
        return this.connection.Wo("Listen", t, e);
      }
      g_(t) {
        return this.onNext(t);
      }
      onNext(t) {
        this.a_.reset();
        const e = (function (t, e) {
            let n;
            if ("targetChange" in e) {
              e.targetChange;
              const r = (function (t) {
                  return "NO_CHANGE" === t
                    ? 0
                    : "ADD" === t
                      ? 1
                      : "REMOVE" === t
                        ? 2
                        : "CURRENT" === t
                          ? 3
                          : "RESET" === t
                            ? 4
                            : ce();
                })(e.targetChange.targetChangeType || "NO_CHANGE"),
                s = e.targetChange.targetIds || [],
                i = (function (t, e) {
                  return t.useProto3Json
                    ? (ue(void 0 === e || "string" == typeof e),
                      En.fromBase64String(e || ""))
                    : (ue(
                        void 0 === e ||
                          e instanceof Buffer ||
                          e instanceof Uint8Array,
                      ),
                      En.fromUint8Array(e || new Uint8Array()));
                })(t, e.targetChange.resumeToken),
                o = e.targetChange.cause,
                a =
                  o &&
                  (function (t) {
                    const e = void 0 === t.code ? le.UNKNOWN : js(t.code);
                    return new de(e, t.message || "");
                  })(o);
              n = new Ys(r, s, i, a || null);
            } else if ("documentChange" in e) {
              e.documentChange;
              const r = e.documentChange;
              r.document, r.document.name, r.document.updateTime;
              const s = pi(t, r.document.name),
                i = hi(r.document.updateTime),
                o = r.document.createTime
                  ? hi(r.document.createTime)
                  : Le.min(),
                a = new sr({ mapValue: { fields: r.document.fields } }),
                c = or.newFoundDocument(s, i, o, a),
                u = r.targetIds || [],
                h = r.removedTargetIds || [];
              n = new Ws(u, h, c.key, c);
            } else if ("documentDelete" in e) {
              e.documentDelete;
              const r = e.documentDelete;
              r.document;
              const s = pi(t, r.document),
                i = r.readTime ? hi(r.readTime) : Le.min(),
                o = or.newNoDocument(s, i),
                a = r.removedTargetIds || [];
              n = new Ws([], a, o.key, o);
            } else if ("documentRemove" in e) {
              e.documentRemove;
              const r = e.documentRemove;
              r.document;
              const s = pi(t, r.document),
                i = r.removedTargetIds || [];
              n = new Ws([], i, s, null);
            } else {
              if (!("filter" in e)) return ce();
              {
                e.filter;
                const t = e.filter;
                t.targetId;
                const { count: r = 0, unchangedNames: s } = t,
                  i = new Fs(r, s),
                  o = t.targetId;
                n = new Xs(o, i);
              }
            }
            return n;
          })(this.serializer, t),
          n = (function (t) {
            if (!("targetChange" in t)) return Le.min();
            const e = t.targetChange;
            return e.targetIds && e.targetIds.length
              ? Le.min()
              : e.readTime
                ? hi(e.readTime)
                : Le.min();
          })(t);
        return this.listener.p_(e, n);
      }
      y_(t) {
        const e = {};
        (e.database = yi(this.serializer)),
          (e.addTarget = (function (t, e) {
            let n;
            const r = e.target;
            if (
              ((n = Rr(r) ? { documents: bi(t, r) } : { query: Ei(t, r).ht }),
              (n.targetId = e.targetId),
              e.resumeToken.approximateByteSize() > 0)
            ) {
              n.resumeToken = ci(t, e.resumeToken);
              const r = oi(t, e.expectedCount);
              null !== r && (n.expectedCount = r);
            } else if (e.snapshotVersion.compareTo(Le.min()) > 0) {
              n.readTime = ai(t, e.snapshotVersion.toTimestamp());
              const r = oi(t, e.expectedCount);
              null !== r && (n.expectedCount = r);
            }
            return n;
          })(this.serializer, t));
        const n = (function (t, e) {
          const n = (function (t) {
            switch (t) {
              case "TargetPurposeListen":
                return null;
              case "TargetPurposeExistenceFilterMismatch":
                return "existence-filter-mismatch";
              case "TargetPurposeExistenceFilterMismatchBloom":
                return "existence-filter-mismatch-bloom";
              case "TargetPurposeLimboResolution":
                return "limbo-document";
              default:
                return ce();
            }
          })(e.purpose);
          return null == n ? null : { "goog-listen-tags": n };
        })(this.serializer, t);
        n && (e.labels = n), this.I_(e);
      }
      w_(t) {
        const e = {};
        (e.database = yi(this.serializer)), (e.removeTarget = t), this.I_(e);
      }
    }
    class Uo extends Vo {
      constructor(t, e, n, r, s, i) {
        super(
          t,
          "write_stream_connection_backoff",
          "write_stream_idle",
          "health_check_timeout",
          e,
          n,
          r,
          i,
        ),
          (this.serializer = s);
      }
      get S_() {
        return this.__ > 0;
      }
      start() {
        (this.lastStreamToken = void 0), super.start();
      }
      A_() {
        this.S_ && this.b_([]);
      }
      f_(t, e) {
        return this.connection.Wo("Write", t, e);
      }
      g_(t) {
        return (
          ue(!!t.streamToken),
          (this.lastStreamToken = t.streamToken),
          ue(!t.writeResults || 0 === t.writeResults.length),
          this.listener.D_()
        );
      }
      onNext(t) {
        ue(!!t.streamToken),
          (this.lastStreamToken = t.streamToken),
          this.a_.reset();
        const e = (function (t, e) {
            return t && t.length > 0
              ? (ue(void 0 !== e),
                t.map((t) =>
                  (function (t, e) {
                    let n = t.updateTime ? hi(t.updateTime) : hi(e);
                    return (
                      n.isEqual(Le.min()) && (n = hi(e)),
                      new ws(n, t.transformResults || [])
                    );
                  })(t, e),
                ))
              : [];
          })(t.writeResults, t.commitTime),
          n = hi(t.commitTime);
        return this.listener.v_(n, e);
      }
      C_() {
        const t = {};
        (t.database = yi(this.serializer)), this.I_(t);
      }
      b_(t) {
        const e = {
          streamToken: this.lastStreamToken,
          writes: t.map((t) =>
            (function (t, e) {
              let n;
              if (e instanceof Ds) n = { update: wi(t, e.key, e.value) };
              else if (e instanceof Ls) n = { delete: gi(t, e.key) };
              else if (e instanceof ks)
                n = {
                  update: wi(t, e.key, e.data),
                  updateMask: Ni(e.fieldMask),
                };
              else {
                if (!(e instanceof Os)) return ce();
                n = { verify: gi(t, e.key) };
              }
              return (
                e.fieldTransforms.length > 0 &&
                  (n.updateTransforms = e.fieldTransforms.map((t) =>
                    (function (t, e) {
                      const n = e.transform;
                      if (n instanceof ls)
                        return {
                          fieldPath: e.field.canonicalString(),
                          setToServerValue: "REQUEST_TIME",
                        };
                      if (n instanceof ds)
                        return {
                          fieldPath: e.field.canonicalString(),
                          appendMissingElements: { values: n.elements },
                        };
                      if (n instanceof gs)
                        return {
                          fieldPath: e.field.canonicalString(),
                          removeAllFromArray: { values: n.elements },
                        };
                      if (n instanceof ms)
                        return {
                          fieldPath: e.field.canonicalString(),
                          increment: n.Ie,
                        };
                      throw ce();
                    })(0, t),
                  )),
                e.precondition.isNone ||
                  (n.currentDocument = (function (t, e) {
                    return void 0 !== e.updateTime
                      ? { updateTime: ui(t, e.updateTime) }
                      : void 0 !== e.exists
                        ? { exists: e.exists }
                        : ce();
                  })(t, e.precondition)),
                n
              );
            })(this.serializer, t),
          ),
        };
        this.I_(e);
      }
    }
    class Bo {}
    class jo extends Bo {
      constructor(t, e, n, r) {
        super(),
          (this.authCredentials = t),
          (this.appCheckCredentials = e),
          (this.connection = n),
          (this.serializer = r),
          (this.F_ = !1);
      }
      M_() {
        if (this.F_)
          throw new de(
            le.FAILED_PRECONDITION,
            "The client has already been terminated.",
          );
      }
      So(t, e, n, r) {
        return (
          this.M_(),
          Promise.all([
            this.authCredentials.getToken(),
            this.appCheckCredentials.getToken(),
          ])
            .then(([s, i]) => this.connection.So(t, di(e, n), r, s, i))
            .catch((t) => {
              throw "FirebaseError" === t.name
                ? (t.code === le.UNAUTHENTICATED &&
                    (this.authCredentials.invalidateToken(),
                    this.appCheckCredentials.invalidateToken()),
                  t)
                : new de(le.UNKNOWN, t.toString());
            })
        );
      }
      Co(t, e, n, r, s) {
        return (
          this.M_(),
          Promise.all([
            this.authCredentials.getToken(),
            this.appCheckCredentials.getToken(),
          ])
            .then(([i, o]) => this.connection.Co(t, di(e, n), r, i, o, s))
            .catch((t) => {
              throw "FirebaseError" === t.name
                ? (t.code === le.UNAUTHENTICATED &&
                    (this.authCredentials.invalidateToken(),
                    this.appCheckCredentials.invalidateToken()),
                  t)
                : new de(le.UNKNOWN, t.toString());
            })
        );
      }
      terminate() {
        (this.F_ = !0), this.connection.terminate();
      }
    }
    class qo {
      constructor(t, e) {
        (this.asyncQueue = t),
          (this.onlineStateHandler = e),
          (this.state = "Unknown"),
          (this.x_ = 0),
          (this.O_ = null),
          (this.N_ = !0);
      }
      B_() {
        0 === this.x_ &&
          (this.L_("Unknown"),
          (this.O_ = this.asyncQueue.enqueueAfterDelay(
            "online_state_timeout",
            1e4,
            () => (
              (this.O_ = null),
              this.k_("Backend didn't respond within 10 seconds."),
              this.L_("Offline"),
              Promise.resolve()
            ),
          )));
      }
      q_(t) {
        "Online" === this.state
          ? this.L_("Unknown")
          : (this.x_++,
            this.x_ >= 1 &&
              (this.Q_(),
              this.k_(
                `Connection failed 1 times. Most recent error: ${t.toString()}`,
              ),
              this.L_("Offline")));
      }
      set(t) {
        this.Q_(), (this.x_ = 0), "Online" === t && (this.N_ = !1), this.L_(t);
      }
      L_(t) {
        t !== this.state && ((this.state = t), this.onlineStateHandler(t));
      }
      k_(t) {
        const e = `Could not reach Cloud Firestore backend. ${t}\nThis typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;
        this.N_ ? (ie(e), (this.N_ = !1)) : se("OnlineStateTracker", e);
      }
      Q_() {
        null !== this.O_ && (this.O_.cancel(), (this.O_ = null));
      }
    }
    const $o = "RemoteStore";
    class zo {
      constructor(t, e, n, r, s) {
        (this.localStore = t),
          (this.datastore = e),
          (this.asyncQueue = n),
          (this.remoteSyncer = {}),
          (this.U_ = []),
          (this.K_ = new Map()),
          (this.W_ = new Set()),
          (this.G_ = []),
          (this.z_ = s),
          this.z_.To((t) => {
            n.enqueueAndForget(async () => {
              Zo(this) &&
                (se($o, "Restarting streams for network reachability change."),
                await (async function (t) {
                  const e = he(t);
                  e.W_.add(4),
                    await Ho(e),
                    e.j_.set("Unknown"),
                    e.W_.delete(4),
                    await Ko(e);
                })(this));
            });
          }),
          (this.j_ = new qo(n, r));
      }
    }
    async function Ko(t) {
      if (Zo(t)) for (const e of t.G_) await e(!0);
    }
    async function Ho(t) {
      for (const e of t.G_) await e(!1);
    }
    function Go(t, e) {
      const n = he(t);
      n.K_.has(e.targetId) ||
        (n.K_.set(e.targetId, e), Jo(n) ? Yo(n) : ya(n).c_() && Wo(n, e));
    }
    function Qo(t, e) {
      const n = he(t),
        r = ya(n);
      n.K_.delete(e),
        r.c_() && Xo(n, e),
        0 === n.K_.size && (r.c_() ? r.P_() : Zo(n) && n.j_.set("Unknown"));
    }
    function Wo(t, e) {
      if (
        (t.H_.Ne(e.targetId),
        e.resumeToken.approximateByteSize() > 0 ||
          e.snapshotVersion.compareTo(Le.min()) > 0)
      ) {
        const n = t.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;
        e = e.withExpectedCount(n);
      }
      ya(t).y_(e);
    }
    function Xo(t, e) {
      t.H_.Ne(e), ya(t).w_(e);
    }
    function Yo(t) {
      (t.H_ = new Zs({
        getRemoteKeysForTarget: (e) => t.remoteSyncer.getRemoteKeysForTarget(e),
        lt: (e) => t.K_.get(e) || null,
        it: () => t.datastore.serializer.databaseId,
      })),
        ya(t).start(),
        t.j_.B_();
    }
    function Jo(t) {
      return Zo(t) && !ya(t).u_() && t.K_.size > 0;
    }
    function Zo(t) {
      return 0 === he(t).W_.size;
    }
    function ta(t) {
      t.H_ = void 0;
    }
    async function ea(t) {
      t.j_.set("Online");
    }
    async function na(t) {
      t.K_.forEach((e, n) => {
        Wo(t, e);
      });
    }
    async function ra(t, e) {
      ta(t), Jo(t) ? (t.j_.q_(e), Yo(t)) : t.j_.set("Unknown");
    }
    async function sa(t, e, n) {
      if ((t.j_.set("Online"), e instanceof Ys && 2 === e.state && e.cause))
        try {
          await (async function (t, e) {
            const n = e.cause;
            for (const r of e.targetIds)
              t.K_.has(r) &&
                (await t.remoteSyncer.rejectListen(r, n),
                t.K_.delete(r),
                t.H_.removeTarget(r));
          })(t, e);
        } catch (n) {
          se($o, "Failed to remove targets %s: %s ", e.targetIds.join(","), n),
            await ia(t, n);
        }
      else if (
        (e instanceof Ws
          ? t.H_.We(e)
          : e instanceof Xs
            ? t.H_.Ze(e)
            : t.H_.je(e),
        !n.isEqual(Le.min()))
      )
        try {
          const e = await mo(t.localStore);
          n.compareTo(e) >= 0 &&
            (await (function (t, e) {
              const n = t.H_.ot(e);
              return (
                n.targetChanges.forEach((n, r) => {
                  if (n.resumeToken.approximateByteSize() > 0) {
                    const s = t.K_.get(r);
                    s && t.K_.set(r, s.withResumeToken(n.resumeToken, e));
                  }
                }),
                n.targetMismatches.forEach((e, n) => {
                  const r = t.K_.get(e);
                  if (!r) return;
                  t.K_.set(
                    e,
                    r.withResumeToken(En.EMPTY_BYTE_STRING, r.snapshotVersion),
                  ),
                    Xo(t, e);
                  const s = new Ri(r.target, e, n, r.sequenceNumber);
                  Wo(t, s);
                }),
                t.remoteSyncer.applyRemoteEvent(n)
              );
            })(t, n));
        } catch (e) {
          se($o, "Failed to raise snapshot:", e), await ia(t, e);
        }
    }
    async function ia(t, e, n) {
      if (!He(e)) throw e;
      t.W_.add(1),
        await Ho(t),
        t.j_.set("Offline"),
        n || (n = () => mo(t.localStore)),
        t.asyncQueue.enqueueRetryable(async () => {
          se($o, "Retrying IndexedDB access"),
            await n(),
            t.W_.delete(1),
            await Ko(t);
        });
    }
    function oa(t, e) {
      return e().catch((n) => ia(t, n, e));
    }
    async function aa(t) {
      const e = he(t),
        n = va(e);
      let r = e.U_.length > 0 ? e.U_[e.U_.length - 1].batchId : -1;
      for (; ca(e); )
        try {
          const t = await yo(e.localStore, r);
          if (null === t) {
            0 === e.U_.length && n.P_();
            break;
          }
          (r = t.batchId), ua(e, t);
        } catch (t) {
          await ia(e, t);
        }
      ha(e) && la(e);
    }
    function ca(t) {
      return Zo(t) && t.U_.length < 10;
    }
    function ua(t, e) {
      t.U_.push(e);
      const n = va(t);
      n.c_() && n.S_ && n.b_(e.mutations);
    }
    function ha(t) {
      return Zo(t) && !va(t).u_() && t.U_.length > 0;
    }
    function la(t) {
      va(t).start();
    }
    async function da(t) {
      va(t).C_();
    }
    async function fa(t) {
      const e = va(t);
      for (const n of t.U_) e.b_(n.mutations);
    }
    async function ga(t, e, n) {
      const r = t.U_.shift(),
        s = Ps.from(r, e, n);
      await oa(t, () => t.remoteSyncer.applySuccessfulWrite(s)), await aa(t);
    }
    async function pa(t, e) {
      e &&
        va(t).S_ &&
        (await (async function (t, e) {
          if (
            (function (t) {
              return (
                (function (t) {
                  switch (t) {
                    case le.OK:
                      return ce();
                    case le.CANCELLED:
                    case le.UNKNOWN:
                    case le.DEADLINE_EXCEEDED:
                    case le.RESOURCE_EXHAUSTED:
                    case le.INTERNAL:
                    case le.UNAVAILABLE:
                    case le.UNAUTHENTICATED:
                      return !1;
                    case le.INVALID_ARGUMENT:
                    case le.NOT_FOUND:
                    case le.ALREADY_EXISTS:
                    case le.PERMISSION_DENIED:
                    case le.FAILED_PRECONDITION:
                    case le.ABORTED:
                    case le.OUT_OF_RANGE:
                    case le.UNIMPLEMENTED:
                    case le.DATA_LOSS:
                      return !0;
                    default:
                      return ce();
                  }
                })(t) && t !== le.ABORTED
              );
            })(e.code)
          ) {
            const n = t.U_.shift();
            va(t).h_(),
              await oa(t, () => t.remoteSyncer.rejectFailedWrite(n.batchId, e)),
              await aa(t);
          }
        })(t, e)),
        ha(t) && la(t);
    }
    async function ma(t, e) {
      const n = he(t);
      n.asyncQueue.verifyOperationInProgress(),
        se($o, "RemoteStore received new credentials");
      const r = Zo(n);
      n.W_.add(3),
        await Ho(n),
        r && n.j_.set("Unknown"),
        await n.remoteSyncer.handleCredentialChange(e),
        n.W_.delete(3),
        await Ko(n);
    }
    function ya(t) {
      return (
        t.J_ ||
          ((t.J_ = (function (t, e, n) {
            const r = he(t);
            return (
              r.M_(),
              new Fo(
                e,
                r.connection,
                r.authCredentials,
                r.appCheckCredentials,
                r.serializer,
                n,
              )
            );
          })(t.datastore, t.asyncQueue, {
            xo: ea.bind(null, t),
            No: na.bind(null, t),
            Lo: ra.bind(null, t),
            p_: sa.bind(null, t),
          })),
          t.G_.push(async (e) => {
            e
              ? (t.J_.h_(), Jo(t) ? Yo(t) : t.j_.set("Unknown"))
              : (await t.J_.stop(), ta(t));
          })),
        t.J_
      );
    }
    function va(t) {
      return (
        t.Y_ ||
          ((t.Y_ = (function (t, e, n) {
            const r = he(t);
            return (
              r.M_(),
              new Uo(
                e,
                r.connection,
                r.authCredentials,
                r.appCheckCredentials,
                r.serializer,
                n,
              )
            );
          })(t.datastore, t.asyncQueue, {
            xo: () => Promise.resolve(),
            No: da.bind(null, t),
            Lo: pa.bind(null, t),
            D_: fa.bind(null, t),
            v_: ga.bind(null, t),
          })),
          t.G_.push(async (e) => {
            e
              ? (t.Y_.h_(), await aa(t))
              : (await t.Y_.stop(),
                t.U_.length > 0 &&
                  (se(
                    $o,
                    `Stopping write stream with ${t.U_.length} pending writes`,
                  ),
                  (t.U_ = [])));
          })),
        t.Y_
      );
    }
    class wa {
      constructor(t, e, n, r, s) {
        (this.asyncQueue = t),
          (this.timerId = e),
          (this.targetTimeMs = n),
          (this.op = r),
          (this.removalCallback = s),
          (this.deferred = new fe()),
          (this.then = this.deferred.promise.then.bind(this.deferred.promise)),
          this.deferred.promise.catch((t) => {});
      }
      get promise() {
        return this.deferred.promise;
      }
      static createAndSchedule(t, e, n, r, s) {
        const i = Date.now() + n,
          o = new wa(t, e, i, r, s);
        return o.start(n), o;
      }
      start(t) {
        this.timerHandle = setTimeout(() => this.handleDelayElapsed(), t);
      }
      skipDelay() {
        return this.handleDelayElapsed();
      }
      cancel(t) {
        null !== this.timerHandle &&
          (this.clearTimeout(),
          this.deferred.reject(
            new de(le.CANCELLED, "Operation cancelled" + (t ? ": " + t : "")),
          ));
      }
      handleDelayElapsed() {
        this.asyncQueue.enqueueAndForget(() =>
          null !== this.timerHandle
            ? (this.clearTimeout(),
              this.op().then((t) => this.deferred.resolve(t)))
            : Promise.resolve(),
        );
      }
      clearTimeout() {
        null !== this.timerHandle &&
          (this.removalCallback(this),
          clearTimeout(this.timerHandle),
          (this.timerHandle = null));
      }
    }
    function ba(t, e) {
      if ((ie("AsyncQueue", `${e}: ${t}`), He(t)))
        return new de(le.UNAVAILABLE, `${e}: ${t}`);
      throw t;
    }
    class Ea {
      static emptySet(t) {
        return new Ea(t.comparator);
      }
      constructor(t) {
        (this.comparator = t
          ? (e, n) => t(e, n) || Ue.comparator(e.key, n.key)
          : (t, e) => Ue.comparator(t.key, e.key)),
          (this.keyedMap = Wr()),
          (this.sortedSet = new gn(this.comparator));
      }
      has(t) {
        return null != this.keyedMap.get(t);
      }
      get(t) {
        return this.keyedMap.get(t);
      }
      first() {
        return this.sortedSet.minKey();
      }
      last() {
        return this.sortedSet.maxKey();
      }
      isEmpty() {
        return this.sortedSet.isEmpty();
      }
      indexOf(t) {
        const e = this.keyedMap.get(t);
        return e ? this.sortedSet.indexOf(e) : -1;
      }
      get size() {
        return this.sortedSet.size;
      }
      forEach(t) {
        this.sortedSet.inorderTraversal((e, n) => (t(e), !1));
      }
      add(t) {
        const e = this.delete(t.key);
        return e.copy(e.keyedMap.insert(t.key, t), e.sortedSet.insert(t, null));
      }
      delete(t) {
        const e = this.get(t);
        return e
          ? this.copy(this.keyedMap.remove(t), this.sortedSet.remove(e))
          : this;
      }
      isEqual(t) {
        if (!(t instanceof Ea)) return !1;
        if (this.size !== t.size) return !1;
        const e = this.sortedSet.getIterator(),
          n = t.sortedSet.getIterator();
        for (; e.hasNext(); ) {
          const t = e.getNext().key,
            r = n.getNext().key;
          if (!t.isEqual(r)) return !1;
        }
        return !0;
      }
      toString() {
        const t = [];
        return (
          this.forEach((e) => {
            t.push(e.toString());
          }),
          0 === t.length
            ? "DocumentSet ()"
            : "DocumentSet (\n  " + t.join("  \n") + "\n)"
        );
      }
      copy(t, e) {
        const n = new Ea();
        return (
          (n.comparator = this.comparator),
          (n.keyedMap = t),
          (n.sortedSet = e),
          n
        );
      }
    }
    class _a {
      constructor() {
        this.Z_ = new gn(Ue.comparator);
      }
      track(t) {
        const e = t.doc.key,
          n = this.Z_.get(e);
        n
          ? 0 !== t.type && 3 === n.type
            ? (this.Z_ = this.Z_.insert(e, t))
            : 3 === t.type && 1 !== n.type
              ? (this.Z_ = this.Z_.insert(e, { type: n.type, doc: t.doc }))
              : 2 === t.type && 2 === n.type
                ? (this.Z_ = this.Z_.insert(e, { type: 2, doc: t.doc }))
                : 2 === t.type && 0 === n.type
                  ? (this.Z_ = this.Z_.insert(e, { type: 0, doc: t.doc }))
                  : 1 === t.type && 0 === n.type
                    ? (this.Z_ = this.Z_.remove(e))
                    : 1 === t.type && 2 === n.type
                      ? (this.Z_ = this.Z_.insert(e, { type: 1, doc: n.doc }))
                      : 0 === t.type && 1 === n.type
                        ? (this.Z_ = this.Z_.insert(e, { type: 2, doc: t.doc }))
                        : ce()
          : (this.Z_ = this.Z_.insert(e, t));
      }
      X_() {
        const t = [];
        return (
          this.Z_.inorderTraversal((e, n) => {
            t.push(n);
          }),
          t
        );
      }
    }
    class Ta {
      constructor(t, e, n, r, s, i, o, a, c) {
        (this.query = t),
          (this.docs = e),
          (this.oldDocs = n),
          (this.docChanges = r),
          (this.mutatedKeys = s),
          (this.fromCache = i),
          (this.syncStateChanged = o),
          (this.excludesMetadataChanges = a),
          (this.hasCachedResults = c);
      }
      static fromInitialDocuments(t, e, n, r, s) {
        const i = [];
        return (
          e.forEach((t) => {
            i.push({ type: 0, doc: t });
          }),
          new Ta(t, e, Ea.emptySet(e), i, n, r, !0, !1, s)
        );
      }
      get hasPendingWrites() {
        return !this.mutatedKeys.isEmpty();
      }
      isEqual(t) {
        if (
          !(
            this.fromCache === t.fromCache &&
            this.hasCachedResults === t.hasCachedResults &&
            this.syncStateChanged === t.syncStateChanged &&
            this.mutatedKeys.isEqual(t.mutatedKeys) &&
            Ur(this.query, t.query) &&
            this.docs.isEqual(t.docs) &&
            this.oldDocs.isEqual(t.oldDocs)
          )
        )
          return !1;
        const e = this.docChanges,
          n = t.docChanges;
        if (e.length !== n.length) return !1;
        for (let t = 0; t < e.length; t++)
          if (e[t].type !== n[t].type || !e[t].doc.isEqual(n[t].doc)) return !1;
        return !0;
      }
    }
    class Sa {
      constructor() {
        (this.ea = void 0), (this.ta = []);
      }
      na() {
        return this.ta.some((t) => t.ra());
      }
    }
    class Ca {
      constructor() {
        (this.queries = Ia()),
          (this.onlineState = "Unknown"),
          (this.ia = new Set());
      }
      terminate() {
        !(function (t, e) {
          const n = he(t),
            r = n.queries;
          (n.queries = Ia()),
            r.forEach((t, n) => {
              for (const t of n.ta) t.onError(e);
            });
        })(this, new de(le.ABORTED, "Firestore shutting down"));
      }
    }
    function Ia() {
      return new Kr((t) => Br(t), Ur);
    }
    async function Aa(t, e) {
      const n = he(t);
      let r = 3;
      const s = e.query;
      let i = n.queries.get(s);
      i ? !i.na() && e.ra() && (r = 2) : ((i = new Sa()), (r = e.ra() ? 0 : 1));
      try {
        switch (r) {
          case 0:
            i.ea = await n.onListen(s, !0);
            break;
          case 1:
            i.ea = await n.onListen(s, !1);
            break;
          case 2:
            await n.onFirstRemoteStoreListen(s);
        }
      } catch (t) {
        const n = ba(t, `Initialization of query '${jr(e.query)}' failed`);
        return void e.onError(n);
      }
      n.queries.set(s, i),
        i.ta.push(e),
        e.sa(n.onlineState),
        i.ea && e.oa(i.ea) && xa(n);
    }
    async function Da(t, e) {
      const n = he(t),
        r = e.query;
      let s = 3;
      const i = n.queries.get(r);
      if (i) {
        const t = i.ta.indexOf(e);
        t >= 0 &&
          (i.ta.splice(t, 1),
          0 === i.ta.length
            ? (s = e.ra() ? 0 : 1)
            : !i.na() && e.ra() && (s = 2));
      }
      switch (s) {
        case 0:
          return n.queries.delete(r), n.onUnlisten(r, !0);
        case 1:
          return n.queries.delete(r), n.onUnlisten(r, !1);
        case 2:
          return n.onLastRemoteStoreUnlisten(r);
        default:
          return;
      }
    }
    function ka(t, e) {
      const n = he(t);
      let r = !1;
      for (const t of e) {
        const e = t.query,
          s = n.queries.get(e);
        if (s) {
          for (const e of s.ta) e.oa(t) && (r = !0);
          s.ea = t;
        }
      }
      r && xa(n);
    }
    function Na(t, e, n) {
      const r = he(t),
        s = r.queries.get(e);
      if (s) for (const t of s.ta) t.onError(n);
      r.queries.delete(e);
    }
    function xa(t) {
      t.ia.forEach((t) => {
        t.next();
      });
    }
    var Ra, La;
    ((La = Ra || (Ra = {}))._a = "default"), (La.Cache = "cache");
    class Oa {
      constructor(t, e, n) {
        (this.query = t),
          (this.aa = e),
          (this.ua = !1),
          (this.ca = null),
          (this.onlineState = "Unknown"),
          (this.options = n || {});
      }
      oa(t) {
        if (!this.options.includeMetadataChanges) {
          const e = [];
          for (const n of t.docChanges) 3 !== n.type && e.push(n);
          t = new Ta(
            t.query,
            t.docs,
            t.oldDocs,
            e,
            t.mutatedKeys,
            t.fromCache,
            t.syncStateChanged,
            !0,
            t.hasCachedResults,
          );
        }
        let e = !1;
        return (
          this.ua
            ? this.la(t) && (this.aa.next(t), (e = !0))
            : this.ha(t, this.onlineState) && (this.Pa(t), (e = !0)),
          (this.ca = t),
          e
        );
      }
      onError(t) {
        this.aa.error(t);
      }
      sa(t) {
        this.onlineState = t;
        let e = !1;
        return (
          this.ca &&
            !this.ua &&
            this.ha(this.ca, t) &&
            (this.Pa(this.ca), (e = !0)),
          e
        );
      }
      ha(t, e) {
        if (!t.fromCache) return !0;
        if (!this.ra()) return !0;
        const n = "Offline" !== e;
        return (
          (!this.options.Ta || !n) &&
          (!t.docs.isEmpty() || t.hasCachedResults || "Offline" === e)
        );
      }
      la(t) {
        if (t.docChanges.length > 0) return !0;
        const e = this.ca && this.ca.hasPendingWrites !== t.hasPendingWrites;
        return (
          !(!t.syncStateChanged && !e) &&
          !0 === this.options.includeMetadataChanges
        );
      }
      Pa(t) {
        (t = Ta.fromInitialDocuments(
          t.query,
          t.docs,
          t.mutatedKeys,
          t.fromCache,
          t.hasCachedResults,
        )),
          (this.ua = !0),
          this.aa.next(t);
      }
      ra() {
        return this.options.source !== Ra.Cache;
      }
    }
    class Ma {
      constructor(t) {
        this.key = t;
      }
    }
    class Pa {
      constructor(t) {
        this.key = t;
      }
    }
    class Va {
      constructor(t, e) {
        (this.query = t),
          (this.fa = e),
          (this.ga = null),
          (this.hasCachedResults = !1),
          (this.current = !1),
          (this.pa = ns()),
          (this.mutatedKeys = ns()),
          (this.ya = $r(t)),
          (this.wa = new Ea(this.ya));
      }
      get Sa() {
        return this.fa;
      }
      ba(t, e) {
        const n = e ? e.Da : new _a(),
          r = e ? e.wa : this.wa;
        let s = e ? e.mutatedKeys : this.mutatedKeys,
          i = r,
          o = !1;
        const a =
            "F" === this.query.limitType && r.size === this.query.limit
              ? r.last()
              : null,
          c =
            "L" === this.query.limitType && r.size === this.query.limit
              ? r.first()
              : null;
        if (
          (t.inorderTraversal((t, e) => {
            const u = r.get(t),
              h = qr(this.query, e) ? e : null,
              l = !!u && this.mutatedKeys.has(u.key),
              d =
                !!h &&
                (h.hasLocalMutations ||
                  (this.mutatedKeys.has(h.key) && h.hasCommittedMutations));
            let f = !1;
            u && h
              ? u.data.isEqual(h.data)
                ? l !== d && (n.track({ type: 3, doc: h }), (f = !0))
                : this.va(u, h) ||
                  (n.track({ type: 2, doc: h }),
                  (f = !0),
                  ((a && this.ya(h, a) > 0) || (c && this.ya(h, c) < 0)) &&
                    (o = !0))
              : !u && h
                ? (n.track({ type: 0, doc: h }), (f = !0))
                : u &&
                  !h &&
                  (n.track({ type: 1, doc: u }),
                  (f = !0),
                  (a || c) && (o = !0)),
              f &&
                (h
                  ? ((i = i.add(h)), (s = d ? s.add(t) : s.delete(t)))
                  : ((i = i.delete(t)), (s = s.delete(t))));
          }),
          null !== this.query.limit)
        )
          for (; i.size > this.query.limit; ) {
            const t = "F" === this.query.limitType ? i.last() : i.first();
            (i = i.delete(t.key)),
              (s = s.delete(t.key)),
              n.track({ type: 1, doc: t });
          }
        return { wa: i, Da: n, ls: o, mutatedKeys: s };
      }
      va(t, e) {
        return (
          t.hasLocalMutations && e.hasCommittedMutations && !e.hasLocalMutations
        );
      }
      applyChanges(t, e, n, r) {
        const s = this.wa;
        (this.wa = t.wa), (this.mutatedKeys = t.mutatedKeys);
        const i = t.Da.X_();
        i.sort(
          (t, e) =>
            (function (t, e) {
              const n = (t) => {
                switch (t) {
                  case 0:
                    return 1;
                  case 2:
                  case 3:
                    return 2;
                  case 1:
                    return 0;
                  default:
                    return ce();
                }
              };
              return n(t) - n(e);
            })(t.type, e.type) || this.ya(t.doc, e.doc),
        ),
          this.Ca(n),
          (r = null != r && r);
        const o = e && !r ? this.Fa() : [],
          a = 0 === this.pa.size && this.current && !r ? 1 : 0,
          c = a !== this.ga;
        return (
          (this.ga = a),
          0 !== i.length || c
            ? {
                snapshot: new Ta(
                  this.query,
                  t.wa,
                  s,
                  i,
                  t.mutatedKeys,
                  0 === a,
                  c,
                  !1,
                  !!n && n.resumeToken.approximateByteSize() > 0,
                ),
                Ma: o,
              }
            : { Ma: o }
        );
      }
      sa(t) {
        return this.current && "Offline" === t
          ? ((this.current = !1),
            this.applyChanges(
              {
                wa: this.wa,
                Da: new _a(),
                mutatedKeys: this.mutatedKeys,
                ls: !1,
              },
              !1,
            ))
          : { Ma: [] };
      }
      xa(t) {
        return (
          !this.fa.has(t) &&
          !!this.wa.has(t) &&
          !this.wa.get(t).hasLocalMutations
        );
      }
      Ca(t) {
        t &&
          (t.addedDocuments.forEach((t) => (this.fa = this.fa.add(t))),
          t.modifiedDocuments.forEach((t) => {}),
          t.removedDocuments.forEach((t) => (this.fa = this.fa.delete(t))),
          (this.current = t.current));
      }
      Fa() {
        if (!this.current) return [];
        const t = this.pa;
        (this.pa = ns()),
          this.wa.forEach((t) => {
            this.xa(t.key) && (this.pa = this.pa.add(t.key));
          });
        const e = [];
        return (
          t.forEach((t) => {
            this.pa.has(t) || e.push(new Pa(t));
          }),
          this.pa.forEach((n) => {
            t.has(n) || e.push(new Ma(n));
          }),
          e
        );
      }
      Oa(t) {
        (this.fa = t.gs), (this.pa = ns());
        const e = this.ba(t.documents);
        return this.applyChanges(e, !0);
      }
      Na() {
        return Ta.fromInitialDocuments(
          this.query,
          this.wa,
          this.mutatedKeys,
          0 === this.ga,
          this.hasCachedResults,
        );
      }
    }
    const Fa = "SyncEngine";
    class Ua {
      constructor(t, e, n) {
        (this.query = t), (this.targetId = e), (this.view = n);
      }
    }
    class Ba {
      constructor(t) {
        (this.key = t), (this.Ba = !1);
      }
    }
    class ja {
      constructor(t, e, n, r, s, i) {
        (this.localStore = t),
          (this.remoteStore = e),
          (this.eventManager = n),
          (this.sharedClientState = r),
          (this.currentUser = s),
          (this.maxConcurrentLimboResolutions = i),
          (this.La = {}),
          (this.ka = new Kr((t) => Br(t), Ur)),
          (this.qa = new Map()),
          (this.Qa = new Set()),
          (this.$a = new gn(Ue.comparator)),
          (this.Ua = new Map()),
          (this.Ka = new Zi()),
          (this.Wa = {}),
          (this.Ga = new Map()),
          (this.za = ji.Kn()),
          (this.onlineState = "Unknown"),
          (this.ja = void 0);
      }
      get isPrimaryClient() {
        return !0 === this.ja;
      }
    }
    async function qa(t, e, n = !0) {
      const r = cc(t);
      let s;
      const i = r.ka.get(e);
      return (
        i
          ? (r.sharedClientState.addLocalQueryTarget(i.targetId),
            (s = i.view.Na()))
          : (s = await za(r, e, n, !0)),
        s
      );
    }
    async function $a(t, e) {
      const n = cc(t);
      await za(n, e, !0, !1);
    }
    async function za(t, e, n, r) {
      const s = await (function (t, e) {
          const n = he(t);
          return n.persistence
            .runTransaction("Allocate target", "readwrite", (t) => {
              let r;
              return n.Hr.getTargetData(t, e).next((s) =>
                s
                  ? ((r = s), Ke.resolve(r))
                  : n.Hr.allocateTargetId(t).next(
                      (s) => (
                        (r = new Ri(
                          e,
                          s,
                          "TargetPurposeListen",
                          t.currentSequenceNumber,
                        )),
                        n.Hr.addTargetData(t, r).next(() => r)
                      ),
                    ),
              );
            })
            .then((t) => {
              const r = n.Ts.get(t.targetId);
              return (
                (null === r ||
                  t.snapshotVersion.compareTo(r.snapshotVersion) > 0) &&
                  ((n.Ts = n.Ts.insert(t.targetId, t)),
                  n.Is.set(e, t.targetId)),
                t
              );
            });
        })(t.localStore, Vr(e)),
        i = s.targetId,
        o = t.sharedClientState.addLocalQueryTarget(i, n);
      let a;
      return (
        r &&
          (a = await (async function (t, e, n, r, s) {
            t.Ha = (e, n, r) =>
              (async function (t, e, n, r) {
                let s = e.view.ba(n);
                s.ls &&
                  (s = await wo(t.localStore, e.query, !1).then(
                    ({ documents: t }) => e.view.ba(t, s),
                  ));
                const i = r && r.targetChanges.get(e.targetId),
                  o = r && null != r.targetMismatches.get(e.targetId),
                  a = e.view.applyChanges(s, t.isPrimaryClient, i, o);
                return nc(t, e.targetId, a.Ma), a.snapshot;
              })(t, e, n, r);
            const i = await wo(t.localStore, e, !0),
              o = new Va(e, i.gs),
              a = o.ba(i.documents),
              c = Qs.createSynthesizedTargetChangeForCurrentChange(
                n,
                r && "Offline" !== t.onlineState,
                s,
              ),
              u = o.applyChanges(a, t.isPrimaryClient, c);
            nc(t, n, u.Ma);
            const h = new Ua(e, n, o);
            return (
              t.ka.set(e, h),
              t.qa.has(n) ? t.qa.get(n).push(e) : t.qa.set(n, [e]),
              u.snapshot
            );
          })(t, e, i, "current" === o, s.resumeToken)),
        t.isPrimaryClient && n && Go(t.remoteStore, s),
        a
      );
    }
    async function Ka(t, e, n) {
      const r = he(t),
        s = r.ka.get(e),
        i = r.qa.get(s.targetId);
      if (i.length > 1)
        return (
          r.qa.set(
            s.targetId,
            i.filter((t) => !Ur(t, e)),
          ),
          void r.ka.delete(e)
        );
      r.isPrimaryClient
        ? (r.sharedClientState.removeLocalQueryTarget(s.targetId),
          r.sharedClientState.isActiveQueryTarget(s.targetId) ||
            (await vo(r.localStore, s.targetId, !1)
              .then(() => {
                r.sharedClientState.clearQueryState(s.targetId),
                  n && Qo(r.remoteStore, s.targetId),
                  tc(r, s.targetId);
              })
              .catch(ze)))
        : (tc(r, s.targetId), await vo(r.localStore, s.targetId, !0));
    }
    async function Ha(t, e) {
      const n = he(t),
        r = n.ka.get(e),
        s = n.qa.get(r.targetId);
      n.isPrimaryClient &&
        1 === s.length &&
        (n.sharedClientState.removeLocalQueryTarget(r.targetId),
        Qo(n.remoteStore, r.targetId));
    }
    async function Ga(t, e) {
      const n = he(t);
      try {
        const t = await (function (t, e) {
          const n = he(t),
            r = e.snapshotVersion;
          let s = n.Ts;
          return n.persistence
            .runTransaction("Apply remote event", "readwrite-primary", (t) => {
              const i = n.ds.newChangeBuffer({ trackRemovals: !0 });
              s = n.Ts;
              const o = [];
              e.targetChanges.forEach((i, a) => {
                const c = s.get(a);
                if (!c) return;
                o.push(
                  n.Hr.removeMatchingKeys(t, i.removedDocuments, a).next(() =>
                    n.Hr.addMatchingKeys(t, i.addedDocuments, a),
                  ),
                );
                let u = c.withSequenceNumber(t.currentSequenceNumber);
                null !== e.targetMismatches.get(a)
                  ? (u = u
                      .withResumeToken(En.EMPTY_BYTE_STRING, Le.min())
                      .withLastLimboFreeSnapshotVersion(Le.min()))
                  : i.resumeToken.approximateByteSize() > 0 &&
                    (u = u.withResumeToken(i.resumeToken, r)),
                  (s = s.insert(a, u)),
                  (function (t, e, n) {
                    return (
                      0 === t.resumeToken.approximateByteSize() ||
                      e.snapshotVersion.toMicroseconds() -
                        t.snapshotVersion.toMicroseconds() >=
                        3e8 ||
                      n.addedDocuments.size +
                        n.modifiedDocuments.size +
                        n.removedDocuments.size >
                        0
                    );
                  })(c, u, i) && o.push(n.Hr.updateTargetData(t, u));
              });
              let a = Gr(),
                c = ns();
              if (
                (e.documentUpdates.forEach((r) => {
                  e.resolvedLimboDocuments.has(r) &&
                    o.push(
                      n.persistence.referenceDelegate.updateLimboDocument(t, r),
                    );
                }),
                o.push(
                  (function (t, e, n) {
                    let r = ns(),
                      s = ns();
                    return (
                      n.forEach((t) => (r = r.add(t))),
                      e.getEntries(t, r).next((t) => {
                        let r = Gr();
                        return (
                          n.forEach((n, i) => {
                            const o = t.get(n);
                            i.isFoundDocument() !== o.isFoundDocument() &&
                              (s = s.add(n)),
                              i.isNoDocument() && i.version.isEqual(Le.min())
                                ? (e.removeEntry(n, i.readTime),
                                  (r = r.insert(n, i)))
                                : !o.isValidDocument() ||
                                    i.version.compareTo(o.version) > 0 ||
                                    (0 === i.version.compareTo(o.version) &&
                                      o.hasPendingWrites)
                                  ? (e.addEntry(i), (r = r.insert(n, i)))
                                  : se(
                                      fo,
                                      "Ignoring outdated watch update for ",
                                      n,
                                      ". Current version:",
                                      o.version,
                                      " Watch version:",
                                      i.version,
                                    );
                          }),
                          { Vs: r, fs: s }
                        );
                      })
                    );
                  })(t, i, e.documentUpdates).next((t) => {
                    (a = t.Vs), (c = t.fs);
                  }),
                ),
                !r.isEqual(Le.min()))
              ) {
                const e = n.Hr.getLastRemoteSnapshotVersion(t).next((e) =>
                  n.Hr.setTargetsMetadata(t, t.currentSequenceNumber, r),
                );
                o.push(e);
              }
              return Ke.waitFor(o)
                .next(() => i.apply(t))
                .next(() => n.localDocuments.getLocalViewOfDocuments(t, a, c))
                .next(() => a);
            })
            .then((t) => ((n.Ts = s), t));
        })(n.localStore, e);
        e.targetChanges.forEach((t, e) => {
          const r = n.Ua.get(e);
          r &&
            (ue(
              t.addedDocuments.size +
                t.modifiedDocuments.size +
                t.removedDocuments.size <=
                1,
            ),
            t.addedDocuments.size > 0
              ? (r.Ba = !0)
              : t.modifiedDocuments.size > 0
                ? ue(r.Ba)
                : t.removedDocuments.size > 0 && (ue(r.Ba), (r.Ba = !1)));
        }),
          await ic(n, t, e);
      } catch (t) {
        await ze(t);
      }
    }
    function Qa(t, e, n) {
      const r = he(t);
      if ((r.isPrimaryClient && 0 === n) || (!r.isPrimaryClient && 1 === n)) {
        const t = [];
        r.ka.forEach((n, r) => {
          const s = r.view.sa(e);
          s.snapshot && t.push(s.snapshot);
        }),
          (function (t, e) {
            const n = he(t);
            n.onlineState = e;
            let r = !1;
            n.queries.forEach((t, n) => {
              for (const t of n.ta) t.sa(e) && (r = !0);
            }),
              r && xa(n);
          })(r.eventManager, e),
          t.length && r.La.p_(t),
          (r.onlineState = e),
          r.isPrimaryClient && r.sharedClientState.setOnlineState(e);
      }
    }
    async function Wa(t, e, n) {
      const r = he(t);
      r.sharedClientState.updateQueryState(e, "rejected", n);
      const s = r.Ua.get(e),
        i = s && s.key;
      if (i) {
        let t = new gn(Ue.comparator);
        t = t.insert(i, or.newNoDocument(i, Le.min()));
        const n = ns().add(i),
          s = new Gs(Le.min(), new Map(), new gn(Ce), t, n);
        await Ga(r, s), (r.$a = r.$a.remove(i)), r.Ua.delete(e), sc(r);
      } else
        await vo(r.localStore, e, !1)
          .then(() => tc(r, e, n))
          .catch(ze);
    }
    async function Xa(t, e) {
      const n = he(t),
        r = e.batch.batchId;
      try {
        const t = await (function (t, e) {
          const n = he(t);
          return n.persistence.runTransaction(
            "Acknowledge batch",
            "readwrite-primary",
            (t) => {
              const r = e.batch.keys(),
                s = n.ds.newChangeBuffer({ trackRemovals: !0 });
              return (function (t, e, n, r) {
                const s = n.batch,
                  i = s.keys();
                let o = Ke.resolve();
                return (
                  i.forEach((t) => {
                    o = o
                      .next(() => r.getEntry(e, t))
                      .next((e) => {
                        const i = n.docVersions.get(t);
                        ue(null !== i),
                          e.version.compareTo(i) < 0 &&
                            (s.applyToRemoteDocument(e, n),
                            e.isValidDocument() &&
                              (e.setReadTime(n.commitVersion), r.addEntry(e)));
                      });
                  }),
                  o.next(() => t.mutationQueue.removeMutationBatch(e, s))
                );
              })(n, t, e, s)
                .next(() => s.apply(t))
                .next(() => n.mutationQueue.performConsistencyCheck(t))
                .next(() =>
                  n.documentOverlayCache.removeOverlaysForBatchId(
                    t,
                    r,
                    e.batch.batchId,
                  ),
                )
                .next(() =>
                  n.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(
                    t,
                    (function (t) {
                      let e = ns();
                      for (let n = 0; n < t.mutationResults.length; ++n)
                        t.mutationResults[n].transformResults.length > 0 &&
                          (e = e.add(t.batch.mutations[n].key));
                      return e;
                    })(e),
                  ),
                )
                .next(() => n.localDocuments.getDocuments(t, r));
            },
          );
        })(n.localStore, e);
        Za(n, r, null),
          Ja(n, r),
          n.sharedClientState.updateMutationState(r, "acknowledged"),
          await ic(n, t);
      } catch (t) {
        await ze(t);
      }
    }
    async function Ya(t, e, n) {
      const r = he(t);
      try {
        const t = await (function (t, e) {
          const n = he(t);
          return n.persistence.runTransaction(
            "Reject batch",
            "readwrite-primary",
            (t) => {
              let r;
              return n.mutationQueue
                .lookupMutationBatch(t, e)
                .next(
                  (e) => (
                    ue(null !== e),
                    (r = e.keys()),
                    n.mutationQueue.removeMutationBatch(t, e)
                  ),
                )
                .next(() => n.mutationQueue.performConsistencyCheck(t))
                .next(() =>
                  n.documentOverlayCache.removeOverlaysForBatchId(t, r, e),
                )
                .next(() =>
                  n.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(
                    t,
                    r,
                  ),
                )
                .next(() => n.localDocuments.getDocuments(t, r));
            },
          );
        })(r.localStore, e);
        Za(r, e, n),
          Ja(r, e),
          r.sharedClientState.updateMutationState(e, "rejected", n),
          await ic(r, t);
      } catch (n) {
        await ze(n);
      }
    }
    function Ja(t, e) {
      (t.Ga.get(e) || []).forEach((t) => {
        t.resolve();
      }),
        t.Ga.delete(e);
    }
    function Za(t, e, n) {
      const r = he(t);
      let s = r.Wa[r.currentUser.toKey()];
      if (s) {
        const t = s.get(e);
        t && (n ? t.reject(n) : t.resolve(), (s = s.remove(e))),
          (r.Wa[r.currentUser.toKey()] = s);
      }
    }
    function tc(t, e, n = null) {
      t.sharedClientState.removeLocalQueryTarget(e);
      for (const r of t.qa.get(e)) t.ka.delete(r), n && t.La.Ja(r, n);
      t.qa.delete(e),
        t.isPrimaryClient &&
          t.Ka.br(e).forEach((e) => {
            t.Ka.containsKey(e) || ec(t, e);
          });
    }
    function ec(t, e) {
      t.Qa.delete(e.path.canonicalString());
      const n = t.$a.get(e);
      null !== n &&
        (Qo(t.remoteStore, n), (t.$a = t.$a.remove(e)), t.Ua.delete(n), sc(t));
    }
    function nc(t, e, n) {
      for (const r of n)
        r instanceof Ma
          ? (t.Ka.addReference(r.key, e), rc(t, r))
          : r instanceof Pa
            ? (se(Fa, "Document no longer in limbo: " + r.key),
              t.Ka.removeReference(r.key, e),
              t.Ka.containsKey(r.key) || ec(t, r.key))
            : ce();
    }
    function rc(t, e) {
      const n = e.key,
        r = n.path.canonicalString();
      t.$a.get(n) ||
        t.Qa.has(r) ||
        (se(Fa, "New document in limbo: " + n), t.Qa.add(r), sc(t));
    }
    function sc(t) {
      for (; t.Qa.size > 0 && t.$a.size < t.maxConcurrentLimboResolutions; ) {
        const e = t.Qa.values().next().value;
        t.Qa.delete(e);
        const n = new Ue(Pe.fromString(e)),
          r = t.za.next();
        t.Ua.set(r, new Ba(n)),
          (t.$a = t.$a.insert(n, r)),
          Go(
            t.remoteStore,
            new Ri(Vr(Or(n.path)), r, "TargetPurposeLimboResolution", Ge.ae),
          );
      }
    }
    async function ic(t, e, n) {
      const r = he(t),
        s = [],
        i = [],
        o = [];
      r.ka.isEmpty() ||
        (r.ka.forEach((t, a) => {
          o.push(
            r.Ha(a, e, n).then((t) => {
              var e;
              if ((t || n) && r.isPrimaryClient) {
                const s = t
                  ? !t.fromCache
                  : null ===
                        (e =
                          null == n
                            ? void 0
                            : n.targetChanges.get(a.targetId)) || void 0 === e
                    ? void 0
                    : e.current;
                r.sharedClientState.updateQueryState(
                  a.targetId,
                  s ? "current" : "not-current",
                );
              }
              if (t) {
                s.push(t);
                const e = uo.Yi(a.targetId, t);
                i.push(e);
              }
            }),
          );
        }),
        await Promise.all(o),
        r.La.p_(s),
        await (async function (t, e) {
          const n = he(t);
          try {
            await n.persistence.runTransaction(
              "notifyLocalViewChanges",
              "readwrite",
              (t) =>
                Ke.forEach(e, (e) =>
                  Ke.forEach(e.Hi, (r) =>
                    n.persistence.referenceDelegate.addReference(
                      t,
                      e.targetId,
                      r,
                    ),
                  ).next(() =>
                    Ke.forEach(e.Ji, (r) =>
                      n.persistence.referenceDelegate.removeReference(
                        t,
                        e.targetId,
                        r,
                      ),
                    ),
                  ),
                ),
            );
          } catch (t) {
            if (!He(t)) throw t;
            se(fo, "Failed to update sequence numbers: " + t);
          }
          for (const t of e) {
            const e = t.targetId;
            if (!t.fromCache) {
              const t = n.Ts.get(e),
                r = t.snapshotVersion,
                s = t.withLastLimboFreeSnapshotVersion(r);
              n.Ts = n.Ts.insert(e, s);
            }
          }
        })(r.localStore, i));
    }
    async function oc(t, e) {
      const n = he(t);
      if (!n.currentUser.isEqual(e)) {
        se(Fa, "User change. New user:", e.toKey());
        const t = await po(n.localStore, e);
        (n.currentUser = e),
          (function (t) {
            t.Ga.forEach((t) => {
              t.forEach((t) => {
                t.reject(
                  new de(
                    le.CANCELLED,
                    "'waitForPendingWrites' promise is rejected due to a user change.",
                  ),
                );
              });
            }),
              t.Ga.clear();
          })(n),
          n.sharedClientState.handleUserChange(
            e,
            t.removedBatchIds,
            t.addedBatchIds,
          ),
          await ic(n, t.Rs);
      }
    }
    function ac(t, e) {
      const n = he(t),
        r = n.Ua.get(e);
      if (r && r.Ba) return ns().add(r.key);
      {
        let t = ns();
        const r = n.qa.get(e);
        if (!r) return t;
        for (const e of r) {
          const r = n.ka.get(e);
          t = t.unionWith(r.view.Sa);
        }
        return t;
      }
    }
    function cc(t) {
      const e = he(t);
      return (
        (e.remoteStore.remoteSyncer.applyRemoteEvent = Ga.bind(null, e)),
        (e.remoteStore.remoteSyncer.getRemoteKeysForTarget = ac.bind(null, e)),
        (e.remoteStore.remoteSyncer.rejectListen = Wa.bind(null, e)),
        (e.La.p_ = ka.bind(null, e.eventManager)),
        (e.La.Ja = Na.bind(null, e.eventManager)),
        e
      );
    }
    function uc(t) {
      const e = he(t);
      return (
        (e.remoteStore.remoteSyncer.applySuccessfulWrite = Xa.bind(null, e)),
        (e.remoteStore.remoteSyncer.rejectFailedWrite = Ya.bind(null, e)),
        e
      );
    }
    class hc {
      constructor() {
        (this.kind = "memory"), (this.synchronizeTabs = !1);
      }
      async initialize(t) {
        (this.serializer = Oo(t.databaseInfo.databaseId)),
          (this.sharedClientState = this.Za(t)),
          (this.persistence = this.Xa(t)),
          await this.persistence.start(),
          (this.localStore = this.eu(t)),
          (this.gcScheduler = this.tu(t, this.localStore)),
          (this.indexBackfillerScheduler = this.nu(t, this.localStore));
      }
      tu(t, e) {
        return null;
      }
      nu(t, e) {
        return null;
      }
      eu(t) {
        return (function (t, e, n, r) {
          return new go(t, e, n, r);
        })(this.persistence, new lo(), t.initialUser, this.serializer);
      }
      Xa(t) {
        return new io(ao.ri, this.serializer);
      }
      Za(t) {
        return new Eo();
      }
      async terminate() {
        var t, e;
        null === (t = this.gcScheduler) || void 0 === t || t.stop(),
          null === (e = this.indexBackfillerScheduler) ||
            void 0 === e ||
            e.stop(),
          this.sharedClientState.shutdown(),
          await this.persistence.shutdown();
      }
    }
    hc.provider = { build: () => new hc() };
    class lc extends hc {
      constructor(t) {
        super(), (this.cacheSizeBytes = t);
      }
      tu(t, e) {
        ue(this.persistence.referenceDelegate instanceof co);
        const n = this.persistence.referenceDelegate.garbageCollector;
        return new Ki(n, t.asyncQueue, e);
      }
      Xa(t) {
        const e =
          void 0 !== this.cacheSizeBytes
            ? Bi.withCacheSize(this.cacheSizeBytes)
            : Bi.DEFAULT;
        return new io((t) => co.ri(t, e), this.serializer);
      }
    }
    class dc {
      async initialize(t, e) {
        this.localStore ||
          ((this.localStore = t.localStore),
          (this.sharedClientState = t.sharedClientState),
          (this.datastore = this.createDatastore(e)),
          (this.remoteStore = this.createRemoteStore(e)),
          (this.eventManager = this.createEventManager(e)),
          (this.syncEngine = this.createSyncEngine(e, !t.synchronizeTabs)),
          (this.sharedClientState.onlineStateHandler = (t) =>
            Qa(this.syncEngine, t, 1)),
          (this.remoteStore.remoteSyncer.handleCredentialChange = oc.bind(
            null,
            this.syncEngine,
          )),
          await (async function (t, e) {
            const n = he(t);
            e
              ? (n.W_.delete(2), await Ko(n))
              : e || (n.W_.add(2), await Ho(n), n.j_.set("Unknown"));
          })(this.remoteStore, this.syncEngine.isPrimaryClient));
      }
      createEventManager(t) {
        return new Ca();
      }
      createDatastore(t) {
        const e = Oo(t.databaseInfo.databaseId),
          n = (function (t) {
            return new Ro(t);
          })(t.databaseInfo);
        return (function (t, e, n, r) {
          return new jo(t, e, n, r);
        })(t.authCredentials, t.appCheckCredentials, n, e);
      }
      createRemoteStore(t) {
        return (function (t, e, n, r, s) {
          return new zo(t, e, n, r, s);
        })(
          this.localStore,
          this.datastore,
          t.asyncQueue,
          (t) => Qa(this.syncEngine, t, 0),
          So.D() ? new So() : new _o(),
        );
      }
      createSyncEngine(t, e) {
        return (function (t, e, n, r, s, i, o) {
          const a = new ja(t, e, n, r, s, i);
          return o && (a.ja = !0), a;
        })(
          this.localStore,
          this.remoteStore,
          this.eventManager,
          this.sharedClientState,
          t.initialUser,
          t.maxConcurrentLimboResolutions,
          e,
        );
      }
      async terminate() {
        var t, e;
        await (async function (t) {
          const e = he(t);
          se($o, "RemoteStore shutting down."),
            e.W_.add(5),
            await Ho(e),
            e.z_.shutdown(),
            e.j_.set("Unknown");
        })(this.remoteStore),
          null === (t = this.datastore) || void 0 === t || t.terminate(),
          null === (e = this.eventManager) || void 0 === e || e.terminate();
      }
    }
    dc.provider = { build: () => new dc() };
    class fc {
      constructor(t) {
        (this.observer = t), (this.muted = !1);
      }
      next(t) {
        this.muted || (this.observer.next && this.iu(this.observer.next, t));
      }
      error(t) {
        this.muted ||
          (this.observer.error
            ? this.iu(this.observer.error, t)
            : ie("Uncaught Error in snapshot listener:", t.toString()));
      }
      su() {
        this.muted = !0;
      }
      iu(t, e) {
        setTimeout(() => {
          this.muted || t(e);
        }, 0);
      }
    }
    const gc = "FirestoreClient";
    class pc {
      constructor(t, e, n, r, s) {
        (this.authCredentials = t),
          (this.appCheckCredentials = e),
          (this.asyncQueue = n),
          (this.databaseInfo = r),
          (this.user = te.UNAUTHENTICATED),
          (this.clientId = Se.newId()),
          (this.authCredentialListener = () => Promise.resolve()),
          (this.appCheckCredentialListener = () => Promise.resolve()),
          (this._uninitializedComponentsProvider = s),
          this.authCredentials.start(n, async (t) => {
            se(gc, "Received user=", t.uid),
              await this.authCredentialListener(t),
              (this.user = t);
          }),
          this.appCheckCredentials.start(
            n,
            (t) => (
              se(gc, "Received new app check token=", t),
              this.appCheckCredentialListener(t, this.user)
            ),
          );
      }
      get configuration() {
        return {
          asyncQueue: this.asyncQueue,
          databaseInfo: this.databaseInfo,
          clientId: this.clientId,
          authCredentials: this.authCredentials,
          appCheckCredentials: this.appCheckCredentials,
          initialUser: this.user,
          maxConcurrentLimboResolutions: 100,
        };
      }
      setCredentialChangeListener(t) {
        this.authCredentialListener = t;
      }
      setAppCheckTokenChangeListener(t) {
        this.appCheckCredentialListener = t;
      }
      terminate() {
        this.asyncQueue.enterRestrictedMode();
        const t = new fe();
        return (
          this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async () => {
            try {
              this._onlineComponents &&
                (await this._onlineComponents.terminate()),
                this._offlineComponents &&
                  (await this._offlineComponents.terminate()),
                this.authCredentials.shutdown(),
                this.appCheckCredentials.shutdown(),
                t.resolve();
            } catch (e) {
              const n = ba(e, "Failed to shutdown persistence");
              t.reject(n);
            }
          }),
          t.promise
        );
      }
    }
    async function mc(t, e) {
      t.asyncQueue.verifyOperationInProgress(),
        se(gc, "Initializing OfflineComponentProvider");
      const n = t.configuration;
      await e.initialize(n);
      let r = n.initialUser;
      t.setCredentialChangeListener(async (t) => {
        r.isEqual(t) || (await po(e.localStore, t), (r = t));
      }),
        e.persistence.setDatabaseDeletedListener(() => t.terminate()),
        (t._offlineComponents = e);
    }
    async function yc(t, e) {
      t.asyncQueue.verifyOperationInProgress();
      const n = await (async function (t) {
        if (!t._offlineComponents)
          if (t._uninitializedComponentsProvider) {
            se(gc, "Using user provided OfflineComponentProvider");
            try {
              await mc(t, t._uninitializedComponentsProvider._offline);
            } catch (e) {
              const n = e;
              if (
                !(function (t) {
                  return "FirebaseError" === t.name
                    ? t.code === le.FAILED_PRECONDITION ||
                        t.code === le.UNIMPLEMENTED
                    : !(
                        "undefined" != typeof DOMException &&
                        t instanceof DOMException
                      ) ||
                        22 === t.code ||
                        20 === t.code ||
                        11 === t.code;
                })(n)
              )
                throw n;
              oe(
                "Error using user provided cache. Falling back to memory cache: " +
                  n,
              ),
                await mc(t, new hc());
            }
          } else
            se(gc, "Using default OfflineComponentProvider"),
              await mc(t, new lc(void 0));
        return t._offlineComponents;
      })(t);
      se(gc, "Initializing OnlineComponentProvider"),
        await e.initialize(n, t.configuration),
        t.setCredentialChangeListener((t) => ma(e.remoteStore, t)),
        t.setAppCheckTokenChangeListener((t, n) => ma(e.remoteStore, n)),
        (t._onlineComponents = e);
    }
    async function vc(t) {
      return (
        t._onlineComponents ||
          (t._uninitializedComponentsProvider
            ? (se(gc, "Using user provided OnlineComponentProvider"),
              await yc(t, t._uninitializedComponentsProvider._online))
            : (se(gc, "Using default OnlineComponentProvider"),
              await yc(t, new dc()))),
        t._onlineComponents
      );
    }
    async function wc(t) {
      const e = await vc(t),
        n = e.eventManager;
      return (
        (n.onListen = qa.bind(null, e.syncEngine)),
        (n.onUnlisten = Ka.bind(null, e.syncEngine)),
        (n.onFirstRemoteStoreListen = $a.bind(null, e.syncEngine)),
        (n.onLastRemoteStoreUnlisten = Ha.bind(null, e.syncEngine)),
        n
      );
    }
    function bc(t) {
      const e = {};
      return (
        void 0 !== t.timeoutSeconds && (e.timeoutSeconds = t.timeoutSeconds), e
      );
    }
    const Ec = new Map();
    function _c(t, e, n) {
      if (!n)
        throw new de(
          le.INVALID_ARGUMENT,
          `Function ${t}() cannot be called with an empty ${e}.`,
        );
    }
    function Tc(t) {
      if (!Ue.isDocumentKey(t))
        throw new de(
          le.INVALID_ARGUMENT,
          `Invalid document reference. Document references must have an even number of segments, but ${t} has ${t.length}.`,
        );
    }
    function Sc(t) {
      if (Ue.isDocumentKey(t))
        throw new de(
          le.INVALID_ARGUMENT,
          `Invalid collection reference. Collection references must have an odd number of segments, but ${t} has ${t.length}.`,
        );
    }
    function Cc(t) {
      if (void 0 === t) return "undefined";
      if (null === t) return "null";
      if ("string" == typeof t)
        return (
          t.length > 20 && (t = `${t.substring(0, 20)}...`), JSON.stringify(t)
        );
      if ("number" == typeof t || "boolean" == typeof t) return "" + t;
      if ("object" == typeof t) {
        if (t instanceof Array) return "an array";
        {
          const e = (function (t) {
            return t.constructor ? t.constructor.name : null;
          })(t);
          return e ? `a custom ${e} object` : "an object";
        }
      }
      return "function" == typeof t ? "a function" : ce();
    }
    function Ic(t, e) {
      if (("_delegate" in t && (t = t._delegate), !(t instanceof e))) {
        if (e.name === t.constructor.name)
          throw new de(
            le.INVALID_ARGUMENT,
            "Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?",
          );
        {
          const n = Cc(t);
          throw new de(
            le.INVALID_ARGUMENT,
            `Expected type '${e.name}', but it was: ${n}`,
          );
        }
      }
      return t;
    }
    const Ac = "firestore.googleapis.com",
      Dc = !0;
    class kc {
      constructor(t) {
        var e, n;
        if (void 0 === t.host) {
          if (void 0 !== t.ssl)
            throw new de(
              le.INVALID_ARGUMENT,
              "Can't provide ssl option if host option is not set",
            );
          (this.host = Ac), (this.ssl = Dc);
        } else
          (this.host = t.host),
            (this.ssl = null !== (e = t.ssl) && void 0 !== e ? e : Dc);
        if (
          ((this.credentials = t.credentials),
          (this.ignoreUndefinedProperties = !!t.ignoreUndefinedProperties),
          (this.localCache = t.localCache),
          void 0 === t.cacheSizeBytes)
        )
          this.cacheSizeBytes = Ui;
        else {
          if (-1 !== t.cacheSizeBytes && t.cacheSizeBytes < 1048576)
            throw new de(
              le.INVALID_ARGUMENT,
              "cacheSizeBytes must be at least 1048576",
            );
          this.cacheSizeBytes = t.cacheSizeBytes;
        }
        (function (t, e, n, r) {
          if (!0 === e && !0 === r)
            throw new de(
              le.INVALID_ARGUMENT,
              "experimentalForceLongPolling and experimentalAutoDetectLongPolling cannot be used together.",
            );
        })(
          0,
          t.experimentalForceLongPolling,
          0,
          t.experimentalAutoDetectLongPolling,
        ),
          (this.experimentalForceLongPolling =
            !!t.experimentalForceLongPolling),
          this.experimentalForceLongPolling
            ? (this.experimentalAutoDetectLongPolling = !1)
            : void 0 === t.experimentalAutoDetectLongPolling
              ? (this.experimentalAutoDetectLongPolling = !0)
              : (this.experimentalAutoDetectLongPolling =
                  !!t.experimentalAutoDetectLongPolling),
          (this.experimentalLongPollingOptions = bc(
            null !== (n = t.experimentalLongPollingOptions) && void 0 !== n
              ? n
              : {},
          )),
          (function (t) {
            if (void 0 !== t.timeoutSeconds) {
              if (isNaN(t.timeoutSeconds))
                throw new de(
                  le.INVALID_ARGUMENT,
                  `invalid long polling timeout: ${t.timeoutSeconds} (must not be NaN)`,
                );
              if (t.timeoutSeconds < 5)
                throw new de(
                  le.INVALID_ARGUMENT,
                  `invalid long polling timeout: ${t.timeoutSeconds} (minimum allowed value is 5)`,
                );
              if (t.timeoutSeconds > 30)
                throw new de(
                  le.INVALID_ARGUMENT,
                  `invalid long polling timeout: ${t.timeoutSeconds} (maximum allowed value is 30)`,
                );
            }
          })(this.experimentalLongPollingOptions),
          (this.useFetchStreams = !!t.useFetchStreams);
      }
      isEqual(t) {
        return (
          this.host === t.host &&
          this.ssl === t.ssl &&
          this.credentials === t.credentials &&
          this.cacheSizeBytes === t.cacheSizeBytes &&
          this.experimentalForceLongPolling ===
            t.experimentalForceLongPolling &&
          this.experimentalAutoDetectLongPolling ===
            t.experimentalAutoDetectLongPolling &&
          (function (t, e) {
            return t.timeoutSeconds === e.timeoutSeconds;
          })(
            this.experimentalLongPollingOptions,
            t.experimentalLongPollingOptions,
          ) &&
          this.ignoreUndefinedProperties === t.ignoreUndefinedProperties &&
          this.useFetchStreams === t.useFetchStreams
        );
      }
    }
    class Nc {
      constructor(t, e, n, r) {
        (this._authCredentials = t),
          (this._appCheckCredentials = e),
          (this._databaseId = n),
          (this._app = r),
          (this.type = "firestore-lite"),
          (this._persistenceKey = "(lite)"),
          (this._settings = new kc({})),
          (this._settingsFrozen = !1),
          (this._emulatorOptions = {}),
          (this._terminateTask = "notTerminated");
      }
      get app() {
        if (!this._app)
          throw new de(
            le.FAILED_PRECONDITION,
            "Firestore was not initialized using the Firebase SDK. 'app' is not available",
          );
        return this._app;
      }
      get _initialized() {
        return this._settingsFrozen;
      }
      get _terminated() {
        return "notTerminated" !== this._terminateTask;
      }
      _setSettings(t) {
        if (this._settingsFrozen)
          throw new de(
            le.FAILED_PRECONDITION,
            "Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.",
          );
        (this._settings = new kc(t)),
          (this._emulatorOptions = t.emulatorOptions || {}),
          void 0 !== t.credentials &&
            (this._authCredentials = (function (t) {
              if (!t) return new pe();
              switch (t.type) {
                case "firstParty":
                  return new we(
                    t.sessionIndex || "0",
                    t.iamToken || null,
                    t.authTokenFactory || null,
                  );
                case "provider":
                  return t.client;
                default:
                  throw new de(
                    le.INVALID_ARGUMENT,
                    "makeAuthCredentialsProvider failed due to invalid credential type",
                  );
              }
            })(t.credentials));
      }
      _getSettings() {
        return this._settings;
      }
      _getEmulatorOptions() {
        return this._emulatorOptions;
      }
      _freezeSettings() {
        return (this._settingsFrozen = !0), this._settings;
      }
      _delete() {
        return (
          "notTerminated" === this._terminateTask &&
            (this._terminateTask = this._terminate()),
          this._terminateTask
        );
      }
      async _restart() {
        "notTerminated" === this._terminateTask
          ? await this._terminate()
          : (this._terminateTask = "notTerminated");
      }
      toJSON() {
        return {
          app: this._app,
          databaseId: this._databaseId,
          settings: this._settings,
        };
      }
      _terminate() {
        return (
          (function (t) {
            const e = Ec.get(t);
            e &&
              (se("ComponentProvider", "Removing Datastore"),
              Ec.delete(t),
              e.terminate());
          })(this),
          Promise.resolve()
        );
      }
    }
    class xc {
      constructor(t, e, n) {
        (this.converter = e),
          (this._query = n),
          (this.type = "query"),
          (this.firestore = t);
      }
      withConverter(t) {
        return new xc(this.firestore, t, this._query);
      }
    }
    class Rc {
      constructor(t, e, n) {
        (this.converter = e),
          (this._key = n),
          (this.type = "document"),
          (this.firestore = t);
      }
      get _path() {
        return this._key.path;
      }
      get id() {
        return this._key.path.lastSegment();
      }
      get path() {
        return this._key.path.canonicalString();
      }
      get parent() {
        return new Lc(this.firestore, this.converter, this._key.path.popLast());
      }
      withConverter(t) {
        return new Rc(this.firestore, t, this._key);
      }
    }
    class Lc extends xc {
      constructor(t, e, n) {
        super(t, e, Or(n)), (this._path = n), (this.type = "collection");
      }
      get id() {
        return this._query.path.lastSegment();
      }
      get path() {
        return this._query.path.canonicalString();
      }
      get parent() {
        const t = this._path.popLast();
        return t.isEmpty() ? null : new Rc(this.firestore, null, new Ue(t));
      }
      withConverter(t) {
        return new Lc(this.firestore, t, this._path);
      }
    }
    function Oc(t, e, ...n) {
      if (
        ((t = g(t)),
        1 === arguments.length && (e = Se.newId()),
        _c("doc", "path", e),
        t instanceof Nc)
      ) {
        const r = Pe.fromString(e, ...n);
        return Tc(r), new Rc(t, null, new Ue(r));
      }
      {
        if (!(t instanceof Rc || t instanceof Lc))
          throw new de(
            le.INVALID_ARGUMENT,
            "Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore",
          );
        const r = t._path.child(Pe.fromString(e, ...n));
        return (
          Tc(r),
          new Rc(t.firestore, t instanceof Lc ? t.converter : null, new Ue(r))
        );
      }
    }
    const Mc = "AsyncQueue";
    class Pc {
      constructor(t = Promise.resolve()) {
        (this.Vu = []),
          (this.mu = !1),
          (this.fu = []),
          (this.gu = null),
          (this.pu = !1),
          (this.yu = !1),
          (this.wu = []),
          (this.a_ = new Mo(this, "async_queue_retry")),
          (this.Su = () => {
            const t = Lo();
            t && se(Mc, "Visibility state changed to " + t.visibilityState),
              this.a_.t_();
          }),
          (this.bu = t);
        const e = Lo();
        e &&
          "function" == typeof e.addEventListener &&
          e.addEventListener("visibilitychange", this.Su);
      }
      get isShuttingDown() {
        return this.mu;
      }
      enqueueAndForget(t) {
        this.enqueue(t);
      }
      enqueueAndForgetEvenWhileRestricted(t) {
        this.Du(), this.vu(t);
      }
      enterRestrictedMode(t) {
        if (!this.mu) {
          (this.mu = !0), (this.yu = t || !1);
          const e = Lo();
          e &&
            "function" == typeof e.removeEventListener &&
            e.removeEventListener("visibilitychange", this.Su);
        }
      }
      enqueue(t) {
        if ((this.Du(), this.mu)) return new Promise(() => {});
        const e = new fe();
        return this.vu(() =>
          this.mu && this.yu
            ? Promise.resolve()
            : (t().then(e.resolve, e.reject), e.promise),
        ).then(() => e.promise);
      }
      enqueueRetryable(t) {
        this.enqueueAndForget(() => (this.Vu.push(t), this.Cu()));
      }
      async Cu() {
        if (0 !== this.Vu.length) {
          try {
            await this.Vu[0](), this.Vu.shift(), this.a_.reset();
          } catch (t) {
            if (!He(t)) throw t;
            se(Mc, "Operation failed with retryable error: " + t);
          }
          this.Vu.length > 0 && this.a_.Xo(() => this.Cu());
        }
      }
      vu(t) {
        const e = this.bu.then(
          () => (
            (this.pu = !0),
            t()
              .catch((t) => {
                (this.gu = t), (this.pu = !1);
                const e = (function (t) {
                  let e = t.message || "";
                  return (
                    t.stack &&
                      (e = t.stack.includes(t.message)
                        ? t.stack
                        : t.message + "\n" + t.stack),
                    e
                  );
                })(t);
                throw (ie("INTERNAL UNHANDLED ERROR: ", e), t);
              })
              .then((t) => ((this.pu = !1), t))
          ),
        );
        return (this.bu = e), e;
      }
      enqueueAfterDelay(t, e, n) {
        this.Du(), this.wu.indexOf(t) > -1 && (e = 0);
        const r = wa.createAndSchedule(this, t, e, n, (t) => this.Fu(t));
        return this.fu.push(r), r;
      }
      Du() {
        this.gu && ce();
      }
      verifyOperationInProgress() {}
      async Mu() {
        let t;
        do {
          (t = this.bu), await t;
        } while (t !== this.bu);
      }
      xu(t) {
        for (const e of this.fu) if (e.timerId === t) return !0;
        return !1;
      }
      Ou(t) {
        return this.Mu().then(() => {
          this.fu.sort((t, e) => t.targetTimeMs - e.targetTimeMs);
          for (const e of this.fu)
            if ((e.skipDelay(), "all" !== t && e.timerId === t)) break;
          return this.Mu();
        });
      }
      Nu(t) {
        this.wu.push(t);
      }
      Fu(t) {
        const e = this.fu.indexOf(t);
        this.fu.splice(e, 1);
      }
    }
    class Vc extends Nc {
      constructor(t, e, n, r) {
        super(t, e, n, r),
          (this.type = "firestore"),
          (this._queue = new Pc()),
          (this._persistenceKey = (null == r ? void 0 : r.name) || "[DEFAULT]");
      }
      async _terminate() {
        if (this._firestoreClient) {
          const t = this._firestoreClient.terminate();
          (this._queue = new Pc(t)), (this._firestoreClient = void 0), await t;
        }
      }
    }
    function Fc(t) {
      if (t._terminated)
        throw new de(
          le.FAILED_PRECONDITION,
          "The client has already been terminated.",
        );
      return (
        t._firestoreClient ||
          (function (t) {
            var e, n, r;
            const s = t._freezeSettings(),
              i = (function (t, e, n, r) {
                return new Ln(
                  t,
                  e,
                  n,
                  r.host,
                  r.ssl,
                  r.experimentalForceLongPolling,
                  r.experimentalAutoDetectLongPolling,
                  bc(r.experimentalLongPollingOptions),
                  r.useFetchStreams,
                );
              })(
                t._databaseId,
                (null === (e = t._app) || void 0 === e
                  ? void 0
                  : e.options.appId) || "",
                t._persistenceKey,
                s,
              );
            t._componentsProvider ||
              ((null === (n = s.localCache) || void 0 === n
                ? void 0
                : n._offlineComponentProvider) &&
                (null === (r = s.localCache) || void 0 === r
                  ? void 0
                  : r._onlineComponentProvider) &&
                (t._componentsProvider = {
                  _offline: s.localCache._offlineComponentProvider,
                  _online: s.localCache._onlineComponentProvider,
                })),
              (t._firestoreClient = new pc(
                t._authCredentials,
                t._appCheckCredentials,
                t._queue,
                i,
                t._componentsProvider &&
                  (function (t) {
                    const e = null == t ? void 0 : t._online.build();
                    return {
                      _offline: null == t ? void 0 : t._offline.build(e),
                      _online: e,
                    };
                  })(t._componentsProvider),
              ));
          })(t),
        t._firestoreClient
      );
    }
    class Uc {
      constructor(t) {
        this._byteString = t;
      }
      static fromBase64String(t) {
        try {
          return new Uc(En.fromBase64String(t));
        } catch (t) {
          throw new de(
            le.INVALID_ARGUMENT,
            "Failed to construct data from Base64 string: " + t,
          );
        }
      }
      static fromUint8Array(t) {
        return new Uc(En.fromUint8Array(t));
      }
      toBase64() {
        return this._byteString.toBase64();
      }
      toUint8Array() {
        return this._byteString.toUint8Array();
      }
      toString() {
        return "Bytes(base64: " + this.toBase64() + ")";
      }
      isEqual(t) {
        return this._byteString.isEqual(t._byteString);
      }
    }
    class Bc {
      constructor(...t) {
        for (let e = 0; e < t.length; ++e)
          if (0 === t[e].length)
            throw new de(
              le.INVALID_ARGUMENT,
              "Invalid field name at argument $(i + 1). Field names must not be empty.",
            );
        this._internalPath = new Fe(t);
      }
      isEqual(t) {
        return this._internalPath.isEqual(t._internalPath);
      }
    }
    class jc {
      constructor(t) {
        this._methodName = t;
      }
    }
    class qc {
      constructor(t, e) {
        if (!isFinite(t) || t < -90 || t > 90)
          throw new de(
            le.INVALID_ARGUMENT,
            "Latitude must be a number between -90 and 90, but was: " + t,
          );
        if (!isFinite(e) || e < -180 || e > 180)
          throw new de(
            le.INVALID_ARGUMENT,
            "Longitude must be a number between -180 and 180, but was: " + e,
          );
        (this._lat = t), (this._long = e);
      }
      get latitude() {
        return this._lat;
      }
      get longitude() {
        return this._long;
      }
      isEqual(t) {
        return this._lat === t._lat && this._long === t._long;
      }
      toJSON() {
        return { latitude: this._lat, longitude: this._long };
      }
      _compareTo(t) {
        return Ce(this._lat, t._lat) || Ce(this._long, t._long);
      }
    }
    class $c {
      constructor(t) {
        this._values = (t || []).map((t) => t);
      }
      toArray() {
        return this._values.map((t) => t);
      }
      isEqual(t) {
        return (function (t, e) {
          if (t.length !== e.length) return !1;
          for (let n = 0; n < t.length; ++n) if (t[n] !== e[n]) return !1;
          return !0;
        })(this._values, t._values);
      }
    }
    const zc = /^__.*__$/;
    class Kc {
      constructor(t, e, n) {
        (this.data = t), (this.fieldMask = e), (this.fieldTransforms = n);
      }
      toMutation(t, e) {
        return null !== this.fieldMask
          ? new ks(t, this.data, this.fieldMask, e, this.fieldTransforms)
          : new Ds(t, this.data, e, this.fieldTransforms);
      }
    }
    class Hc {
      constructor(t, e, n) {
        (this.data = t), (this.fieldMask = e), (this.fieldTransforms = n);
      }
      toMutation(t, e) {
        return new ks(t, this.data, this.fieldMask, e, this.fieldTransforms);
      }
    }
    function Gc(t) {
      switch (t) {
        case 0:
        case 2:
        case 1:
          return !0;
        case 3:
        case 4:
          return !1;
        default:
          throw ce();
      }
    }
    class Qc {
      constructor(t, e, n, r, s, i) {
        (this.settings = t),
          (this.databaseId = e),
          (this.serializer = n),
          (this.ignoreUndefinedProperties = r),
          void 0 === s && this.Bu(),
          (this.fieldTransforms = s || []),
          (this.fieldMask = i || []);
      }
      get path() {
        return this.settings.path;
      }
      get Lu() {
        return this.settings.Lu;
      }
      ku(t) {
        return new Qc(
          Object.assign(Object.assign({}, this.settings), t),
          this.databaseId,
          this.serializer,
          this.ignoreUndefinedProperties,
          this.fieldTransforms,
          this.fieldMask,
        );
      }
      qu(t) {
        var e;
        const n =
            null === (e = this.path) || void 0 === e ? void 0 : e.child(t),
          r = this.ku({ path: n, Qu: !1 });
        return r.$u(t), r;
      }
      Uu(t) {
        var e;
        const n =
            null === (e = this.path) || void 0 === e ? void 0 : e.child(t),
          r = this.ku({ path: n, Qu: !1 });
        return r.Bu(), r;
      }
      Ku(t) {
        return this.ku({ path: void 0, Qu: !0 });
      }
      Wu(t) {
        return ou(
          t,
          this.settings.methodName,
          this.settings.Gu || !1,
          this.path,
          this.settings.zu,
        );
      }
      contains(t) {
        return (
          void 0 !== this.fieldMask.find((e) => t.isPrefixOf(e)) ||
          void 0 !== this.fieldTransforms.find((e) => t.isPrefixOf(e.field))
        );
      }
      Bu() {
        if (this.path)
          for (let t = 0; t < this.path.length; t++) this.$u(this.path.get(t));
      }
      $u(t) {
        if (0 === t.length) throw this.Wu("Document fields must not be empty");
        if (Gc(this.Lu) && zc.test(t))
          throw this.Wu('Document fields cannot begin and end with "__"');
      }
    }
    class Wc {
      constructor(t, e, n) {
        (this.databaseId = t),
          (this.ignoreUndefinedProperties = e),
          (this.serializer = n || Oo(t));
      }
      ju(t, e, n, r = !1) {
        return new Qc(
          { Lu: t, methodName: e, zu: n, path: Fe.emptyPath(), Qu: !1, Gu: r },
          this.databaseId,
          this.serializer,
          this.ignoreUndefinedProperties,
        );
      }
    }
    function Xc(t) {
      const e = t._freezeSettings(),
        n = Oo(t._databaseId);
      return new Wc(t._databaseId, !!e.ignoreUndefinedProperties, n);
    }
    function Yc(t, e, n, r, s, i = {}) {
      const o = t.ju(i.merge || i.mergeFields ? 2 : 0, e, n, s);
      nu("Data must be an object, but it was:", o, r);
      const a = tu(r, o);
      let c, u;
      if (i.merge) (c = new wn(o.fieldMask)), (u = o.fieldTransforms);
      else if (i.mergeFields) {
        const t = [];
        for (const r of i.mergeFields) {
          const s = ru(e, r, n);
          if (!o.contains(s))
            throw new de(
              le.INVALID_ARGUMENT,
              `Field '${s}' is specified in your field mask but missing from your input data.`,
            );
          au(t, s) || t.push(s);
        }
        (c = new wn(t)),
          (u = o.fieldTransforms.filter((t) => c.covers(t.field)));
      } else (c = null), (u = o.fieldTransforms);
      return new Kc(new sr(a), c, u);
    }
    class Jc extends jc {
      _toFieldTransform(t) {
        if (2 !== t.Lu)
          throw 1 === t.Lu
            ? t.Wu(
                `${this._methodName}() can only appear at the top level of your update data`,
              )
            : t.Wu(
                `${this._methodName}() cannot be used with set() unless you pass {merge:true}`,
              );
        return t.fieldMask.push(t.path), null;
      }
      isEqual(t) {
        return t instanceof Jc;
      }
    }
    function Zc(t, e) {
      if (eu((t = g(t)))) return nu("Unsupported field value:", e, t), tu(t, e);
      if (t instanceof jc)
        return (
          (function (t, e) {
            if (!Gc(e.Lu))
              throw e.Wu(
                `${t._methodName}() can only be used with update() and set()`,
              );
            if (!e.path)
              throw e.Wu(
                `${t._methodName}() is not currently supported inside arrays`,
              );
            const n = t._toFieldTransform(e);
            n && e.fieldTransforms.push(n);
          })(t, e),
          null
        );
      if (void 0 === t && e.ignoreUndefinedProperties) return null;
      if ((e.path && e.fieldMask.push(e.path), t instanceof Array)) {
        if (e.settings.Qu && 4 !== e.Lu)
          throw e.Wu("Nested arrays are not supported");
        return (function (t, e) {
          const n = [];
          let r = 0;
          for (const s of t) {
            let t = Zc(s, e.Ku(r));
            null == t && (t = { nullValue: "NULL_VALUE" }), n.push(t), r++;
          }
          return { arrayValue: { values: n } };
        })(t, e);
      }
      return (function (t, e) {
        if (null === (t = g(t))) return { nullValue: "NULL_VALUE" };
        if ("number" == typeof t) return os(e.serializer, t);
        if ("boolean" == typeof t) return { booleanValue: t };
        if ("string" == typeof t) return { stringValue: t };
        if (t instanceof Date) {
          const n = Re.fromDate(t);
          return { timestampValue: ai(e.serializer, n) };
        }
        if (t instanceof Re) {
          const n = new Re(t.seconds, 1e3 * Math.floor(t.nanoseconds / 1e3));
          return { timestampValue: ai(e.serializer, n) };
        }
        if (t instanceof qc)
          return {
            geoPointValue: { latitude: t.latitude, longitude: t.longitude },
          };
        if (t instanceof Uc)
          return { bytesValue: ci(e.serializer, t._byteString) };
        if (t instanceof Rc) {
          const n = e.databaseId,
            r = t.firestore._databaseId;
          if (!r.isEqual(n))
            throw e.Wu(
              `Document reference is for database ${r.projectId}/${r.database} but should be for database ${n.projectId}/${n.database}`,
            );
          return {
            referenceValue: li(
              t.firestore._databaseId || e.databaseId,
              t._key.path,
            ),
          };
        }
        if (t instanceof $c)
          return (function (t, e) {
            return {
              mapValue: {
                fields: {
                  [Pn]: { stringValue: Un },
                  [Bn]: {
                    arrayValue: {
                      values: t.toArray().map((t) => {
                        if ("number" != typeof t)
                          throw e.Wu(
                            "VectorValues must only contain numeric values.",
                          );
                        return ss(e.serializer, t);
                      }),
                    },
                  },
                },
              },
            };
          })(t, e);
        throw e.Wu(`Unsupported field value: ${Cc(t)}`);
      })(t, e);
    }
    function tu(t, e) {
      const n = {};
      return (
        fn(t)
          ? e.path && e.path.length > 0 && e.fieldMask.push(e.path)
          : dn(t, (t, r) => {
              const s = Zc(r, e.qu(t));
              null != s && (n[t] = s);
            }),
        { mapValue: { fields: n } }
      );
    }
    function eu(t) {
      return !(
        "object" != typeof t ||
        null === t ||
        t instanceof Array ||
        t instanceof Date ||
        t instanceof Re ||
        t instanceof qc ||
        t instanceof Uc ||
        t instanceof Rc ||
        t instanceof jc ||
        t instanceof $c
      );
    }
    function nu(t, e, n) {
      if (
        !eu(n) ||
        !(function (t) {
          return (
            "object" == typeof t &&
            null !== t &&
            (Object.getPrototypeOf(t) === Object.prototype ||
              null === Object.getPrototypeOf(t))
          );
        })(n)
      ) {
        const r = Cc(n);
        throw "an object" === r
          ? e.Wu(t + " a custom object")
          : e.Wu(t + " " + r);
      }
    }
    function ru(t, e, n) {
      if ((e = g(e)) instanceof Bc) return e._internalPath;
      if ("string" == typeof e) return iu(t, e);
      throw ou(
        "Field path arguments must be of type string or ",
        t,
        !1,
        void 0,
        n,
      );
    }
    const su = new RegExp("[~\\*/\\[\\]]");
    function iu(t, e, n) {
      if (e.search(su) >= 0)
        throw ou(
          `Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,
          t,
          !1,
          void 0,
          n,
        );
      try {
        return new Bc(...e.split("."))._internalPath;
      } catch (r) {
        throw ou(
          `Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,
          t,
          !1,
          void 0,
          n,
        );
      }
    }
    function ou(t, e, n, r, s) {
      const i = r && !r.isEmpty(),
        o = void 0 !== s;
      let a = `Function ${e}() called with invalid data`;
      n && (a += " (via `toFirestore()`)"), (a += ". ");
      let c = "";
      return (
        (i || o) &&
          ((c += " (found"),
          i && (c += ` in field ${r}`),
          o && (c += ` in document ${s}`),
          (c += ")")),
        new de(le.INVALID_ARGUMENT, a + t + c)
      );
    }
    function au(t, e) {
      return t.some((t) => t.isEqual(e));
    }
    class cu {
      constructor(t, e, n, r, s) {
        (this._firestore = t),
          (this._userDataWriter = e),
          (this._key = n),
          (this._document = r),
          (this._converter = s);
      }
      get id() {
        return this._key.path.lastSegment();
      }
      get ref() {
        return new Rc(this._firestore, this._converter, this._key);
      }
      exists() {
        return null !== this._document;
      }
      data() {
        if (this._document) {
          if (this._converter) {
            const t = new uu(
              this._firestore,
              this._userDataWriter,
              this._key,
              this._document,
              null,
            );
            return this._converter.fromFirestore(t);
          }
          return this._userDataWriter.convertValue(this._document.data.value);
        }
      }
      get(t) {
        if (this._document) {
          const e = this._document.data.field(hu("DocumentSnapshot.get", t));
          if (null !== e) return this._userDataWriter.convertValue(e);
        }
      }
    }
    class uu extends cu {
      data() {
        return super.data();
      }
    }
    function hu(t, e) {
      return "string" == typeof e
        ? iu(t, e)
        : e instanceof Bc
          ? e._internalPath
          : e._delegate._internalPath;
    }
    class lu {
      convertValue(t, e = "none") {
        switch (jn(t)) {
          case 0:
            return null;
          case 1:
            return t.booleanValue;
          case 2:
            return Sn(t.integerValue || t.doubleValue);
          case 3:
            return this.convertTimestamp(t.timestampValue);
          case 4:
            return this.convertServerTimestamp(t, e);
          case 5:
            return t.stringValue;
          case 6:
            return this.convertBytes(Cn(t.bytesValue));
          case 7:
            return this.convertReference(t.referenceValue);
          case 8:
            return this.convertGeoPoint(t.geoPointValue);
          case 9:
            return this.convertArray(t.arrayValue, e);
          case 11:
            return this.convertObject(t.mapValue, e);
          case 10:
            return this.convertVectorValue(t.mapValue);
          default:
            throw ce();
        }
      }
      convertObject(t, e) {
        return this.convertObjectMap(t.fields, e);
      }
      convertObjectMap(t, e = "none") {
        const n = {};
        return (
          dn(t, (t, r) => {
            n[t] = this.convertValue(r, e);
          }),
          n
        );
      }
      convertVectorValue(t) {
        var e, n, r;
        const s =
          null ===
            (r =
              null ===
                (n =
                  null === (e = t.fields) || void 0 === e
                    ? void 0
                    : e[Bn].arrayValue) || void 0 === n
                ? void 0
                : n.values) || void 0 === r
            ? void 0
            : r.map((t) => Sn(t.doubleValue));
        return new $c(s);
      }
      convertGeoPoint(t) {
        return new qc(Sn(t.latitude), Sn(t.longitude));
      }
      convertArray(t, e) {
        return (t.values || []).map((t) => this.convertValue(t, e));
      }
      convertServerTimestamp(t, e) {
        switch (e) {
          case "previous":
            const n = xn(t);
            return null == n ? null : this.convertValue(n, e);
          case "estimate":
            return this.convertTimestamp(Rn(t));
          default:
            return null;
        }
      }
      convertTimestamp(t) {
        const e = Tn(t);
        return new Re(e.seconds, e.nanos);
      }
      convertDocumentKey(t, e) {
        const n = Pe.fromString(t);
        ue(xi(n));
        const r = new Mn(n.get(1), n.get(3)),
          s = new Ue(n.popFirst(5));
        return (
          r.isEqual(e) ||
            ie(
              `Document ${s} contains a document reference within a different database (${r.projectId}/${r.database}) which is not supported. It will be treated as a reference in the current database (${e.projectId}/${e.database}) instead.`,
            ),
          s
        );
      }
    }
    class du {
      constructor(t, e) {
        (this.hasPendingWrites = t), (this.fromCache = e);
      }
      isEqual(t) {
        return (
          this.hasPendingWrites === t.hasPendingWrites &&
          this.fromCache === t.fromCache
        );
      }
    }
    class fu extends cu {
      constructor(t, e, n, r, s, i) {
        super(t, e, n, r, i),
          (this._firestore = t),
          (this._firestoreImpl = t),
          (this.metadata = s);
      }
      exists() {
        return super.exists();
      }
      data(t = {}) {
        if (this._document) {
          if (this._converter) {
            const e = new gu(
              this._firestore,
              this._userDataWriter,
              this._key,
              this._document,
              this.metadata,
              null,
            );
            return this._converter.fromFirestore(e, t);
          }
          return this._userDataWriter.convertValue(
            this._document.data.value,
            t.serverTimestamps,
          );
        }
      }
      get(t, e = {}) {
        if (this._document) {
          const n = this._document.data.field(hu("DocumentSnapshot.get", t));
          if (null !== n)
            return this._userDataWriter.convertValue(n, e.serverTimestamps);
        }
      }
    }
    class gu extends fu {
      data(t = {}) {
        return super.data(t);
      }
    }
    class pu {
      constructor(t, e, n, r) {
        (this._firestore = t),
          (this._userDataWriter = e),
          (this._snapshot = r),
          (this.metadata = new du(r.hasPendingWrites, r.fromCache)),
          (this.query = n);
      }
      get docs() {
        const t = [];
        return this.forEach((e) => t.push(e)), t;
      }
      get size() {
        return this._snapshot.docs.size;
      }
      get empty() {
        return 0 === this.size;
      }
      forEach(t, e) {
        this._snapshot.docs.forEach((n) => {
          t.call(
            e,
            new gu(
              this._firestore,
              this._userDataWriter,
              n.key,
              n,
              new du(
                this._snapshot.mutatedKeys.has(n.key),
                this._snapshot.fromCache,
              ),
              this.query.converter,
            ),
          );
        });
      }
      docChanges(t = {}) {
        const e = !!t.includeMetadataChanges;
        if (e && this._snapshot.excludesMetadataChanges)
          throw new de(
            le.INVALID_ARGUMENT,
            "To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().",
          );
        return (
          (this._cachedChanges &&
            this._cachedChangesIncludeMetadataChanges === e) ||
            ((this._cachedChanges = (function (t, e) {
              if (t._snapshot.oldDocs.isEmpty()) {
                let e = 0;
                return t._snapshot.docChanges.map((n) => {
                  const r = new gu(
                    t._firestore,
                    t._userDataWriter,
                    n.doc.key,
                    n.doc,
                    new du(
                      t._snapshot.mutatedKeys.has(n.doc.key),
                      t._snapshot.fromCache,
                    ),
                    t.query.converter,
                  );
                  return (
                    n.doc,
                    { type: "added", doc: r, oldIndex: -1, newIndex: e++ }
                  );
                });
              }
              {
                let n = t._snapshot.oldDocs;
                return t._snapshot.docChanges
                  .filter((t) => e || 3 !== t.type)
                  .map((e) => {
                    const r = new gu(
                      t._firestore,
                      t._userDataWriter,
                      e.doc.key,
                      e.doc,
                      new du(
                        t._snapshot.mutatedKeys.has(e.doc.key),
                        t._snapshot.fromCache,
                      ),
                      t.query.converter,
                    );
                    let s = -1,
                      i = -1;
                    return (
                      0 !== e.type &&
                        ((s = n.indexOf(e.doc.key)), (n = n.delete(e.doc.key))),
                      1 !== e.type &&
                        ((n = n.add(e.doc)), (i = n.indexOf(e.doc.key))),
                      { type: mu(e.type), doc: r, oldIndex: s, newIndex: i }
                    );
                  });
              }
            })(this, e)),
            (this._cachedChangesIncludeMetadataChanges = e)),
          this._cachedChanges
        );
      }
    }
    function mu(t) {
      switch (t) {
        case 0:
          return "added";
        case 2:
        case 3:
          return "modified";
        case 1:
          return "removed";
        default:
          return ce();
      }
    }
    class yu extends lu {
      constructor(t) {
        super(), (this.firestore = t);
      }
      convertBytes(t) {
        return new Uc(t);
      }
      convertReference(t) {
        const e = this.convertDocumentKey(t, this.firestore._databaseId);
        return new Rc(this.firestore, null, e);
      }
    }
    function vu(t, e) {
      return (function (t, e) {
        const n = new fe();
        return (
          t.asyncQueue.enqueueAndForget(async () =>
            (async function (t, e, n) {
              const r = uc(t);
              try {
                const t = await (function (t, e) {
                  const n = he(t),
                    r = Re.now(),
                    s = e.reduce((t, e) => t.add(e.key), ns());
                  let i, o;
                  return n.persistence
                    .runTransaction(
                      "Locally write mutations",
                      "readwrite",
                      (t) => {
                        let a = Gr(),
                          c = ns();
                        return n.ds
                          .getEntries(t, s)
                          .next((t) => {
                            (a = t),
                              a.forEach((t, e) => {
                                e.isValidDocument() || (c = c.add(t));
                              });
                          })
                          .next(() =>
                            n.localDocuments.getOverlayedDocuments(t, a),
                          )
                          .next((s) => {
                            i = s;
                            const o = [];
                            for (const t of e) {
                              const e = Is(t, i.get(t.key).overlayedDocument);
                              null != e &&
                                o.push(
                                  new ks(
                                    t.key,
                                    e,
                                    ir(e.value.mapValue),
                                    bs.exists(!0),
                                  ),
                                );
                            }
                            return n.mutationQueue.addMutationBatch(t, r, o, e);
                          })
                          .next((e) => {
                            o = e;
                            const r = e.applyToLocalDocumentSet(i, c);
                            return n.documentOverlayCache.saveOverlays(
                              t,
                              e.batchId,
                              r,
                            );
                          });
                      },
                    )
                    .then(() => ({ batchId: o.batchId, changes: Xr(i) }));
                })(r.localStore, e);
                r.sharedClientState.addPendingMutation(t.batchId),
                  (function (t, e, n) {
                    let r = t.Wa[t.currentUser.toKey()];
                    r || (r = new gn(Ce)),
                      (r = r.insert(e, n)),
                      (t.Wa[t.currentUser.toKey()] = r);
                  })(r, t.batchId, n),
                  await ic(r, t.changes),
                  await aa(r.remoteStore);
              } catch (t) {
                const e = ba(t, "Failed to persist write");
                n.reject(e);
              }
            })(
              await (function (t) {
                return vc(t).then((t) => t.syncEngine);
              })(t),
              e,
              n,
            ),
          ),
          n.promise
        );
      })(Fc(t), e);
    }
    new WeakMap(),
      (function (t, e = !0) {
        (ee = "11.6.0"),
          St(
            new p(
              "firestore",
              (t, { instanceIdentifier: n, options: r }) => {
                const s = t.getProvider("app").getImmediate(),
                  i = new Vc(
                    new ye(t.getProvider("auth-internal")),
                    new Ee(s, t.getProvider("app-check-internal")),
                    (function (t, e) {
                      if (
                        !Object.prototype.hasOwnProperty.apply(t.options, [
                          "projectId",
                        ])
                      )
                        throw new de(
                          le.INVALID_ARGUMENT,
                          '"projectId" not provided in firebase.initializeApp.',
                        );
                      return new Mn(t.options.projectId, e);
                    })(s, n),
                    s,
                  );
                return (
                  (r = Object.assign({ useFetchStreams: e }, r)),
                  i._setSettings(r),
                  i
                );
              },
              "PUBLIC",
            ).setMultipleInstances(!0),
          ),
          Dt(Jt, Zt, t),
          Dt(Jt, Zt, "esm2017");
      })(),
      Dt("firebase", "11.6.0", "app");
    const wu = (function (t) {
      const e =
          "object" == typeof t
            ? t
            : (function (t = vt) {
                const e = bt.get(t);
                if (!e && t === vt && a()) return At();
                if (!e) throw Ct.create("no-app", { appName: t });
                return e;
              })(),
        n = "string" == typeof t ? t : On,
        r = (function (t, e) {
          const n = t.container
            .getProvider("heartbeat")
            .getImmediate({ optional: !0 });
          return n && n.triggerHeartbeat(), t.container.getProvider(e);
        })(e, "firestore").getImmediate({ identifier: n });
      if (!r._initialized) {
        const t = ((t) => {
          const e = ((t) => {
            var e, n;
            return null ===
              (n =
                null === (e = o()) || void 0 === e
                  ? void 0
                  : e.emulatorHosts) || void 0 === n
              ? void 0
              : n[t];
          })(t);
          if (!e) return;
          const n = e.lastIndexOf(":");
          if (n <= 0 || n + 1 === e.length)
            throw new Error(
              `Invalid host ${e} with no separate hostname and port!`,
            );
          const r = parseInt(e.substring(n + 1), 10);
          return "[" === e[0]
            ? [e.substring(1, n - 1), r]
            : [e.substring(0, n), r];
        })("firestore");
        t &&
          (function (t, e, n, r = {}) {
            var s;
            const o = (t = Ic(t, Nc))._getSettings(),
              a = Object.assign(Object.assign({}, o), {
                emulatorOptions: t._getEmulatorOptions(),
              }),
              c = `${e}:${n}`;
            o.host !== Ac &&
              o.host !== c &&
              oe(
                "Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.",
              );
            const u = Object.assign(Object.assign({}, o), {
              host: c,
              ssl: !1,
              emulatorOptions: r,
            });
            if (!d(u, a) && (t._setSettings(u), r.mockUserToken)) {
              let e, n;
              if ("string" == typeof r.mockUserToken)
                (e = r.mockUserToken), (n = te.MOCK_USER);
              else {
                e = (function (t, e) {
                  if (t.uid)
                    throw new Error(
                      'The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.',
                    );
                  const n = e || "demo-project",
                    r = t.iat || 0,
                    s = t.sub || t.user_id;
                  if (!s)
                    throw new Error(
                      "mockUserToken must contain 'sub' or 'user_id' field!",
                    );
                  const o = Object.assign(
                    {
                      iss: `https://securetoken.google.com/${n}`,
                      aud: n,
                      iat: r,
                      exp: r + 3600,
                      auth_time: r,
                      sub: s,
                      user_id: s,
                      firebase: { sign_in_provider: "custom", identities: {} },
                    },
                    t,
                  );
                  return [
                    i(JSON.stringify({ alg: "none", type: "JWT" })),
                    i(JSON.stringify(o)),
                    "",
                  ].join(".");
                })(
                  r.mockUserToken,
                  null === (s = t._app) || void 0 === s
                    ? void 0
                    : s.options.projectId,
                );
                const o = r.mockUserToken.sub || r.mockUserToken.user_id;
                if (!o)
                  throw new de(
                    le.INVALID_ARGUMENT,
                    "mockUserToken must contain 'sub' or 'user_id' field!",
                  );
                n = new te(o);
              }
              t._authCredentials = new me(new ge(e, n));
            }
          })(r, ...t);
      }
      return r;
    })(
      At({
        apiKey: "AIzaSyCATbcmofh-mYsGwccinVHE0eMpPjcXuGI",
        authDomain: "billboard-a6ede.firebaseapp.com",
        projectId: "billboard-a6ede",
        storageBucket: "billboard-a6ede.firebasestorage.app",
        messagingSenderId: "32108406274",
        appId: "1:32108406274:web:c8c99492c57df8fe46691b",
      }),
    );
    class bu {
      async getAds(t) {
        var e;
        try {
          if (t) {
            const n = await (function (t) {
              t = Ic(t, Rc);
              const e = Ic(t.firestore, Vc);
              return (function (t, e, n = {}) {
                const r = new fe();
                return (
                  t.asyncQueue.enqueueAndForget(async () =>
                    (function (t, e, n, r, s) {
                      const i = new fc({
                          next: (a) => {
                            i.su(), e.enqueueAndForget(() => Da(t, o));
                            const c = a.docs.has(n);
                            !c && a.fromCache
                              ? s.reject(
                                  new de(
                                    le.UNAVAILABLE,
                                    "Failed to get document because the client is offline.",
                                  ),
                                )
                              : c && a.fromCache && r && "server" === r.source
                                ? s.reject(
                                    new de(
                                      le.UNAVAILABLE,
                                      'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)',
                                    ),
                                  )
                                : s.resolve(a);
                          },
                          error: (t) => s.reject(t),
                        }),
                        o = new Oa(Or(n.path), i, {
                          includeMetadataChanges: !0,
                          Ta: !0,
                        });
                      return Aa(t, o);
                    })(await wc(t), t.asyncQueue, e, n, r),
                  ),
                  r.promise
                );
              })(Fc(e), t._key).then((n) =>
                (function (t, e, n) {
                  const r = n.docs.get(e._key),
                    s = new yu(t);
                  return new fu(
                    t,
                    s,
                    e._key,
                    r,
                    new du(n.hasPendingWrites, n.fromCache),
                    e.converter,
                  );
                })(e, t, n),
              );
            })(Oc(wu, "providers", t));
            n &&
              (await (function (t, e, n, ...r) {
                t = Ic(t, Rc);
                const s = Ic(t.firestore, Vc),
                  i = Xc(s);
                let o;
                return (
                  (o =
                    "string" == typeof (e = g(e)) || e instanceof Bc
                      ? (function (t, e, n, r, s, i) {
                          const o = t.ju(1, e, n),
                            a = [ru(e, r, n)],
                            c = [s];
                          if (i.length % 2 != 0)
                            throw new de(
                              le.INVALID_ARGUMENT,
                              `Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`,
                            );
                          for (let t = 0; t < i.length; t += 2)
                            a.push(ru(e, i[t])), c.push(i[t + 1]);
                          const u = [],
                            h = sr.empty();
                          for (let t = a.length - 1; t >= 0; --t)
                            if (!au(u, a[t])) {
                              const e = a[t];
                              let n = c[t];
                              n = g(n);
                              const r = o.Uu(e);
                              if (n instanceof Jc) u.push(e);
                              else {
                                const t = Zc(n, r);
                                null != t && (u.push(e), h.set(e, t));
                              }
                            }
                          const l = new wn(u);
                          return new Hc(h, l, o.fieldTransforms);
                        })(i, "updateDoc", t._key, e, n, r)
                      : (function (t, e, n, r) {
                          const s = t.ju(1, e, n);
                          nu("Data must be an object, but it was:", s, r);
                          const i = [],
                            o = sr.empty();
                          dn(r, (t, r) => {
                            const a = iu(e, t, n);
                            r = g(r);
                            const c = s.Uu(a);
                            if (r instanceof Jc) i.push(a);
                            else {
                              const t = Zc(r, c);
                              null != t && (i.push(a), o.set(a, t));
                            }
                          });
                          const a = new wn(i);
                          return new Hc(o, a, s.fieldTransforms);
                        })(i, "updateDoc", t._key, e)),
                  vu(s, [o.toMutation(t._key, bs.exists(!0))])
                );
              })(Oc(wu, "providers", t), {
                counter:
                  (null === (e = n.data()) || void 0 === e
                    ? void 0
                    : e.counter) + 1,
              }));
          } else
            await (function (t, e, n) {
              t = Ic(t, Rc);
              const r = Ic(t.firestore, Vc),
                s = (function (t, e, n) {
                  let r;
                  return (
                    (r = t
                      ? n && (n.merge || n.mergeFields)
                        ? t.toFirestore(e, n)
                        : t.toFirestore(e)
                      : e),
                    r
                  );
                })(t.converter, { counter: 1 }, n);
              return vu(r, [
                Yc(
                  Xc(r),
                  "setDoc",
                  t._key,
                  s,
                  null !== t.converter,
                  n,
                ).toMutation(t._key, bs.none()),
              ]);
            })(Oc(wu, "providers", "handle"));
          const n = (
            await (function (t) {
              t = Ic(t, xc);
              const e = Ic(t.firestore, Vc),
                n = Fc(e),
                r = new yu(e);
              return (
                (function (t) {
                  if ("L" === t.limitType && 0 === t.explicitOrderBy.length)
                    throw new de(
                      le.UNIMPLEMENTED,
                      "limitToLast() queries require specifying at least one orderBy() clause",
                    );
                })(t._query),
                (function (t, e, n = {}) {
                  const r = new fe();
                  return (
                    t.asyncQueue.enqueueAndForget(async () =>
                      (function (t, e, n, r, s) {
                        const i = new fc({
                            next: (n) => {
                              i.su(),
                                e.enqueueAndForget(() => Da(t, o)),
                                n.fromCache && "server" === r.source
                                  ? s.reject(
                                      new de(
                                        le.UNAVAILABLE,
                                        'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)',
                                      ),
                                    )
                                  : s.resolve(n);
                            },
                            error: (t) => s.reject(t),
                          }),
                          o = new Oa(n, i, {
                            includeMetadataChanges: !0,
                            Ta: !0,
                          });
                        return Aa(t, o);
                      })(await wc(t), t.asyncQueue, e, n, r),
                    ),
                    r.promise
                  );
                })(n, t._query).then((n) => new pu(e, r, t, n))
              );
            })(
              (function (t, e, ...n) {
                if (
                  ((t = g(t)), _c("collection", "path", e), t instanceof Nc)
                ) {
                  const r = Pe.fromString(e, ...n);
                  return Sc(r), new Lc(t, null, r);
                }
                {
                  if (!(t instanceof Rc || t instanceof Lc))
                    throw new de(
                      le.INVALID_ARGUMENT,
                      "Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore",
                    );
                  const r = t._path.child(Pe.fromString(e, ...n));
                  return Sc(r), new Lc(t.firestore, null, r);
                }
              })(wu, "active_ads"),
            )
          ).docs.map((t) => ({
            link: t.data().link,
            description: t.data().description,
            ipfsHash: t.data().ipfsHash,
            expiryTime: t.data().expiryTime,
          }));
          return await Promise.all(
            n.map(async (t) => {
              const e = await fetch(
                  "https://getimagefromipfs-pe2o27xb6q-ew.a.run.app",
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ cid: t.ipfsHash }),
                  },
                ),
                n = await e.json();
              return { ...t, url: n.result || "" };
            }),
          );
        } catch (t) {
          throw (
            (console.error(t), new Error(`Error while fetching for ads: ${t}`))
          );
        }
      }
      async uploadImage(t) {
        if (t.size > 5242880)
          throw new Error("File size exceeds the maximum limit of 5MB");
        try {
          const e = await t.arrayBuffer(),
            n = new Uint8Array(e).reduce(
              (t, e) => t + String.fromCharCode(e),
              "",
            ),
            r = btoa(n),
            s = await fetch(
              "https://uploadimagetoipfs-pe2o27xb6q-ew.a.run.app",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ imageData: r }),
              },
            );
          return await s.json();
        } catch (t) {
          throw (
            (console.error(t), new Error(`Error while uploading image: ${t}`))
          );
        }
      }
    }
    const Eu = bu;
    return e;
  })(),
);
