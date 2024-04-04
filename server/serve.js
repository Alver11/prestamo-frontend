import path from 'node:path';
import { readFileSync } from 'node:fs';
import { Buffer } from 'node:buffer';
import { lazyMinifier } from './internal/minifier';
import { htmlMinifier } from './config';
import { createApp, setResponseStatus, setHeader, getRequestURL, eventHandler, fromNodeMiddleware, toNodeListener, } from 'h3';
import devalue from '@nuxt/devalue';
import { listen } from 'listhen';
import { fileURLToPath } from 'node:url';
const root = process.cwd();
const isTest = process.env.NODE_ENV === 'test' || !!process.env.VITE_TEST_BUILD;
const isProd = process.env.NODE_ENV === 'production';
const resolve = (p) => path.resolve(path.dirname(fileURLToPath(import.meta.url)), p);
globalThis.__VUE_PROD_DEVTOOLS__ = false;
globalThis.__VUE_I18N_FULL_INSTALL__ = false;
globalThis.__VUE_I18N_LEGACY_API__ = false;
async function createServer() {
    let vite;
    const app = createApp({
        debug: !isProd,
    });
    const manifest = isProd
        ? await import('../dist/client/.vite/ssr-manifest.json', { assert: { type: 'json' } })
        : {};
    const indexProd = isProd
        ? readFileSync(resolve('../dist/client/index.html'), 'utf-8')
        : '';
    if (!isProd) {
        process.env.VITE_CJS_IGNORE_WARNING = 'true';
        vite = await import('vite').then(m => m.createServer({
            root,
            logLevel: isTest ? 'error' : 'info',
            appType: 'custom',
            server: {
                middlewareMode: true,
                watch: {
                    usePolling: true,
                    interval: 100,
                },
            },
        }));
        app.use(fromNodeMiddleware(vite.middlewares));
    }
    else {
        const compression = await import('compression').then(m => m.default || m);
        const serveStatic = await import('serve-static').then(m => m.default || m);
        app.use(fromNodeMiddleware(compression()));
        app.use(fromNodeMiddleware(serveStatic(resolve('../dist/client'), {
            index: false,
            fallthrough: true,
            maxAge: '1w',
        })));
    }
    app.use('*', eventHandler(async (event) => {
        try {
            const url = getRequestURL(event);
            const ext = url.pathname.split('.');
            if (ext.length > 1) {
                setHeader(event, 'Cache-Control', 'no-cache, no-store, must-revalidate');
                return null;
            }
            let template, render;
            if (!isProd) {
                template = readFileSync(resolve('../index.html'), 'utf-8');
                template = await vite.transformIndexHtml(url.pathname, template);
                render = (await vite.ssrLoadModule('/src/entry-server.ts')).render;
            }
            else {
                template = indexProd;
                render = require('../dist/server/entry-server.js').render;
            }
            const { appHtml, headTags, htmlAttrs, bodyAttrs, bodyTags, bodyTagsOpen, preloadLinks, initialState, } = await render(event, url.pathname, manifest);
            const html = template
                .replace(`<html>`, `<html${htmlAttrs}>`)
                .replace(`<head>`, `<head><meta charset="UTF-8" />${headTags}`)
                .replace(`</head>`, `${preloadLinks}</head>`)
                .replace(`<body>`, `<body${bodyAttrs}>${bodyTagsOpen}`)
                .replace(`</body>`, `${bodyTags}</body>`)
                .replace(/<div id="app"([\s\w\-"'=[\]]*)><\/div>/, `<div id="app" data-server-rendered="true"$1>${appHtml}</div><script>window.__vuero__=${devalue(initialState)}</script>`);
            setHeader(event, 'Content-Type', 'text/html');
            let minified = html;
            switch (htmlMinifier.minifier) {
                case 'terser': {
                    const minifier = await lazyMinifier(htmlMinifier.minifier);
                    minified = await minifier(html, htmlMinifier.terserOptions);
                    break;
                }
                case 'minify-html': {
                    const minifier = await lazyMinifier(htmlMinifier.minifier);
                    minified = minifier(Buffer.from(html), htmlMinifier.minifyHtmlOptions);
                    break;
                }
            }
            return Buffer.from(minified);
        }
        catch (error) {
            if (!isProd) {
                setHeader(event, 'Cache-Control', 'no-cache, no-store, must-revalidate');
                setResponseStatus(event, 500);
                vite?.ssrFixStacktrace(error);
                console.error('[dev] [pageError] ', error);
                return error.message;
            }
            else {
                setHeader(event, 'Cache-Control', 'no-cache, no-store, must-revalidate');
                setResponseStatus(event, 500);
                console.error('[pageError] ' + error);
                return 'Internal Server Error';
            }
        }
    }));
    return { app };
}
if (!isTest) {
    createServer()
        .then(({ app }) => listen(toNodeListener(app), { port: process.env.PORT || 3000 }))
        .catch((error) => {
        if (!isProd) {
            console.error('[dev] [serverError] ', error);
        }
        else {
            console.error('[serverError] ' + error);
        }
        process.exit(1);
    });
    if (!isProd) {
        process.on('unhandledRejection', error => console.error('[dev] [unhandledRejection]', error));
        process.on('uncaughtException', error => console.error('[dev] [uncaughtException]', error));
    }
    else {
        process.on('unhandledRejection', error => console.error('[unhandledRejection] ' + error));
        process.on('uncaughtException', error => console.error('[uncaughtException] ' + error));
    }
}
//# sourceMappingURL=serve.js.map