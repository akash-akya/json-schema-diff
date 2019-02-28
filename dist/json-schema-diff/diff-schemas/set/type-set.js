"use strict";
// tslint:disable:max-classes-per-file
Object.defineProperty(exports, "__esModule", { value: true });
class AllTypeSet {
    constructor(setType) {
        this.setType = setType;
        this.type = 'all';
    }
    intersect(other) {
        return other;
    }
    complement() {
        return new EmptyTypeSet(this.setType);
    }
    toJsonSchema() {
        return { type: [this.setType] };
    }
}
exports.AllTypeSet = AllTypeSet;
class EmptyTypeSet {
    constructor(setType) {
        this.setType = setType;
        this.type = 'empty';
    }
    intersect() {
        return this;
    }
    complement() {
        return new AllTypeSet(this.setType);
    }
    toJsonSchema() {
        return false;
    }
}
exports.EmptyTypeSet = EmptyTypeSet;
