import React from 'react'

const AddCategory = () => {
  return (
    <>
     <Row className="g-0">
          <Col lg={2} className="d-none d-lg-block">
            <AdminSidebar />
          </Col>
          <Col sm={5}>
          <h2>
            User <b>Management</b>
          </h2>
        </Col>
        <Col sm={7} className="text-end">
          <Button variant="secondary" className="me-2">
            <MdPersonAdd /> <span>Add New User</span>
          </Button>
          <Button variant="secondary">
            <MdFileDownload /> <span>Export to Excel</span>
          </Button>
        </Col>
    </Row>
    
    </>
  )
}

export default AddCategory