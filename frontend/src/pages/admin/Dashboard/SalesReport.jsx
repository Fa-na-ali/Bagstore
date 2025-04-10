import React, { useState, useEffect } from 'react';
import {
    Container,
    Table,
    Button,
    Form,
    Row,
    Col,
    Spinner,
    Tooltip,
    OverlayTrigger
} from 'react-bootstrap';
import { useGetSalesReportQuery, useDownloadExcelReportMutation, useDownloadPdfReportMutation } from '../../../redux/api/dashboardApiSlice';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import AdminSidebar from '../../../components/AdminSidebar';


const SalesReport = () => {
    const [filter, setFilter] = useState('daily');
    const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

 
    const [showDateInputs, setShowDateInputs] = useState(false);

    const {
        data: reportData,
        isLoading,
        isFetching,
        refetch
    } = useGetSalesReportQuery({ filter, startDate, endDate });
console.log("data",reportData)
    const [downloadExcel, { isLoading: isExcelLoading }] = useDownloadExcelReportMutation();
    const [downloadPdf, { isLoading: isPdfLoading }] = useDownloadPdfReportMutation();

    useEffect(() => {
        setShowDateInputs(filter === 'custom');
    }, [filter]);

    const handleGenerateReport = () => {
        refetch();
    };

    const handleDownloadExcel = async () => {
        try {
            const blob = await downloadExcel({ filter, startDate, endDate }).unwrap();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `sales_report_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading Excel:', error);
        }
    };

    const handleDownloadPdf = async () => {
        try {
            const blob = await downloadPdf({ filter, startDate, endDate }).unwrap();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `sales_report_${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading PDF:', error);
            // Fallback to client-side PDF generation if API fails
            generateClientPdf();
        }
    };

    const generateClientPdf = () => {
        const doc = new jsPDF();
        doc.text('Sales Report', 14, 16);

        const headers = [['Product Name', 'Sold', 'Returns', 'Offer Discounts', 'Revenue (₹)']];
        const data = reportData?.orders?.map(order => [
            `${order.productName} ${order.size || ''}`,
            order.soldCount,
            order.returnedCount,
            `₹${order.offerDiscounts}`,
            `₹${order.revenue}`
        ]) || [];

        doc.autoTable({
            head: headers,
            body: data,
            startY: 20,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [22, 160, 133] }
        });

        // Add summary
        let yPos = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(10);
        doc.text(`Offer Discounts: ₹${reportData?.offerDiscounts || 0}`, 14, yPos);
        yPos += 7;
        doc.text(`Coupon Discounts: ₹${reportData?.couponDiscounts || 0}`, 14, yPos);
        yPos += 7;
        doc.text(`Overall Sales Count: ${reportData?.overallSalesCount || 0}`, 14, yPos);
        yPos += 7;
        doc.text(`Order Count: ${reportData?.orderCount || 0}`, 14, yPos);
        yPos += 7;
        doc.text(`Overall Discount: ₹${reportData?.overallDiscount || 0}`, 14, yPos);
        yPos += 7;
        doc.text(`Net Revenue: ₹${reportData?.netRevenue || 0}`, 14, yPos);

        doc.save(`sales_report_${new Date().toISOString().split('T')[0]}.pdf`);
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
            </Row>

            <h3 className="fw-medium">Sales Report</h3>

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
                        id="generateReport"
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
                        id="downloadExcel"
                        onClick={handleDownloadExcel}
                        disabled={isExcelLoading}
                    >
                        {isExcelLoading ? (
                            <>
                                <Spinner as="span" size="sm" animation="border" role="status" />
                                <span className="ms-2">Preparing...</span>
                            </>
                        ) : (
                            'Download Excel'
                        )}
                    </Button>
                    <Button
                        variant="danger"
                        id="downloadPDF"
                        onClick={handleDownloadPdf}
                        disabled={isPdfLoading}
                    >
                        {isPdfLoading ? (
                            <>
                                <Spinner as="span" size="sm" animation="border" role="status" />
                                <span className="ms-2">Preparing...</span>
                            </>
                        ) : (
                            'Download PDF'
                        )}
                    </Button>
                </Col>
            </Row>

            <div className="table-responsive mt-4">
                <Table id="salesTable" bordered className="text-center">
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
                                    <td>₹{order.productDiscounts}</td>
                                    <td>₹{order.revenue}</td>
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

            {!isLoading && reportData && (
                <div className="mt-4">
                    <h5>Offer Discounts: ₹{reportData.offerDiscounts}</h5>
                    <h5>Coupon Discounts: ₹{reportData.couponDiscounts}</h5>
                    <h5>Overall Sales Count: {reportData.overallSalesCount}</h5>
                    <h5>Order Count: {reportData.orderCount}</h5>
                    <h5>Overall Discount: ₹{reportData.overallDiscount}</h5>
                    <h5>Net Revenue: ₹{reportData.netRevenue}</h5>
                </div>
            )}
        </Container>
   
  );
};

export default SalesReport;