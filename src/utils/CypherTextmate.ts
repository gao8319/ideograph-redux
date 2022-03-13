import { loadWASM } from 'onigasm' // peer dependency of 'monaco-textmate'
import { Registry } from 'monaco-textmate' // peer dependency
import * as monaco from 'monaco-editor';
import monacoGithubTheme from './editor-wire/github-monaco.json'


export async function prepareCypherSyntaxHighlights() {
    await loadWASM(`/static/onigasm.wasm`) // See https://www.npmjs.com/package/onigasm#light-it-up
    const registry = new Registry({
        getGrammarDefinition: async (scopeName) => {
            const gd = {
                format: 'json' as 'json',
                content: await (await fetch(`/static/cypher.JSON-tmLanguage`)).text()
            }
            return gd;
        }
    })
    const grammars = new Map<string, string>()
    grammars.set('cypher', 'source.cypher');

    // @ts-ignore
    monaco.editor.defineTheme('github-wasm', monacoGithubTheme);

    return {
        grammars,
        registry,
    }
    
    // var editor = monaco.editor.create(document.getElementById('container'), {
    //     value: [
    //         'html, body {',
    //         '    margin: 0;',
    //         '}'
    //     ].join('\n'),
    //     language: 'css', // this won't work out of the box, see below for more info,
    //     theme: 'vs-code-theme-converted' // very important, see comment above
    // })
    
    // await wireTmGrammars(monaco, registry, grammars, editor)
}