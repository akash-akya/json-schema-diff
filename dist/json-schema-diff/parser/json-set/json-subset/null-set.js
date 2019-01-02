"use strict";
// tslint:disable:max-classes-per-file
Object.defineProperty(exports, "__esModule", { value: true });
const set_1 = require("../set");
class AllNullSet {
    constructor(schemaOrigins) {
        this.schemaOrigins = schemaOrigins;
        this.setType = 'null';
        this.type = 'all';
    }
    intersect(other) {
        return other.intersectWithAll(this);
    }
    intersectWithAll(other) {
        return new AllNullSet(this.schemaOrigins.concat(other.schemaOrigins));
    }
    intersectWithEmpty(other) {
        return new EmptyNullSet(this.schemaOrigins.concat(other.schemaOrigins));
    }
    complement() {
        return new EmptyNullSet(this.schemaOrigins);
    }
    toRepresentations() {
        return [{
                destinationValues: set_1.toDestinationRepresentationValues(this.schemaOrigins),
                sourceValues: set_1.toSourceRepresentationValues(this.schemaOrigins),
                type: 'type',
                value: 'null'
            }];
    }
}
exports.AllNullSet = AllNullSet;
class EmptyNullSet {
    constructor(schemaOrigins) {
        this.schemaOrigins = schemaOrigins;
        this.setType = 'null';
        this.type = 'empty';
    }
    intersect(other) {
        return other.intersectWithEmpty(this);
    }
    intersectWithAll(other) {
        return new EmptyNullSet(this.schemaOrigins.concat(other.schemaOrigins));
    }
    intersectWithEmpty(other) {
        // TODO: this can't be asserted without keywords support
        return new EmptyNullSet(this.schemaOrigins.concat(other.schemaOrigins));
    }
    complement() {
        return new AllNullSet(this.schemaOrigins);
    }
    toRepresentations() {
        return [];
    }
}
exports.EmptyNullSet = EmptyNullSet;
