import { describe, expect, it } from "vitest";
import {
    invalid_booleans,
    invalid_strings,
    valid_booleans,
    valid_strings,
} from "../../constants";
import { loginActions } from "./actions";
import {
    loginReducer_setIsLoading,
    loginReducer_setPassword,
    loginReducer_setUsername,
} from "./reducers";
import { initialLoginState } from "./state";

describe("loginReducer", () => {
    describe(loginActions.setIsLoading, () => {
        it("should allow valid boolean values", () => {
            valid_booleans.forEach((value) => {
                const dispatch = {
                    action: loginActions.setIsLoading,
                    payload: value,
                };
                const state = loginReducer_setIsLoading(
                    initialLoginState,
                    dispatch,
                );
                expect(state.isLoading).toBe(value);
            });
        });

        it("should not allow invalid boolean values", () => {
            const initialIsLoading = initialLoginState.isLoading;

            invalid_booleans.forEach((value) => {
                const dispatch = {
                    action: loginActions.setIsLoading,
                    payload: value,
                };
                const state = loginReducer_setIsLoading(
                    initialLoginState,
                    dispatch as any,
                );
                expect(state.isLoading).toBe(initialIsLoading);
            });
        });
    });

    describe(loginActions.setPassword, () => {
        it("should allow valid string values", () => {
            valid_strings.forEach((value) => {
                const dispatch = {
                    action: loginActions.setPassword,
                    payload: value,
                };
                const state = loginReducer_setPassword(
                    initialLoginState,
                    dispatch,
                );
                expect(state.password).toBe(value);
            });
        });

        it("should not allow invalid string values", () => {
            const initialPassword = initialLoginState.password;

            invalid_strings.forEach((value) => {
                const dispatch = {
                    action: loginActions.setPassword,
                    payload: value,
                };
                const state = loginReducer_setPassword(
                    initialLoginState,
                    dispatch as any,
                );
                expect(state.password).toBe(initialPassword);
            });
        });
    });

    describe(loginActions.setUsername, () => {
        it("should allow valid string values", () => {
            valid_strings.forEach((value) => {
                const dispatch = {
                    action: loginActions.setUsername,
                    payload: value,
                };
                const state = loginReducer_setUsername(
                    initialLoginState,
                    dispatch,
                );
                expect(state.username).toBe(value);
            });
        });

        it("should not allow invalid string values", () => {
            const initialUsername = initialLoginState.username;

            invalid_strings.forEach((value) => {
                const dispatch = {
                    action: loginActions.setUsername,
                    payload: value,
                };
                const state = loginReducer_setUsername(
                    initialLoginState,
                    dispatch as any,
                );
                expect(state.username).toBe(initialUsername);
            });
        });
    });
});
