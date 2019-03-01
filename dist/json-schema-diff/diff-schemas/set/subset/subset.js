"use strict";
// tslint:disable:max-classes-per-file
Object.defineProperty(exports, "__esModule", { value: true });
class AllSubset {
    constructor(setType) {
        this.setType = setType;
        this.type = 'all';
    }
    complement() {
        return [new EmptySubset(this.setType)];
    }
    intersect(other) {
        return other;
    }
    intersectWithSome(other) {
        return other;
    }
    toJsonSchema() {
        return { type: [this.setType] };
    }
}
exports.AllSubset = AllSubset;
class EmptySubset {
    constructor(setType) {
        this.setType = setType;
        this.type = 'empty';
    }
    complement() {
        return [new AllSubset(this.setType)];
    }
    intersect() {
        return this;
    }
    intersectWithSome() {
        return this;
    }
    toJsonSchema() {
        return false;
    }
}
exports.EmptySubset = EmptySubset;
