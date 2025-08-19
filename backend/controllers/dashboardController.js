const Order = require("../models/orderModel");
const Payment = require("../models/paymentModel");
const User = require("../models/userModel");
const STATUS_CODES = require("../statusCodes");

const getSalesReportData = async (filter, startDate, endDate) => {
  let matchConditions = {
    $or: [
      { "items.status": "Delivered" },
      { "items.status": "Returned" }
    ],
    paymentStatus: "Success"
  };

  let dateRange = {};
  const now = new Date();

  switch (filter) {
    case 'daily':
      dateRange = {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lte: new Date(new Date().setHours(23, 59, 59, 999)),
      };
      break;
    case 'weekly':
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(now);
      endOfWeek.setDate(now.getDate() + (6 - now.getDay()));
      endOfWeek.setHours(23, 59, 59, 999);

      dateRange = {
        $gte: startOfWeek,
        $lte: endOfWeek
      };
      break;
    case 'monthly':
      dateRange = {
        $gte: new Date(now.getFullYear(), now.getMonth(), 1),
        $lte: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
      };
      break;
    case 'yearly':
      dateRange = {
        $gte: new Date(now.getFullYear(), 0, 1),
        $lte: new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
      };
      break;
    case 'custom':
      if (startDate && endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        dateRange = {
          $gte: new Date(startDate),
          $lte: endDateTime
        };
      }
      break;
  }

  if (Object.keys(dateRange).length > 0) {
    matchConditions.createdAt = dateRange;
  }

  const orders = await Order.find({
    "items.status": "Delivered"
  });

  try {

    const orderCount = await Order.countDocuments(matchConditions);
    if (orderCount === 0) {
      return {
        orders: [],
        offerDiscounts: 0,
        couponDiscounts: 0,
        overallSalesCount: 0,
        orderCount: 0,
        returnedOrderCount: 0,
        overallDiscount: 0,
        netRevenue: 0,
        grossRevenue: 0
      };
    }

    const result = await Order.aggregate([
      { $match: matchConditions },
      { $unwind: "$items" },
      {
        $match: {
          $or: [
            { "items.status": "Delivered" },
            { "items.status": "Returned" }
          ]
        }
      },
      {
        $group: {
          _id: {
            productId: "$items.product",
            name: "$items.name",
            category: "$items.category"
          },
          productName: { $first: "$items.name" },
          category: { $first: "$items.category" },
          soldCount: {
            $sum: {
              $cond: [
                { $eq: ["$items.status", "Delivered"] },
                "$items.qty",
                0
              ]
            }
          },
          returnedCount: {
            $sum: {
              $cond: [
                { $eq: ["$items.status", "Returned"] },
                "$items.qty",
                0
              ]
            }
          },
          productDiscounts: {
            $sum: {
              $cond: [
                { $eq: ["$items.status", "Delivered"] },
                { $multiply: ["$items.discount", "$items.qty"] },
                0
              ]
            }
          },
          revenue: {
            $sum: {
              $cond: [
                { $eq: ["$items.status", "Delivered"] },
                {
                  $subtract: [
                    { $multiply: ["$items.price", "$items.qty"] },
                    { $multiply: ["$items.discount", "$items.qty"] }
                  ]
                },
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          productName: 1,
          category: 1,
          soldCount: 1,
          returnedCount: 1,
          productDiscounts: 1,
          revenue: 1
        }
      }
    ]);


    const couponStats = await Order.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: null,
          totalCouponDiscount: {
            $sum: {
              $cond: [
                { $eq: ["$paymentStatus", "Success"] },
                "$couponDiscount",
                0
              ]
            }
          },
          totalOrders: { $sum: 1 },
          returnedOrders: {
            $sum: {
              $cond: [
                { $eq: ["$status", "Returned"] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    //detailed orders
    const detailedOrders = await Order.aggregate([
      { $match: matchConditions },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $lookup: {
          from: 'addresses',
          localField: 'shippingAddress',
          foreignField: '_id',
          as: 'address'
        }
      },
      {
        $unwind: "$user"
      },
      {
        $unwind: "$address"
      },
      {
        $project: {
          orderDate: "$createdAt",
          orderNumber: 1,
          userName: "$user.name",
          userEmail: "$user.email",
          shippingAddress: "$address",
          paymentMethod: 1,
          couponDiscount: 1,
          shippingPrice: 1,
          tax: 1,
          totalDiscount: 1,
          totalPrice: 1,
          items: 1
        }
      }
    ]);


    const totalCouponDiscount = couponStats[0]?.totalCouponDiscount || 0;
    const totalProductDiscounts = result.reduce((sum, item) => sum + item.productDiscounts, 0);
    const totalRevenue = result.reduce((sum, item) => sum + item.revenue, 0);
    const totalSold = result.reduce((sum, item) => sum + item.soldCount, 0);
    const totalReturns = result.reduce((sum, item) => sum + item.returnedCount, 0);

    return {
      orders: result,
      offerDiscounts: totalProductDiscounts.toFixed(2),
      couponDiscounts: totalCouponDiscount,
      overallSalesCount: totalSold,
      orderCount: couponStats[0]?.totalOrders || 0,
      returnedOrderCount: couponStats[0]?.returnedOrders || 0,
      overallDiscount: totalProductDiscounts + totalCouponDiscount,
      netRevenue: totalRevenue,
      grossRevenue: totalRevenue + totalProductDiscounts + totalCouponDiscount,
      detailedOrders
    };
  } catch (error) {
    console.error('Error in getSalesReportData:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Internal server error"
    })
  }
};


//sales report 
const getSalesReport = async (req, res) => {
  try {
    const { filter, startDate, endDate } = req.query;
    const reportData = await getSalesReportData(filter, startDate, endDate);
    res.status(STATUS_CODES.OK).json({ status: "success", reportData });
  } catch (error) {
    console.error('Error generating sales report:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      staus: "error",
      message: 'Failed to generate report'
    });
  }
};

//load sles report
const loadSalesReport = async (req, res) => {
  try {
    const reportData = await getSalesReportData('daily');
    res.status(STATUS_CODES.OK).json({
      status: "success",
      orders: reportData.orders,
      offerDiscounts: reportData.offerDiscounts.toFixed(2),
      couponDiscounts: reportData.couponDiscounts.toFixed(2),
      overallSalesCount: reportData.overallSalesCount,
      orderCount: reportData.orderCount,
      returnedOrderCount: reportData.returnedOrderCount,
      overallDiscount: reportData.overallDiscount.toFixed(2),
      netRevenue: reportData.netRevenue.toFixed(2),
      grossRevenue: reportData.grossRevenue.toFixed(2)
    });
  } catch (error) {
    console.error('Error loading sales report page:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: 'Failed to load sales report'
    });
  }
};
///////////////////////////////////////////////////////////////////////

const loadDashboard = async (req, res) => {
  try {

    let { filter, startDate, endDate } = req.query;
    startDate = parseInt(startDate);
    endDate = endDate ? new Date(endDate) : null;
    let dateRange = {};
    const now = new Date();

    switch (filter) {
      case 'daily':
        dateRange = {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lte: new Date(new Date().setHours(23, 59, 59, 999)),
        };
        break;
      case 'weekly':

        const day = now.getDay();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        dateRange = {
          $gte: startOfWeek,
          $lte: endOfWeek
        };
        break;
      case 'monthly':
        const month = parseInt(startDate);
        const yearl = now.getFullYear();

        const startOfMonth = new Date(yearl, month, 1);
        const endOfMonth = new Date(yearl, month + 1, 0, 23, 59, 59, 999);

        dateRange = {
          $gte: startOfMonth,
          $lte: endOfMonth
        };
        break;
      case 'yearly':
        const year = !isNaN(startDate) ? startDate : now.getFullYear();
        dateRange = {
          $gte: new Date(year, 0, 1),
          $lte: new Date(year, 11, 31, 23, 59, 59, 999)
        };
        break;
      case 'custom':
        if (startDate && endDate) {
          const endDateTime = new Date(endDate);
          endDateTime.setHours(23, 59, 59, 999);
          dateRange = {
            $gte: new Date(startDate),
            $lte: endDateTime
          };
        }
        break;
    }

    //user data
    const userData = await User.aggregate([
      {
        $match: {
          createdAt:
            dateRange

        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          userCount: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          date: {
            $concat: [
              { $toString: "$_id.year" }, "-",
              { $toString: "$_id.month" }, "-",
              { $toString: "$_id.day" }
            ]
          },
          userCount: 1
        }
      },
      {
        $sort: { year: 1, month: 1, date: 1 }
      }
    ]);

    //sales data
    const salesData = await Payment.aggregate([
      {
        $match: {
          status: "Success",
          createdAt:
            dateRange

        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          total_amount: { $sum: "$amount" }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
      },
      {
        $project: {
          _id: 0,
          date: {
            $concat: [
              { $toString: "$_id.year" }, "-",
              { $toString: "$_id.month" }, "-",
              { $toString: "$_id.day" }
            ]
          },
          total_amount: 1
        }
      }
    ]);

    //order data
    const orderData = await Order.aggregate([
      {
        $match: {
          paymentStatus: "Success",
          createdAt:
            dateRange

        }
      },
      { $unwind: "$items" },
      {
        $match: {
          "items.status": "Delivered"
        }
      },
      {
        $group: {
          _id: "$items.status",
          order_count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          status: "$_id",
          order_count: 1
        }
      }
    ])

    //top selling products
    const topSellingProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $match: {
          'items.status': 'Delivered',
          'paymentStatus': 'Success'
        }
      },
      {
        $group: {
          _id: '$items.product',
          productName: { $first: '$items.name' },
          category: { $first: '$items.category' },
          totalSold: { $sum: '$items.qty' },
          totalRevenue: {
            $sum: {
              $multiply: ['$items.price', '$items.qty']
            }
          }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $project: {
          _id: 1,
          productName: 1,
          category: 1,
          totalSold: 1,
          totalRevenue: 1,
          'productInfo.pdImage': 1,
          'productInfo.brand': 1,
          'productInfo.color': 1,
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);

    //top selling categories
    const topSellingCategories = await Order.aggregate([
      { $unwind: '$items' },
      {
        $match: {
          'items.status': 'Delivered',
          'paymentStatus': 'Success'
        }
      },
      {
        $group: {
          _id: '$items.category',
          totalSold: { $sum: '$items.qty' },
          totalRevenue: {
            $sum: {
              $multiply: ['$items.price', '$items.qty']
            }
          }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);

    res.status(STATUS_CODES.OK).json({
      status: "success",
      topSellingProducts,
      topSellingCategories,
      salesData,
      orderData,
      userData
    });

  } catch (error) {
    console.error('Error loading dashboard:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: 'Failed to load dashboard data',

    });
  }
};



module.exports = {
  loadSalesReport,
  getSalesReport,
  loadDashboard,
}