import { Err } from "ts-results";
import { z } from "zod";
import { createOptionSchema } from "../../schemas";
import { registerActions } from "./actions";

const setForageWorkerMaybeRegisterDispatchSchema = z.object({
    action: z.literal(registerActions.setForageWorkerMaybe),
    payload: createOptionSchema(z.instanceof(Worker)),
});

const setCacheWorkerMaybeRegisterDispatchSchema = z.object({
    action: z.literal(registerActions.setCacheWorkerMaybe),
    payload: createOptionSchema(z.instanceof(Worker)),
});

const setFetchWorkerMaybeRegisterDispatchSchema = z.object({
    action: z.literal(registerActions.setFetchWorkerMaybe),
    payload: createOptionSchema(z.instanceof(Worker)),
});

const setIsLoadingRegisterDispatchSchema = z.object({
    action: z.literal(registerActions.setIsLoading),
    payload: z.boolean(),
});

const setPasswordRegisterDispatchSchema = z.object({
    action: z.literal(registerActions.setPassword),
    payload: z.string(),
});

const response_data_schema = z.object({
    body: z.string(),
    id: z.number(),
    title: z.string(),
    userId: z.number(),
});
const setResponseDataMaybeRegisterDispatchSchema = z.object({
    action: z.literal(registerActions.setResponseDataMaybe),
    payload: createOptionSchema(z.array(response_data_schema)),
});

const setSafeErrorMaybeRegisterDispatchSchema = z.object({
    action: z.literal(registerActions.setSafeErrorMaybe),
    payload: createOptionSchema(z.instanceof(Err)),
});

const setUsernameRegisterDispatchSchema = z.object({
    action: z.literal(registerActions.setUsername),
    payload: z.string(),
});

type RegisterDispatch =
    | z.infer<typeof setForageWorkerMaybeRegisterDispatchSchema>
    | z.infer<typeof setCacheWorkerMaybeRegisterDispatchSchema>
    | z.infer<typeof setFetchWorkerMaybeRegisterDispatchSchema>
    | z.infer<typeof setIsLoadingRegisterDispatchSchema>
    | z.infer<typeof setPasswordRegisterDispatchSchema>
    | z.infer<typeof setResponseDataMaybeRegisterDispatchSchema>
    | z.infer<typeof setSafeErrorMaybeRegisterDispatchSchema>
    | z.infer<typeof setUsernameRegisterDispatchSchema>;

export {
    response_data_schema,
    setCacheWorkerMaybeRegisterDispatchSchema,
    setFetchWorkerMaybeRegisterDispatchSchema,
    setForageWorkerMaybeRegisterDispatchSchema,
    setIsLoadingRegisterDispatchSchema,
    setPasswordRegisterDispatchSchema,
    setResponseDataMaybeRegisterDispatchSchema,
    setSafeErrorMaybeRegisterDispatchSchema,
    setUsernameRegisterDispatchSchema,
};
export type { RegisterDispatch };
