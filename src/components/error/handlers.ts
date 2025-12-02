import type { ErrorDispatch } from "./dispatches";
import type { MessageEventLoggerWorkerToMain } from "./loggerWorker";

async function handleMessageFromLoggerWorker({
    errorDispatch,
    event,
    isComponentMountedRef,
}: {
    errorDispatch: React.Dispatch<ErrorDispatch>;
    event: MessageEventLoggerWorkerToMain;
    isComponentMountedRef: React.RefObject<boolean>;
}) {
    if (!isComponentMountedRef.current) {
        return;
    }

    const { data } = event;

    console.group("handleMessageFromLoggerWorker");
    console.log("data", data);
    console.groupEnd();
}

export { handleMessageFromLoggerWorker };
