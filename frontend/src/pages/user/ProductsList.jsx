import React, { useState } from 'react'
import { Accordion, Button, Form, Card, Container, Row, Col, InputGroup, FormControl, Pagination } from "react-bootstrap";
import { FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import { useFetchCategoriesQuery } from '../../redux/api/categoryApiSlice';
import { useFilterProductsQuery } from '../../redux/api/productApiSlice';
import Cards from '../../components/Cards';


const ProductsList = () => {

  const { data: categories } = useFetchCategoriesQuery();
  console.log("categories",categories)
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSort, setSelectedSort] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading } = useFilterProductsQuery({
    search: searchTerm,
    categories: selectedCategories,
    colors: selectedColors,
    minPrice,
    maxPrice,
    sortBy: selectedSort,
    page: currentPage,
  });
  const totalPages = data?.totalPages || 1;
  console.log("filtered", data)
  const searchHandler = (e) => {
    e.preventDefault();
    refetch();
  };

  const handleSortChange = (sortOption) => {
    setSelectedSort(sortOption);
  };

  const handleColorCheck = (value, color) => {
    const updatedChecked = value ? [...selectedColors, color]
      : selectedColors.filter((c) => c !== color);
    setSelectedColors(updatedChecked)
  };
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleCategoryCheck = (value, id) => {
    const updatedChecked = value ? [...selectedCategories, id]
      : selectedCategories.filter((c) => c !== id);
    setSelectedCategories(updatedChecked)

  };

  return (

    <>
      <section className='background-one'>
        <Container>
          <Row className='py-5'>
            <Col lg={6}></Col>
            <Col lg={3}></Col>
            <Col lg={3} className="d-flex justify-content-end gap-3">
              <InputGroup className="mb-3">
                <Form onSubmit={searchHandler} method="GET" className="d-flex">
                  <FormControl
                    type="search"
                    placeholder="Search"
                    aria-label="Search"
                    aria-describedby="search-addon"
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value) }}
                  />
                  <Button type='submit' variant="outline-primary" id="search-addon">
                    Search
                  </Button>
                </Form>
              </InputGroup>
            </Col>
          </Row>
          <Row >
            <Col lg={3} className="d-block ">
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
                        {categories?.all.map((category) => (
                          <li key={category._id} className="d-flex align-items-center">
                            <input
                              type="checkbox"
                              className="form-check-input me-2"
                              id={category.name}

                              onChange={(e) => handleCategoryCheck(e.target.checked, category._id)}
                            />
                            <label htmlFor={category.name} className="text-dark">
                              {category.name}
                            </label>
                          </li>
                        ))}
                      </ul>
                    </Accordion.Body>
                  </Accordion.Item>
                  {/* Brands */}
                  <Accordion.Item eventKey="1">
                    <Accordion.Header>Color</Accordion.Header>
                    <Accordion.Body>
                      {[
                        { name: "White", },
                        { name: "Brown", },
                        { name: "Beige", },
                        { name: "Black", },
                        { name: "Green", },
                        { name: "Red", },
                      ].map((color, index) => (
                        <Form.Check key={index} label={`${color.name}`}
                          type="checkbox"
                          onChange={(e) => handleColorCheck(e.target.checked, `${color.name}`)}
                        />
                      ))}
                    </Accordion.Body>
                  </Accordion.Item>
                  {/* Price Range */}
                  <Accordion.Item eventKey="2">
                    <Accordion.Header>Price</Accordion.Header>
                    <Accordion.Body>
                      {/* Min Price Slider */}
                      <Form.Label>Min Price: {minPrice}</Form.Label>
                      <Form.Range
                        min={0}
                        max={10000}
                        step={100}
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                      />

                      {/* Max Price Slider */}
                      <Form.Label>Max Price: {maxPrice}</Form.Label>
                      <Form.Range
                        min={0}
                        max={10000}
                        step={100}
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                      />
                    </Accordion.Body>
                  </Accordion.Item>
                  {/* Sizes */}
                  <Accordion.Item eventKey="3">
                    <Accordion.Header>Sort By</Accordion.Header>
                    <Accordion.Body>
                      {[
                        { label: "Aa-Zz", value: "nameAsc" },
                        { label: "Zz-Aa", value: "nameDesc" },
                        { label: "Price: Low to High", value: "priceLowHigh" },
                        { label: "Price: High to Low", value: "priceHighLow" },
                        { label: "New Arrivals", value: "newArrivals" },
                      ].map((option) => (
                        <Form.Check key={option.value}
                          label={option.label} type="radio" name="sortOptions"
                          checked={selectedSort === option.value}
                          onChange={() => handleSortChange(option.value)} />
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
            <Col lg={9} >
              <Cards products={data?.products} />
            </Col>
          </Row>


          <div className="clearfix d-flex justify-content-between align-items-center">
            <div className="hint-text">Showing <b>{data?.products?.length || 1}</b> out of <b>{data?.totalProducts || 0}</b> entries</div>
            <Pagination>
              <Pagination.Item
                disabled={currentPage === 1}
                onClick={() => handlePageChange(1)}

              ><FaAngleDoubleLeft /></Pagination.Item>
              {[...Array(totalPages).keys()].map((num) => (
                <Pagination.Item
                  key={num + 1}
                  active={num + 1 === currentPage}
                  onClick={() => handlePageChange(num + 1)}
                >
                  {num + 1}
                </Pagination.Item>
              ))}

              <Pagination.Item
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(totalPages)}
              >
                <FaAngleDoubleRight />
              </Pagination.Item>
            </Pagination>
          </div>
        </Container>
      </section>
    </>
  )
}

export default ProductsList