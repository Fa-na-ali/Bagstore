import React from 'react'
import { Row, Col, Button, Container, Form } from 'react-bootstrap'
import { MdOutlineAdd } from "react-icons/md";
import AdminSidebar from '../../../components/AdminSidebar'

const EditCategory = () => {
    return (
        <>
            <Container fluid>
                <Row className="g-0 background-one">
                    <Col lg={2} className="d-none d-lg-block">
                        <AdminSidebar />
                    </Col>
                    <Col lg={6}>
                        <h2 className='ms-5 my-5 heading'>
                            EDIT CATEGORY
                        </h2>
                        <Form className='ms-5'>
                            <Form.Group controlId="categoryName">
                                <Form.Label className='caption'>Category Name</Form.Label>
                                <Form.Control type="text" placeholder="Enter category name" />
                            </Form.Group>
                        </Form>
                    </Col>
                    <Col lg={4} className="my-5">
                        <Button className="me-2 button-custom">
                            <MdOutlineAdd /> <span>Add New Category</span>
                        </Button>
                    </Col>
                </Row>
            </Container>
        </>
    )
}



export default EditCategory

