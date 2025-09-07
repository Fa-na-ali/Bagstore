import { useState, useEffect } from 'react'
import { Col, Container, Row, InputGroup, Form, FormControl } from 'react-bootstrap'
import AdminSidebar from '../../../components/AdminSidebar'
import Ttable from '../../../components/Ttable'
import { useDeleteUserMutation, useFetchUsersQuery, useUnblockUserMutation } from '../../../redux/api/usersApiSlice'
import { toast } from 'react-toastify'
import debounce from 'lodash.debounce'
import { USER_MESSAGES } from '../../../constants/messageConstants'
import Swal from "sweetalert2";
import Footer from '../../../components/Footer'

const UserManagement = () => {

  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  let { data, error, isLoading } = useFetchUsersQuery({ keyword: searchTerm, page: currentPage });
  const user = data?.user || [];
  const [deleteUser] = useDeleteUserMutation();
  const [unblockUser] = useUnblockUserMutation()
  const [users, setUsers] = useState([]);

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
    if (data?.user) {
      setUsers(data.user);
    }
  }, [data]);

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
          await deleteUser(id);
          setUsers((prev) =>
            prev.map((u) =>
              u._id === id ? { ...u, isExist: false } : u
            )
          );
          toast.success(USER_MESSAGES.USER_DLT_SUCCESS)

        } catch (err) {
          toast.error(err?.data?.message || `${USER_MESSAGES.USER_DLT_FAILURE}`);
        }
      }
    })
  };

  //unblock user
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
          await unblockUser(id);
          setUsers((prev) =>
            prev.map((u) =>
              u._id === id ? { ...u, isExist: true } : u
            )
          );
          toast.success(USER_MESSAGES.USER_UNBLOCK_SUCCESS)

        } catch (err) {
          toast.error(err?.data?.message || `${USER_MESSAGES.USER_UNBLOCK_FAILURE}`);
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
              <Col lg={12} >
                <h2 className='text-center my-5 heading'>USERS</h2>
                <div className="table-title mb-4">
                  <Row className="align-items-center">
                    <Col
                      xs={12}
                      md={12}
                      className="d-flex flex-column flex-md-row justify-content-between gap-2"
                    >
                      <InputGroup className="mb-3">
                        <Form className="w-25">
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
                    data={users}
                    columns={columns}
                    onDelete={handleDelete}
                    onUnblock={handleUnblock}
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
          <Footer />
        </div>
      </div>
    </>
  )
}

export default UserManagement