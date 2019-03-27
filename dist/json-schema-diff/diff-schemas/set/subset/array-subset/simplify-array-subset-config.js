"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const json_set_1 = require("../../json-set");
exports.simplifyArraySubsetConfig = (config) => {
    if (config.maxItems === 0) {
        return Object.assign({}, config, { items: json_set_1.allJsonSet });
    }
    else {
        return config;
    }
};
