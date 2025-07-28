import { useState, useEffect } from 'react'
import { Col, Container, Row, Button, InputGroup, Form, FormControl } from 'react-bootstrap'
import AdminSidebar from '../../../components/AdminSidebar'
import Ttable from '../../../components/Ttable'
import { useDeleteUserMutation, useFetchUsersQuery } from '../../../redux/api/usersApiSlice'
import { toast } from 'react-toastify'


const UserManagement = () => {

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  let { data, refetch: load, error, isLoading } = useFetchUsersQuery({ keyword: searchTerm, page: currentPage });
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
    if (user)
      load()
  }, [load]);

  const searchHandler = (e) => {
    e.preventDefault();
    refetch();
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  // on delete
  const handleDelete = async (id) => {
    if (window.confirm("Do you want to delete")) {
      try {
        await deleteUser(id);
        load();
        toast.success(" Deleted Successfully")


      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  return (
    <>
      <Container fluid>
        <Row className="g-0">
          <Col lg={2} className="d-none d-lg-block">
            <AdminSidebar />
          </Col>

          <Col lg={9} className="p-4 background-one vw-75">
            <h2 className='text-center my-5 heading'>USERS</h2>
            <div className="table-title my-5">
              <Row className="align-items-center">
                <Col lg={6}>

                </Col>
                <Col lg={3}></Col>
                <Col lg={3} className="d-flex justify-content-end gap-3">
                  <InputGroup className="mb-3">
                    <Form onSubmit={searchHandler} method="GET" className="d-flex">
                      <FormControl
                        type="search"
                        placeholder="Search"
                        aria-label="Search"
                        aria-describedby="search-addon"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value) }}
                      />
                      <Button type='submit' variant="outline-primary" id="search-addon">
                        Search
                      </Button>
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


    </>
  )
}

export default UserManagement