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

const generateExcel = async (reportData, res, filter, startDate, endDate) => {
    try {
        const wb = new xl.Workbook();
        const ws = wb.addWorksheet('Sales Report');
  
        
        const headerStyle = wb.createStyle({
            font: { bold: true, color: 'FFFFFF', size: 12 },
            fill: { type: 'pattern', patternType: 'solid', fgColor: '4F81BD' },
            alignment: { horizontal: 'center', vertical: 'center' }
        });
  
        const moneyStyle = wb.createStyle({ 
            numberFormat: '₹#,##0.00; (₹#,##0.00)',
            alignment: { horizontal: 'right' }
        });
  
        const boldStyle = wb.createStyle({
            font: { bold: true },
            alignment: { horizontal: 'left' }
        });
  
        // Set column widths
        ws.column(1).setWidth(40);
        ws.column(2).setWidth(15);
        ws.column(3).setWidth(15);
        ws.column(4).setWidth(20);
        ws.column(5).setWidth(20);
  
        // Report Title
        ws.cell(1, 1).string('Sales Report').style(boldStyle);
        ws.cell(2, 1).string(getDateRangeText(filter, startDate, endDate)).style(boldStyle);
  
        // Headers
        ws.cell(4, 1).string('Product Name').style(headerStyle);
        ws.cell(4, 2).string('Sold').style(headerStyle);
        ws.cell(4, 3).string('Returns').style(headerStyle);
        ws.cell(4, 4).string('Offer Discounts').style(headerStyle);
        ws.cell(4, 5).string('Revenue').style(headerStyle);
  
        // Data rows
        reportData.result.forEach((order, index) => {
            const rowIndex = index + 5;
            ws.cell(rowIndex, 1).string(order.productName || 'N/A');
            ws.cell(rowIndex, 2).number(order.soldCount || 0);
            ws.cell(rowIndex, 3).number(order.returnedCount || 0);
            ws.cell(rowIndex, 4).number(Number(order.offerDiscounts) || 0).style(moneyStyle);
            ws.cell(rowIndex, 5).number(Number(order.revenue) || 0).style(moneyStyle);
        });
  
        // Summary section
        const summaryRow = reportData.result.length + 6;
        
        ws.cell(summaryRow, 1).string('Offer Discounts:').style(boldStyle);
        ws.cell(summaryRow, 4).number(Number(reportData.totalOfferDiscounts) || 0).style(moneyStyle);
  
        ws.cell(summaryRow + 1, 1).string('Coupon Discounts:').style(boldStyle);
        ws.cell(summaryRow + 1, 4).number(Number(reportData.totalCouponDiscounts) || 0).style(moneyStyle);
  
        ws.cell(summaryRow + 2, 1).string('Overall Discount:').style(boldStyle);
        ws.cell(summaryRow + 2, 4).number(Number(reportData.overallDiscount) || 0).style(moneyStyle);
  
        ws.cell(summaryRow + 3, 1).string('Net Revenue:').style(boldStyle);
        ws.cell(summaryRow + 3, 4).number(Number(reportData.netRevenue) || 0).style(moneyStyle);
  
        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="sales_report.xlsx"');
  
        // Write to buffer and send
        const buffer = await wb.writeToBuffer();
        res.send(buffer);
    } catch (error) {
        console.error('Excel generation error:', error);
       res.status(500).json({
        status:"error",
        message:"Failed to generate Excel report"
       })
    }
  };
  
  
  const generatePDF = async (reportData, res, filter, startDate, endDate) => {
    try {
      
      const doc = new PDFDocument({ margin: 50 });
      
     
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=sales-report-${filter || 'custom'}-${new Date().toISOString().split('T')[0]}.pdf`);
      
    
      doc.pipe(res);
      
    
      doc.fontSize(25).text('Sales Report', { align: 'center' });
      doc.moveDown();
      
      
      doc.fontSize(12);
      
      const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      };
      
      
      doc.text(`${getDateRangeText(filter, startDate, endDate)}`, { align: 'left' });
      doc.text(`Generated on: ${formatDate(new Date())}`, { align: 'left' });
      doc.moveDown(2);
      
      
      doc.fontSize(16).text('Summary', { underline: true });
      doc.moveDown();
      doc.fontSize(12);
      doc.text(`Total Revenue: Rs.${reportData.totalRevenue.toFixed(2)}`);
      doc.text(`Total Products Sold: ${reportData.totalSold}`);
      doc.text(`Total Returns: ${reportData.totalReturns}`);
      doc.text(`Total Offer Discounts: Rs. ${reportData.totalOfferDiscounts.toFixed(2)}`);
      doc.text(`Total Coupon Discounts: Rs. ${reportData.totalCouponDiscount.toFixed(2)}`);
      doc.text(`Overall Discount: Rs. ${reportData.overallDiscount.toFixed(2)}`);
      doc.text(`Net Revenue: Rs. ${reportData.netRevenue.toFixed(2)}`);
      doc.moveDown(2);
      
      
      doc.fontSize(16).text('Product Details', { underline: true });
      doc.moveDown();
      
      
      const tableTop = doc.y;
      const tableColumns = [
        { title: 'Product', x: 50, width: 180 },
        { title: 'Category', x: 230, width: 100 },
        { title: 'Size', x: 330, width: 60 },
        { title: 'Sold', x: 390, width: 60 },
        { title: 'Returns', x: 450, width: 60 },
        { title: 'Revenue', x: 510, width: 80 }
      ];
      
   
      doc.fontSize(10).font('Helvetica-Bold');
      tableColumns.forEach(column => {
        doc.text(column.title, column.x, tableTop, { width: column.width, align: 'left' });
      });
      
      
      doc.moveDown();
      const lineY = doc.y;
      doc.moveTo(50, lineY).lineTo(590, lineY).stroke();
      doc.moveDown(0.5);
      
      
      let rowY = doc.y;
      doc.font('Helvetica');
      
      reportData.result.forEach((item, index) => {
        
        if (rowY > 700) {
          doc.addPage();
          rowY = 50;
          doc.moveDown();
        }
        
        doc.text(item.productName, tableColumns[0].x, rowY, { width: tableColumns[0].width, align: 'left' });
        doc.text(item.category, tableColumns[1].x, rowY, { width: tableColumns[1].width, align: 'left' });
        doc.text(item.size, tableColumns[2].x, rowY, { width: tableColumns[2].width, align: 'left' });
        doc.text(item.soldCount.toString(), tableColumns[3].x, rowY, { width: tableColumns[3].width, align: 'left' });
        doc.text(item.returnedCount.toString(), tableColumns[4].x, rowY, { width: tableColumns[4].width, align: 'left' });
        doc.text(`Rs. ${item.revenue.toFixed(2)}`, tableColumns[5].x, rowY, { width: tableColumns[5].width, align: 'left' });
        
        doc.moveDown();
        rowY = doc.y;
      });
      
      
      doc.fontSize(10).text('Thank you for your order!', { align: 'center' });
      
      
      doc.end();
      
    } catch (error) {
      console.error('Error generating PDF sales report:', error);
      res.status(500).json({ 
        status:"error",
        message: 'Failed to generate PDF report' });
    }
  };
  
  const downloadSalesReport = async (req, res) => {
    try {
        const { filter, startDate, endDate, format } = req.query;
  
        
        if (!filter) {
            return res.status(400).json({ error: 'Filter parameter is required' });
        }
  
        if (filter === 'custom' && (!startDate || !endDate)) {
            return res.status(400).json({ status:"error",message: 'Start date and end date are required for custom filter' });
        }
  
        
        const reportData = await getSalesReportData(filter, startDate, endDate);
  
        
        switch (format?.toLowerCase()) {
          case 'excel':
              await generateExcel(reportData, res, filter, startDate, endDate);
              break;
          case 'pdf':
              await generatePDF(reportData, res, filter, startDate, endDate);
              break;
          default:
              res.status(400).json({ status:"error",message: 'Invalid format. Supported formats are "excel" and "pdf"' });
      }
      
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ 
            status:"error",
            message: error.message 
        });
    }
  }

  module.exports = {
    loadSalesReport,
  downloadSalesReport,
  getSalesReport,
  }