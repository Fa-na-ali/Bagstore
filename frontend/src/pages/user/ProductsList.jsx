import React from 'react'
import {  Accordion, Button, Form, Card, Container, Row, Col } from "react-bootstrap";

const ProductsList = () => {

    const { data: categories } = useFetchCategoriesQuery();
  return (
    
    <>
       <section className='background-one'>
      <Container>
        <Row >
          <Col lg={3} className="d-block py-5">
            {/* Toggle Button (Only for mobile view) */}
            <Button variant="outline-secondary" className="mb-3 w-100 d-lg-none" aria-controls="sidebarFilters" aria-expanded="false">
              Show filter
            </Button>
            {/* Sidebar Filters */}
            <Card className="mb-5" id="sidebarFilters">
              <Accordion defaultActiveKey="0" alwaysOpen>
                {/* Related Items */}
                <Accordion.Item eventKey="0">
                  <Accordion.Header>Categories</Accordion.Header>
                  <Accordion.Body>
                    <ul className="list-unstyled">
                      <li><a href="#" className="text-dark">Electronics</a></li>
                      <li><a href="#" className="text-dark">Home items</a></li>
                      <li><a href="#" className="text-dark">Books, Magazines</a></li>
                      <li><a href="#" className="text-dark">Men's clothing</a></li>
                      <li><a href="#" className="text-dark">Interior items</a></li>
                      <li><a href="#" className="text-dark">Underwear</a></li>
                      <li><a href="#" className="text-dark">Shoes for men</a></li>
                      <li><a href="#" className="text-dark">Accessories</a></li>
                    </ul>
                  </Accordion.Body>
                </Accordion.Item>
                {/* Brands */}
                <Accordion.Item eventKey="1">
                  <Accordion.Header>Brands</Accordion.Header>
                  <Accordion.Body>
                    {[
                      { name: "Mercedes", count: 120 },
                      { name: "Toyota", count: 15 },
                      { name: "Mitsubishi", count: 35 },
                      { name: "Nissan", count: 89 },
                      { name: "Honda", count: 30 },
                      { name: "Suzuki", count: 30 },
                    ].map((brand, index) => (
                      <Form.Check key={index} label={`${brand.name} (${brand.count})`} defaultChecked />
                    ))}
                  </Accordion.Body>
                </Accordion.Item>
                {/* Price Range */}
                <Accordion.Item eventKey="2">
                  <Accordion.Header>Price</Accordion.Header>
                  <Accordion.Body>
                    <Form.Range />
                    <Row className="mb-3">
                      <Col><Form.Label>Min</Form.Label><Form.Control type="number" placeholder="$0" /></Col>
                      <Col><Form.Label>Max</Form.Label><Form.Control type="number" placeholder="$10,000" /></Col>
                    </Row>
                    <Button variant="secondary" className="w-100">Apply</Button>
                  </Accordion.Body>
                </Accordion.Item>
                {/* Sizes */}
                <Accordion.Item eventKey="3">
                  <Accordion.Header>Size</Accordion.Header>
                  <Accordion.Body>
                    {['XS', 'SM', 'LG', 'XXL'].map((size, index) => (
                      <Form.Check key={index} inline label={size} type="checkbox" defaultChecked />
                    ))}
                  </Accordion.Body>
                </Accordion.Item>
                {/* Ratings */}
                <Accordion.Item eventKey="4">
                  <Accordion.Header>Ratings</Accordion.Header>
                  <Accordion.Body>
                    {[5, 4, 3, 2].map((stars, index) => (
                      <Form.Check key={index} label={'⭐'.repeat(stars) + '☆'.repeat(5 - stars)} defaultChecked />
                    ))}
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
    </>
  )
}

export default ProductsList