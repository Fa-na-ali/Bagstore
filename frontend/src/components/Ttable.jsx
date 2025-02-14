import React, { useState } from "react";

import { Table, Container, Row, Col, Form, InputGroup, Button, Pagination, FormControl, Dropdown, Badge } from "react-bootstrap";
import { FaSort, FaSearch, FaTimes, FaEdit, FaTrash, FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import { Link } from "react-router-dom";

const Ttable = ({ naming, data, columns, onDelete, onView, onEdit, onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");



  return (
    <Container fluid="xl">
      <div className="table-responsive">
        <div className="table-wrapper">

          <div className="table-title my-5">

          </div>


          <Table bordered hover responsive>
            <thead className="heading">
              <tr className="table-primary
              ">
                <th className="heading">#</th>
                {columns.map((col) => (
                  <th className="heading" key={col.key}>{col.label} <FaSort /></th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.length > 0 ? (
                data.map((item, index) => (
                  <tr className="table-light" key={item._id}>
                    <td>{index + 1}</td>
                    {columns.map((col) => (
                      <td className="caption" key={col.key}>
                        {col.key === "isExist" ? (
                          item[col.key] ? (
                            <Badge bg="success" pill>
                              Active
                            </Badge>
                          ) : (
                            <Badge bg="danger" pill>
                              Inactive
                            </Badge>
                          )
                        ) : (
                          item[col.key]
                        )}

                      </td>
                    ))}
                    <td>
                      <Link to={`/admin/${naming}/edit/${item._id}`}>
                        <Button variant="link" className="caption p-0 me-2" title="Edit" >
                          <FaEdit />
                        </Button>
                      </Link>
                      <Button variant="link" className="text-danger p-0" title="Delete" onClick={() => onDelete(item._id)}>
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


          <div className="clearfix d-flex justify-content-between align-items-center">
            <div className="hint-text">Showing <b>{data.length}</b> out of <b>{data.length}</b> entries</div>
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
