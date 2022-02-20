import Color from "color";

export interface IColorSlot {
    primary: string,
    constrained: string,
    disabled: string,
    foreground: string,
}

export class ColorSlot implements IColorSlot {
    private _primary: string;
    public constrained: string;
    public disabled: string;
    public foreground: string;

    public get primary(): string { return this._primary; };
    public set primary(v: string) {
        const c = new Color(v);
        this._primary = v;
        this.constrained = c.darken(0.2).saturate(0.1).toString()
        this.disabled = c.lighten(0.2).desaturate(0.2).toString()
        this.foreground = c.darken(3).isDark() ? "#fff" : "#000"
    };

    constructor(primary: string) {
        const c = new Color(primary);
        this._primary = primary;
        this.constrained = c.darken(0.2).saturate(0.1).toString()
        this.disabled = c.lighten(0.2).desaturate(0.2).toString()
        this.foreground = c.darken(3).isDark() ? "#fff" : "#000"
    }

    public asObject = (): IColorSlot => ({
        primary: this._primary,
        constrained: this.constrained,
        disabled: this.disabled,
        foreground: this.foreground,
    })
}