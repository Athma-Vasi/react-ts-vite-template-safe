import { Err } from "ts-results";
import { z } from "zod";
import { createOptionSchema } from "../../schemas";
import { loginActions } from "./actions";

const setCacheWorkerLoginDispatchSchema = z.object({
    action: z.literal("setCacheWorker"),
    payload: createOptionSchema(z.instanceof(Worker)),
});

const setIsLoadingLoginDispatchSchema = z.object({
    action: z.literal(loginActions.setIsLoading),
    payload: z.boolean(),
});

const setPasswordLoginDispatchSchema = z.object({
    action: z.literal(loginActions.setPassword),
    payload: z.string(),
});

const setSafeErrorMaybeLoginDispatchSchema = z.object({
    action: z.literal("setSafeErrorMaybe"),
    payload: createOptionSchema(z.instanceof(Err)),
});

const setUsernameLoginDispatchSchema = z.object({
    action: z.literal(loginActions.setUsername),
    payload: z.string(),
});

type LoginDispatch =
    | z.infer<typeof setCacheWorkerLoginDispatchSchema>
    | z.infer<typeof setIsLoadingLoginDispatchSchema>
    | z.infer<typeof setPasswordLoginDispatchSchema>
    | z.infer<typeof setSafeErrorMaybeLoginDispatchSchema>
    | z.infer<typeof setUsernameLoginDispatchSchema>;

export {
    setCacheWorkerLoginDispatchSchema,
    setIsLoadingLoginDispatchSchema,
    setPasswordLoginDispatchSchema,
    setSafeErrorMaybeLoginDispatchSchema,
    setUsernameLoginDispatchSchema,
};
export type { LoginDispatch };
