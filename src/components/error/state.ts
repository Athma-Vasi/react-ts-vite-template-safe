import { None, type Option } from "ts-results";

type ErrorState = {
    childComponentState: Record<string, unknown>;
    loggerWorkerMaybe: Option<Worker>;
};

const initialErrorState: ErrorState = {
    childComponentState: {},
    loggerWorkerMaybe: None,
};

export { initialErrorState };
export type { ErrorState };
