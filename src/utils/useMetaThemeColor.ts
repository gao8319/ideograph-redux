import React from "react";
import { useEffect } from "react";

/**
 * 修改浏览器 theme-color 的钩子
 * @param main 
 * @param light 
 * @param dark 
 */
export const useMetaThemeColor = (main: string, light: string = main, dark: string = main) => {
    const m = React.useRef(document.querySelector('meta[name="theme-color"]'));
    const l = React.useRef(document.querySelector('meta[name="theme-color"][media="(prefers-color-scheme: light)"]'));
    const d = React.useRef(document.querySelector('meta[name="theme-color"][media="(prefers-color-scheme: dark)"]'));

    useEffect(() => {
        if(m.current && main) {
            m.current.setAttribute('content', main);
        };
        if(l.current && (light || main)) {
            l.current.setAttribute('content', light ?? main);
        };
        if(d.current && (light || main)) {
            d.current.setAttribute('content', dark ?? main);
        };
    }, [main, light, dark,])

}