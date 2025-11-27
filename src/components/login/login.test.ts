import { describe, expect, it } from "vitest";
import {
    INVALID_BOOLEANS,
    INVALID_STRINGS,
    VALID_BOOLEANS,
    VALID_STRINGS,
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
            VALID_BOOLEANS.forEach((value) => {
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

            INVALID_BOOLEANS.forEach((value) => {
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
            VALID_STRINGS.forEach((value) => {
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

            INVALID_STRINGS.forEach((value) => {
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
            VALID_STRINGS.forEach((value) => {
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

            INVALID_STRINGS.forEach((value) => {
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
