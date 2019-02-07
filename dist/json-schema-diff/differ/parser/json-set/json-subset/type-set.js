"use strict";
// tslint:disable:max-classes-per-file
Object.defineProperty(exports, "__esModule", { value: true });
const set_1 = require("../set");
class AllTypeSet {
    constructor(setType, schemaOrigins) {
        this.setType = setType;
        this.schemaOrigins = schemaOrigins;
        this.type = 'all';
    }
    toAll() {
        throw new Error('not implemented');
    }
    toEmpty() {
        throw new Error('not implemented');
    }
    intersect(otherSet) {
        return otherSet.intersectWithAll(this);
    }
    intersectWithAll(other) {
        return new AllTypeSet(this.setType, this.schemaOrigins.concat(other.schemaOrigins));
    }
    intersectWithEmpty(other) {
        return new EmptyTypeSet(this.setType, this.schemaOrigins.concat(other.schemaOrigins));
    }
    complement() {
        return new EmptyTypeSet(this.setType, this.schemaOrigins);
    }
    toJsonSchema() {
        return {
            'type': [this.setType],
            'x-destination-origins': set_1.toDestinationOriginValues(this.schemaOrigins),
            'x-source-origins': set_1.toSourceOriginValues(this.schemaOrigins)
        };
    }
}
exports.AllTypeSet = AllTypeSet;
class EmptyTypeSet {
    constructor(setType, schemaOrigins) {
        this.setType = setType;
        this.schemaOrigins = schemaOrigins;
        this.type = 'empty';
    }
    toAll() {
        throw new Error('not implemented');
    }
    toEmpty() {
        throw new Error('not implemented');
    }
    intersect(otherSet) {
        return otherSet.intersectWithEmpty(this);
    }
    intersectWithAll(other) {
        return new EmptyTypeSet(this.setType, this.schemaOrigins.concat(other.schemaOrigins));
    }
    intersectWithEmpty(other) {
        // TODO: this can't be asserted without keywords support e.g. {allOf: [{type: !str}, {type: !str}]}} -> true
        return new EmptyTypeSet(this.setType, this.schemaOrigins.concat(other.schemaOrigins));
    }
    complement() {
        return new AllTypeSet(this.setType, this.schemaOrigins);
    }
    toJsonSchema() {
        return false;
    }
}
exports.EmptyTypeSet = EmptyTypeSet;
