import { useEffect, useState } from 'react';
import Ttable from '../../../components/Ttable'
import AdminSidebar from '../../../components/AdminSidebar';
import { Row, Col, Button, FormControl, InputGroup, Form, Container } from 'react-bootstrap'
import { Link } from 'react-router';
import { MdOutlineAdd } from "react-icons/md";
import { toast } from 'react-toastify';
import { useDeleteProductMutation, useGetProductsQuery, useUnblockProductMutation, } from '../../../redux/api/productApiSlice';
import debounce from 'lodash.debounce';
import { PRODUCT_MESSAGES } from '../../../constants/messageConstants';
import Swal from "sweetalert2";
import Footer from '../../../components/Footer'


const ProductManagement = () => {

  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  let { data, refetch: load, error, isLoading } = useGetProductsQuery({ keyword: searchTerm, page: currentPage });
  const [deleteProduct] = useDeleteProductMutation();
  const [unblockProduct] = useUnblockProductMutation()
  const products = data?.products || [];
  const [pdts, setPdts] = useState([]);


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
    if (products) {
      setPdts(products);
    }
  }, [products]);


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
    Swal.fire({
      title: "Do you want to delete?",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteProduct(id);
          setPdts((prev) =>
            prev.map((p) =>
              p._id === id ? { ...p, isExist: false } : p
            )
          );
          toast.success(PRODUCT_MESSAGES.PRODUCT_DLT_SUCCESS)
        } catch (err) {
          toast.error(err?.data?.message || `${PRODUCT_MESSAGES.PRODUCT_DLT_FAILURE}`);
        }
      }
    })
  };

  // on UNBLOCK
  const handleUnblock = async (id) => {
    Swal.fire({
      title: "Do you want to unblock?",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await unblockProduct(id);
          setPdts((prev) =>
            prev.map((p) =>
              p._id === id ? { ...p, isExist: true } : p
            )
          );
          toast.success(PRODUCT_MESSAGES.PRODUCT_UNBLOCK_SUCCESS)
        } catch (err) {
          toast.error(err?.data?.message || `${PRODUCT_MESSAGES.PRODUCT_UNBLOCK_FAILURE}`);
        }
      }
    })
  };

  return (
    <>
      <div className='d-flex' >
        <AdminSidebar />
        <div className="main-content-wrapper background-one flex-grow-1">
          <Container fluid>
            <Row className="g-0">
              <Col xs={12} lg={12}>
                <h2 className="text-center my-4 heading">PRODUCTS</h2>
                <div className="table-title mb-4">
                  <Row className="align-items-center">
                    <Col
                      xs={12}
                      md={12}
                      className="d-flex flex-column flex-md-row justify-content-between gap-2"
                    >
                      <Link to="/admin/products/add">
                        <Button className="me-2 button-custom">
                          <MdOutlineAdd /> <span>Add New</span>
                        </Button>
                      </Link>
                      <InputGroup className="w-25 w-md-25">
                        <Form className="d-flex  w-100">
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
                {products && products.length > 0 ? (
                  <Ttable
                    naming="products"
                    data={pdts}
                    columns={columns}
                    onDelete={handleDelete}
                    onUnblock={handleUnblock}
                    onPage={handlePageChange}
                    pageData={data}
                    currentPage={currentPage}
                  />
                ) : (
                  <p>No Products found</p>
                )}
              </Col>
            </Row>
          </Container>
          <Footer />
        </div>
      </div>
    </>
  );
};

export default ProductManagement;
