import z from "zod";
import { errorActions } from "./actions";

const setChildComponentStateErrorDispatchSchema = z.object({
    action: z.literal(errorActions.setChildComponentState),
    payload: z.record(z.string(), z.unknown()),
});

type ErrorDispatch = z.infer<typeof setChildComponentStateErrorDispatchSchema>;

export { setChildComponentStateErrorDispatchSchema };
export type { ErrorDispatch };
