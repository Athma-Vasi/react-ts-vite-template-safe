import { Err, Ok } from "ts-results";
import z from "zod";

function createOptionSchema<Value extends z.ZodTypeAny>(
    value: Value,
) {
    return z.object({
        none: z.boolean(),
        some: z.boolean(),
        value,
    });
}

const resultSchema = z.instanceof(Ok).or(z.instanceof(Err));
export { createOptionSchema, resultSchema };
