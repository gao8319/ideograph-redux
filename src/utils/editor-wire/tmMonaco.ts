import * as monacoNsps from 'monaco-editor'

/**
 * 把 monaco editor 的 token 和 vscode 的 textmate 绑定
 * 这样就可以直接使用 从vscode cypher插件上扒下来的 syntax highlight 配置。
 * @param editor 
 * @param scopes 
 * @returns 
 */
export const TMToMonacoToken = (editor: monacoNsps.editor.ICodeEditor, scopes: string[]) => {
    let scopeName = "";
    
    for (let i = scopes[0].length - 1; i >= 0; i -= 1) {
        const char = scopes[0][i];
        if (char === ".") {
            break;
        }
        scopeName = char + scopeName;
    }

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
