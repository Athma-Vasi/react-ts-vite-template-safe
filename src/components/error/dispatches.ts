import z from "zod";
import { createOptionSchema } from "../../schemas";
import { errorActions } from "./actions";

const setChildComponentStateErrorDispatchSchema = z.object({
    action: z.literal(errorActions.setChildComponentState),
    payload: z.record(z.string(), z.unknown()),
});

const setLoggerWorkerMaybeErrorDispatchSchema = z.object({
    action: z.literal(errorActions.setLoggerWorkerMaybe),
    payload: createOptionSchema(z.instanceof(Worker)),
});

type ErrorDispatch =
    | z.infer<typeof setChildComponentStateErrorDispatchSchema>
    | z.infer<typeof setLoggerWorkerMaybeErrorDispatchSchema>;

export {
    setChildComponentStateErrorDispatchSchema,
    setLoggerWorkerMaybeErrorDispatchSchema,
};
export type { ErrorDispatch };
