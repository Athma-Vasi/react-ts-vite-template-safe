import { describe, expect, it } from "vitest";
import { errorActions } from "./actions";
import { errorReducer_setChildComponentState } from "./reducers";
import { initialErrorState } from "./state";

describe("errorReducer", () => {
    describe(errorActions.setChildComponentState, () => {
        it("should allow valid Record<string, unknown> values", () => {
            const validRecords = [
                {},
                { key: "value" },
                { key1: "value1", key2: 123 },
                { nested: { object: true } },
                { array: [1, 2, 3] },
                { mixed: "string", number: 42, bool: true, obj: { a: 1 } },
            ];

            validRecords.forEach((value) => {
                const dispatch = {
                    action: errorActions.setChildComponentState,
                    payload: value,
                };
                const state = errorReducer_setChildComponentState(
                    initialErrorState,
                    dispatch,
                );
                expect(state.childComponentState).toEqual(value);
            });
        });

        it("should not allow invalid Record values", () => {
            const initial = initialErrorState.childComponentState;
            const invalidValues = [
                "not an object",
                123,
                true,
                null,
                undefined,
                [],
            ];

            invalidValues.forEach((value) => {
                const dispatch = {
                    action: errorActions.setChildComponentState,
                    payload: value,
                };
                const state = errorReducer_setChildComponentState(
                    initialErrorState,
                    dispatch as any,
                );
                expect(state.childComponentState).toEqual(initial);
            });
        });

        it("should allow empty object", () => {
            const dispatch = {
                action: errorActions.setChildComponentState,
                payload: {},
            };
            const state = errorReducer_setChildComponentState(
                initialErrorState,
                dispatch,
            );
            expect(state.childComponentState).toEqual({});
        });

        it("should preserve other state fields", () => {
            const dispatch = {
                action: errorActions.setChildComponentState,
                payload: { test: "value" },
            };
            const state = errorReducer_setChildComponentState(
                initialErrorState,
                dispatch,
            );

            // Verify all expected keys exist
            expect(Object.keys(state)).toContain("childComponentState");
            expect(state.childComponentState).toEqual({ test: "value" });
        });
    });
});
