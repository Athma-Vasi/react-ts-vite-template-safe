import { Err } from "ts-results";
import { z } from "zod";
import { createOptionSchema } from "../../schemas";
import { loginActions } from "./actions";

const setCacheWorkerMaybeLoginDispatchSchema = z.object({
    action: z.literal("setCacheWorkerMaybe"),
    payload: createOptionSchema(z.instanceof(Worker)),
});

const setFetchWorkerMaybeLoginDispatchSchema = z.object({
    action: z.literal("setFetchWorkerMaybe"),
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
    | z.infer<typeof setCacheWorkerMaybeLoginDispatchSchema>
    | z.infer<typeof setFetchWorkerMaybeLoginDispatchSchema>
    | z.infer<typeof setIsLoadingLoginDispatchSchema>
    | z.infer<typeof setPasswordLoginDispatchSchema>
    | z.infer<typeof setSafeErrorMaybeLoginDispatchSchema>
    | z.infer<typeof setUsernameLoginDispatchSchema>;

export {
    setCacheWorkerMaybeLoginDispatchSchema,
    setFetchWorkerMaybeLoginDispatchSchema,
    setIsLoadingLoginDispatchSchema,
    setPasswordLoginDispatchSchema,
    setSafeErrorMaybeLoginDispatchSchema,
    setUsernameLoginDispatchSchema,
};
export type { LoginDispatch };
