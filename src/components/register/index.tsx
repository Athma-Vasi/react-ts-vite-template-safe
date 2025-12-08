import React from "react";
import ErrorSuspenseHOC from "../error";
import { initialRegisterState } from "./state.ts";

function RegisterSuspenseBoundary() {
    const Register = React.lazy(() => import("./Register.tsx"));
    return ErrorSuspenseHOC(Register)(initialRegisterState);
}

export { RegisterSuspenseBoundary };
