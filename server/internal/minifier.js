let _minifier;
export async function lazyMinifier(minifier) {
    if (_minifier)
        return _minifier;
    switch (minifier) {
        case 'terser':
            _minifier = await import('html-minifier-terser').then(m => m.minify);
            return _minifier;
        case 'minify-html':
            _minifier = await import('@minify-html/node').then(m => m.minify);
            return _minifier;
    }
    throw new Error(`Unknown minifier: ${minifier}`);
}
//# sourceMappingURL=minifier.js.map