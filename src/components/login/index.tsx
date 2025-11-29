import { useEffect, useReducer, useRef } from "react";
import { Some } from "ts-results";
import { sendMessageToWorker } from "../../utils";
import { AccessibleTextInput } from "../accessibleInputs/AccessibleTextInput";
import ErrorSuspenseHOC from "../error";
import { errorActions } from "../error/actions";
import type { ErrorDispatch } from "../error/dispatches";
import { loginActions } from "./actions";
import type {
    MessageEventLoginCacheWorkerToMain,
    MessageEventMainToLoginCacheWorker,
} from "./cacheWorker";
import CacheWorker from "./cacheWorker?worker";
import FetchWorker from "./fetchWorker?worker";
import type {
    MessageEventLoginForageWorkerToMain,
    MessageEventMainToLoginForageWorker,
} from "./forageWorker";
import ForageWorker from "./forageWorker?worker";
import {
    handleMessageFromCacheWorker,
    handleMessageFromFetchWorker,
    handleMessageFromForageWorker,
} from "./handlers";
import { loginReducer } from "./reducers";
import {
    password_validation_regexes,
    username_validation_regexes,
} from "./regexes";
import { initialLoginState, type LoginState } from "./state";

type LoginProps = {
    // this component's back-up state from ErrorBoundary
    childComponentState: LoginState;
    errorDispatch: React.ActionDispatch<[dispatch: ErrorDispatch]>;
};
function Login(
    { childComponentState: backupStateFromErrorHOC, errorDispatch }: LoginProps,
) {
    const [
        loginState,
        loginDispatch,
    ] = useReducer(loginReducer, backupStateFromErrorHOC ?? initialLoginState);
    const {
        forageWorkerMaybe,
        cacheWorkerMaybe,
        fetchWorkerMaybe,
        isLoading,
        password,
        safeErrorMaybe,
        username,
    } = loginState;

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
        loginDispatch({
            action: loginActions.setForageWorkerMaybe,
            payload: Some(forageWorker),
        });
        forageWorker.onmessage = async (
            event: MessageEventLoginForageWorkerToMain,
        ) => {
            await handleMessageFromForageWorker(
                { errorDispatch, event, isComponentMountedRef, loginDispatch },
            );
        };

        const cacheWorker = new CacheWorker();
        loginDispatch({
            action: loginActions.setCacheWorkerMaybe,
            payload: Some(cacheWorker),
        });
        cacheWorker.onmessage = async (
            event: MessageEventLoginCacheWorkerToMain,
        ) => {
            await handleMessageFromCacheWorker(
                { errorDispatch, event, isComponentMountedRef, loginDispatch },
            );
        };

        const fetchWorker = new FetchWorker();
        loginDispatch({
            action: loginActions.setFetchWorkerMaybe,
            payload: Some(fetchWorker),
        });
        fetchWorker.onmessage = async (
            event: MessageEventLoginCacheWorkerToMain,
        ) => {
            await handleMessageFromFetchWorker(
                { errorDispatch, event, isComponentMountedRef, loginDispatch },
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
            action={loginActions.setUsername}
            errorAction={errorActions.setChildComponentState}
            dispatch={loginDispatch}
            errorDispatch={errorDispatch}
            label="Username:"
            name="username"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                const { currentTarget: { value } } = event;

                sendMessageToWorker<MessageEventMainToLoginCacheWorker>({
                    actions: loginActions,
                    dispatch: loginDispatch,
                    message: {
                        kind: "set",
                        payload: ["username", value],
                    },
                    workerMaybe: cacheWorkerMaybe,
                });

                sendMessageToWorker<MessageEventMainToLoginForageWorker>({
                    actions: loginActions,
                    dispatch: loginDispatch,
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
            action={loginActions.setPassword}
            dispatch={loginDispatch}
            errorAction={errorActions.setChildComponentState}
            errorDispatch={errorDispatch}
            label="Password:"
            name="password"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                const { currentTarget: { value } } = event;

                sendMessageToWorker<MessageEventMainToLoginCacheWorker>({
                    actions: loginActions,
                    dispatch: loginDispatch,
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

    console.group("Login Render");
    console.log("loginState", loginState);
    console.log("childComponentState", backupStateFromErrorHOC);
    console.groupEnd();

    return (
        <div className="login-component">
            <h2>Login Component</h2>
            {usernameElement}
            {passwordElement}
        </div>
    );
}

function LoginWrapper() {
    return ErrorSuspenseHOC(Login)(initialLoginState);
}

export default LoginWrapper;
