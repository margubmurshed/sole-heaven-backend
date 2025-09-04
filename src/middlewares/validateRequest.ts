import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";

const validateRequest = (zodSchema: AnyZodObject) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = req.body?.data ? JSON.parse(req.body.data) : req.body; 
            req.body = await zodSchema.parseAsync(req.body);
            next();
        } catch (error) {
            next(error)
        }
    }
}

export default validateRequest;