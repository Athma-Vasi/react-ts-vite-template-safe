import { None, Some } from "ts-results";
import {
    WebSocketError,
    WebSocketMessageError,
    WebSocketWorkerError,
    WebSocketWorkerMessageError,
} from "../errors";
import type { AppResult, SafeSuccess } from "../types";
import { createErrorResult, createSuccessResult } from "../utils";

type MessageEventWebSocketWorkerToMain<Data = unknown> = MessageEvent<
    {
        kind: "data";
        payload: AppResult<Data>;
    } | {
        kind: "connected";
        payload: AppResult<string>;
    } | {
        kind: "closed";
        payload: AppResult<string>;
    } | {
        kind: "reconnecting";
        payload: AppResult<string>;
    } | {
        kind: "disconnected";
        payload: AppResult<string>;
    } | {
        kind: "error";
        payload: AppResult;
    }
>;

type MessageEventMainToWebSocketWorker<
    WebSocketServerUrl extends string = string,
    FormData extends Record<string, unknown> = Record<string, unknown>,
> = MessageEvent<
    | {
        kind: "connect";
        payload: [WebSocketServerUrl];
    }
    | {
        kind: "send";
        payload: [FormData];
    }
    | {
        kind: "disconnect";
        payload: [];
    }
>;

type MessageEventServerToWebSocket<Data = unknown> = MessageEvent<Data>;

{ // block scope for persistent worker state
    type WebSocketWorkerState = {
        socketMaybe: SafeSuccess<WebSocket>;
        shouldReconnect: boolean;
        reconnectTimeout: number;
        webSocketServerUrlMaybe: SafeSuccess<string>;
    };

    const state: WebSocketWorkerState = {
        socketMaybe: None,
        shouldReconnect: false,
        reconnectTimeout: 1000,
        webSocketServerUrlMaybe: None,
    };

    function connectToWebSocketServer(
        webSocketServerUrl: string,
        reconnectTimeout: number,
    ): AppResult<WebSocket> {
        try {
            const socket = new WebSocket(webSocketServerUrl);

            function handleSocketOpen() {
                clearTimeout(reconnectTimeout);
                self.postMessage(
                    createSuccessResult(
                        "Web socket connected successfully",
                    ),
                );
            }

            function handleSocketError(event: Event) {
                console.error("Unhandled error in web socket:", event);
                self.postMessage(
                    createErrorResult(
                        new WebSocketError(
                            event,
                            "Unhandled error in web socket",
                        ),
                    ),
                );
                return true; // Prevents default logging to console
            }

            function handleSocketMessage(event: MessageEventServerToWebSocket) {
                try {
                    if (event.data == null) {
                        self.postMessage(
                            createErrorResult(
                                new WebSocketMessageError(
                                    "No data received from web socket server",
                                ),
                            ),
                        );
                        return;
                    }

                    self.postMessage(
                        createSuccessResult(
                            event.data,
                        ),
                    );
                    return;
                } catch (error: unknown) {
                    self.postMessage(
                        createErrorResult(
                            new WebSocketError(
                                error,
                                "Error occurred while handling message from web socket server",
                            ),
                        ),
                    );
                }
            }

            function handleSocketClose(event: CloseEvent) {
                self.postMessage(
                    createSuccessResult(
                        `Web socket closed with code ${event.code} and reason: ${event.reason}`,
                    ),
                );
            }

            socket.onopen = handleSocketOpen;
            socket.onerror = handleSocketError;
            socket.onmessage = handleSocketMessage;
            socket.onclose = handleSocketClose;

            return createSuccessResult(socket);
        } catch (error: unknown) {
            return createErrorResult(
                new WebSocketError(
                    error,
                    "Error occurred while connecting to web socket server",
                ),
            );
        }
    }

    function cleanupWebSocketConnection(
        reconnectTimeout: number,
    ): None {
        clearTimeout(reconnectTimeout);

        if (state.socketMaybe.none) {
            return None;
        }
        const socket = state.socketMaybe.safeUnwrap();
        socket.onopen = null;
        socket.onerror = null;
        socket.onmessage = null;
        socket.onclose = null;
        socket.close();

        state.socketMaybe = None;
        state.webSocketServerUrlMaybe = None;

        return None;
    }

    async function handleWorkerMessageEvent(
        event: MessageEventMainToWebSocketWorker,
    ): Promise<None> {
        try {
            if (!event.data) {
                self.postMessage(
                    createErrorResult(
                        new WebSocketWorkerMessageError(
                            "No data received in web socket worker message",
                        ),
                    ),
                );
                return None;
            }

            const {
                reconnectTimeout,
                shouldReconnect,
                socketMaybe,
                webSocketServerUrlMaybe,
            } = state;
            const { kind, payload } = event.data;

            switch (kind) {
                case "connect": {
                    if (webSocketServerUrlMaybe.some) {
                        // already connected or connecting
                        self.postMessage(
                            createErrorResult(
                                new WebSocketWorkerMessageError(
                                    "Web socket worker is already connected or connecting.",
                                ),
                            ),
                        );
                        break;
                    }

                    const [webSocketServerUrl] = payload;
                    const connectResult = connectToWebSocketServer(
                        webSocketServerUrl,
                        reconnectTimeout,
                    );

                    if (connectResult.err) {
                        self.postMessage(connectResult);
                        break;
                    }

                    state.socketMaybe = connectResult.safeUnwrap();
                    state.webSocketServerUrlMaybe = !webSocketServerUrl
                        ? None
                        : Some(webSocketServerUrl);
                    state.shouldReconnect = true;

                    break;
                }

                case "send": {
                    const [formData] = payload;
                    // Implementation will go here
                    break;
                }

                case "disconnect": {
                    state.shouldReconnect = false;
                    cleanupWebSocketConnection(reconnectTimeout);
                    break;
                }

                default: {
                    self.postMessage(
                        createErrorResult(
                            new WebSocketWorkerMessageError(
                                `Unknown message kind: "${
                                    String(kind)
                                }" received in web socket worker.`,
                            ),
                        ),
                    );
                    break;
                }
            }

            return None;
        } catch (error: unknown) {
            self.postMessage(
                createErrorResult(
                    new WebSocketWorkerMessageError(
                        error,
                        "Error occurred while handling message in web socket worker",
                    ),
                ),
            );
            return None;
        }
    }

    function handleWorkerErrorEvent(event: string | Event): boolean {
        console.error("Unhandled error in web socket worker:", event);
        self.postMessage(
            createErrorResult(
                new WebSocketWorkerError(
                    event,
                    "Unhandled error in web socket worker",
                ),
            ),
        );
        return true; // Prevents default logging to console
    }

    function handleWorkerCloseEvent(): None {
        const { reconnectTimeout, shouldReconnect, webSocketServerUrlMaybe } =
            state;

        if (shouldReconnect && webSocketServerUrlMaybe.some) {
            const webSocketServerUrl = webSocketServerUrlMaybe.safeUnwrap();
            setTimeout(() => {
                const connectResult = connectToWebSocketServer(
                    webSocketServerUrl,
                    reconnectTimeout,
                );

                if (connectResult.err) {
                    self.postMessage(connectResult);
                } else {
                    state.socketMaybe = connectResult.safeUnwrap();
                }
            }, reconnectTimeout);
        }

        return None;
    }

    self.onmessage = handleWorkerMessageEvent;
    self.onerror = handleWorkerErrorEvent;
    self.onclose = handleWorkerCloseEvent;
}

export type {
    MessageEventMainToWebSocketWorker,
    MessageEventWebSocketWorkerToMain,
};
