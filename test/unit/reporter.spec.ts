import {DiffResult} from '../../lib/api-types';
import {Reporter} from '../../lib/json-schema-diff/reporter';
import {WrappedLog} from '../../lib/json-schema-diff/reporter/wrapped-log';

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
        const diffResult: DiffResult = {
            addedJsonSchema: false,
            additionsFound: false,
            removalsFound: true,
            removedJsonSchema: {type: ['string', 'object', 'null', 'array', 'boolean', 'integer']}
        };

        reporter.reportFailureWithBreakingChanges(diffResult);

        expect(mockWrappedLog.error).toHaveBeenCalledWith(jasmine.stringMatching('"type"')); // removedJsonSchema
        expect(mockWrappedLog.error).toHaveBeenCalledWith(jasmine.stringMatching('"string"')); // removedJsonSchema
        expect(mockWrappedLog.error).toHaveBeenCalledWith(jasmine.stringMatching('false')); // addedJsonSchema
    });

    it('should report non-breaking changes with result when called', async () => {
        const diffResult: DiffResult = {
            addedJsonSchema: {type: ['number']},
            additionsFound: true,
            removalsFound: false,
            removedJsonSchema: false
        };

        reporter.reportNonBreakingChanges(diffResult);

        expect(mockWrappedLog.info).toHaveBeenCalledWith(jasmine.stringMatching('"type"')); // addedJsonSchema
        expect(mockWrappedLog.info).toHaveBeenCalledWith(jasmine.stringMatching('"number"')); // addedJsonSchema
        expect(mockWrappedLog.info).toHaveBeenCalledWith(jasmine.stringMatching('false')); // removedJsonSchema
    });
});
