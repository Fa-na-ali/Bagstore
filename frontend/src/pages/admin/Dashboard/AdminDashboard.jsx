import React from 'react'
import AdminSidebar from '../../../components/AdminSidebar'
import { Col, Container, Row, Button } from 'react-bootstrap'
import { Link } from 'react-router'

const AdminDashboard = () => {
  return (
    <>
      <Container fluid>
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
          </div>
        </Col>
        </Row>


      </Container>
    </>
  )
}

export default AdminDashboard