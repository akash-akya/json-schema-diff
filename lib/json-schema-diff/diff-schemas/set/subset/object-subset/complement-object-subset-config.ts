import {allJsonSet, emptyJsonSet} from '../../json-set';
import {defaultMinProperties, defaultRequired} from '../../keyword-defaults';
import {ParsedPropertiesKeyword} from '../../set';
import {getPropertyNames, getPropertySet, ObjectSubsetConfig} from './object-subset-config';

const complementProperties = (config: ObjectSubsetConfig): ObjectSubsetConfig[] =>
    getPropertyNames(config).map((propertyName) => {
        const complementedPropertySchema = getPropertySet(config, propertyName).complement();

        return {
            additionalProperties: allJsonSet,
            // TODO: Untestable today, need:
            //  not: {properties: {name: {type: 'string'}, minProperties: 1, type: 'object'} -> true
            minProperties: defaultMinProperties,
            properties: {[propertyName]: complementedPropertySchema},
            required: [propertyName]
        };
    });

const complementRequiredProperties = (config: ObjectSubsetConfig): ObjectSubsetConfig[] =>
    config.required.map((requiredPropertyName) => ({
        additionalProperties: allJsonSet,
        minProperties: defaultMinProperties,
        properties: {
            [requiredPropertyName]: emptyJsonSet
        },
        required: defaultRequired
    }));

const complementAdditionalProperties = (config: ObjectSubsetConfig): ObjectSubsetConfig[] => {
    const defaultComplementedAdditionalProperties = [complementAdditionalPropertiesWithEmpty(config)];

    return getPropertyNames(config).length > 0
        ? defaultComplementedAdditionalProperties.concat(complementAdditionalPropertiesWithRequired(config))
        : defaultComplementedAdditionalProperties;
};

const complementAdditionalPropertiesWithEmpty = (config: ObjectSubsetConfig): ObjectSubsetConfig => {
    const propertyNames = getPropertyNames(config);

    const emptyProperties: ParsedPropertiesKeyword = {};
    for (const propertyName of propertyNames) {
        emptyProperties[propertyName] = emptyJsonSet;
    }

    return {
        additionalProperties: config.additionalProperties.complement(),
        minProperties: 1,
        properties: emptyProperties,
        required: defaultRequired
    };
};

const complementAdditionalPropertiesWithRequired = (config: ObjectSubsetConfig): ObjectSubsetConfig => {
    const propertyNames = getPropertyNames(config);
    return {
        additionalProperties: config.additionalProperties.complement(),
        minProperties: 1 + propertyNames.length,
        // TODO: All the tests went green when I made this an empty object, whats up with that?
        properties: config.properties,
        required: propertyNames
    };
};

export const complementObjectSubsetConfig = (config: ObjectSubsetConfig): ObjectSubsetConfig[] => {
    const complementedProperties = complementProperties(config);
    const complementedAdditionalProperties = complementAdditionalProperties(config);
    const complementedRequiredProperties = complementRequiredProperties(config);

    return [
        ...complementedAdditionalProperties,
        ...complementedProperties,
        ...complementedRequiredProperties
    ];
};
