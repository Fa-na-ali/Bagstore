import React from 'react'
import {Col,Container,Row} from 'react-bootstrap'
import AdminSidebar from '../../components/AdminSidebar'
import Ttable from '../../components/Ttable'

const UserManagement = () => {
  return (
   <>
   <Container fluid>
      <Row className="g-0">
        <Col lg={3} className="d-none d-lg-block">
          <AdminSidebar />
        </Col>
        <Col lg={9} className="p-4">
          <Ttable />
        </Col>
      </Row>
    </Container>
   
   </>
  )
}

export default UserManagement