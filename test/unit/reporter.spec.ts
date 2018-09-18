import {DiffResult} from '../../lib/api-types';
import {DiffJsonSchema} from '../../lib/json-schema-diff/differ/parser/json-set/diff-json-schema';
import {Reporter} from '../../lib/json-schema-diff/reporter';
import {WrappedLog} from '../../lib/json-schema-diff/reporter/wrapped-log';
import {diffJsonSchemaBuilder} from './support/builders/diff-json-schema-builder';
import {diffResultOriginsBuilder} from './support/builders/diff-result-origins-builder';

describe('reporter', () => {
    let reporter: Reporter;
    let mockWrappedLog: jasmine.SpyObj<WrappedLog>;

    beforeEach(() => {
        mockWrappedLog = jasmine.createSpyObj<WrappedLog>('wrappedLog', ['error', 'info']);
        reporter = new Reporter(mockWrappedLog);
    });

    it('should report a success message when diff is successful with no differences', async () => {
        reporter.reportNoDifferencesFound();
        expect(mockWrappedLog.info).toHaveBeenCalledWith('No differences found');
    });

    it('should report errors', async () => {
        reporter.reportError(new Error('some error'));

        expect(mockWrappedLog.error).toHaveBeenCalledWith(new Error('some error'));
    });

    it('should report breaking changes with result', async () => {
        const removedJsonSchema: DiffJsonSchema = diffJsonSchemaBuilder
            .withSourceOrigins([diffResultOriginsBuilder
                .withPath(['type'])
                .withValue(undefined)])
            .withDestinationOrigins([diffResultOriginsBuilder
                .withPath(['type'])
                .withValue('number')])
            .withSchema({type: ['string', 'object', 'null', 'array', 'boolean', 'integer']})
            .build();
        const addedJsonSchema: DiffJsonSchema = false;
        const diffResult: DiffResult = {
            addedJsonSchema,
            additionsFound: false,
            removalsFound: true,
            removedJsonSchema
        };

        reporter.reportFailureWithBreakingChanges(diffResult);

        expect(mockWrappedLog.error).toHaveBeenCalledWith(jasmine.stringMatching('"type"')); // removedJsonSchema
        expect(mockWrappedLog.error).toHaveBeenCalledWith(jasmine.stringMatching('"string"')); // removedJsonSchema
        expect(mockWrappedLog.error).toHaveBeenCalledWith(jasmine.stringMatching('false')); // addedJsonSchema
    });

    it('should report non-breaking changes with result when called', async () => {
        const addedJsonSchema: DiffJsonSchema = diffJsonSchemaBuilder
            .withSourceOrigins([diffResultOriginsBuilder
                .withPath(['type'])
                .withValue('string')])
            .withDestinationOrigins([diffResultOriginsBuilder
                .withPath(['type'])
                .withValue('number')])
            .withSchema({type: ['number']})
            .build();
        const removedJsonSchema: DiffJsonSchema = false;
        const diffResult: DiffResult = {
            addedJsonSchema,
            additionsFound: true,
            removalsFound: false,
            removedJsonSchema
        };

        reporter.reportNonBreakingChanges(diffResult);

        expect(mockWrappedLog.info).toHaveBeenCalledWith(jasmine.stringMatching('"type"')); // addedJsonSchema
        expect(mockWrappedLog.info).toHaveBeenCalledWith(jasmine.stringMatching('"number"')); // addedJsonSchema
        expect(mockWrappedLog.info).toHaveBeenCalledWith(jasmine.stringMatching('false')); // removedJsonSchema
    });
});
