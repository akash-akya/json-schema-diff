import {allJsonSet} from '../../json-set';
import {ArraySubsetConfig} from './array-subset-config';

export const simplifyArraySubsetConfig = (config: ArraySubsetConfig): ArraySubsetConfig => {
    if (config.maxItems === 0) {
        return {...config, items: allJsonSet};
    } else {
        return config;
    }
};
