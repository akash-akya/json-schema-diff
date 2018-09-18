import * as _ from 'lodash';
import {
    CoreDiffJsonSchema,
    DiffJsonSchema
} from '../../../../lib/json-schema-diff/differ/parser/json-set/diff-json-schema';
import {DiffResultOriginsBuilder} from './diff-result-origins-builder';

interface DiffJsonSchemaBuilderState {
    schema: CoreDiffJsonSchema;
    destinationOrigins: DiffResultOriginsBuilder[];
    sourceOrigins: DiffResultOriginsBuilder[];
}

export class DiffJsonSchemaBuilder {
    public static defaultDiffJsonSchemaBuilder(): DiffJsonSchemaBuilder {
        return new DiffJsonSchemaBuilder({
            destinationOrigins: [],
            schema: {type: []},
            sourceOrigins: []
        });
    }

    private constructor(private readonly state: DiffJsonSchemaBuilderState) {}

    public withSchema(schema: CoreDiffJsonSchema): DiffJsonSchemaBuilder {
        const copyOfSchema = _.cloneDeep(schema);
        return new DiffJsonSchemaBuilder({...this.state, schema: copyOfSchema});
    }

    public withDestinationOrigins(origins: DiffResultOriginsBuilder[]): DiffJsonSchemaBuilder {
        return new DiffJsonSchemaBuilder({...this.state, destinationOrigins: [...origins]});
    }

    public withSourceOrigins(origins: DiffResultOriginsBuilder[]): DiffJsonSchemaBuilder {
        return new DiffJsonSchemaBuilder({...this.state, sourceOrigins: [...origins]});
    }

    public build(): DiffJsonSchema {
        const copyOfSchema = _.cloneDeep(this.state.schema);
        const result = {...copyOfSchema};
        if (this.state.destinationOrigins.length > 0) {
            result['x-destination-origins'] = this.state.destinationOrigins.map((origin) => origin.build());
        }
        if (this.state.sourceOrigins.length > 0) {
            result['x-source-origins'] = this.state.sourceOrigins.map((origin) => origin.build());
        }
        return result;
    }
}

export const diffJsonSchemaBuilder = DiffJsonSchemaBuilder.defaultDiffJsonSchemaBuilder();
