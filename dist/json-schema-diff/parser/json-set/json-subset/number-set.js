"use strict";
// tslint:disable:max-classes-per-file
Object.defineProperty(exports, "__esModule", { value: true });
const set_1 = require("../set");
class AllNumberSet {
    constructor(schemaOrigins) {
        this.schemaOrigins = schemaOrigins;
        this.setType = 'number';
        this.type = 'all';
    }
    intersect(other) {
        return other.intersectWithAll(this);
    }
    intersectWithAll(other) {
        return new AllNumberSet(this.schemaOrigins.concat(other.schemaOrigins));
    }
    intersectWithEmpty(other) {
        return new EmptyNumberSet(this.schemaOrigins.concat(other.schemaOrigins));
    }
    complement() {
        return new EmptyNumberSet(this.schemaOrigins);
    }
    toRepresentations() {
        return [{
                destinationValues: set_1.toDestinationRepresentationValues(this.schemaOrigins),
                sourceValues: set_1.toSourceRepresentationValues(this.schemaOrigins),
                type: 'type',
                value: 'number'
            }];
    }
}
exports.AllNumberSet = AllNumberSet;
class EmptyNumberSet {
    constructor(schemaOrigins) {
        this.schemaOrigins = schemaOrigins;
        this.setType = 'number';
        this.type = 'empty';
    }
    intersect(other) {
        return other.intersectWithEmpty(this);
    }
    intersectWithAll(other) {
        return new EmptyNumberSet(this.schemaOrigins.concat(other.schemaOrigins));
    }
    intersectWithEmpty(other) {
        // TODO: this can't be asserted without keywords support
        return new EmptyNumberSet(this.schemaOrigins.concat(other.schemaOrigins));
    }
    complement() {
        return new AllNumberSet(this.schemaOrigins);
    }
    toRepresentations() {
        return [];
    }
}
exports.EmptyNumberSet = EmptyNumberSet;
