import {ParsedPropertiesKeyword, Set} from '../../set';

export interface ObjectSubsetConfig {
    additionalProperties: Set<'json'>;
    properties: ParsedPropertiesKeyword;
    minProperties: number;
    required: string[];
}

export const getPropertyNames = (config: ObjectSubsetConfig): string[] => Object.keys(config.properties);

export const getPropertySet = (config: ObjectSubsetConfig, propertyName: string): Set<'json'> =>
    config.properties[propertyName] || config.additionalProperties;
