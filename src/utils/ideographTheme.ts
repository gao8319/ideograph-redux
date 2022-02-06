import { createTheme } from "@fluentui/style-utilities";

const compactDisplayFont = {
    fontFamily: 'var(--display-font)',
    letterSpacing: "-0.025em",
}

export const ideographThemeFont = {
    large: {
        fontFamily: 'var(--display-font)'
    },
    xLarge: compactDisplayFont,
    xxLarge: compactDisplayFont,
    xLargePlus: compactDisplayFont,
    xxLargePlus: compactDisplayFont,
    superLarge: compactDisplayFont,
    mega: compactDisplayFont,
}

export const ideographTheme = createTheme({
    palette: {
        themePrimary: '#1870fb',
        themeLighterAlt: '#01040a',
        themeLighter: '#041228',
        themeLight: '#07214b',
        themeTertiary: '#0f4396',
        themeSecondary: '#1662dc',
        themeDarkAlt: '#307dfa',
        themeDark: '#4f91fb',
        themeDarker: '#7daefc',
        neutralLighterAlt: '#ffffff',
        neutralLighter: '#ffffff',
        neutralLight: '#ffffff',
        neutralQuaternaryAlt: '#ffffff',
        neutralQuaternary: '#ffffff',
        neutralTertiaryAlt: '#ffffff',
        neutralTertiary: '#0b0b0e',
        neutralSecondary: '#0e0f12',
        neutralPrimaryAlt: '#111217',
        neutralPrimary: '#20222a',
        neutralDark: '#181a20',
        black: '#1c1d24',
        white: '#ffffff',
    },
    defaultFontStyle: {
        fontFamily: 'var(--font)'
    },
    fonts: ideographThemeFont
});

export const ideographMonoTheme = createTheme({
    palette: {
        themePrimary: '#1870fb',
        themeLighterAlt: '#01040a',
        themeLighter: '#041228',
        themeLight: '#07214b',
        themeTertiary: '#0f4396',
        themeSecondary: '#1662dc',
        themeDarkAlt: '#307dfa',
        themeDark: '#4f91fb',
        themeDarker: '#7daefc',
        neutralLighterAlt: '#ffffff',
        neutralLighter: '#ffffff',
        neutralLight: '#ffffff',
        neutralQuaternaryAlt: '#ffffff',
        neutralQuaternary: '#ffffff',
        neutralTertiaryAlt: '#ffffff',
        neutralTertiary: '#0b0b0e',
        neutralSecondary: '#0e0f12',
        neutralPrimaryAlt: '#111217',
        neutralPrimary: '#20222a',
        neutralDark: '#181a20',
        black: '#1c1d24',
        white: '#ffffff',
    },
    defaultFontStyle: {
        fontFamily: 'JetBrains Mono'
    }
});


export const ideographDarkTheme = createTheme({
    palette: {
        themePrimary: '#1870fb',
        themeLighterAlt: '#f6f9ff',
        themeLighter: '#dae8fe',
        themeLight: '#b9d3fd',
        themeTertiary: '#74a8fc',
        themeSecondary: '#3480fb',
        themeDarkAlt: '#1664e1',
        themeDark: '#1355be',
        themeDarker: '#0e3e8c',
        neutralLighterAlt: '#272932',
        neutralLighter: '#2e303a',
        neutralLight: '#393c48',
        neutralQuaternaryAlt: '#414450',
        neutralQuaternary: '#474a57',
        neutralTertiaryAlt: '#626574',
        neutralTertiary: '#c8c8c8',
        neutralSecondary: '#d0d0d0',
        neutralPrimaryAlt: '#dadada',
        neutralPrimary: '#ffffff',
        neutralDark: '#f4f4f4',
        black: '#f8f8f8',
        white: '#20222a',
      },
    defaultFontStyle: {
        fontFamily: 'var(--font)'
    },
    fonts: ideographThemeFont
});

export const ideographAltTheme = createTheme({
    palette: {
        themePrimary: '#ffffff',
        themeLighterAlt: '#767676',
        themeLighter: '#a6a6a6',
        themeLight: '#c8c8c8',
        themeTertiary: '#d0d0d0',
        themeSecondary: '#dadada',
        themeDarkAlt: '#eaeaea',
        themeDark: '#f4f4f4',
        themeDarker: '#f8f8f8',
        neutralLighterAlt: '#186cf3',
        neutralLighter: '#186aef',
        neutralLight: '#1766e5',
        neutralQuaternaryAlt: '#155fd6',
        neutralQuaternary: '#145bcc',
        neutralTertiaryAlt: '#1457c4',
        neutralTertiary: '#a7aab6',
        neutralSecondary: '#8d919f',
        neutralPrimaryAlt: '#757987',
        neutralPrimary: '#20222a',
        neutralDark: '#474b58',
        black: '#333540',
        white: '#1870fb',
    },
    defaultFontStyle: {
        fontFamily: 'var(--font)'
    },
    fonts: ideographThemeFont
})

export const generalCalloutStyle = {
    theme: ideographDarkTheme,
    beakWidth: 8,
    styles: { beakCurtain: { borderRadius: 0 } },
    dismissOnTargetClick: true,
}