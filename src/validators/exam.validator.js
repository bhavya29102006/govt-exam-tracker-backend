import { z } from "zod";

const createExamSchema = z.object({
    examname: z.string().trim().min(1, "examname is required"),
    origanization: z.string().trim().min(1, "origanization is required"),
    category: z.string().trim().min(1, "category is required"),
    applicationStartdate: z.string().optional(),
    applicationlastdate: z.string().optional(),
    examdate: z.string().optional(),
    resultdate: z.string().optional(),
    officialwebsite: z.string().url("must be a valid URL").optional(),
    status: z.string().optional()
});

const updateExamSchema = z.object({
    examname: z.string().trim().min(1).optional(),
    origanization: z.string().trim().min(1).optional(),
    category: z.string().trim().min(1).optional(),
    applicationStartdate: z.string().optional(),
    applicationlastdate: z.string().optional(),
    examdate: z.string().optional(),
    resultdate: z.string().optional(),
    officialwebsite: z.string().url("must be a valid URL").optional(),
    status: z.string().optional()
}).refine((data) => Object.keys(data).length > 0, {
    message: "at least one field is required to update"
});

export {
    createExamSchema,
    updateExamSchema
};