"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
exports.allSchemaTypes = ['array', 'boolean', 'integer', 'null', 'number', 'object', 'string'];
exports.toSourceOriginValues = (schemaOrigins) => toOriginValues(schemaOrigins, 'source');
exports.toDestinationOriginValues = (schemaOrigins) => toOriginValues(schemaOrigins, 'destination');
const toOriginValues = (schemaOrigins, origin) => {
    const originValuesWithDuplications = schemaOrigins
        .filter((schemaOrigin) => schemaOrigin.type === origin)
        .map((schemaOrigin) => ({
        path: schemaOrigin.path,
        value: schemaOrigin.value
    }));
    return _.uniqWith(originValuesWithDuplications, _.isEqual);
};
