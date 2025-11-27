import { z } from "zod";
import { loginActions } from "./actions";

const setIsLoadingLoginDispatchSchema = z.object({
    action: z.literal(loginActions.setIsLoading),
    payload: z.boolean(),
});

const setPasswordLoginDispatchSchema = z.object({
    action: z.literal(loginActions.setPassword),
    payload: z.string(),
});

const setUsernameLoginDispatchSchema = z.object({
    action: z.literal(loginActions.setUsername),
    payload: z.string(),
});

const setSafeErrorMaybeLoginDispatchSchema = z.object({
    action: z.literal("setSafeErrorMaybe"),
    payload: z.ZodAny,
});

type LoginDispatch =
    | z.infer<typeof setIsLoadingLoginDispatchSchema>
    | z.infer<typeof setPasswordLoginDispatchSchema>
    | z.infer<typeof setUsernameLoginDispatchSchema>
    | z.infer<typeof setSafeErrorMaybeLoginDispatchSchema>;

export {
    setIsLoadingLoginDispatchSchema,
    setPasswordLoginDispatchSchema,
    setSafeErrorMaybeLoginDispatchSchema,
    setUsernameLoginDispatchSchema,
};
export type { LoginDispatch };
