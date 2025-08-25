import { useEffect, useState } from 'react';
import AdminSidebar from '../../../components/AdminSidebar';
import { Link } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  ListGroup,
  Spinner,
  Button,
  Form
} from 'react-bootstrap';
import { Chart } from 'chart.js/auto';
import { useGetDashboardDataQuery } from '../../../redux/api/dashboardApiSlice';

//to get months
const getMonthName = (monthIndex) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
  return months[monthIndex];
};

const getRandomColor = () => {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r}, ${g}, ${b})`;
};

const AdminDashboard = () => {
  const [filter, setFilter] = useState('weekly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDateInputs, setShowDateInputs] = useState(false);
  const { data: dashboardData, isLoading, isError } = useGetDashboardDataQuery({ filter, startDate, endDate });
  const [chartInstance, setChartInstance] = useState(null);
  const [lineChart, setlineChart] = useState(null);
  const [categoryChartInstance, setCategoryChartInstance] = useState(null);

  useEffect(() => {
    setShowDateInputs(filter === 'custom');

    if (filter === 'monthly') {
      const currentMonth = new Date().getMonth();
      setStartDate(currentMonth.toString());
    }
  }, [filter]);

  useEffect(() => {
    // sales chart
    if (dashboardData?.salesData && chartInstance) {
      chartInstance.destroy();
    }
    if (dashboardData?.salesData) {
      const salesCtx = document.getElementById('salesChart').getContext('2d');
      const color = getRandomColor();
      const groupedData = [];

      dashboardData?.salesData?.forEach(item => {
        const date = new Date(item.date);
        let key = filter === 'yearly' ? getMonthName(date.getMonth()) : date.toISOString().split('T')[0];
        const group = groupedData.find(g => g.key === key);
        if (group) {
          group.total_amount += item.total_amount;
        } else {
          groupedData.push({ key, total_amount: item.total_amount });
        }
      });
      const newChart = new Chart(salesCtx, {
        type: 'bar',
        data: {
          labels: groupedData.map(g => g.key),
          datasets: [{
            label: 'Sales',
            data: groupedData.map(g => g.total_amount),
            backgroundColor: color,
            borderColor: color,
            borderWidth: 2,
            borderRadius: 5,
          }]
        },

        options: {
          responsive: true,
          scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: true, grid: { display: false } },
          },
          barThickness: 20,
          categoryPercentage: 0.7,
        }
      });

      setChartInstance(newChart);
    }

    // user chart
    if (dashboardData?.userData && lineChart) {
      lineChart.destroy();
    }
    if (dashboardData?.userData) {
      const canvas = document.getElementById('customersChart');
      if (!canvas) return;
      const userCtx = canvas.getContext('2d');

      const groupedUserData = dashboardData.userData.map(item => ({
        key: new Date(item.date).toISOString().split('T')[0],
        count: item.userCount
      }));

      const newLineChart = new Chart(userCtx, {
        type: 'line',
        data: {
          labels: groupedUserData.map(d => d.key),
          datasets: [{
            label: 'New Customers',
            data: groupedUserData.map(d => d.count),
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgb(75, 192, 192)',
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: true }
          }
        }
      });
      setlineChart(newLineChart)
    }
    //top selling pie chart
    if (dashboardData?.topSellingCategories) {
      const canvas = document.getElementById('categoryChart');
      if (!canvas) return;

      if (categoryChartInstance) {
        categoryChartInstance.destroy();
      }

      const topCtx = canvas.getContext('2d');
      const newChart = new Chart(topCtx, {
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
        },
        options: {
          responsive: true
        }
      });

      setCategoryChartInstance(newChart);
    }
  }, [dashboardData?.salesData]);

  const totalSales = dashboardData?.salesData?.reduce((sum, val) => sum + val.total_amount, 0) || 0;
  const totalUsers = dashboardData?.userData?.reduce((sum, val) => sum + val.userCount, 0) || 0;
  const totalOrders = dashboardData?.orderData?.reduce((sum, val) => sum + val.order_count, 0) || 0;

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
              <Row className=" mb-4">
                <Col lg={4}>
                  <Link to="/admin/sales-report">
                    <Button className="me-2 button-custom">
                      <span>View Sales Report</span>
                    </Button>
                  </Link>
                </Col>
                <Col lg={4} className="d-flex justify-content-space between align-items-center">
                  <Form.Label htmlFor="filter">Filter:</Form.Label>
                  <Form.Select
                    id="filter"
                    className="w-auto ms-3"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="custom">Custom Date</option>
                  </Form.Select>
                  {filter === 'monthly' && (
                    <Form.Select
                      className="ms-3"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i} value={i}>
                          {getMonthName(i)}
                        </option>
                      ))}
                    </Form.Select>
                  )}

                  {filter === 'yearly' && (
                    <Form.Select
                      className="ms-3"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    >
                      {[2023, 2024, 2025].map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </Form.Select>
                  )}

                </Col>
                {showDateInputs && (
                  <Col xs={12} lg={4} className="date-inputs d-flex gap-2">
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
              </Row>


              {/* Summary Cards */}
              <Row className="mb-4">
                {/* Sales Summary */}
                <Col md={4}>
                  <Card className="h-100">
                    <Card.Body>
                      <Card.Title>Total Sales</Card.Title>
                      <Card.Text>₹{totalSales.toLocaleString()}</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Users Summary */}
                <Col md={4}>
                  <Card className="h-100">
                    <Card.Body>
                      <Card.Title>Users</Card.Title>
                      <Card.Text>{totalUsers}</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Orders Summary */}
                <Col md={4}>
                  <Card className="h-100">
                    <Card.Body>
                      <Card.Title>Orders</Card.Title>
                      <Card.Text>{totalOrders}</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Row>
                <Col>
                  <Card>
                    <Card.Body>
                      <canvas id="salesChart" height="100"></canvas>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              <Col md={12} className="mt-5 mt-md-3">
                <Card className="h-100">
                  <Card.Body>
                    <Row>
                      <Col>
                        <Card.Title className='caption'>Customers</Card.Title>
                      </Col>
                    </Row>
                    <div className="chart-container mt-5" style={{ height: '200px' }}>
                      <canvas id="customersChart"></canvas>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* Category and Products Row */}
              <Row className='mt-5'>
                {/* Category Distribution */}
                <Col md={6}>
                  <Card className="h-100">
                    <Card.Body>
                      <Card.Title>Top Selling Categories</Card.Title>
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
                      <Card.Title>Top Selling Products</Card.Title>
                      <ListGroup variant="flush">
                        {dashboardData.topSellingProducts.map((product, index) => (
                          <ListGroup.Item key={index} className="d-flex align-items-center">
                            <img
                              src={`${product.productInfo?.pdImage[0]}`}
                              alt={product.productInfo?.name}
                              width={50}
                              height={50}
                              className="me-3 rounded"
                              style={{ objectFit: 'cover' }}
                            />
                            <div>
                              <h6 className="mb-0">{product.productInfo?.name}</h6>
                              <small className="text-muted">Sold: {product.totalSold}</small>
                              <div className="text-success">
                                ₹{product.totalRevenue.toFixed(2)}
                              </div>
                            </div>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default AdminDashboard;