/* eslint-disable @typescript-eslint/no-explicit-any */
import { User } from "../user/user.model";
import { Order } from "../order/order.model";
import { toZonedTime } from "date-fns-tz";
import { format, startOfDay, subDays } from "date-fns";

const getStats = async () => {
  const today = new Date();
  const timeZone = "Asia/Dhaka";

  const localDate = startOfDay(subDays(today, 13));
  const startDate = toZonedTime(localDate, timeZone);

  const lastSevenDays = Array.from({ length: 7 }).map((_, i) =>
    format(subDays(today, 6 - i), "dd MMM")
  );

  // 🟢 New Customers
  const usersRaw = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        role: "USER",
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt",
            timezone: timeZone,
          },
        },
        count: { $sum: 1 },
      },
    },
  ]);

  // 🟢 Orders (with revenue + products sold)
  const ordersRaw = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt",
            timezone: timeZone,
          },
        },
        count: { $sum: 1 },
        totalRevenue: { $sum: "$totalAmount" },
        productsSold: { $sum: { $sum: "$products.quantity" } }, // sum of all product quantities
      },
    },
  ]);

  const fillMissingDays = (raw: any[], withRevenue = false) => {
    const lookup = raw.reduce((prev, current) => {
      const key = format(new Date(current._id), "dd MMM");
      prev[key] = current;
      return prev;
    }, {} as Record<string, any>);

    return lastSevenDays.map((date) => ({
      date,
      count: lookup[date]?.count || 0,
      totalRevenue: withRevenue ? lookup[date]?.totalRevenue || 0 : undefined,
      productsSold: withRevenue ? lookup[date]?.productsSold || 0 : undefined,
    }));
  };

  const sumCounts = (raw: any[], startOffset: number, endOffset: number) => {
    const start = toZonedTime(startOfDay(subDays(today, startOffset)), timeZone);
    const end = toZonedTime(startOfDay(subDays(today, endOffset)), timeZone);
    const startStr = format(start, "yyyy-MM-dd");
    const endStr = format(end, "yyyy-MM-dd");

    return raw
      .filter((r) => r._id <= endStr && r._id >= startStr)
      .reduce(
        (prev, current) => {
          prev.count += current.count;
          prev.totalRevenue += current.totalRevenue || 0;
          prev.productsSold += current.productsSold || 0;
          return prev;
        },
        { count: 0, totalRevenue: 0, productsSold: 0 }
      );
  };

  // Weekly summaries
  const thisWeekUsers = sumCounts(usersRaw, 6, 0);
  const lastWeekUsers = sumCounts(usersRaw, 13, 7);

  const thisWeekOrders = sumCounts(ordersRaw, 6, 0);
  const lastWeekOrders = sumCounts(ordersRaw, 13, 7);

  const calcGrowth = (thisVal: number, prevVal: number) => {
    if (prevVal === 0) {
      if (thisVal === 0) return "0%";
      return `+${thisVal}`;
    }
    const growth = ((thisVal - prevVal) / prevVal) * 100;
    return `${growth >= 0 ? "+" : ""}${growth.toFixed(2)}%`;
  };

  return {
    usersPerDay: fillMissingDays(usersRaw),
    ordersPerDay: fillMissingDays(ordersRaw, true), // includes revenue + products
    thisWeek: {
      users: thisWeekUsers,
      orders: thisWeekOrders,
      revenue: thisWeekOrders.totalRevenue,
      productsSold: thisWeekOrders.productsSold,
    },
    lastWeek: {
      users: lastWeekUsers,
      orders: lastWeekOrders,
      revenue: lastWeekOrders.totalRevenue,
      productsSold: lastWeekOrders.productsSold,
    },
    growth: {
      users: calcGrowth(thisWeekUsers.count, lastWeekUsers.count),
      orders: calcGrowth(thisWeekOrders.count, lastWeekOrders.count),
      revenue: calcGrowth(
        thisWeekOrders.totalRevenue,
        lastWeekOrders.totalRevenue
      ),
      productsSold: calcGrowth(
        thisWeekOrders.productsSold,
        lastWeekOrders.productsSold
      ),
    },
  };
};

export const StatsService = {
  getStats,
};
