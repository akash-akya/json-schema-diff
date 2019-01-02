"use strict";
// tslint:disable:max-classes-per-file
Object.defineProperty(exports, "__esModule", { value: true });
const set_1 = require("../set");
class AllIntegerSet {
    constructor(schemaOrigins) {
        this.schemaOrigins = schemaOrigins;
        this.setType = 'integer';
        this.type = 'all';
    }
    intersect(other) {
        return other.intersectWithAll(this);
    }
    intersectWithAll(other) {
        return new AllIntegerSet(this.schemaOrigins.concat(other.schemaOrigins));
    }
    intersectWithEmpty(other) {
        return new EmptyIntegerSet(this.schemaOrigins.concat(other.schemaOrigins));
    }
    complement() {
        return new EmptyIntegerSet(this.schemaOrigins);
    }
    toRepresentations() {
        return [{
                destinationValues: set_1.toDestinationRepresentationValues(this.schemaOrigins),
                sourceValues: set_1.toSourceRepresentationValues(this.schemaOrigins),
                type: 'type',
                value: 'integer'
            }];
    }
}
exports.AllIntegerSet = AllIntegerSet;
class EmptyIntegerSet {
    constructor(schemaOrigins) {
        this.schemaOrigins = schemaOrigins;
        this.setType = 'integer';
        this.type = 'empty';
    }
    intersect(other) {
        return other.intersectWithEmpty(this);
    }
    intersectWithAll(other) {
        return new EmptyIntegerSet(this.schemaOrigins.concat(other.schemaOrigins));
    }
    intersectWithEmpty(other) {
        // TODO: this can't be asserted without keywords support
        return new EmptyIntegerSet(this.schemaOrigins.concat(other.schemaOrigins));
    }
    complement() {
        return new AllIntegerSet(this.schemaOrigins);
    }
    toRepresentations() {
        return [];
    }
}
exports.EmptyIntegerSet = EmptyIntegerSet;
