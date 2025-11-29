import { useEffect, useReducer, useRef } from "react";
import { Some } from "ts-results";
import { sendMessageToWorker } from "../../utils";
import ErrorSuspenseHOC from "../error";
import { errorActions } from "../error/actions";
import type { ErrorDispatch } from "../error/dispatches";
import { loginActions } from "./actions";
import type {
    MessageEventLoginCacheMainToWorker,
    MessageEventLoginCacheWorkerToMain,
} from "./cacheWorker";
import CacheWorker from "./cacheWorker?worker";
import FetchWorker from "./fetchWorker?worker";
import type {
    MessageEventLoginForageMainToWorker,
    MessageEventLoginForageWorkerToMain,
} from "./forageWorker";
import ForageWorker from "./forageWorker?worker";
import {
    handleMessageFromCacheWorker,
    handleMessageFromFetchWorker,
    handleMessageFromForageWorker,
} from "./handlers";
import { loginReducer } from "./reducers";
import { initialLoginState, type LoginState } from "./state";

type LoginProps = {
    // this component's back-up state from ErrorBoundary
    childComponentState: LoginState;
    errorDispatch: React.Dispatch<ErrorDispatch>;
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
        <div>
            <label htmlFor="username">Username:</label>
            <input
                name="username"
                type="text"
                value={username}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    const { currentTarget: { value } } = event;

                    loginDispatch({
                        action: loginActions.setUsername,
                        payload: value,
                    });

                    errorDispatch({
                        action: errorActions.setChildComponentState,
                        payload: {
                            ...backupStateFromErrorHOC,
                            username: value,
                        },
                    });

                    sendMessageToWorker<MessageEventLoginCacheMainToWorker>({
                        actions: loginActions,
                        dispatch: loginDispatch,
                        message: {
                            kind: "set",
                            payload: ["username", value],
                        },
                        workerMaybe: cacheWorkerMaybe,
                    });

                    sendMessageToWorker<MessageEventLoginForageMainToWorker>({
                        actions: loginActions,
                        dispatch: loginDispatch,
                        message: {
                            kind: "set",
                            payload: ["username", value],
                        },
                        workerMaybe: forageWorkerMaybe,
                    });
                }}
            />
        </div>
    );

    const passwordElement = (
        <div>
            <label htmlFor="password">Password:</label>
            <input
                name="password"
                type="password"
                value={password}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    const { currentTarget: { value } } = event;

                    loginDispatch({
                        action: loginActions.setPassword,
                        payload: value,
                    });

                    errorDispatch({
                        action: errorActions.setChildComponentState,
                        payload: {
                            ...backupStateFromErrorHOC,
                            password: value,
                        },
                    });
                }}
            />
        </div>
    );

    console.group("Login Render");
    console.log("loginState", loginState);
    console.log("childComponentState", backupStateFromErrorHOC);
    console.groupEnd();

    return (
        <div>
            <h2>Login Component</h2>
            {usernameElement}
            {passwordElement}
            <div>
                {isLoading ? <p>Loading...</p> : <p>Not Loading</p>}
            </div>
        </div>
    );
}

function LoginWrapper() {
    return ErrorSuspenseHOC(Login)(initialLoginState);
}

export default LoginWrapper;
