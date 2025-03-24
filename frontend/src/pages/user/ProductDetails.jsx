import React ,{useState} from 'react'
import { productApiSlice, useDeleteImageMutation, useFetchRelatedProductsQuery, useGetProductByIdQuery, useUpdateProductMutation } from '../../redux/api/productApiSlice';
import { useNavigate, useParams } from 'react-router';
import { Row, Col, Container, Button, Card, Modal, Image } from 'react-bootstrap'
import Cards from '../../components/Cards';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../redux/features/cart/cartSlice';


const ProductDetails = () => {
  const { id } = useParams();
  console.log("id", id)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { data, refetch, isLoading, isError } = useGetProductByIdQuery(id);
  const product=data?.product
  const imageBaseUrl = "http://localhost:5004/uploads/";
  const [quantity, setQuantity] = useState(1);
  
  console.log(product?._id)
  const { data: products } = useFetchRelatedProductsQuery(id)
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
  
  const addToCartHandler = () => {
    dispatch(addToCart({ ...product, qty: quantity })); 
    toast.success("Item added successfully");
  };



  return (

    <>
      <section className='background'>
        <Container className=" py-5 ">
          <Row>

            <Col md={6} className="mb-4">

              <Image
                id="mainImage"
                src={`${imageBaseUrl}${product.pdImage[0]}`}
                alt="Product"
                fluid
                rounded
                className="mb-3 zoom-image"
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
                <span className="h6 me-2 caption">Price: ₹{product.price}</span>

              </div>
              <div className="mb-3">
                {[...Array(product.rating)].map((_, i) => (
                  <i key={i} className="bi bi-star-fill text-warning"></i>
                ))}
                {product.rating < 5 && <i className="bi bi-star-half text-warning"></i>}
                <span className=" caption">Reviews: 4.5 ({20} reviews)</span>
              </div>
              <p className="mb-4 caption">Description: {product.description}</p>
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
              <label htmlFor="quantity" className="form-label caption">
                  Quantity
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="quantity"
                  value={quantity} 
                  min={1}
                  max={5}
                  onChange={(e) => setQuantity(Number(e.target.value))} 
                  style={{ width: "80px" }}
                />
              </div>
              <Button size="lg" className="mb-3 me-2 button-custom" 
              onClick={addToCartHandler}
              disabled={product.quantity <= 0 || !product.category?.isExist }>
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
                products={products?.relatedProducts}

              />
            </div>


          </Row>
        </Container>

      </section>

    </>
  )
}

export default ProductDetails