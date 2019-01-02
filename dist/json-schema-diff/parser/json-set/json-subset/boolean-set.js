"use strict";
// tslint:disable:max-classes-per-file
Object.defineProperty(exports, "__esModule", { value: true });
const set_1 = require("../set");
class AllBooleanSet {
    constructor(schemaOrigins) {
        this.schemaOrigins = schemaOrigins;
        this.setType = 'boolean';
        this.type = 'all';
    }
    intersect(other) {
        return other.intersectWithAll(this);
    }
    intersectWithAll(other) {
        return new AllBooleanSet(this.schemaOrigins.concat(other.schemaOrigins));
    }
    intersectWithEmpty(other) {
        return new EmptyBooleanSet(this.schemaOrigins.concat(other.schemaOrigins));
    }
    complement() {
        return new EmptyBooleanSet(this.schemaOrigins);
    }
    toRepresentations() {
        return [{
                destinationValues: set_1.toDestinationRepresentationValues(this.schemaOrigins),
                sourceValues: set_1.toSourceRepresentationValues(this.schemaOrigins),
                type: 'type',
                value: 'boolean'
            }];
    }
}
exports.AllBooleanSet = AllBooleanSet;
class EmptyBooleanSet {
    constructor(schemaOrigins) {
        this.schemaOrigins = schemaOrigins;
        this.setType = 'boolean';
        this.type = 'empty';
    }
    intersect(other) {
        return other.intersectWithEmpty(this);
    }
    intersectWithAll(other) {
        return new EmptyBooleanSet(this.schemaOrigins.concat(other.schemaOrigins));
    }
    intersectWithEmpty(other) {
        // TODO: this can't be asserted without keywords support
        return new EmptyBooleanSet(this.schemaOrigins.concat(other.schemaOrigins));
    }
    complement() {
        return new AllBooleanSet(this.schemaOrigins);
    }
    toRepresentations() {
        return [];
    }
}
exports.EmptyBooleanSet = EmptyBooleanSet;
