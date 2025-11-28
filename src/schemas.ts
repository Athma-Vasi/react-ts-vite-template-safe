import { Err, Ok } from "ts-results";
import z from "zod";

function createOptionSchema<Value extends z.ZodTypeAny>(
    val: Value,
) {
    return z.object({
        none: z.boolean(),
        some: z.boolean(),
        val,
    });
}

const resultSchema = z.instanceof(Ok).or(z.instanceof(Err));
export { createOptionSchema, resultSchema };
