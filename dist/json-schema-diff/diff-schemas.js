"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const dereference_schema_1 = require("./diff-schemas/dereference-schema");
const parse_as_json_set_1 = require("./diff-schemas/parse-as-json-set");
const validate_schemas_1 = require("./diff-schemas/validate-schemas");
const logDebug = (setName, set) => {
    if (process.env.JSON_SCHEMA_DIFF_ENABLE_DEBUG === 'true') {
        console.log(`\n${setName}`);
        console.log(JSON.stringify(set.toJsonSchema(), null, 2));
    }
};
exports.diffSchemas = (sourceSchema, destinationSchema) => __awaiter(this, void 0, void 0, function* () {
    const [dereferencedSourceSchema, dereferencedDestinationSchema] = yield Promise.all([
        dereference_schema_1.dereferenceSchema(sourceSchema), dereference_schema_1.dereferenceSchema(destinationSchema)
    ]);
    yield validate_schemas_1.validateSchemas(sourceSchema, destinationSchema);
    const sourceSet = parse_as_json_set_1.parseAsJsonSet(dereferencedSourceSchema);
    logDebug('sourceSet', sourceSet);
    const destinationSet = parse_as_json_set_1.parseAsJsonSet(dereferencedDestinationSchema);
    logDebug('destinationSet', destinationSet);
    const intersectionOfSets = sourceSet.intersect(destinationSet);
    logDebug('intersectionOfSets', intersectionOfSets);
    const intersectionOfSetsComplement = intersectionOfSets.complement();
    logDebug('intersectionOfSetsComplement', intersectionOfSetsComplement);
    const addedToDestinationSet = intersectionOfSetsComplement.intersect(destinationSet);
    logDebug('addedToDestinationSet', addedToDestinationSet);
    const removedFromDestinationSet = intersectionOfSetsComplement.intersect(sourceSet);
    logDebug('removedFromDestinationSet', removedFromDestinationSet);
    return {
        addedJsonSchema: addedToDestinationSet.toJsonSchema(),
        additionsFound: addedToDestinationSet.type !== 'empty',
        removalsFound: removedFromDestinationSet.type !== 'empty',
        removedJsonSchema: removedFromDestinationSet.toJsonSchema()
    };
});
