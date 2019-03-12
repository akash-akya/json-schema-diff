import {ArraySubsetConfig} from './array-subset-config';

const intersectMaxItems = (configA: ArraySubsetConfig, configB: ArraySubsetConfig): number =>
    Math.min(configA.maxItems, configB.maxItems);

const intersectMinItems = (configA: ArraySubsetConfig, configB: ArraySubsetConfig): number =>
    Math.max(configA.minItems, configB.minItems);

export const intersectArraySubsetConfig = (
    configA: ArraySubsetConfig,
    configB: ArraySubsetConfig
): ArraySubsetConfig => ({
    items: configA.items.intersect(configB.items),
    maxItems: intersectMaxItems(configA, configB),
    minItems: intersectMinItems(configA, configB)
});
