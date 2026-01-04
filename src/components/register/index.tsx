import ErrorSuspenseHOC from "../error";
import Register from "./Register.tsx";
import { initialRegisterState } from "./state.ts";

function RegisterSuspenseBoundary() {
    // const Register = React.lazy(() => import("./Register.tsx"));
    return ErrorSuspenseHOC(Register)(initialRegisterState);
}

export { RegisterSuspenseBoundary };
