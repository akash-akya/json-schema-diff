import {
    ObjectSubsetConfig
} from './object-subset-config';

const isMinPropertiesBiggerThanDefinedProperties = (config: ObjectSubsetConfig): boolean => {
    const numberOfDefinedPropertiesInSchema = Object.keys(config.properties)
        .map((propertyName) => config.properties[propertyName])
        .filter((propertySchema) => propertySchema.type !== 'empty')
        .length;

    return config.minProperties > numberOfDefinedPropertiesInSchema;
};

const areAdditionalPropertiesNotAllowed = (config: ObjectSubsetConfig): boolean =>
    config.additionalProperties.type === 'empty';

const isMinPropertiesAndAdditionalPropertiesContradiction = (config: ObjectSubsetConfig): boolean => {
    return areAdditionalPropertiesNotAllowed(config) && isMinPropertiesBiggerThanDefinedProperties(config);
};

const isRequiredPropertyContradiction = (config: ObjectSubsetConfig): boolean => {
    return config.required.some((propertyName) => {
        const propertySchema = config.properties[propertyName] || config.additionalProperties;
        return propertySchema.type === 'empty';
    });
};

export const objectSubsetConfigHasContradictions = (config: ObjectSubsetConfig): boolean => {
    return isRequiredPropertyContradiction(config)
        || isMinPropertiesAndAdditionalPropertiesContradiction(config);
};
