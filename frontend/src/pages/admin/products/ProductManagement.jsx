import React, { useEffect, useState } from 'react';

import Ttable from '../../../components/Ttable'
import AdminSidebar from '../../../components/AdminSidebar';
import { Row, Col, Button, FormControl, InputGroup, Form, Container } from 'react-bootstrap'
import { Outlet, Link } from 'react-router';
import { MdOutlineAdd } from "react-icons/md";
import { toast } from 'react-toastify';
import { useAllProductsQuery, useDeleteProductMutation, } from '../../../redux/api/productApiSlice';

const CategoryManagement = () => {
  let { data: products, refetch: load, error, isLoading } = useAllProductsQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchedProducts, setSearchedProducts] = useState([]);
  //const { data: searchProducts, refetch, error: searchError, isLoading: searchLoading } = useSearchCategoriesQuery(searchTerm)
  const [deleteProduct] = useDeleteProductMutation();

  //  columns for the category table
  const columns = [
    { key: "name", label: "Product Name" },
    { key: "category", label: "Category" },
    { key: "price", label: "Price" },
    { key: "quantity", label: "Quantity" },
    { key: "color", label: "Color" },
    { key: "brand", label: "Brand" },
    { key: "createdBy", label: "Created By" },
    { key: "isExist", label: "Status" }
  ];

  // useEffect(() => {
  //   load()
  //   if (searchProducts) {
  //     setSearchedProducts(searchProducts);
  //   }
  // }, [searchCategories, load]);

  // const searchHandler = (e) => {
  //   e.preventDefault();
  //   refetch();
  // };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  // Define handlers for actions 
   const handleDelete = async (id) => {
     if (window.confirm("Do you want to delete")) {
       try {
         await deleteProduct(id);
         toast.success(" Deleted Successfully")
         load();

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
                    <Form  method="GET" className="d-flex">
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
            {(products || searchedProducts) && (products.length > 0 || searchedProducts.length > 0) ? (
              <Ttable
                naming="products"
                data={searchTerm ? searchedProducts : products}
                columns={columns}
                onDelete={handleDelete}

              />
            ) : (
              <p>No Products found</p>
            )}

          </Col>
          <Col lg={1} className=" background-one"></Col>
        </Row>
      </Container>
    </>
  );
};

export default CategoryManagement;
