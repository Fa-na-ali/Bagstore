import React, { useState } from "react";
import { Table, Container, Row, Col, Form, InputGroup, Button, Pagination, Dropdown } from "react-bootstrap";
import { FaSort, FaSearch, FaEye, FaEdit, FaTrash, FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";

const Ttable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("Name");

  const customers = [
    { id: 1, name: "Thomas Hardy", address: "89 Chiaroscuro Rd.", city: "Portland", pin: "97219", country: "USA" },
    { id: 2, name: "Maria Anders", address: "Obere Str. 57", city: "Berlin", pin: "12209", country: "Germany" },
    { id: 3, name: "Fran Wilson", address: "C/ Araquil, 67", city: "Madrid", pin: "28023", country: "Spain" },
    { id: 4, name: "Dominique Perrier", address: "25, rue Lauriston", city: "Paris", pin: "75016", country: "France" },
    { id: 5, name: "Martin Blank", address: "Via Monte Bianco 34", city: "Turin", pin: "10100", country: "Italy" },
  ];

  // Sorting Logic
  const sortedCustomers = [...customers].sort((a, b) => {
    if (sortBy === "Name") return a.name.localeCompare(b.name);
    if (sortBy === "City") return a.city.localeCompare(b.city);
    if (sortBy === "Country") return a.country.localeCompare(b.country);
    return 0;
  });

  // Search Filter
  const filteredCustomers = sortedCustomers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container fluid="xl">
      <div className="table-responsive">
        <div className="table-wrapper">
          {/* Table Header */}
          <div className="table-title my-5">
            <Row className="align-items-center">
              <Col lg={6}>
                <h2>Customer <b>Details</b></h2>
              </Col>
              <Col sm={6} className="d-flex justify-content-end gap-3">
                {/* Search Box */}
                <InputGroup style={{ width: "250px" }}>
                  <InputGroup.Text><FaSearch /></InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>

                {/* Sort By Dropdown */}
                <Dropdown>
                  <Dropdown.Toggle variant="outline-primary">
                    Sort By: {sortBy}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {["Name", "City", "Country"].map((option) => (
                      <Dropdown.Item key={option} onClick={() => setSortBy(option)}>
                        {option}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </Col>
            </Row>
          </div>

          {/* Customer Table */}
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Name <FaSort /></th>
                <th>Address</th>
                <th>City <FaSort /></th>
                <th>Pin Code</th>
                <th>Country <FaSort /></th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td>{customer.id}</td>
                    <td>{customer.name}</td>
                    <td>{customer.address}</td>
                    <td>{customer.city}</td>
                    <td>{customer.pin}</td>
                    <td>{customer.country}</td>
                    <td>
                      <Button variant="link" className="text-primary p-0 me-2" title="View"><FaEye /></Button>
                      <Button variant="link" className="text-warning p-0 me-2" title="Edit"><FaEdit /></Button>
                      <Button variant="link" className="text-danger p-0" title="Delete"><FaTrash /></Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center text-muted">No results found</td>
                </tr>
              )}
            </tbody>
          </Table>

          {/* Pagination */}
          <div className="clearfix d-flex justify-content-between align-items-center">
            <div className="hint-text">Showing <b>{filteredCustomers.length}</b> out of <b>{customers.length}</b> entries</div>
            <Pagination>
              <Pagination.Item disabled><FaAngleDoubleLeft /></Pagination.Item>
              <Pagination.Item>1</Pagination.Item>
              <Pagination.Item>2</Pagination.Item>
              <Pagination.Item active>3</Pagination.Item>
              <Pagination.Item>4</Pagination.Item>
              <Pagination.Item>5</Pagination.Item>
              <Pagination.Item><FaAngleDoubleRight /></Pagination.Item>
            </Pagination>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Ttable;
