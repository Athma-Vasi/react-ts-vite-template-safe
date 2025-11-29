import { describe, expect, it } from "vitest";
import {
    invalid_booleans,
    invalid_strings,
    valid_booleans,
    valid_strings,
} from "../../constants";
import { registerActions } from "./actions";
import {
    registerReducer_setIsLoading,
    registerReducer_setPassword,
    registerReducer_setUsername,
} from "./reducers";
import { initialRegisterState } from "./state";

describe("RegisterReducer", () => {
    describe(registerActions.setIsLoading, () => {
        it("should allow valid boolean values", () => {
            valid_booleans.forEach((value) => {
                const dispatch = {
                    action: registerActions.setIsLoading,
                    payload: value,
                };
                const state = registerReducer_setIsLoading(
                    initialRegisterState,
                    dispatch,
                );
                expect(state.isLoading).toBe(value);
            });
        });

        it("should not allow invalid boolean values", () => {
            const initialIsLoading = initialRegisterState.isLoading;

            invalid_booleans.forEach((value) => {
                const dispatch = {
                    action: registerActions.setIsLoading,
                    payload: value,
                };
                const state = registerReducer_setIsLoading(
                    initialRegisterState,
                    dispatch as any,
                );
                expect(state.isLoading).toBe(initialIsLoading);
            });
        });
    });

    describe(registerActions.setPassword, () => {
        it("should allow valid string values", () => {
            valid_strings.forEach((value) => {
                const dispatch = {
                    action: registerActions.setPassword,
                    payload: value,
                };
                const state = registerReducer_setPassword(
                    initialRegisterState,
                    dispatch,
                );
                expect(state.password).toBe(value);
            });
        });

        it("should not allow invalid string values", () => {
            const initialPassword = initialRegisterState.password;

            invalid_strings.forEach((value) => {
                const dispatch = {
                    action: registerActions.setPassword,
                    payload: value,
                };
                const state = registerReducer_setPassword(
                    initialRegisterState,
                    dispatch as any,
                );
                expect(state.password).toBe(initialPassword);
            });
        });
    });

    describe(registerActions.setUsername, () => {
        it("should allow valid string values", () => {
            valid_strings.forEach((value) => {
                const dispatch = {
                    action: registerActions.setUsername,
                    payload: value,
                };
                const state = registerReducer_setUsername(
                    initialRegisterState,
                    dispatch,
                );
                expect(state.username).toBe(value);
            });
        });

        it("should not allow invalid string values", () => {
            const initialUsername = initialRegisterState.username;

            invalid_strings.forEach((value) => {
                const dispatch = {
                    action: registerActions.setUsername,
                    payload: value,
                };
                const state = registerReducer_setUsername(
                    initialRegisterState,
                    dispatch as any,
                );
                expect(state.username).toBe(initialUsername);
            });
        });
    });
});
