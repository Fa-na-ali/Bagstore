import React from 'react'
import { productApiSlice, useDeleteImageMutation, useFetchRelatedProductsQuery, useGetProductByIdQuery, useUpdateProductMutation } from '../../redux/api/productApiSlice';
import { useNavigate, useParams } from 'react-router';
import { Row, Col, Container, Button, Card, Modal, Image } from 'react-bootstrap'
import { useSpecificCategoriesQuery } from '../../redux/api/categoryApiSlice';
import Cards from '../../components/Cards';

const ProductDetails = () => {
  const { id } = useParams();
 console.log("id", id)
  const { data: product, refetch, isLoading, isError } = useGetProductByIdQuery(id);
  const imageBaseUrl = "http://localhost:5004/uploads/";
//  const { data: category } = useSpecificCategoriesQuery({id:product?.category});
console.log(product?._id)
  const {data:products} = useFetchRelatedProductsQuery(id)
console.log(products)
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading product details.</div>;
  }

  console.log("product", product);

  if (!product) {
    return <div>Product not found.</div>;
  }


  return (

    <>
    <section className='background'>
      <Container  className=" py-5 ">
        <Row>

          <Col md={6} className="mb-4">

            <Image
              id="mainImage"
              src={`${imageBaseUrl}${product.pdImage[0]}`} 
              alt="Product"
              fluid
              rounded
              className="mb-3"
              style={{ width: "500px", height: "500px", }}
            />


            <div className="d-flex">
              {product.pdImage.slice(0, 5).map((image, index) => (
                <Image
                  key={index}
                  src={`${imageBaseUrl}${image}`} 
                  alt={`Thumbnail ${index + 1}`}
                  rounded
                  className="thumbnail active"
                  onClick={() => document.getElementById('mainImage').src = `${imageBaseUrl}${image}`}
                  style={{ width: "80px", height: "80px", objectFit: "cover", cursor: "pointer" }}
                />
              ))}
            </div>
          </Col>

          
          <Col md={6}>
            <h2 className="mb-3 caption">{product.name}</h2>
            <p className="text-muted mb-4 caption">ID: {product._id}</p>
            <div className="mb-3">
              <span className="h4 me-2 caption">${product.price}</span>

            </div>
            <div className="mb-3">
              {[...Array(product.rating)].map((_, i) => (
                <i key={i} className="bi bi-star-fill text-warning"></i>
              ))}
              {product.rating < 5 && <i className="bi bi-star-half text-warning"></i>}
              <span className="ms-2 caption">4.5 ({20} reviews)</span>
            </div>
            <p className="mb-4 caption">{product.description}</p>
            <div className="mb-4">
              <h5 className='caption'>Color:</h5>
              <div className="btn-group" role="group" aria-label="Color selection">
                {product.color ? (
                  <React.Fragment>
                    <input
                      type="radio"
                      className="btn-check"
                      name="color"
                      id={product.color}
                      autoComplete="off"
                      defaultChecked
                    />
                    <label className={`btn btn-outline-${product.color.toLowerCase()}`} htmlFor={product.color}>
                      {product.color}
                    </label>
                  </React.Fragment>
                ) : (
                  <span>No color available</span>  
                )}
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="quantity" className="form-label caption">Quantity</label>
              <input
                type="number"
                className="form-control"
                id="quantity"
                value={product.quantity}
                min={1}
                style={{ width: '80px' }}
              />
            </div>
            <Button  size="lg" className="mb-3 me-2 button-custom">
              <i className="bi bi-cart-plus"></i> Add to Cart
            </Button>
            <Button variant="outline-secondary" size="lg" className="mb-3">
              <i className="bi bi-heart"></i> Add to Wishlist
            </Button>

          </Col>
        </Row>
        <Row>

        <div className='text-center py-5'>
            <h4 className='mt-4 mb-5 heading'><strong>RELATED PRODUCTS</strong></h4>
              <Cards
              products={products}
              
              />
          </div>


        </Row>
      </Container>

      </section>

    </>
  )
}

export default ProductDetails