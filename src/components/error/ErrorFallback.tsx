import type { Err } from "ts-results";
import type { SafeError } from "../../types";

function ErrorFallback({
    error,
    resetErrorBoundary,
}: {
    error: Err<SafeError>;
    resetErrorBoundary: () => void;
}) {
    console.log("ErrorFallback rendered with error:", error);
    console.log("resetErrorBoundary function:", resetErrorBoundary);

    return (
        <div
            className="error-fallback"
            role="alert"
            style={{
                padding: "1rem",
                border: "1px solid red",
                borderRadius: "4px",
                // backgroundColor: "#ffe6e6",
            }}
        >
            <h2 style={{ color: "red" }}>Something went wrong:</h2>
            <pre
                style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}
            >{error.err ? error.val.stack : "no error"}</pre>
            <button
                onClick={resetErrorBoundary}
                style={{
                    marginTop: "1rem",
                    padding: "0.5rem 1rem",
                    backgroundColor: "red",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                }}
            >
                Try again
            </button>
        </div>
    );
}

export default ErrorFallback;
