import React,{useEffect,useState}from 'react';
import { useFetchCategoriesQuery } from '../../../redux/api/categoryApiSlice';
import Ttable from '../../../components/Ttable'
import AdminSidebar from '../../../components/AdminSidebar';
import {Row,Col} from 'react-bootstrap'
import { Outlet } from 'react-router';
const CategoryManagement = () => {
  const { data: categories, error, isLoading } = useFetchCategoriesQuery();

  //  columns for the category table
  const columns = [
    { key: "name", label: "Category Name" },
    { key: "createdBy", label: "Created By" },
    { key: "isExist", label: "Status" }
  ];
  const [sortedCategories, setSortedCategories] = useState([]);

  useEffect(() => {
    if (categories && categories.length > 0) {
      const sorted = [...categories].sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);

        // Log the parsed dates to check if they are being parsed correctly
        console.log("dateA: ", dateA);
        console.log("dateB: ", dateB);

        // Sort in descending order (most recent first)
        return dateA - dateB;
      });

      setSortedCategories(sorted);
    }
  }, [categories]);
  
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  // Define handlers for actions (Edit, View, Delete)
  const handleDelete = (category) => {
    console.log("Delete Category", category);
  };
  const handleView = (category) => {
    console.log("View Category", category);
  };
  const handleEdit = (category) => {
    console.log("Edit Category", category);
  };

  return (
    <>
     <Row className="g-0">
        <Col lg={2} className="d-none d-lg-block">
          <AdminSidebar />
        </Col>
        <Col lg={9} className="p-4 background-one vw-75">
          <h2 className='text-center my-5 heading'>CATEGORIES</h2>
        
      {categories && categories.length > 0 ? (
        <Ttable 
          data={sortedCategories} 
          columns={columns} 
          onDelete={handleDelete} 
          onView={handleView} 
          onEdit={handleEdit} 
        />
      ) : (
        <p>No categories found</p>
      )}
       <Outlet />
        </Col>
        </Row>
    </>
  );
};

export default CategoryManagement;
