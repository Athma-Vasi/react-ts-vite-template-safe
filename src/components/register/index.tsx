import { useEffect, useReducer } from "react";
import { Some } from "ts-results";
import { useMountedRef } from "../../hooks/useMountedRef";
import { createSafeErrorResult, sendMessageToWorker } from "../../utils";
import type {
    MessageEventCacheWorkerToMain,
    MessageEventMainToCacheWorker,
} from "../../workers/cacheWorker";
import CacheWorker from "../../workers/cacheWorker?worker";
import type {
    MessageEventFetchWorkerToMain,
    MessageEventMainToFetchWorker,
} from "../../workers/fetchWorker";
import FetchWorker from "../../workers/fetchWorker?worker";
import type {
    MessageEventForageWorkerToMain,
    MessageEventMainToForageWorker,
} from "../../workers/forageWorker";
import ForageWorker from "../../workers/forageWorker?worker";
import { AccessibleTextInput } from "../accessibleInputs/AccessibleTextInput";
import ErrorSuspenseHOC from "../error";
import { errorActions } from "../error/actions";
import type { ErrorDispatch } from "../error/dispatches";
import { registerActions } from "./actions";
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
        registerState,
        registerDispatch,
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
        responseDataMaybe,
        safeErrorMaybe,
        username,
    } = registerState;

    const isComponentMountedRef = useMountedRef();

    useEffect(() => {
        if (
            forageWorkerMaybe.some || cacheWorkerMaybe.some ||
            fetchWorkerMaybe.some
        ) {
            return;
        }

        // initialize, add to state, and setup listeners for workers

        const forageWorker = new ForageWorker();
        registerDispatch({
            action: registerActions.setForageWorkerMaybe,
            payload: Some(forageWorker),
        });
        forageWorker.onmessage = async (
            event: MessageEventForageWorkerToMain,
        ) => {
            await handleMessageFromForageWorker(
                {
                    errorDispatch,
                    event,
                    isComponentMountedRef,
                    registerDispatch,
                },
            );
        };

        const cacheWorker = new CacheWorker();
        registerDispatch({
            action: registerActions.setCacheWorkerMaybe,
            payload: Some(cacheWorker),
        });
        cacheWorker.onmessage = async (
            event: MessageEventCacheWorkerToMain,
        ) => {
            await handleMessageFromCacheWorker(
                {
                    errorDispatch,
                    event,
                    isComponentMountedRef,
                    registerDispatch,
                },
            );
        };

        const fetchWorker = new FetchWorker();
        registerDispatch({
            action: registerActions.setFetchWorkerMaybe,
            payload: Some(fetchWorker),
        });
        fetchWorker.onmessage = async (
            event: MessageEventFetchWorkerToMain,
        ) => {
            await handleMessageFromFetchWorker(
                {
                    errorDispatch,
                    event,
                    isComponentMountedRef,
                    registerDispatch,
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

    useEffect(() => {
        // simulate random error for testing ErrorBoundary HOC
        const isError = Math.random() < 0.15;
        if (!isError || !username) {
            return;
        }

        registerDispatch({
            action: registerActions.setSafeErrorMaybe,
            payload: Some(
                createSafeErrorResult(
                    new Error("Random simulated error in Register component."),
                ),
            ),
        });
    }, [username]);

    if (safeErrorMaybe.some) {
        throw safeErrorMaybe.val;
    }

    const usernameElement = (
        <AccessibleTextInput
            action={registerActions.setUsername}
            errorAction={errorActions.setChildComponentState}
            dispatch={registerDispatch}
            errorDispatch={errorDispatch}
            label="Username: "
            name="username"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                const { currentTarget: { value } } = event;

                sendMessageToWorker<MessageEventMainToCacheWorker>({
                    actions: registerActions,
                    dispatch: registerDispatch,
                    message: {
                        kind: "set",
                        payload: ["username", value],
                    },
                    workerMaybe: cacheWorkerMaybe,
                });

                sendMessageToWorker<MessageEventMainToForageWorker>({
                    actions: registerActions,
                    dispatch: registerDispatch,
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
            dispatch={registerDispatch}
            errorAction={errorActions.setChildComponentState}
            errorDispatch={errorDispatch}
            label="Password: "
            name="password"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                const { currentTarget: { value } } = event;

                sendMessageToWorker<MessageEventMainToCacheWorker>({
                    actions: registerActions,
                    dispatch: registerDispatch,
                    message: {
                        kind: "set",
                        payload: ["password", value],
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
            onClick={(
                event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
            ) => {
                event.preventDefault();

                registerDispatch({
                    action: registerActions.setIsLoading,
                    payload: true,
                });

                sendMessageToWorker<MessageEventMainToFetchWorker>({
                    actions: registerActions,
                    dispatch: registerDispatch,
                    message: {
                        requestInit: {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                            },
                        },
                        url: "https://jsonplaceholder.typicode.com/posts",
                    },
                    workerMaybe: fetchWorkerMaybe,
                });
            }}
            type="button"
        >
            {isLoading ? "Registering..." : "Register"}
        </button>
    );

    const responseDataElement = responseDataMaybe.some
        ? (
            <div className="response-data-container">
                {responseDataMaybe.val.map((dataItem) => {
                    const { body, id, title, userId } = dataItem;

                    return (
                        <div
                            className="response-data-item-card"
                            key={`response-data-item-${id}`}
                        >
                            <h3>{`Title: ${title}`}</h3>
                            <p>{`Body: ${body}`}</p>
                            <p>{`User ID: ${userId}`}</p>
                            <p>{`ID: ${id}`}</p>
                        </div>
                    );
                })}
            </div>
        )
        : null;

    console.group("Register Render");
    console.log("registerState", registerState);
    console.log("childComponentState", backupStateFromErrorHOC);
    console.groupEnd();

    return (
        <div className="register-component">
            <h2>Register Component</h2>
            {usernameElement}
            {passwordElement}
            {submitButtonElement}
            {responseDataElement}
        </div>
    );
}

function RegisterWrapper() {
    return ErrorSuspenseHOC(Register)(initialRegisterState);
}

export default RegisterWrapper;
