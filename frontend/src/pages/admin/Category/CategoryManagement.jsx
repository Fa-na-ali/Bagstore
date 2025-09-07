import { useEffect, useState, } from 'react';
import { useDeleteCategoryMutation, useSearchCategoriesQuery, useUnblockCategoryMutation } from '../../../redux/api/categoryApiSlice';
import Ttable from '../../../components/Ttable'
import AdminSidebar from '../../../components/AdminSidebar';
import { Row, Col, Button, FormControl, InputGroup, Form, Container } from 'react-bootstrap'
import { Link } from 'react-router';
import { MdOutlineAdd } from "react-icons/md";
import { toast } from 'react-toastify';
import debounce from 'lodash.debounce';
import { CATEGORY_MESSAGES } from '../../../constants/messageConstants';
import Swal from "sweetalert2";
import Footer from '../../../components/Footer';

const CategoryManagement = () => {

  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  let { data, refetch: load, error, isLoading } = useSearchCategoriesQuery({ keyword: searchTerm, page: currentPage });
  const categories = data?.categories || [];
  const [deleteCategory] = useDeleteCategoryMutation();
  const [unblockCategory] = useUnblockCategoryMutation();
  const [category, setCategory] = useState([])

  //  columns for the category table
  const columns = [
    { key: "name", label: "Category Name" },
    { key: "isExist", label: "Status" }
  ];

  useEffect(() => {
    if (categories) {
      setCategory(categories);
    }
  }, [categories]);

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

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

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
          await deleteCategory(id);
          setCategory((prev) =>
            prev.map((c) =>
              c._id === id ? { ...c, isExist: false } : c
            )
          );
          toast.success(CATEGORY_MESSAGES.CATEGORY_DLT_SUCCESS);
        } catch (err) {
          toast.error(err?.data?.message || `${CATEGORY_MESSAGES.CATEGORY_DLT_FAILURE}`);
        }
      }
    })
  };

  // on unblock
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
          await deleteCategory(id);
          setCategory((prev) =>
            prev.map((c) =>
              c._id === id ? { ...c, isExist: true } : c
            )
          );
          toast.success(CATEGORY_MESSAGES.CATEGORY_UNBLOCK_SUCCESS);
        } catch (err) {
          toast.error(err?.data?.message || `${CATEGORY_MESSAGES.CATEGORY_UNBLOCK_FAILURE}`);
        }
      }
    })
  };

  return (
    <>
      <div className="d-flex">
        <AdminSidebar />
        <div className="main-content-wrapper background-one flex-grow-1">
          <Container fluid>
            <Row className="g-0">
              <Col xs={12} lg={12} >
                <h2 className='text-center my-5 heading'>CATEGORIES</h2>
                <div className="table-title mb-4">
                  <Row className="align-items-center">
                    <Col
                      xs={12}
                      md={12}
                      className="d-flex flex-column flex-md-row justify-content-between gap-2"
                    >
                      <Link to="/admin/category/add">
                        <Button className="me-2 button-custom">
                          <MdOutlineAdd /> <span>Add New</span>
                        </Button>
                      </Link>
                      <InputGroup className="w-25 w-md-25">
                        <Form className="d-flex w-100">
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
                {(categories) && (categories.length > 0) ? (
                  <Ttable
                    naming="category"
                    data={category}
                    columns={columns}
                    onDelete={handleDelete}
                    onUnblock={handleUnblock}
                    onPage={handlePageChange}
                    pageData={data}
                    currentPage={currentPage}
                  />
                ) : (
                  <p>No categories found</p>
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

export default CategoryManagement;
