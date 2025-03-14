import React from 'react'
import AdminSidebar from '../../components/AdminSidebar'
import { Col, Container, Row } from 'react-bootstrap'

const AdminDashboard = () => {
  return (
    <>
      <Container fluid>
        <Row className="g-0">
          <Col lg={2} className="d-none d-lg-block">
            <AdminSidebar />
          </Col>
        </Row>

      </Container>
    </>
  )
}

export default AdminDashboard