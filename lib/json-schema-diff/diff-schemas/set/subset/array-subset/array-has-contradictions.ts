import {SomeArraySubsetConfig} from '../array-subset';

const isItemsAndMinItemsContradiction = (config: SomeArraySubsetConfig): boolean => {
    const itemsAcceptsNoValues = config.items.type === 'empty';
    const minItemsRequiresValues = config.minItems > 0;
    return itemsAcceptsNoValues && minItemsRequiresValues;
};

const isMaxItemsAndMinItemsContradiction = (config: SomeArraySubsetConfig): boolean => {
    return config.minItems > config.maxItems;
};

const isMinItemsContradiction = (config: SomeArraySubsetConfig): boolean => {
    return config.minItems === Infinity;
};

export const arrayHasContradictions = (config: SomeArraySubsetConfig): boolean => {
    return isItemsAndMinItemsContradiction(config)
        || isMaxItemsAndMinItemsContradiction(config)
        || isMinItemsContradiction(config);
};
