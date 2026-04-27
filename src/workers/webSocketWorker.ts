import { None, type Option } from "ts-results";
import {
    WebSocketError,
    WebSocketMessageError,
    WebSocketWorkerError,
    WebSocketWorkerMessageError,
} from "../errors";
import type { AppResult } from "../types";
import { createAppErrorResult, createSafeSuccessResult } from "../utils";

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
        reconnectTimeout: number;
        webSocketServerUrlMaybe: Option<string>;
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
    ): WebSocket {
        try {
            const socket = new WebSocket(webSocketServerUrl);

            socket.onopen = () => {
                clearTimeout(reconnectTimeout);
                self.postMessage(
                    createSafeSuccessResult(
                        "Web socket connected successfully",
                    ),
                );
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

            socket.onmessage = (event: MessageEventServerToWebSocket) => {
                try {
                    if (event.data == null) {
                        self.postMessage(
                            createAppErrorResult(
                                new WebSocketMessageError(
                                    "No data received from web socket server",
                                ),
                            ),
                        );
                        return;
                    }

                    const parsed = JSON.parse(event.data);
                } catch (error: unknown) {
                    self.postMessage(
                        createAppErrorResult(
                            new WebSocketError(
                                error,
                                "Error occurred while handling message from web socket server",
                            ),
                        ),
                    );
                }
            };

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
    ) {
        try {
            if (!event.data) {
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
                reconnectTimeoutMaybe,
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
    //     state.reconnectTimeoutMaybe.map((timeoutId) => {
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

class WebSocketClient {
    constructor(url, options = {}) {
        this.url = url;
        this.options = {
            reconnectInterval: 1000,
            maxReconnectAttempts: 5,
            beatInterval: 30000,
            ...options,
        };
        this.reconnectAttempts = 0;
        this.messageQueue = [];
        this.eventHandlers = {};
        this.isConnected = false;

        this.connect();
    }

    connect() {
        console.log(`Connecting to ${this.url}...`);

        try {
            this.ws = new WebSocket(this.url);
            this.setupEventHandlers();
        } catch (error) {
            console.error("Failed to create WebSocket:", error);
            this.scheduleReconnect();
        }
    }

    setupEventHandlers() {
        this.ws.onopen = (event) => {
            console.log("WebSocket connected");
            this.isConnected = true;
            this.reconnectAttempts = 0;

            // Send any queued messages
            while (this.messageQueue.length > 0) {
                const message = this.messageQueue.shift();
                this.send(message);
            }

            // Start beat
            this.startBeat();

            // Trigger custom open handlers
            this.trigger("open", event);
        };

        this.ws.onmessage = (event) => {
            console.log("Message received:", event.data);

            // Try to parse JSON messages
            let data = event.data;
            try {
                data = JSON.parse(event.data);
            } catch (e) {
                // Not JSON, use as-is
            }

            // Handle ping/pong for heartbeat
            if (data.type === "pong") {
                this.lastPong = Date.now();
                return;
            }

            // Trigger custom message handlers
            this.trigger("message", data);

            // Trigger typed message handlers
            if (data.type) {
                this.trigger(data.type, data);
            }
        };

        this.ws.onerror = (error) => {
            console.error("WebSocket error:", error);
            this.trigger("error", error);
        };

        this.ws.onclose = (event) => {
            console.log(`WebSocket closed: ${event.code} - ${event.reason}`);
            this.isConnected = false;
            this.stopTimer();

            // Trigger custom close handlers
            this.trigger("close", event);

            // Attempt to reconnect if not a normal closure
            if (event.code !== 1000 && event.code !== 1001) {
                this.scheduleReconnect();
            }
        };
    }

    send(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const data = typeof message === "object"
                ? JSON.stringify(message)
                : message;
            this.ws.send(data);
        } else {
            // Queue message if not connected
            console.log("WebSocket not connected, queuing message");
            this.messageQueue.push(message);
        }
    }

    startBeat() {
        this.stopTimer();
        this.timer = setInterval(() => {
            if (this.ws.readyState === WebSocket.OPEN) {
                this.send({ type: "ping", timestamp: Date.now() });

                // Check for pong timeout
                setTimeout(() => {
                    const timeSinceLastPong = Date.now() - (this.lastPong || 0);
                    if (
                        timeSinceLastPong > this.options.beatInterval * 2
                    ) {
                        console.log("beat timeout, reconnecting...");
                        this.ws.close();
                    }
                }, 5000);
            }
        }, this.options.beatInterval);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    scheduleReconnect() {
        if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
            console.error("Max reconnection attempts reached");
            this.trigger("maxReconnectAttemptsReached");
            return;
        }

        this.reconnectAttempts++;
        const delay = this.options.reconnectInterval *
            Math.pow(2, this.reconnectAttempts - 1);
        console.log(
            `Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})...`,
        );

        setTimeout(() => {
            this.connect();
        }, delay);
    }

    on(event, handler) {
        if (!this.eventHandlers[event]) {
            this.eventHandlers[event] = [];
        }
        this.eventHandlers[event].push(handler);
    }

    off(event, handler) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event] = this.eventHandlers[event].filter(
                (h) => h !== handler,
            );
        }
    }

    trigger(event, data) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event].forEach((handler) => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`Error in ${event} handler:`, error);
                }
            });
        }
    }

    close() {
        this.reconnectAttempts = this.options.maxReconnectAttempts;
        this.stopTimer();
        if (this.ws) {
            this.ws.close(1000, "Client closing connection");
        }
    }
}

// Usage example
const client = new WebSocketClient("wss://echo.websocket.org");

client.on("open", () => {
    console.log("Connected and ready!");
    client.send({ type: "hello", user: "JavaScript Client" });
});

client.on("message", (data) => {
    console.log("Received:", data);
});

client.on("error", (error) => {
    console.error("Connection error:", error);
});

client.on("close", (event) => {
    console.log("Connection closed:", event.code, event.reason);
});
