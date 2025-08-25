import { useEffect, useState } from 'react';
import Ttable from '../../../components/Ttable'
import AdminSidebar from '../../../components/AdminSidebar';
import { Row, Col, Button, FormControl, InputGroup, Form, Container } from 'react-bootstrap'
import { Link } from 'react-router';
import { MdOutlineAdd } from "react-icons/md";
import { toast } from 'react-toastify';
import { useDeleteProductMutation, useGetProductsQuery, } from '../../../redux/api/productApiSlice';
import debounce from 'lodash.debounce';
import { PRODUCT_MESSAGES } from '../../../constants/messageConstants';

const ProductManagement = () => {

  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  let { data, refetch: load, error, isLoading } = useGetProductsQuery({ keyword: searchTerm, page: currentPage });
  const [deleteProduct] = useDeleteProductMutation();
  const products = data?.products || [];

  //  columns for the category table
  const columns = [
    { key: "name", label: "Product Name" },
    { key: "category", label: "Category" },
    { key: "price", label: "Price" },
    { key: "quantity", label: "Quantity" },
    { key: "color", label: "Color" },
    { key: "brand", label: "Brand" },
    { key: "isExist", label: "Status" }
  ];

  useEffect(() => {

    const debouncedResults = debounce(() => {
      setSearchTerm(inputValue);
    }, 500);

    debouncedResults()

    return () => {
      debouncedResults.cancel();
    };

  }, [inputValue]);

  const handleChange = (e) => {
    setInputValue(e.target.value);
    setCurrentPage(1);
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // on delete
  const handleDelete = async (id) => {
    if (window.confirm("Do you want to delete")) {
      try {
        await deleteProduct(id);
        toast.success(PRODUCT_MESSAGES.PRODUCT_DLT_SUCCESS)
        load();

      } catch (err) {
        toast.error(err?.data?.message || `${PRODUCT_MESSAGES.PRODUCT_DLT_FAILURE}`);
      }
    }
  };

  return (
    <>
      <div className="d-flex">
        <AdminSidebar />
        <div className="main-content-wrapper background-one flex-grow-1">
          <Container fluid className="mt-4 p-4">
            <Row className="g-0">
              <Col lg={12} >
                <h2 className='text-center my-5 heading'>PRODUCTS</h2>
                <div className="table-title my-5">
                  <Row className="align-items-center">
                    <Col lg={6}>
                      <Link to="/admin/products/add">
                        <Button className="me-2 button-custom">
                          <MdOutlineAdd /> <span>Add New</span>
                        </Button>
                      </Link>
                    </Col>
                    <Col lg={3}></Col>
                    <Col lg={3} className="d-flex justify-content-end gap-3">
                      <InputGroup className="mb-3">
                        <Form className="d-flex">
                          <FormControl
                            type="search"
                            placeholder="Search"
                            aria-label="Search"
                            aria-describedby="search-addon"
                            value={inputValue}
                            onChange={handleChange}
                          />
                        </Form>
                      </InputGroup>
                    </Col>
                  </Row>
                </div>
                {(products) && (products.length > 0) ? (
                  <Ttable
                    naming="products"
                    data={products}
                    columns={columns}
                    onDelete={handleDelete}
                    onPage={handlePageChange}
                    pageData={data}
                    currentPage={currentPage}
                  />
                ) : (
                  <p>No Products found</p>
                )}

              </Col>
              <Col lg={1} className=" background-one"></Col>
            </Row>
          </Container>
        </div>
      </div>
    </>
  );
};

export default ProductManagement;
