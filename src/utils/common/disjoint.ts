interface IIdentifiable<K extends PropertyKey> {
    id: K
}

export class DisjointSet<K extends PropertyKey = PropertyKey, T extends any = IIdentifiable<K>> {

    public _parent: Record<PropertyKey, T>;
    // public _rank: Record<PropertyKey, number>;
    // public _size: Record<PropertyKey, number>;
    public _sets: number;
    public _idAccessorFn: (obj: T) => K;

    public get trees() { return 1; }

    constructor(idAccessorFn: (obj: T) => K) {
        this._parent = {};
        // this._rank = {};
        // this._size = {};
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
        // this._rank = {};
        // this._size = {};
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

    // public isSingleton(value: T) {
    //     return this._size[this._idAccessorFn(value)] === 1;
    // }

    public makeSet(value: T) {
        if (!this.includes(value)) {
            const id = this._idAccessorFn(value);
            this._parent[id] = value;
            // this._rank[id] = 0;
            // this._size[id] = 1;
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
                    // this._rank[id] = 0;
                    // this._size[id] = 1;
                    this._sets += 1;
                }
            }
        )
        return this;
    }

    // public setSize(value: T) {
    //     if (!this.includes(value)) {
    //         return 0;
    //     }
    //     return this._size[this._idAccessorFn(this._findSet(value))];
    // }


    public setParentTo(children:T, parent: T) {
        const childrenId = this._idAccessorFn(children)
        this._parent[childrenId] = parent;
        Object.keys(this._parent).forEach(
            it => {
                const attached = this._parent[it]
                const attachedId = this._idAccessorFn(attached)
                if(this._idAccessorFn(this._parent[attachedId]) == childrenId) {
                    this.setParentTo(this._parent[it], parent)
                }
            }
        )
    }

    public union(parent: T, children: T) {
        // x <- y
        if (this.includes(parent) && this.includes(children)) {
            const xParent = this._findSet(parent);
            const yParent = this._findSet(children);

            if (xParent !== yParent) {
                // let xParentId = this._idAccessorFn(xParent);
                // let yParentId = this._idAccessorFn(yParent);
                // const rankDiff = this._rank[xRepId] - this._rank[yRepId];

                // if (rankDiff === 0) {
                //     this._rank[xRepId] += 1;
                // }
                //  else if (rankDiff < 0) {
                //     [xRep, yRep] = [yRep, xRep];
                //     [xRepId, yRepId] = [yRepId, xRepId];
                // }

                // this._parent[yParentId] = this._parent[xParentId];
                this.setParentTo(children, parent);
                // this._size[xParentId] += this._size[yParentId];
                // delete this._size[yParentId];
                this._sets -= 1;
            }
        }
        return this;
    }

}