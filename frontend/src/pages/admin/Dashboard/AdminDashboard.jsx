import React, { useEffect } from 'react';
import AdminSidebar from '../../../components/AdminSidebar'
import { Link } from 'react-router'
import {
  Container,
  Row,
  Col,
  Card,
  ListGroup,
  ProgressBar,
  Spinner,
  Button,
  Badge
} from 'react-bootstrap';
import { Chart } from 'chart.js/auto';
import { useGetDashboardDataQuery } from '../../../redux/api/dashboardApiSlice';
import { IMG_URL } from '../../../redux/constants';


const AdminDashboard = () => {

  const { data: dashboardData, isLoading, isError } = useGetDashboardDataQuery();
  console.log("dash", dashboardData)
  const imageBaseUrl = IMG_URL;
  
  useEffect(() => {
    if (!dashboardData) return;

    // Initialize charts when data is available
    initCharts();
  }, [dashboardData]);

  const initCharts = () => {
    // Sales Bar Chart
    const salesCtx = document.getElementById('salesChart');
    new Chart(salesCtx, {
      type: 'bar',
      data: {
        labels: JSON.parse(dashboardData.monthlySalesLabels),
        datasets: [{
          label: "Total Sales (₹)",
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 2,
          data: JSON.parse(dashboardData.monthlySalesData),
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true },
          x: { grid: { display: false } }
        }
      }
    });

    // Customers Line Chart
    const customersCtx = document.getElementById('customersChart');
    const customerData = JSON.parse(dashboardData.monthlyCustomersData);
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    new Chart(customersCtx, {
      type: 'line',
      data: {
        labels: monthLabels.slice(12 - customerData.length),
        datasets: [{
          label: 'Monthly New Customers',
          data: customerData,
          fill: false,
          borderColor: 'rgb(54, 162, 235)',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });

    // Category Pie Chart
    const categoryCtx = document.getElementById('categoryChart');
    new Chart(categoryCtx, {
      type: 'pie',
      data: {
        labels: dashboardData.topSellingCategories.map(cat => cat._id),
        datasets: [{
          data: dashboardData.topSellingCategories.map(cat => cat.totalSold),
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)'
          ],
          borderWidth: 1
        }]
      }
    });
  };

  if (isLoading) return (
    <div className="d-flex justify-content-center mt-5">
      <Spinner animation="border" variant="primary" />
    </div>
  );

  if (isError) return (
    <div className="alert alert-danger mt-3">
      Failed to load dashboard data. Please try again later.
    </div>
  );

  if (!dashboardData) return null;


  return (
    <>
      <Container fluid className='my-custom-min-height'>
        <Row className="g-0">
          <Col lg={2} className="d-none d-lg-block">
            <AdminSidebar />
          </Col>

          <Col lg={9} className="p-4 background-one vw-75">
            <h2 className='text-center my-5 heading'>ADMIN DASHBOARD</h2>
            <div className="table-title my-5">
              <Row className="align-items-center">
                <Col lg={6}>
                  <Link to="/admin/sales-report">
                    <Button className="me-2 button-custom">
                      <span>View Sales Report</span>
                    </Button>
                  </Link>
                </Col>
              </Row>
              <Row>
                <Col lg={10}>
                  {/* Header */}
                  <Row className="mb-4">

                  </Row>

                  {/* Metrics Row */}
                  <Row className="mb-4">
                    {/* Sales Card */}
                    <Col md={8}>
                      <Card className="h-100">
                        <Card.Body>
                          <Row>
                            <Col>
                              <Card.Title className='caption'>Total Sales</Card.Title>
                              <Card.Subtitle className="text-muted mb-2">THIS MONTH</Card.Subtitle>
                            </Col>
                            <Col className="text-end">
                              <h4 className='caption'>₹{dashboardData.lastMonthlySales?.toFixed(2)}</h4>
                            </Col>
                          </Row>
                          <div className="chart-container mt-3" style={{ height: '200px' }}>
                            <canvas id="salesChart"></canvas>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>

                    {/* Orders Card */}
                    <Col md={4}>
                      <Card className="h-100">
                        <Card.Body>
                          <Card.Title className='caption'>Orders</Card.Title>
                          <Card.Subtitle className="text-muted mb-3">Monthly Goal: 1,000</Card.Subtitle>
                          <div className="mt-4">
                            <p className='caption'>{10 - dashboardData.lastMonthlyOrders} left</p>
                            <ProgressBar
                              now={(dashboardData.lastMonthlyOrders / 10) * 100}
                              style={{ height: '15px' }}
                            />
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>

                    {/* Customers Card */}
                    <Col md={12} className="mt-5 mt-md-3">
                      <Card className="h-100">
                        <Card.Body>
                          <Row>
                            <Col>
                              <Card.Title className='caption'>Customers</Card.Title>
                              <Card.Subtitle className="text-muted mb-2">THIS MONTH</Card.Subtitle>
                            </Col>
                            <Col className="text-end">
                              <h4 className='caption'>{dashboardData.lastMonthlyCustomers}</h4>
                            </Col>
                          </Row>
                          <div className="chart-container mt-3" style={{ height: '200px' }}>
                            <canvas id="customersChart"></canvas>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  {/* Category and Products Row */}
                  <Row>
                    {/* Category Distribution */}
                    <Col md={6}>
                      <Card className="h-100">
                        <Card.Body>
                          <Card.Title className='caption'>Category Distribution</Card.Title>
                          <div className="chart-container" style={{ height: '300px' }}>
                            <canvas id="categoryChart"></canvas>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>

                    {/* Top Selling Products */}
                    <Col md={6}>
                      <Card className="h-100">
                        <Card.Body>
                          <Card.Title className='caption'>Top Selling Products</Card.Title>
                          <ListGroup variant="flush">
                            {dashboardData.topSellingProducts.map((product, index) => (
                              <ListGroup.Item key={index} className="d-flex align-items-center">
                                <img
                                  src={`${imageBaseUrl}${product.productInfo?.pdImage[0]}`}  
                                  alt={product.productInfo?.name}
                                  width={50}
                                  height={50}
                                  className="me-3 rounded"
                                  style={{ objectFit: 'cover' }}
                                />
                                <div>
                                  <h6 className="mb-0">{product.productInfo?.name}</h6>
                                  <small className="text-muted">Sold: {product.totalSold}</small>
                                </div>
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  {/* Top Selling Categories */}
                  <Row className="mt-4">
                    <Col>
                      <Card>
                        <Card.Body>
                          <Card.Title className='caption'>Top Selling Categories</Card.Title>
                          <Row>
                            {dashboardData.topSellingCategories.map((category, index) => (
                              <Col md={3} key={index} className="mb-3">
                                <Card className="text-center">
                                  <Card.Body>
                                    <h5>{category._id}</h5>
                                    <Badge bg="primary">Sold: {category.totalSold}</Badge>
                                  </Card.Body>
                                </Card>
                              </Col>
                            ))}
                          </Row>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </div>

          </Col>
        </Row>


      </Container>
    </>
  )
}

export default AdminDashboard



