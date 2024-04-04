import { join, basename } from 'pathe';
import { compileTemplate, parse } from '@vue/compiler-sfc';
import { createProcessor } from './markdown';
import { transformExampleMarkup, transformSlots } from './transform';
function parseId(id) {
    const index = id.indexOf('?');
    if (index < 0)
        return id;
    else
        return id.slice(0, index);
}
export function VitePluginVueroDoc(options) {
    let config;
    let processor;
    const cwd = process.cwd();
    const pathPrefix = options.pathPrefix ? join(cwd, options.pathPrefix) : cwd;
    async function markdownToVue(id, raw) {
        const path = parseId(id);
        const input = transformExampleMarkup(raw);
        if (!processor)
            processor = await createProcessor(options.shiki.themes);
        const vFile = await processor?.process(input);
        const content = vFile.toString();
        const frontmatter = vFile.data?.frontmatter ?? {};
        const slot = transformSlots(content);
        const sfc = [
            `<template>`,
            `  <${options.wrapperComponent} :frontmatter="frontmatter" :source-meta="sourceMeta">`,
            `    ${slot}`,
            `  </${options.wrapperComponent}>`,
            `</template>`,
        ].join('\n');
        const result = parse(sfc, {
            filename: path,
            sourceMap: true,
        });
        if (result.errors.length || result.descriptor.template === null) {
            console.error(result.errors);
            throw new Error(`Markdown: unable to parse virtual file generated for "${id}"`);
        }
        const { code, errors } = compileTemplate({
            filename: path,
            id: path,
            source: result.descriptor.template.content,
            preprocessLang: result.descriptor.template.lang,
            transformAssetUrls: false,
        });
        if (errors.length) {
            console.error(errors);
            throw new Error(`Markdown: unable to compile virtual file "${id}"`);
        }
        let sourceMeta = 'undefined';
        if (options.sourceMeta?.enabled) {
            sourceMeta = JSON.stringify({
                relativePath: path.substring(cwd.length),
                basename: basename(path),
                path: config?.isProduction ? '' : path,
                editProtocol: config?.isProduction ? '' : options.sourceMeta.editProtocol,
            });
        }
        return [
            `import { reactive } from 'vue'`,
            `import { useDarkmode } from '/@src/stores/darkmode'`,
            code.replace('export function render', 'function render'),
            `const __frontmatter = ${JSON.stringify(frontmatter)};`,
            `const setup = () => ({`,
            `  frontmatter: reactive(__frontmatter),`,
            `  darkmode: useDarkmode(),`,
            `  sourceMeta: ${sourceMeta},`,
            `});`,
            `const __script = { render, setup };`,
            config?.isProduction ? '' : `__script.__hmrId = ${JSON.stringify(path)};`,
            `export default __script;`,
        ].join('\n');
    }
    return {
        name: 'vite-plugin-vuero-doc',
        enforce: 'pre',
        configResolved(_config) {
            config = _config;
        },
        async transform(raw, id) {
            if (id.endsWith('.md') && id.startsWith(pathPrefix)) {
                return await markdownToVue(id, raw);
            }
        },
    };
}
export default VitePluginVueroDoc;
//# sourceMappingURL=index.js.map