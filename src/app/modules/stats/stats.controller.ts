import { Request, Response } from "express"
import sendResponse from "../../../utils/sendResponse";
import catchAsync from "../../../utils/catchAsync";
import { StatsService } from "./stats.service";


const getStats = catchAsync(async (req: Request, res: Response) => {
    const data = await StatsService.getStats();

    sendResponse(res, {
        message: "Stats retrieved Successfully",
        success: true,
        statusCode: 200,
        data
    })
})

export const StatsController = {
    getStats
}