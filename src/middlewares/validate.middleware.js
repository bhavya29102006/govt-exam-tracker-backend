import { ApiError } from "../utils/ApiError.js";

const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
        const errorMessages = result.error.issues.map((issue) => issue.message);
        throw new ApiError(400, errorMessages[0], errorMessages);
    }

    req.body = result.data;
    next();
};

export { validate };