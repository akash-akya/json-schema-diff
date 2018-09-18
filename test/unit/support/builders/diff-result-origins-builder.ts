import * as _ from 'lodash';
import {DiffResultOriginValue, Path} from '../../../../lib/api-types';

export class DiffResultOriginsBuilder {
    public static create(): DiffResultOriginsBuilder {
        return new DiffResultOriginsBuilder(['default', 'path'], 'default-value');
    }

    private constructor(private readonly path: Path, private readonly value: any) {}

    public build(): DiffResultOriginValue {
        return {
            path: [...this.path],
            value: _.cloneDeep(this.value)
        };
    }

    public withPath(newLocation: Path): DiffResultOriginsBuilder {
        return new DiffResultOriginsBuilder([...newLocation], this.value);
    }

    public withValue(newValue: any): DiffResultOriginsBuilder {
        const copyOfNewValue = _.cloneDeep(newValue);
        return new DiffResultOriginsBuilder(this.path, copyOfNewValue);
    }
}

export const diffResultOriginsBuilder = DiffResultOriginsBuilder.create();
