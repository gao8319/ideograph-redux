import * as monacoNsps from 'monaco-editor'

// as described in issue: https://github.com/NeekSandhu/monaco-textmate/issues/5
export const TMToMonacoToken = (editor: monacoNsps.editor.ICodeEditor, scopes: string[]) => {
    let scopeName = "";
    // get the scope name. Example: cpp , java, haskell
    for (let i = scopes[0].length - 1; i >= 0; i -= 1) {
        const char = scopes[0][i];
        if (char === ".") {
            break;
        }
        scopeName = char + scopeName;
    }

    // iterate through all scopes from last to first
    for (let i = scopes.length - 1; i >= 0; i -= 1) {
        const scope = scopes[i];
        for (let i = scope.length - 1; i >= 0; i -= 1) {
            const char = scope[i];
            if (char === ".") {
                const token = scope.slice(0, i);
                if (

                    // @ts-ignore
                    editor['_themeService'].getColorTheme()._tokenTheme._match(token + "." + scopeName)._foreground >
                    1
                ) {
                    return token + "." + scopeName;
                }

                    // @ts-ignore
                if (editor['_themeService'].getColorTheme()._tokenTheme._match(token)._foreground > 1) {
                    return token;
                }
            }
        }
    }

    return "";
};
