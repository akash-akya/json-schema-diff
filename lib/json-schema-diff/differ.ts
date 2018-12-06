import {DiffResult} from '../api-types';
import {diffSchemas} from './differ/diff-schemas';

export class Differ {
    public static async diff(sourceSchema: any, destinationSchema: any): Promise<DiffResult> {
        return diffSchemas(sourceSchema, destinationSchema);
    }
}
