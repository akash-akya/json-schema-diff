"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const type_set_1 = require("../set/type-set");
const is_type_supported_1 = require("./is-type-supported");
exports.createTypeSet = (setType, types) => is_type_supported_1.isTypeSupported(types, setType)
    ? new type_set_1.AllTypeSet(setType)
    : new type_set_1.EmptyTypeSet(setType);
