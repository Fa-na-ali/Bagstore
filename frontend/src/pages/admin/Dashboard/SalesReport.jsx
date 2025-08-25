import { useState, useEffect, useRef } from 'react';
import {
  Container,
  Table,
  Button,
  Form,
  Row,
  Col,
  Spinner,
  Tooltip,
  OverlayTrigger,
  Card
} from 'react-bootstrap';
import { useGetSalesReportQuery } from '../../../redux/api/dashboardApiSlice';
import * as XLSX from 'xlsx';
import 'jspdf-autotable';
import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import AdminSidebar from '../../../components/AdminSidebar';
import { BOLD_URL_FONT, BOLDITALICS_URL_FONT, ITALICS_URL_FONT, NORMAL_URL_FONT } from '../../../constants/constants';


// Initialize pdfMake
if (pdfFonts && pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
  pdfMake.vfs = pdfFonts.default.pdfMake.vfs;
} else {
  pdfMake.vfs = {
    Roboto: {
      normal: `${NORMAL_URL_FONT}`,
      bold: `${BOLD_URL_FONT}`,
      italics: `${ITALICS_URL_FONT}`,
      bolditalics: `${BOLDITALICS_URL_FONT}`
    }
  };
}

const SalesReport = () => {
  const [filter, setFilter] = useState('daily');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDateInputs, setShowDateInputs] = useState(false);
  const tableRef = useRef(null);

  const {
    data: report,
    isLoading,
    isFetching,
    refetch
  } = useGetSalesReportQuery({ filter, startDate, endDate });
  const reportData = report?.reportData

  useEffect(() => {
    setShowDateInputs(filter === 'custom');
  }, [filter]);

  const handleGenerateReport = () => {
    refetch();
  };

  const handleDownloadPdf = () => {
    if (!reportData?.orders) return;

    const body = [
      ['Product Name', 'Sold', 'Returns', 'Offer Discounts', 'Revenue (₹)'],
      ...reportData.orders.map(order => [
        order.productName,
        order.soldCount,
        order.returnedCount,
        `₹${order.productDiscounts}`,
        `₹${order.revenue}`
      ])
    ];

    const orderDetailsBody = [
      [
        'Date', 'Email', 'Payment Method',
        'Coupon Discount', 'Shipping Price', 'Tax',
        'Total Discount', 'Subtotal', 'Products'
      ],
      ...reportData.detailedOrders.map(order => [
        new Date(order.orderDate).toLocaleString(),
        order.userEmail,
        order.paymentMethod,
        `₹${order.couponDiscount}`,
        `₹${order.shippingPrice}`,
        `₹${order.tax.toFixed(2)}`,
        `₹${order.totalDiscount}`,
        `₹${order.totalPrice}`,
        order.items.map(item => `${item.name} (${item.category}), Qty:${item.qty}, Price:₹${item.price}`).join('\n')
      ])
    ];

    const docDefinition = {
      content: [
        { text: 'Sales Report', style: 'header' },
        {
          text: `Generated on ${new Date().toLocaleString()}`,
          alignment: 'right',
          margin: [0, 0, 0, 10],
        },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto', 'auto'],
            body: body,
          },
        },
        {
          text: `Offer Discounts: ₹${reportData.offerDiscounts || 0}`,
          style: 'subheader',
          alignment: 'left',
          margin: [10, 10, 10, 10],
        },
        {
          text: `Coupon Discount: ₹${reportData.couponDiscounts || 0}`,
          alignment: 'left',
          style: 'subheader',
          margin: [10, 0, 0, 10],
        },
        {
          text: `Net Revenue: ₹${reportData.netRevenue || 0}`,
          alignment: 'left',
          style: 'subheader',
          margin: [10, 0, 0, 10],
        },
        { text: 'Order Details', style: 'header', margin: [0, 20, 0, 10] },
        {
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*'],
            body: orderDetailsBody,
          },
          // layout: 'lightHorizontalLines'
        }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10],
        },
        subheader: {
          fontSize: 14,
          bold: true,
        }
      },
      defaultStyle: {
        fontSize: 12,
        alignment: 'center'
      },
      pageOrientation: 'landscape'
    };

    pdfMake.createPdf(docDefinition).download('sales_report.pdf');
  };

  const handleDownloadExcel = () => {
    if (!reportData?.orders) return;

    // First sheet: Sales Report
    const salesHeaders = ['Product Name', 'Sold', 'Returns', 'Offer Discounts', 'Revenue (₹)'];
    const salesData = reportData.orders.map(order => [
      order.productName,
      order.soldCount,
      order.returnedCount,
      order.productDiscounts,
      order.revenue
    ]);
    const summaryData = [
      [],
      ['Offer Discounts', reportData.offerDiscounts],
      ['Coupon Discount', reportData.couponDiscounts],
      ['Net Revenue', reportData.netRevenue]
    ];

    // Second sheet: Order Details
    const orderHeaders = [
      'Order Date', 'Email', 'Payment Method',
      'Coupon Discount', 'Shipping Price', 'Tax',
      'Total Discount', 'Subtotal', 'Products'
    ];
    const orderData = reportData.detailedOrders.map(order => [
      new Date(order.orderDate).toLocaleString(),
      order.userEmail,
      order.paymentMethod,
      order.couponDiscount,
      order.shippingPrice,
      order.tax,
      order.totalDiscount,
      order.totalPrice,
      order.items.map(item => `${item.name} (${item.category}) x${item.qty} @ ₹${item.price}`).join(', ')
    ]);

    const wb = XLSX.utils.book_new();

    // Add Sales Report
    const salesSheet = XLSX.utils.aoa_to_sheet([salesHeaders, ...salesData, ...summaryData]);
    XLSX.utils.book_append_sheet(wb, salesSheet, 'Sales Report');

    // Add Order Details
    const orderSheet = XLSX.utils.aoa_to_sheet([orderHeaders, ...orderData]);
    XLSX.utils.book_append_sheet(wb, orderSheet, 'Order Details');

    XLSX.writeFile(wb, 'sales_report.xlsx');
  };



  const revenueTooltip = (
    <Tooltip id="revenue-tooltip">
      This is the price of the total products sold after offer discount.
    </Tooltip>
  );

  return (
    <Container fluid className="mt-4 p-4">
      <Row className="g-0">
        <Col lg={2} className="d-none d-lg-block">
          <AdminSidebar />
        </Col>
        <Col lg={10} className='ps-3'>
          <h3 className="fw-medium text-center heading">SALES REPORT</h3>

          <Row className="justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <Col xs={12} md={4} className="d-flex gap-2 align-items-center">
              <Form.Label htmlFor="filter">Filter by:</Form.Label>
              <Form.Select
                id="filter"
                className="w-auto"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="custom">Custom Date</option>
              </Form.Select>
            </Col>

            {showDateInputs && (
              <Col xs={12} md={4} className="date-inputs d-flex gap-2">
                <Form.Control
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <Form.Control
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Col>
            )}

            <Col xs={12} md={4} className="d-flex gap-2 justify-content-md-end">
              <Button
                variant="primary"
                onClick={handleGenerateReport}
                disabled={isFetching}
              >
                {isFetching ? (
                  <>
                    <Spinner as="span" size="sm" animation="border" role="status" />
                    <span className="ms-2">Generating...</span>
                  </>
                ) : (
                  'Generate Report'
                )}
              </Button>
              <Button
                variant="success"
                onClick={handleDownloadExcel}
                disabled={isLoading || !reportData?.orders?.length}
              >
                Download Excel
              </Button>
              <Button
                variant="danger"
                onClick={handleDownloadPdf}
                disabled={isLoading || !reportData?.orders?.length}
              >
                Download PDF
              </Button>
            </Col>
          </Row>

          <div className="table-responsive mt-4">
            <Table bordered className="text-center" ref={tableRef}>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Sold</th>
                  <th>Returns</th>
                  <th>Offer Discounts</th>
                  <th>
                    <OverlayTrigger placement="top" overlay={revenueTooltip}>
                      <span>Revenue (₹)</span>
                    </OverlayTrigger>
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="text-center">
                      <Spinner animation="border" variant="primary" />
                    </td>
                  </tr>
                ) : reportData?.orders?.length > 0 ? (
                  reportData.orders.map((order, index) => (
                    <tr key={index}>
                      <td>{order.productName}</td>
                      <td>{order.soldCount}</td>
                      <td>{order.returnedCount}</td>
                      <td>₹{order.productDiscounts.toFixed(2)}</td>
                      <td>₹{order.revenue.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">No sales data available</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          {reportData?.detailedOrders?.length > 0 && (
            <>
              <h4 className="mt-5 fw-bold">Order Details</h4>
              <div className="table-responsive mt-3">
                <Table bordered className="text-center">
                  <thead>
                    <tr>
                      <th>Order Date</th>
                      {/* <th>Order No.</th> */}
                      {/* <th>Ordered By</th> */}
                      <th>Email</th>
                      <th>Shipping Address</th>
                      <th>Payment Method</th>
                      <th>Coupon Discount</th>
                      <th>Shipping Price</th>
                      <th>Tax</th>
                      <th>Total Discount</th>
                      <th>Subtotal</th>
                      {/* <th>Net Total</th> */}
                      <th>Products</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.detailedOrders.map((order, index) => (
                      <tr key={index}>
                        <td>{new Date(order.orderDate).toLocaleString()}</td>
                        {/* <td>{order.orderNumber}</td> */}
                        {/* <td>{order.userName}</td> */}
                        <td>{order.userEmail}</td>
                        <td>
                          {order.shippingAddress.houseName},<br />
                          {order.shippingAddress.town}, {order.shippingAddress.street},<br />
                          {order.shippingAddress.state}
                        </td>
                        <td>{order.paymentMethod}</td>
                        <td>₹{order.couponDiscount.toFixed(2)}</td>
                        <td>₹{order.shippingPrice}</td>
                        <td>₹{order.tax.toFixed(2)}</td>
                        <td>₹{order.totalDiscount.toFixed(2)}</td>
                        <td>₹{order.totalPrice.toFixed(2)}</td>
                        {/* <td>₹{order.totalPrice + order.tax + order.shippingPrice - order.totalDiscount - order.couponDiscount}</td> */}
                        <td>
                          <ul className="text-start">
                            {order.items.map((item, i) => (
                              <li key={i}>
                                {item.name} ({item.category}), Qty: {item.qty}, Price: ₹{item.price.toFixed(2)}
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </>
          )}


          {!isLoading && reportData && (
            <Card className="mt-4 shadow-sm">
              <Card.Header className="bg-light">
                <h5 className="mb-0 fw-bold">Sales Summary</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Offer Discounts:</span>
                      <span className="fw-medium">₹{reportData.offerDiscounts}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Coupon Discounts:</span>
                      <span className="fw-medium">₹{reportData?.couponDiscounts?.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Overall Sales Count:</span>
                      <span className="fw-medium">{reportData?.overallSalesCount?.toFixed(2)}</span>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Order Count:</span>
                      <span className="fw-medium">{reportData.orderCount}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Overall Discount:</span>
                      <span className="fw-medium">₹{reportData?.overallDiscount?.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Net Revenue:</span>
                      <span className="fw-bold text-success">₹{reportData?.netRevenue?.toFixed(2)}</span>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );

};

export default SalesReport;