"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable:max-classes-per-file
const set_1 = require("../set");
class AllArraySet {
    constructor(schemaOrigins) {
        this.schemaOrigins = schemaOrigins;
        this.setType = 'array';
        this.type = 'all';
    }
    intersect(other) {
        return other.intersectWithAll(this);
    }
    intersectWithAll(other) {
        return new AllArraySet(this.schemaOrigins.concat(other.schemaOrigins));
    }
    intersectWithEmpty(other) {
        return new EmptyArraySet(this.schemaOrigins.concat(other.schemaOrigins));
    }
    complement() {
        return new EmptyArraySet(this.schemaOrigins);
    }
    toRepresentations() {
        return [{
                destinationValues: set_1.toDestinationRepresentationValues(this.schemaOrigins),
                sourceValues: set_1.toSourceRepresentationValues(this.schemaOrigins),
                type: 'type',
                value: 'array'
            }];
    }
}
exports.AllArraySet = AllArraySet;
class EmptyArraySet {
    constructor(schemaOrigins) {
        this.schemaOrigins = schemaOrigins;
        this.setType = 'array';
        this.type = 'empty';
    }
    intersect(other) {
        return other.intersectWithEmpty(this);
    }
    intersectWithAll(other) {
        return new EmptyArraySet(other.schemaOrigins.concat(this.schemaOrigins));
    }
    intersectWithEmpty(other) {
        // TODO: this can't be asserted without keywords support
        return new EmptyArraySet(other.schemaOrigins.concat(this.schemaOrigins));
    }
    complement() {
        return new AllArraySet(this.schemaOrigins);
    }
    toRepresentations() {
        return [];
    }
}
exports.EmptyArraySet = EmptyArraySet;
