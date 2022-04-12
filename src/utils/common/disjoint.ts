interface IIdentifiable<K extends PropertyKey> {
    id: K
}

export class DisjointSet<K extends PropertyKey = PropertyKey, T extends any = IIdentifiable<K>> {

    public _parent: Record<PropertyKey, T>;
    public _rank: Record<PropertyKey, number>;
    public _size: Record<PropertyKey, number>;
    public _sets: number;
    public _idAccessorFn: (obj: T) => K;

    public get trees() { return this._size; }

    constructor(idAccessorFn: (obj: T) => K) {
        this._parent = {};
        this._rank = {};
        this._size = {};
        this._sets = 0;
        this._idAccessorFn = idAccessorFn;
    }

    private _findSet(value: T) {
        const id = this._idAccessorFn(value);

        if (this._parent[id] !== value) {
            this._parent[id] = this._findSet(this._parent[id]);
        }

        return this._parent[id];
    }

    private _id(x: T) {
        return x;
    }

    public get forestElements() {
        return Object.keys(this._parent).length;
    }

    public get forestSets() {
        return this._sets;
    }

    public areConnected(x: T, y: T) {
        if (!this.includes(x) || !this.includes(y)) {
            return false;
        }

        return this._findSet(x) === this._findSet(y);
    }

    private clear() {
        this._parent = {};
        this._rank = {};
        this._size = {};
        this._sets = 0;
        return this;
    }

    public get parents() {
        return this._parent
    }

    public findSet(value: T) {
        if (this.includes(value)) {
            return this._findSet(value);
        }
        return undefined;
    }

    public getId(value: T) {
        if (!this.includes(value)) {
            return undefined;
        }
        return this._idAccessorFn(value);
    }

    private includes(value: T) {
        return Object.prototype.hasOwnProperty.call(this._parent, this._idAccessorFn(value));
    }

    public isEmpty() {
        return this.forestElements === 0;
    }

    public isRepresentative(value: T) {
        if (!this.includes(value)) {
            return false;
        }

        return this._parent[this._idAccessorFn(value)] === value;
    }

    public isSingleton(value: T) {
        return this._size[this._idAccessorFn(value)] === 1;
    }

    public makeSet(value: T) {
        if (!this.includes(value)) {
            const id = this._idAccessorFn(value);
            this._parent[id] = value;
            this._rank[id] = 0;
            this._size[id] = 1;
            this._sets += 1;
        }

        return this;
    }

    public makeSetByArray(value: T[]) {
        value.forEach(
            v => {
                if (!this.includes(v)) {
                    const id = this._idAccessorFn(v);
                    this._parent[id] = v;
                    this._rank[id] = 0;
                    this._size[id] = 1;
                    this._sets += 1;
                }
            }
        )
        return this;
    }

    public setSize(value: T) {
        if (!this.includes(value)) {
            return 0;
        }
        return this._size[this._idAccessorFn(this._findSet(value))];
    }

    public union(parent: T, children: T) {
        if (this.includes(parent) && this.includes(children)) {
            let xRep = this._findSet(parent);
            let yRep = this._findSet(children);

            if (xRep !== yRep) {
                let xRepId = this._idAccessorFn(xRep);
                let yRepId = this._idAccessorFn(yRep);
                const rankDiff = this._rank[xRepId] - this._rank[yRepId];

                if (rankDiff === 0) {
                    this._rank[xRepId] += 1;
                }
                //  else if (rankDiff < 0) {
                //     [xRep, yRep] = [yRep, xRep];
                //     [xRepId, yRepId] = [yRepId, xRepId];
                // }

                this._parent[yRepId] = xRep;
                this._size[xRepId] += this._size[yRepId];
                delete this._size[yRepId];
                this._sets -= 1;
            }
        }
        return this;
    }

}