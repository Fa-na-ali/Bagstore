import { FaEye } from "react-icons/fa";
import { Table, Container, Button, Pagination, Badge } from "react-bootstrap";
import { FaSort, FaEdit, FaTrash, FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import { PropTypes } from "prop-types";

const Ttable = ({ naming, data, columns, onDelete, onPage, pageData, currentPage }) => {
  const totalPages = pageData?.pages || 1;

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
                        {(col.key === "isExist") || (col.key === "status") ? (
                          item[col.key] ? (
                            <Badge bg="success" pill>
                              Active
                            </Badge>
                          ) : (
                            <Badge bg="danger" pill>
                              Inactive
                            </Badge>
                          )
                        ) : col.key === "isAdmin" ? (
                          item[col.key] ? (
                            <Badge bg="success" pill>
                              Admin
                            </Badge>
                          ) : (
                            <Badge bg="danger" pill>
                              User
                            </Badge>
                          )
                        ) :
                          col.key === "userId" || col.key === "category" ? (
                            item.userId?.name || item.category?.name
                          ) : (
                            item[col.key]
                          )}

                      </td>
                    ))}
                    <td>
                      {(naming === "orders" || naming === "wallets") ? (
                        <Link to={`/admin/${naming}/edit/${item._id}`}>
                          <Button variant="link" className="caption p-0 me-2" title="View">
                            <FaEye />
                          </Button>
                        </Link>
                      ) : (
                        naming !== "user" && (
                          <Link to={`/admin/${naming}/edit/${item._id}`}>
                            <Button variant="link" className="caption p-0 me-2" title="Edit">
                              <FaEdit />
                            </Button>
                          </Link>
                        )
                      )}
                      {naming !== "wallets" && (
                        <Button variant="link" className="text-danger p-0" title="Delete" onClick={() => onDelete(item._id)}>
                          <FaTrash />
                        </Button>
                      )}
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
            <div className="hint-text">Showing <b>{data.length}</b> out of <b>{pageData?.count || 0}</b> entries</div>
            <Pagination>
              <Pagination.Item
                disabled={currentPage === 1}
                onClick={() => onPage(1)}

              ><FaAngleDoubleLeft /></Pagination.Item>
              {[...Array(totalPages).keys()].map((num) => (
                <Pagination.Item
                  key={num + 1}
                  active={num + 1 === currentPage}
                  onClick={() => onPage(num + 1)}
                >
                  {num + 1}
                </Pagination.Item>
              ))}

              <Pagination.Item
                disabled={currentPage === totalPages}
                onClick={() => onPage(totalPages)}
              >
                <FaAngleDoubleRight />
              </Pagination.Item>
            </Pagination>
          </div>
        </div>
      </div>
    </Container>
  );
};

Ttable.propTypes = {
  naming: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  onDelete: PropTypes.func.isRequired,
  onPage: PropTypes.func.isRequired,
  pageData: PropTypes.shape({
    pages: PropTypes.number,
    count: PropTypes.number,
  }),
  currentPage: PropTypes.number.isRequired,
};

export default Ttable;
