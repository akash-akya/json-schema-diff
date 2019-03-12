import {ParsedPropertiesKeyword} from '../../set';
import {getPropertyNames, getPropertySet, ObjectSubsetConfig} from './object-subset-config';
import {unique} from './unique';

const intersectMinProperties = (configA: ObjectSubsetConfig, configB: ObjectSubsetConfig): number =>
    Math.max(configA.minProperties, configB.minProperties);

const intersectProperties = (configA: ObjectSubsetConfig, configB: ObjectSubsetConfig): ParsedPropertiesKeyword => {
    const allPropertyNames = unique(getPropertyNames(configA), getPropertyNames(configB));

    const intersectedProperties: ParsedPropertiesKeyword = {};
    for (const propertyName of allPropertyNames) {
        const propertySetA = getPropertySet(configA, propertyName);
        const propertySetB = getPropertySet(configB, propertyName);
        intersectedProperties[propertyName] = propertySetA.intersect(propertySetB);
    }

    return intersectedProperties;
};

const intersectRequired = (configA: ObjectSubsetConfig, configB: ObjectSubsetConfig): string[] =>
    unique(configA.required, configB.required);

export const intersectObjectSubsetConfig = (
    configA: ObjectSubsetConfig,
    configB: ObjectSubsetConfig
): ObjectSubsetConfig => ({
    additionalProperties: configA.additionalProperties.intersect(configB.additionalProperties),
    maxProperties: configA.maxProperties,
    minProperties: intersectMinProperties(configA, configB),
    properties: intersectProperties(configA, configB),
    required: intersectRequired(configA, configB)
});
