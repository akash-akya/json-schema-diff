import {ArraySubsetConfig} from './array-subset-config';

const isItemsAndMinItemsContradiction = (config: ArraySubsetConfig): boolean => {
    const itemsAcceptsNoValues = config.items.type === 'empty';
    const minItemsRequiresValues = config.minItems > 0;
    return itemsAcceptsNoValues && minItemsRequiresValues;
};

const isMaxItemsAndMinItemsContradiction = (config: ArraySubsetConfig): boolean => {
    return config.minItems > config.maxItems;
};

const isMinItemsContradiction = (config: ArraySubsetConfig): boolean => {
    return config.minItems === Infinity;
};

export const arraySubsetConfigHasContradictions = (config: ArraySubsetConfig): boolean => {
    return isItemsAndMinItemsContradiction(config)
        || isMaxItemsAndMinItemsContradiction(config)
        || isMinItemsContradiction(config);
};
