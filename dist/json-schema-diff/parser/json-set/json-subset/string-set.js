"use strict";
// tslint:disable:max-classes-per-file
Object.defineProperty(exports, "__esModule", { value: true });
const set_1 = require("../set");
class AllStringSet {
    constructor(schemaOrigins) {
        this.schemaOrigins = schemaOrigins;
        this.setType = 'string';
        this.type = 'all';
    }
    intersect(otherSet) {
        return otherSet.intersectWithAll(this);
    }
    intersectWithAll(other) {
        return new AllStringSet(this.schemaOrigins.concat(other.schemaOrigins));
    }
    intersectWithEmpty(other) {
        return new EmptyStringSet(this.schemaOrigins.concat(other.schemaOrigins));
    }
    complement() {
        return new EmptyStringSet(this.schemaOrigins);
    }
    toRepresentations() {
        return [{
                destinationValues: set_1.toDestinationRepresentationValues(this.schemaOrigins),
                sourceValues: set_1.toSourceRepresentationValues(this.schemaOrigins),
                type: 'type',
                value: 'string'
            }];
    }
}
exports.AllStringSet = AllStringSet;
class EmptyStringSet {
    constructor(schemaOrigins) {
        this.schemaOrigins = schemaOrigins;
        this.setType = 'string';
        this.type = 'empty';
    }
    intersect(otherSet) {
        return otherSet.intersectWithEmpty(this);
    }
    intersectWithAll(other) {
        return new EmptyStringSet(this.schemaOrigins.concat(other.schemaOrigins));
    }
    intersectWithEmpty(other) {
        // TODO: this can't be asserted without keywords support
        return new EmptyStringSet(this.schemaOrigins.concat(other.schemaOrigins));
    }
    complement() {
        return new AllStringSet(this.schemaOrigins);
    }
    toRepresentations() {
        return [];
    }
}
exports.EmptyStringSet = EmptyStringSet;
