const Order = require("../models/orderModel");

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
    console.log('Final match conditions:', JSON.stringify(matchConditions, null, 2))
    const orders = await Order.find({
        "items.status": "Delivered"
      });
      console.log("orders",orders)

    try {
        // First check if any orders exist with these conditions
        const orderCount = await Order.countDocuments(matchConditions);
        console.log(`Found ${orderCount} matching orders`); // Debug log
    
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
  
    // Main aggregation for product-level stats
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
  
    // Aggregation for coupon discounts
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

    
  
    // Calculate totals
    const totalCouponDiscount = couponStats[0]?.totalCouponDiscount || 0;
    const totalProductDiscounts = result.reduce((sum, item) => sum + item.productDiscounts, 0);
    const totalRevenue = result.reduce((sum, item) => sum + item.revenue, 0);
    const totalSold = result.reduce((sum, item) => sum + item.soldCount, 0);
    const totalReturns = result.reduce((sum, item) => sum + item.returnedCount, 0);

    console.log('Aggregation results:', JSON.stringify({
        orders: result,
        offerDiscounts: totalProductDiscounts,
        couponDiscounts: totalCouponDiscount,
        overallSalesCount: totalSold,
        orderCount: couponStats[0]?.totalOrders || 0,
        returnedOrderCount: couponStats[0]?.returnedOrders || 0,
        overallDiscount: totalProductDiscounts + totalCouponDiscount,
        netRevenue: totalRevenue,
        grossRevenue: totalRevenue + totalProductDiscounts + totalCouponDiscount
      }, null, 2));
  
  
    return {
      orders: result,
      offerDiscounts: totalProductDiscounts,
      couponDiscounts: totalCouponDiscount,
      overallSalesCount: totalSold,
      orderCount: couponStats[0]?.totalOrders || 0,
      returnedOrderCount: couponStats[0]?.returnedOrders || 0,
      overallDiscount: totalProductDiscounts + totalCouponDiscount,
      netRevenue: totalRevenue,
      grossRevenue: totalRevenue + totalProductDiscounts + totalCouponDiscount
    };
} catch (error) {
    console.error('Error in getSalesReportData:', error);
    res.status(500).json({
        status:"success",
        message:"internal server error"
    })
  }
  };
  
  // The getDateRangeText and controller functions remain the same as in your original code


const getDateRangeText = (filter, startDate, endDate) => {
    switch (filter) {
        case 'daily':
            return `Date: ${new Date().toLocaleDateString()}`;
        case 'weekly':
            return `Week: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`;
        case 'monthly':
            return `Month: ${new Date(startDate).toLocaleString('default', { month: 'long', year: 'numeric' })}`;
        case 'yearly':
            return `Year: ${new Date().getFullYear()}`;
        case 'custom':
            return `Custom Range: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`;
        default:
            return 'Sales Report';
    }
};



const getSalesReport = async (req, res) => {
    try {
        const { filter, startDate, endDate } = req.query;
        console.log("query",req.query)

        const reportData = await getSalesReportData(filter, startDate, endDate);

        res.status(200).json(reportData);
    } catch (error) {
        console.error('Error generating sales report:', error);
        res.status(500).json({
            staus: "error",
            message: 'Failed to generate report'
        });
    }
};



const loadSalesReport = async (req, res) => {
    try {
      const reportData = await getSalesReportData('daily');
      res.status(200).json({
        status:"success",
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
      res.status(500).json({status:"error", 
         message: 'Failed to load sales report' });
    }
  };

  const loadDashboard = async (req, res) => {
    try {
     
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
        { $sort: { totalSold: -1 } },
        { $limit: 5 }
      ]);
  
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
  
      const monthlySales = await Order.aggregate([
        { 
          $match: { 
            'items.status': 'Delivered',
            'paymentStatus': 'Success'
          } 
        },
        {
          $group: {
            _id: { 
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" }
            },
            totalRevenue: { $sum: "$totalPrice" },
            totalDiscount: { $sum: "$totalDiscount" },
            totalTax: { $sum: "$tax" },
            couponDiscount: { $sum: "$couponDiscount" },
            itemDiscounts: {
              $sum: {
                $reduce: {
                  input: "$items",
                  initialValue: 0,
                  in: { $add: ["$$value", "$$this.discount"] }
                }
              }
            },
            orderCount: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            year: "$_id.year",
            month: "$_id.month",
            totalRevenue: 1,
            totalDiscount: 1,
            totalTax: 1,
            couponDiscount: 1,
            itemDiscounts: 1,
            orderCount: 1,
            netSales: {
              $subtract: [
                "$totalRevenue",
                { $add: ["$totalDiscount", "$totalTax"] }
              ]
            }
          }
        },
        { $sort: { "year": 1, "month": 1 } }
      ]);
  
      // Prepare chart data
      const monthlySalesLabels = monthlySales.map(sale => {
        const date = new Date(sale.year, sale.month - 1);
        return date.toLocaleString('default', { month: 'short', year: 'numeric' });
      });
  
      const monthlySalesData = monthlySales.map(sale => sale.netSales);
      const lastMonthlySales = monthlySales.length ? monthlySales[monthlySales.length - 1].netSales : 0;
  
      // Monthly Customers
      const monthlyCustomers = await User.aggregate([
        { 
          $match: { 
            isAdmin: false,
            isExist: true 
          } 
        },
        { 
          $group: { 
            _id: { 
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" }
            }, 
            newCustomers: { $sum: 1 } 
          } 
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]);
  
      const monthlyCustomersData = Array(12).fill(0);
      monthlyCustomers.forEach(item => {
        monthlyCustomersData[item._id.month - 1] = item.newCustomers;
      });
  
      const lastMonthlyCustomers = monthlyCustomers.length ? 
        monthlyCustomers[monthlyCustomers.length - 1].newCustomers : 0;
  
      // Monthly Orders
      const monthlyOrders = await Order.aggregate([
        { 
          $match: { 
            'items.status': 'Delivered',
            'paymentStatus': 'Success'
          } 
        },
        { 
          $group: { 
            _id: { 
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" }
            }, 
            totalOrders: { $sum: 1 } 
          } 
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]);
  
      const lastMonthlyOrders = monthlyOrders.length ? 
        monthlyOrders[monthlyOrders.length - 1].totalOrders : 0;
  
      // Render dashboard with all data
      res.status(200).render('admin/dashboard', {
        title: "Dashboard",
        topSellingProducts,
        topSellingCategories,
        monthlySalesLabels: JSON.stringify(monthlySalesLabels),
        monthlySalesData: JSON.stringify(monthlySalesData),
        lastMonthlySales,
        lastMonthlyCustomers,
        lastMonthlyOrders,
        categoryLabels: JSON.stringify(topSellingCategories.map(cat => cat._id)),
        categorySales: JSON.stringify(topSellingCategories.map(cat => cat.totalSold)),
        monthlyCustomersData: JSON.stringify(monthlyCustomersData),
      });
  
    } catch (error) {
      console.error('Error loading dashboard:', error);
      res.status(500).render('error', { 
        message: 'Failed to load dashboard data',
        error
      });
    }
  };


  
  
  module.exports = {
 loadSalesReport,
  getSalesReport,
  }