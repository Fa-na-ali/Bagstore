import { useEffect, useState, } from 'react';
import { useDeleteCategoryMutation, useSearchCategoriesQuery } from '../../../redux/api/categoryApiSlice';
import Ttable from '../../../components/Ttable'
import AdminSidebar from '../../../components/AdminSidebar';
import { Row, Col, Button, FormControl, InputGroup, Form, Container } from 'react-bootstrap'
import { Link } from 'react-router';
import { MdOutlineAdd } from "react-icons/md";
import { toast } from 'react-toastify';
import debounce from 'lodash.debounce';
import { CATEGORY_MESSAGES } from '../../../constants/messageConstants';

const CategoryManagement = () => {

  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  let { data, refetch: load, error, isLoading } = useSearchCategoriesQuery({ keyword: searchTerm, page: currentPage });
  const categories = data?.categories || [];
  const [deleteCategory] = useDeleteCategoryMutation();

  //  columns for the category table
  const columns = [
    { key: "name", label: "Category Name" },
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

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  // on delete
  const handleDelete = async (id) => {
    if (window.confirm("Do you want to delete")) {
      try {
        await deleteCategory(id);
        toast.success(CATEGORY_MESSAGES.CATEGORY_DLT_SUCCESS)
        load();
      } catch (err) {
        toast.error(err?.data?.message || `${CATEGORY_MESSAGES.CATEGORY_DLT_FAILURE}`);
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
                <h2 className='text-center my-5 heading'>CATEGORIES</h2>
                <div className="table-title my-5">
                  <Row className="align-items-center">
                    <Col lg={6}>
                      <Link to="/admin/category/add">
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
                {(categories) && (categories.length > 0) ? (
                  <Ttable
                    naming="category"
                    data={categories}
                    columns={columns}
                    onDelete={handleDelete}
                    onPage={handlePageChange}
                    pageData={data}
                    currentPage={currentPage}
                  />
                ) : (
                  <p>No categories found</p>
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

export default CategoryManagement;
