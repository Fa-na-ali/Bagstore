import React from 'react'
import { useNavigate, useParams } from 'react-router';
import { useGetProductByIdQuery, useUpdateProductMutation } from '../../../redux/api/productApiSlice';

const EditProduct = () => {

  const { id } = useParams();
  const navigate = useNavigate();
 console.log("id",id)
  const { data: category, refetch, isLoading, isError } = useGetProductByIdQuery(id);
  const [update, { isLoading: isUpdating }] = useUpdateProductMutation();

  const [updatingName, setUpdatingName] = useState("");
console.log("product",product)
  useEffect(() => {
      if (category) {
          setUpdatingName(category.name || "");
      }
  }, [category]);

  const updateHandler = async (e, id) => {
      e.preventDefault();
      try {
          await update({
              id,
              name: updatingName,
          }).unwrap();
          console.log(updatingName)
          toast.success("Category updated successfully!");
          navigate("/admin/category");
          refetch();
      } catch (err) {
          toast.error(err?.data?.message || "Failed to update the category.");
      }
    }



  return (

   <>
   
   
   
   
   </>
  )
}

export default EditProduct