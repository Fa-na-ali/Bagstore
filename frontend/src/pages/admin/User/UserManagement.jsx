import { useState, useEffect } from 'react'
import { Col, Container, Row, InputGroup, Form, FormControl } from 'react-bootstrap'
import AdminSidebar from '../../../components/AdminSidebar'
import Ttable from '../../../components/Ttable'
import { useDeleteUserMutation, useFetchUsersQuery } from '../../../redux/api/usersApiSlice'
import { toast } from 'react-toastify'
import debounce from 'lodash.debounce'
import { USER_MESSAGES } from '../../../constants/messageConstants'


const UserManagement = () => {

  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  let { data, error, isLoading } = useFetchUsersQuery({ keyword: searchTerm, page: currentPage });
  const user = data?.user || [];
  const [deleteUser] = useDeleteUserMutation();

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  //  columns for the category table
  const columns = [
    { key: "name", label: "User Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "isExist", label: "Status" },
    { key: "isAdmin", label: "Is Admin" }
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

  // on delete
  const handleDelete = async (id) => {
    if (window.confirm("Do you want to delete")) {
      try {
        await deleteUser(id);
        toast.success(USER_MESSAGES.USER_DLT_SUCCESS)

      } catch (err) {
        toast.error(err?.data?.message || `${USER_MESSAGES.USER_DLT_FAILURE}`);
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
                <h2 className='text-center my-5 heading'>USERS</h2>
                <div className="table-title my-5">
                  <Row className="align-items-center">
                    <Col lg={6}>

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
                {(user) && (user.length > 0) ? (
                  <Ttable
                    naming="user"
                    data={user}
                    columns={columns}
                    onDelete={handleDelete}
                    onPage={handlePageChange}
                    pageData={data}
                    currentPage={currentPage}
                  />
                ) : (
                  <p>No users found</p>
                )}

              </Col>
              <Col lg={1} className=" background-one"></Col>
            </Row>
          </Container>
        </div>
      </div>
    </>
  )
}

export default UserManagement