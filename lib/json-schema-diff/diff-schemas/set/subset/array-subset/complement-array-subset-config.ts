import {allJsonSet} from '../../json-set';
import {defaultMaxItems, defaultMinItems} from '../../keyword-defaults';
import {ArraySubsetConfig} from './array-subset-config';

const complementItems = (config: ArraySubsetConfig): ArraySubsetConfig => ({
    items: config.items.complement(),
    maxItems: defaultMaxItems,
    minItems: 1
});

const complementMinItems = (config: ArraySubsetConfig): ArraySubsetConfig => ({
    items: allJsonSet,
    maxItems: config.minItems - 1,
    minItems: defaultMinItems
});

const complementMaxItems = (config: ArraySubsetConfig): ArraySubsetConfig => ({
    items: allJsonSet,
    maxItems: defaultMaxItems,
    minItems: config.maxItems + 1
});

export const complementArraySubsetConfig = (config: ArraySubsetConfig): ArraySubsetConfig[] => {
    const complementedItems = complementItems(config);
    const complementedMinItems = complementMinItems(config);
    const complementedMaxItems = complementMaxItems(config);
    return [complementedItems, complementedMinItems, complementedMaxItems];
};
