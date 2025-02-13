import React, { useState } from "react";
import { MdOutlineAdd } from "react-icons/md";
import { Table, Container, Row, Col, Form, InputGroup, Button, Pagination, Dropdown } from "react-bootstrap";
import { FaSort, FaSearch, FaEye, FaEdit, FaTrash, FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import { Link, useNavigate } from "react-router";

const Ttable = ({ data, columns, onDelete, onView, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState(columns[0]?.key);
const navigate = useNavigate()
  // Sorting Logic
  const sortedData = [...data].sort((a, b) => {
    if (sortBy) return a[sortBy].localeCompare(b[sortBy]);
    return 0;
  });

  // Search Filter
  const filteredData = sortedData.filter(
    (item) =>
      columns.some((col) =>
        item[col.key]?.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  return (
    <Container fluid="xl">
      <div className="table-responsive">
        <div className="table-wrapper">
          {/* Table Header */}
          <div className="table-title my-5">
            <Row className="align-items-center">
              <Col lg={6}>
              <Link to='add-category'>
                <Button  className="me-2 button-custom" >
                  <MdOutlineAdd /> <span>Add New </span>
                </Button>
                </Link>
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
                  <Dropdown.Toggle variant="outline-dark">
                    Sort By: {sortBy}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {columns.map((col) => (
                      <Dropdown.Item key={col.key} onClick={() => setSortBy(col.key)}>
                        {col.label}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </Col>
            </Row>
          </div>

          {/* Data Table */}
          <Table striped bordered hover responsive>
            <thead className="heading">
              <tr className="heading">
                <th className="heading">#</th>
                {columns.map((col) => (
                  <th className="heading" key={col.key}>{col.label} <FaSort /></th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <tr key={item._id}>
                    <td>{index + 1}</td>
                    {columns.map((col) => (
                      <td className="caption" key={col.key}>{item[col.key]}</td>
                    ))}
                    <td>
                     
                      <Button variant="link" className="caption p-0 me-2" title="Edit" onClick={() => onEdit(item)}>
                        <FaEdit />
                      </Button>
                      <Button variant="link" className="text-danger p-0" title="Delete" onClick={() => onDelete(item)}>
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length + 2} className="text-center text-muted">No results found</td>
                </tr>
              )}
            </tbody>
          </Table>

          {/* Pagination */}
          <div className="clearfix d-flex justify-content-between align-items-center">
            <div className="hint-text">Showing <b>{filteredData.length}</b> out of <b>{data.length}</b> entries</div>
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
