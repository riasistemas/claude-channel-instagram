/**
 * Optional extensions loader.
 *
 * If `INSTAGRAM_EXTENSIONS_DIR` is set and that directory exports a default
 * implementation of the `InstagramExtensions` interface (see ./extensions/README.md),
 * this loader imports it at boot and exposes the handlers to server.ts.
 *
 * Without the env var, the loader returns a no-op implementation, and the
 * plugin runs as a pure generic Instagram channel.
 *
 * This is the integration point for private extensions (CRM enrichment,
 * action nudges, echo targets, permission relay, etc.) without polluting
 * the public core.
 */
var __rewriteRelativeImportExtension = (this && this.__rewriteRelativeImportExtension) || function (path, preserveJsx) {
    if (typeof path === "string" && /^\.\.?\//.test(path)) {
        return path.replace(/\.(tsx)$|((?:\.d)?)((?:\.[^./]+?)?)\.([cm]?)ts$/i, function (m, tsx, d, ext, cm) {
            return tsx ? preserveJsx ? ".jsx" : ".js" : d && (!ext || !cm) ? m : (d + ext + "." + cm.toLowerCase() + "js");
        });
    }
    return path;
};
import { existsSync } from 'fs';
import { join } from 'path';
const NO_OP = {
    init: async () => undefined,
    onInboundComment: async () => undefined,
    onFirstContact: async () => undefined,
    onReplySent: async () => undefined,
    onInboundDm: async () => undefined,
    onDmSent: async () => undefined,
    permissionRelay: async () => null,
};
let cached = null;
/**
 * Load the private extensions module if INSTAGRAM_EXTENSIONS_DIR is set.
 * Looks for `<dir>/index.ts`, `<dir>/index.js`, or `<dir>/index.mjs`.
 * Returns a no-op object if the env var is missing or load fails.
 *
 * After load, calls `init(ctx)` on the extension if it exposes one — this
 * is how extensions capture references to `notify` and `log` for use in
 * background loops or asynchronous hooks.
 */
export async function loadExtensions(ctx) {
    if (cached)
        return cached;
    const log = ctx.log;
    const dir = process.env.INSTAGRAM_EXTENSIONS_DIR;
    if (!dir) {
        cached = NO_OP;
        return cached;
    }
    if (!existsSync(dir)) {
        log(`extensions dir not found: ${dir} — running without extensions`);
        cached = NO_OP;
        return cached;
    }
    const candidates = [
        join(dir, 'index.ts'),
        join(dir, 'index.js'),
        join(dir, 'index.mjs'),
    ];
    const entry = candidates.find(existsSync);
    if (!entry) {
        log(`no index.ts/js/mjs in ${dir} — running without extensions`);
        cached = NO_OP;
        return cached;
    }
    try {
        const mod = (await import(__rewriteRelativeImportExtension(entry)));
        const ext = ('default' in mod ? mod.default : mod);
        if (!ext || typeof ext !== 'object') {
            log(`extensions module at ${entry} has no default export — running without`);
            cached = NO_OP;
            return cached;
        }
        log(`extensions loaded from ${entry}`);
        if (ext.init) {
            try {
                await ext.init(ctx);
            }
            catch (err) {
                log(`extensions init() threw: ${err} — keeping load (hooks may misbehave)`);
            }
        }
        cached = ext;
        return cached;
    }
    catch (err) {
        log(`extensions load failed (${entry}): ${err} — running without extensions`);
        cached = NO_OP;
        return cached;
    }
}
/** Run a hook safely — never let a buggy extension crash the plugin. */
export async function runHook(log, name, fn) {
    try {
        const result = fn();
        if (result === undefined)
            return undefined;
        return await result;
    }
    catch (err) {
        log(`extension hook ${name} threw: ${err}`);
        return undefined;
    }
}
