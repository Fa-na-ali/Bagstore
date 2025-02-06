import React from 'react'
import { MdOutlineAdd } from "react-icons/md";
import { MdOutlineRemove } from "react-icons/md";
import { Row, Col, Container, Form, Button } from 'react-bootstrap'
import AdminSidebar from '../../../components/AdminSidebar'

const AddProduct = () => {
  return (
    <>
      <Container fluid>
        <Row className="g-0">
          <Col lg={2} className="d-none d-lg-block">
            <AdminSidebar />
          </Col>
          <Col lg={9} className="p-4 background-one vw-75">
            <h2 className='text-center my-5 heading'>ADD PRODUCT</h2>
            <Form>
              <Row className="mb-3 my-5">
                <Form.Group as={Col} controlId="formGridEmail">
                  <Form.Label className='caption'>Name of Product</Form.Label>
                  <Form.Control type="text" placeholder="Enter Product name" />
                </Form.Group>

                <Form.Group as={Col} controlId="formGridState">
                  <Form.Label className='caption'>Category</Form.Label>
                  <Form.Select className='text-secondary' defaultValue="Choose...">
                    <option>Choose...</option>
                    <option>...</option>
                  </Form.Select>
                </Form.Group>

              </Row>

              <Form.Group className="mb-3" controlId="formGridAddress1">
                <Form.Label className='caption'>Description</Form.Label>
                <Form.Control placeholder="Enter Description" />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formGridAddress2">
                <Form.Label className='caption'>Size</Form.Label>
                <Form.Control placeholder="Enter Size" />
              </Form.Group>

              <Row className="mb-3">
                <Form.Group as={Col} controlId="formGridCity">
                  <Form.Label className='caption'>Price</Form.Label>
                  <Form.Control placeholder="Enter Price" />
                </Form.Group>

                <Form.Group as={Col} controlId="formGridState">
                  <Form.Label className='caption'>Color</Form.Label>
                  <Form.Select className='text-secondary' defaultValue="Choose...">
                    <option >Choose...</option>
                    <option>...</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group as={Col} controlId="formGridZip">
                  <Form.Label className='caption'>Brand</Form.Label>
                  <Form.Control placeholder="Enter Brand" />
                </Form.Group>
              </Row>
              <div style={{ maxWidth: '300px' }}>
                <Form.Label className="mb-2 caption">Quantity</Form.Label>
                <div className="d-flex align-items-center">
                  <Button className="px-3 me-2 button-custom">
                  <MdOutlineRemove />
                  </Button>

                  <Form.Control
                    type="number"
                    min="1"
                    value={1}
                
                    className="text-center"
                    style={{ width: '70px' }}
                  />

                  <Button  className="px-3 ms-2 button-custom">
                  <MdOutlineAdd />
                  </Button>
                </div>
              </div>
              <Form.Group controlId="formFileMultiple" className="mb-3 my-4">
                <Form.Label className='caption'>Upload Images</Form.Label>
                <Form.Control type="file" multiple />
                <Form.Text className="text-muted">
                  You can upload multiple images.
                </Form.Text>
              </Form.Group>

              <Button className='button-custom w-100 my-5' type="submit">
                Submit
              </Button>
            </Form>
          </Col>
          <Col lg={1} className='background-one'></Col>
        </Row>
      </Container>

    </>
  )
}

export default AddProduct