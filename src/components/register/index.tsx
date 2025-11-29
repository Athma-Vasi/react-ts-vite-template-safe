import { useEffect, useReducer, useRef } from "react";
import { Some } from "ts-results";
import { sendMessageToWorker } from "../../utils";
import { AccessibleTextInput } from "../accessibleInputs/AccessibleTextInput";
import ErrorSuspenseHOC from "../error";
import { errorActions } from "../error/actions";
import type { ErrorDispatch } from "../error/dispatches";
import { registerActions } from "./actions";
import type {
    MessageEventMainToRegisterCacheWorker,
    MessageEventRegisterCacheWorkerToMain,
} from "./cacheWorker";
import CacheWorker from "./cacheWorker?worker";
import FetchWorker from "./fetchWorker?worker";
import type {
    MessageEventMainToRegisterForageWorker,
    MessageEventRegisterForageWorkerToMain,
} from "./forageWorker";
import ForageWorker from "./forageWorker?worker";
import {
    handleMessageFromCacheWorker,
    handleMessageFromFetchWorker,
    handleMessageFromForageWorker,
} from "./handlers";
import { registerReducer } from "./reducers";
import {
    password_validation_regexes,
    username_validation_regexes,
} from "./regexes";
import { initialRegisterState, type RegisterState } from "./state";

type RegisterProps = {
    // this component's back-up state from ErrorBoundary
    childComponentState: RegisterState;
    errorDispatch: React.ActionDispatch<[dispatch: ErrorDispatch]>;
};
function Register(
    { childComponentState: backupStateFromErrorHOC, errorDispatch }:
        RegisterProps,
) {
    const [
        RegisterState,
        RegisterDispatch,
    ] = useReducer(
        registerReducer,
        backupStateFromErrorHOC ?? initialRegisterState,
    );
    const {
        forageWorkerMaybe,
        cacheWorkerMaybe,
        fetchWorkerMaybe,
        isLoading,
        password,
        safeErrorMaybe,
        username,
    } = RegisterState;

    const isComponentMountedRef = useRef(true);

    useEffect(() => {
        if (
            forageWorkerMaybe.some || cacheWorkerMaybe.some ||
            fetchWorkerMaybe.some
        ) {
            return;
        }

        // initialize, add to state, and setup listeners for workers

        const forageWorker = new ForageWorker();
        RegisterDispatch({
            action: registerActions.setForageWorkerMaybe,
            payload: Some(forageWorker),
        });
        forageWorker.onmessage = async (
            event: MessageEventRegisterForageWorkerToMain,
        ) => {
            await handleMessageFromForageWorker(
                {
                    errorDispatch,
                    event,
                    isComponentMountedRef,
                    RegisterDispatch,
                },
            );
        };

        const cacheWorker = new CacheWorker();
        RegisterDispatch({
            action: registerActions.setCacheWorkerMaybe,
            payload: Some(cacheWorker),
        });
        cacheWorker.onmessage = async (
            event: MessageEventRegisterCacheWorkerToMain,
        ) => {
            await handleMessageFromCacheWorker(
                {
                    errorDispatch,
                    event,
                    isComponentMountedRef,
                    RegisterDispatch,
                },
            );
        };

        const fetchWorker = new FetchWorker();
        RegisterDispatch({
            action: registerActions.setFetchWorkerMaybe,
            payload: Some(fetchWorker),
        });
        fetchWorker.onmessage = async (
            event: MessageEventRegisterCacheWorkerToMain,
        ) => {
            await handleMessageFromFetchWorker(
                {
                    errorDispatch,
                    event,
                    isComponentMountedRef,
                    RegisterDispatch,
                },
            );
        };

        // cleanup function to terminate workers on unmount
        return () => {
            forageWorker.terminate();
            cacheWorker.terminate();
            fetchWorker.terminate();
            isComponentMountedRef.current = false;
        };
    }, []);

    if (safeErrorMaybe.some) {
        throw safeErrorMaybe.val;
    }

    const usernameElement = (
        <AccessibleTextInput
            action={registerActions.setUsername}
            errorAction={errorActions.setChildComponentState}
            dispatch={RegisterDispatch}
            errorDispatch={errorDispatch}
            label="Username:"
            name="username"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                const { currentTarget: { value } } = event;

                sendMessageToWorker<MessageEventMainToRegisterCacheWorker>({
                    actions: registerActions,
                    dispatch: RegisterDispatch,
                    message: {
                        kind: "set",
                        payload: ["username", value],
                    },
                    workerMaybe: cacheWorkerMaybe,
                });

                sendMessageToWorker<MessageEventMainToRegisterForageWorker>({
                    actions: registerActions,
                    dispatch: RegisterDispatch,
                    message: {
                        kind: "set",
                        payload: ["username", value],
                    },
                    workerMaybe: forageWorkerMaybe,
                });
            }}
            type="text"
            validationRegexes={username_validation_regexes}
            value={username}
        />
    );

    const passwordElement = (
        <AccessibleTextInput
            action={registerActions.setPassword}
            dispatch={RegisterDispatch}
            errorAction={errorActions.setChildComponentState}
            errorDispatch={errorDispatch}
            label="Password:"
            name="password"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                const { currentTarget: { value } } = event;

                sendMessageToWorker<MessageEventMainToRegisterCacheWorker>({
                    actions: registerActions,
                    dispatch: RegisterDispatch,
                    message: {
                        kind: "set",
                        payload: ["username", value],
                    },
                    workerMaybe: cacheWorkerMaybe,
                });
            }}
            type="password"
            validationRegexes={password_validation_regexes}
            value={password}
        />
    );

    const submitButtonElement = (
        <button
            disabled={isLoading}
            onClick={() => {
                // handle submit logic
            }}
            type="button"
        >
            {isLoading ? "Registering..." : "Register"}
        </button>
    );

    console.group("Register Render");
    console.log("RegisterState", RegisterState);
    console.log("childComponentState", backupStateFromErrorHOC);
    console.groupEnd();

    return (
        <div className="register-component">
            <h2>Register Component</h2>
            {usernameElement}
            {passwordElement}
            {submitButtonElement}
        </div>
    );
}

function RegisterWrapper() {
    return ErrorSuspenseHOC(Register)(initialRegisterState);
}

export default RegisterWrapper;
