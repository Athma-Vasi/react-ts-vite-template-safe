type ErrorState = {
    childComponentState: Record<string, unknown>;
};

const initialErrorState: ErrorState = {
    childComponentState: {},
};

export { initialErrorState };
export type { ErrorState };
