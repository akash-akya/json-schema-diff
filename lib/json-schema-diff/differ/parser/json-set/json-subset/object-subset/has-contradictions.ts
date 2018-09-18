import {
    SomeObjectSubsetConfig
} from '../object-subset';

const isMinPropertiesBiggerThanDefinedProperties = (config: SomeObjectSubsetConfig): boolean => {
    const minProperties = config.minProperties.parsedValue;

    const numberOfDefinedPropertiesInSchema = Object.keys(config.properties)
        .map((propertyName) => config.properties[propertyName])
        .filter((propertySchema) => propertySchema.type !== 'empty')
        .length;

    return minProperties > numberOfDefinedPropertiesInSchema;
};

const areAdditionalPropertiesNotAllowed = (config: SomeObjectSubsetConfig): boolean =>
    config.additionalProperties.type === 'empty';

const isMinPropertiesAndAdditionalPropertiesContradiction = (config: SomeObjectSubsetConfig): boolean => {
    return areAdditionalPropertiesNotAllowed(config) && isMinPropertiesBiggerThanDefinedProperties(config);
};

const isRequiredPropertyContradiction = (config: SomeObjectSubsetConfig): boolean => {
    return config.required.parsedValue.some((propertyName) => {
        const propertySchema = config.properties[propertyName] || config.additionalProperties;
        return propertySchema.type === 'empty';
    });
};

export const hasContradictions = (config: SomeObjectSubsetConfig): boolean => {
    return isRequiredPropertyContradiction(config) || isMinPropertiesAndAdditionalPropertiesContradiction(config);
};
