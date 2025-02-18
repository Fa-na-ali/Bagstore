import React from 'react'
import Banner from './Banner'
import { Container, Row, Col, Modal,Card ,Badge} from "react-bootstrap";
import { useState } from "react";
import sling from '../assets/images/sling1.webp'
import handbag from '../assets/images/handbag.webp'
import wallet from '../assets/images/wallet.webp'
import { useGetNewProductsQuery } from '../redux/api/productApiSlice';

const Home = () => {
    const [show, setShow] = useState(null);

    const handleShow = (index) => setShow(index);
    const handleClose = () => setShow(null);
  const {data:products} = useGetNewProductsQuery()
  console.log(products)
    const images = [
      { src: sling, modalId: 1 },
      { src: handbag, modalId: 2 },
      { src: wallet, modalId: 3 },
    ];
    const imageBaseUrl = "http://localhost:5004/uploads/"; 
  const productImages = products?.pdImage?.map((img) => `${imageBaseUrl}${img}`);
  console.log("images",productImages)

  
  return (
   <>
   <Banner/>
   <section className='background-one '>
   <Container className=''>
    <h2 className='heading text-center'>NEW PRODUCTS</h2>
      <Row>
        {images.map((image, index) => (
          <Col key={index} lg={4} md={12} className="mb-4">
            <div className="bg-image hover-overlay shadow-1-strong rounded my-5">
              <img src={image.src} alt="Gallery" className="w-100" />
              <div className="mask" style={{ backgroundColor: "rgba(251, 251, 251, 0.2)" }} onClick={() => handleShow(image.modalId)}></div>
            </div>

            {/* Modal */}
            <Modal show={show === image.modalId} onHide={handleClose} centered>
              <Modal.Header closeButton>
                <Modal.Title>Image Preview</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <img src={image.src} alt="Gallery" className="w-100" />
              </Modal.Body>
            </Modal>
          </Col>
        ))}
      </Row>
     
      <div className='text-center py-5'>
              <h4 className='mt-4 mb-5 heading'><strong>NEW PRODUCTS</strong></h4>
              <Row>
          {products?.map((product) => {
            const productImages = product.pdImage?.length
              ? product.pdImage.map((img) => `${imageBaseUrl}${img}`)
              : ['https://via.placeholder.com/300'];
            return (
              <Col key={product._id} lg={4} md={6} className='mb-4'>
                <Card className='shadow-lg hover-shadow h-100 d-flex flex-column'>
                  <div
                    className='bg-image hover-zoom ripple ripple-surface ripple-surface-light'
                    style={{ height: "400px", overflow: "hidden" }}
                  >
                    <Card.Img
                      variant='top'
                      src={productImages[0]}
                      className='w-100 h-100'
                      alt={product.name}
                      style={{ objectFit: "cover" }} 
                    />
                    <a href='#!'>
                      <div className='hover-overlay'>
                        <div
                          className='mask'
                          style={{ backgroundColor: 'rgba(251, 251, 251, 0.15)' }}
                        ></div>
                      </div>
                    </a>
                  </div>
                  <Card.Body>
                    <a href='' className='text-reset text-decoration-none'>
                      <Card.Title className='mb-3 caption'>{product.name}</Card.Title>
                    </a>
                    <a href='' className='text-reset text-decoration-none '>
                      <p className='caption'>{product.color}</p>
                    </a>
                    <h6 className='mb-3 caption'>INR {product.price}</h6>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
            </div>

    </Container>
    </section>
   
   </>
  )
}

export default Home