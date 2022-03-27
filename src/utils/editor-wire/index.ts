import { Registry, StackElement, INITIAL } from 'monaco-textmate'
import * as monacoNsps from 'monaco-editor'
import { TMToMonacoToken } from './tmMonaco';

class TokenizerState implements monacoNsps.languages.IState {

    constructor(
        private _ruleStack: StackElement
    ) { }

    public get ruleStack(): StackElement {
        return this._ruleStack
    }

    public clone(): TokenizerState {
        return new TokenizerState(this._ruleStack);
    }

    public equals(other: monacoNsps.languages.IState): boolean {
        if (!other ||
            !(other instanceof TokenizerState) ||
            other !== this ||
            other._ruleStack !== this._ruleStack
        ) {
            return false;
        }
        return true;
    }
}

export function wireTmGrammars(monaco: typeof monacoNsps, registry: Registry, languages: Map<string, string>, editor?: monacoNsps.editor.ICodeEditor) {
    return Promise.all(
        Array.from(languages.keys())
            .map(async (languageId) => {
                const grammar = await registry.loadGrammar(languages.get(languageId)!)

                monaco.languages.register({ id: languageId });

                monaco.languages.setLanguageConfiguration(languageId, {
                    "comments": {
                        "lineComment": "//"
                    },
                    "brackets": [
                        ["{", "}"],
                        ["[", "]"],
                        ["(", ")"]
                    ]
                })

                monaco.languages.setTokensProvider(languageId, {
                    getInitialState: () => new TokenizerState(INITIAL),
                    tokenize: (line: string, state: TokenizerState) => {
                        const res = grammar.tokenizeLine(line, state.ruleStack)
                        return {
                            endState: new TokenizerState(res.ruleStack),
                            tokens: res.tokens.map(token => ({
                                ...token,
                                // TODO: At the moment, monaco-editor doesn't seem to accept array of scopes
                                scopes: editor ? TMToMonacoToken(editor, token.scopes) : token.scopes[token.scopes.length - 1]
                            })),
                        }
                    }
                })
            })
    )
}