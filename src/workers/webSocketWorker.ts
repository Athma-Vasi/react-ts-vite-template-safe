import { None, type Option } from "ts-results";
import {
    WebSocketError,
    WebSocketWorkerError,
    WebSocketWorkerMessageError,
} from "../errors";
import type { AppResult } from "../types";
import { createAppErrorResult } from "../utils";

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

type MessageEventServerToWebSocket = MessageEvent<unknown>;

{ // block scope for persistent worker state
    type WebSocketWorkerState = {
        socketMaybe: Option<WebSocket>;
        shouldReconnect: boolean;
        reconnectTimeoutId: number;
        webSocketServerUrlMaybe: Option<string>;
    };

    const state: WebSocketWorkerState = {
        socketMaybe: None,
        shouldReconnect: false,
        reconnectTimeoutId: 1000,
        webSocketServerUrlMaybe: None,
    };

    function connectToWebSocketServer(
        webSocketServerUrl: string,
        reconnectTimeoutId: number,
    ): WebSocket {
        try {
            const socket = new WebSocket(webSocketServerUrl);

            socket.onopen = () => {
                clearTimeout(reconnectTimeoutId);
            };

            socket.onerror = (event: Event) => {
                console.error("Unhandled error in web socket:", event);
                self.postMessage(
                    createAppErrorResult(
                        new WebSocketError(
                            event,
                            "Unhandled error in web socket",
                        ),
                    ),
                );
                return true; // Prevents default logging to console
            };

            socket.onmessage = (event: MessageEventServerToWebSocket) => {};

            socket.onclose = (event: CloseEvent) => {};

            return socket;
        } catch (error: unknown) {
            self.postMessage(
                createAppErrorResult(
                    new WebSocketError(
                        error,
                        "Error occurred while connecting to web socket server",
                    ),
                ),
            );
            throw error;
        }
    }

    function cleanupWebSocketConnection(
        reconnectTimeoutId: number,
    ): None {
        clearTimeout(reconnectTimeoutId);

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
    ) {
        try {
            if (event.data == null) {
                self.postMessage(
                    createAppErrorResult(
                        new WebSocketWorkerMessageError(
                            "No data received in web socket worker message",
                        ),
                    ),
                );
                return;
            }

            const {
                reconnectTimeoutIdMaybe,
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
                            createAppErrorResult(
                                new WebSocketWorkerMessageError(
                                    "Web socket worker is already connected or connecting.",
                                ),
                            ),
                        );
                        return;
                    }

                    if (socketMaybe.some) {
                        // should not happen, but just in case
                        self.postMessage(
                            createAppErrorResult(
                                new WebSocketWorkerError(
                                    "Web socket worker has an existing socket while trying to connect.",
                                ),
                            ),
                        );
                        return;
                    }

                    const [webSocketServerUrl] = payload;

                    break;
                }

                case "send": {
                    const [formData] = payload;
                    // Implementation will go here
                    break;
                }

                case "disconnect": {
                    // Implementation will go here
                    break;
                }

                default: {
                    self.postMessage(
                        createAppErrorResult(
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
        } catch (error: unknown) {
            self.postMessage(
                createAppErrorResult(
                    new WebSocketWorkerMessageError(
                        error,
                        "Error occurred while handling message in web socket worker",
                    ),
                ),
            );
        }
    }

    self.onmessage = handleWorkerMessageEvent;

    // self.addEventListener("unload", () => {
    //     state.reconnectTimeoutIdMaybe.map((timeoutId) => {
    //         clearTimeout(timeoutId);
    //     });
    //     state.socketMaybe.map((socket) => {
    //         socket.close();
    //     });
    // });

    self.onerror = (event: string | Event) => {
        console.error("Unhandled error in web socket worker:", event);
        self.postMessage(
            createAppErrorResult(
                new WebSocketWorkerError(
                    event,
                    "Unhandled error in web socket worker",
                ),
            ),
        );
        return true; // Prevents default logging to console
    };
}
