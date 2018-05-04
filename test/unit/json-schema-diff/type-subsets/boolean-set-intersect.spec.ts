import {schemaOriginBuilder} from '../../support/builders/parsed-schema-keywords/schema-origin-builder';
import {representationBuilder} from '../../support/builders/representation-builder';
import {representationValueBuilder} from '../../support/builders/representation-value-builder';
import {
    allBooleanSetBuilder, createAllBooleanSetWithOrigins, createEmptyBooleanSetWithOrigins,
    emptyBooleanSetBuilder
} from '../../support/builders/sets/boolean-set-builder';
import {customMatchers, CustomMatchers} from '../../support/custom-matchers/custom-matchers';

declare function expect<T>(actual: T): CustomMatchers<T>;

describe('boolean-set', () => {
    beforeEach(() => {
        jasmine.addMatchers(customMatchers);
    });

    describe('intersect', () => {
        describe('empty and empty', () => {
            it('should union empty and empty boolean sets resulting in another empty boolean set', () => {
                const emptyBooleanSetSource = emptyBooleanSetBuilder.build();

                const emptyBooleanSetDestination = emptyBooleanSetBuilder.build();

                const resultBooleanSet = emptyBooleanSetSource.intersect(emptyBooleanSetDestination);

                expect(resultBooleanSet.toRepresentations()).toContainRepresentations([]);
            });

            it('should merge schema origins when empty and empty boolean sets are intersected', () => {
                const emptyBooleanSetSource = createEmptyBooleanSetWithOrigins([
                    schemaOriginBuilder
                        .withPath('.type')
                        .withType('source')
                        .withValue('string')
                ]).build();

                const emptyBooleanSetDestination = createEmptyBooleanSetWithOrigins([
                    schemaOriginBuilder
                        .withPath('.type')
                        .withType('destination')
                        .withValue('string')
                ]).build();

                const complementOfIntersection = emptyBooleanSetSource
                    .intersect(emptyBooleanSetDestination).complement();

                const representationValue = representationValueBuilder
                    .withPath('.type')
                    .withValue('string');
                const expectedRepresentation = representationBuilder
                    .withDestinationValue(representationValue)
                    .withSourceValue(representationValue)
                    .withValue('boolean')
                    .build();

                expect(complementOfIntersection.toRepresentations()).toContainRepresentations([expectedRepresentation]);
            });
        });

        describe('all and all', () => {
            it('should intersect all and all boolean sets resulting in another all boolean set', () => {
                const allBooleanSetSource = createAllBooleanSetWithOrigins([]).build();

                const allBooleanSetDestination = createAllBooleanSetWithOrigins([]).build();

                const resultBooleanSet = allBooleanSetSource.intersect(allBooleanSetDestination);

                const representation = representationBuilder
                    .withSourceValues([])
                    .withDestinationValues([])
                    .withValue('boolean')
                    .build();
                expect(resultBooleanSet.toRepresentations()).toContainRepresentations([representation]);
            });

            it('should merge schema origins when all and all boolean sets are intersected', () => {
                const allBooleanSetSource = createAllBooleanSetWithOrigins([
                    schemaOriginBuilder
                        .withPath('.type')
                        .withType('source')
                        .withValue('boolean')
                ]).build();

                const allBooleanSetDestination = createAllBooleanSetWithOrigins([
                    schemaOriginBuilder
                        .withPath('.type')
                        .withType('destination')
                        .withValue('boolean')
                ]).build();

                const resultBooleanSet = allBooleanSetSource.intersect(allBooleanSetDestination);

                const representationValue = representationValueBuilder
                    .withPath('.type')
                    .withValue('boolean');
                const expectedRepresentation = representationBuilder
                    .withDestinationValue(representationValue)
                    .withSourceValue(representationValue)
                    .withValue('boolean')
                    .build();

                expect(resultBooleanSet.toRepresentations()).toContainRepresentations([expectedRepresentation]);
            });
        });

        describe('all and empty', () => {
            it('should intersect empty and all boolean sets resulting in another empty boolean set', () => {
                const emptyBooleanSetSource = emptyBooleanSetBuilder.build();

                const allBooleanSetDestination = allBooleanSetBuilder.build();

                const resultBooleanSet = emptyBooleanSetSource.intersect(allBooleanSetDestination);

                expect(resultBooleanSet.toRepresentations()).toContainRepresentations([]);
            });

            it('should merge schema origins when empty and all boolean sets are intersected', () => {
                const emptyBooleanSetSource = createEmptyBooleanSetWithOrigins([
                    schemaOriginBuilder
                        .withPath('.type')
                        .withType('source')
                        .withValue('string')
                ]).build();

                const allBooleanSetDestination = createAllBooleanSetWithOrigins([
                    schemaOriginBuilder
                        .withPath('.type')
                        .withType('destination')
                        .withValue('boolean')
                ]).build();

                const complementOfTheResult = emptyBooleanSetSource.intersect(allBooleanSetDestination).complement();

                const expectedRepresentation = representationBuilder
                    .withDestinationValue(representationValueBuilder
                        .withPath('.type')
                        .withValue('boolean'))
                    .withSourceValue(representationValueBuilder
                        .withPath('.type')
                        .withValue('string'))
                    .withValue('boolean')
                    .build();

                expect(complementOfTheResult.toRepresentations()).toContainRepresentations([expectedRepresentation]);
            });

            it('should return the same result regardless the order of the operands', () => {
                const emptyBooleanSet = emptyBooleanSetBuilder.build();

                const allBooleanSet = allBooleanSetBuilder.build();

                const resultAllWithEmpty = allBooleanSet.intersect(emptyBooleanSet);
                const resultEmptyWithAll = emptyBooleanSet.intersect(allBooleanSet);

                expect(resultAllWithEmpty.complement().toRepresentations())
                    .toContainRepresentations(resultEmptyWithAll.complement().toRepresentations());
            });
        });
    });
});
