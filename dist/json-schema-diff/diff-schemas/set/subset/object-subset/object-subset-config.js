"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPropertyNames = (config) => Object.keys(config.properties);
exports.getPropertySet = (config, propertyName) => config.properties[propertyName] || config.additionalProperties;
