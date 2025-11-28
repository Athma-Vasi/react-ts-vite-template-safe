import { useEffect, useReducer, useRef } from "react";
import { Some } from "ts-results";
import ErrorSuspenseHOC from "../error";
import { errorActions } from "../error/actions";
import type { ErrorDispatch } from "../error/dispatches";
import { loginActions } from "./actions";
import type { MessageEventLoginAsyncWorkerToMain } from "./asyncWorker";
import AsyncWorker from "./asyncWorker?worker";
import type { MessageEventLoginCacheWorkerToMain } from "./cacheWorker";
import CacheWorker from "./cacheWorker?worker";
import FetchWorker from "./fetchWorker?worker";
import { loginReducer } from "./reducers";
import { initialLoginState, type LoginState } from "./state";

type LoginProps = {
    // this component's state
    childComponentState: LoginState;
    errorDispatch: React.Dispatch<ErrorDispatch>;
    // initialChildComponentState: LoginState;
};
function Login(
    { childComponentState, errorDispatch }: LoginProps,
) {
    const [
        loginState,
        loginDispatch,
    ] = useReducer(loginReducer, childComponentState);
    const {
        asyncWorkerMaybe,
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
            asyncWorkerMaybe.some || cacheWorkerMaybe.some ||
            fetchWorkerMaybe.some
        ) {
            return;
        }

        // initialize, add to state, and setup listeners for workers

        const asyncWorker = new AsyncWorker();
        loginDispatch({
            action: loginActions.setAsyncWorkerMaybe,
            payload: Some(asyncWorker),
        });
        asyncWorker.onmessage = async (
            event: MessageEventLoginAsyncWorkerToMain,
        ) => {
            // await handleMessageFromAsyncWorker(
            //     event,
            //     loginDispatch,
            //     errorDispatch,
            // );
        };

        const cacheWorker = new CacheWorker();
        loginDispatch({
            action: loginActions.setCacheWorkerMaybe,
            payload: Some(cacheWorker),
        });
        cacheWorker.onmessage = async (
            event: MessageEventLoginCacheWorkerToMain,
        ) => {
            // await handleMessageFromCacheWorker(
            //     event,
            //     loginDispatch,
            //     errorDispatch,
            // );
        };

        const fetchWorker = new FetchWorker();
        loginDispatch({
            action: loginActions.setFetchWorkerMaybe,
            payload: Some(fetchWorker),
        });
        fetchWorker.onmessage = async (
            event: MessageEventLoginCacheWorkerToMain,
        ) => {
            // await handleMessageFromFetchWorker(
            //     event,
            //     loginDispatch,
            //     errorDispatch,
            // );
        };

        // cleanup function to terminate workers on unmount
        return () => {
            asyncWorker.terminate();
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
                            ...childComponentState,
                            username: value,
                        },
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
                            ...childComponentState,
                            password: value,
                        },
                    });
                }}
            />
        </div>
    );

    console.group("Login Render");
    console.log("loginState", loginState);
    console.log("childComponentState", childComponentState);
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
