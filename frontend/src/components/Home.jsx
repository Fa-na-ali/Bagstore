import React from 'react'
import Banner from './Banner'
import { Container, Row, Col, Modal, Card, Badge } from "react-bootstrap";
import { useState } from "react";
import sling from '../assets/images/sling1.webp'
import handbag from '../assets/images/handbag.webp'
import wallet from '../assets/images/wallet.webp'
import { useGetNewProductsQuery } from '../redux/api/productApiSlice';

import Cards from './Cards';
import { useSelector } from 'react-redux';
import { IMG_URL } from '../redux/constants';

const Home = () => {
  const [show, setShow] = useState(null);

  const handleShow = (index) => setShow(index);
  const handleClose = () => setShow(null);
  const { data: products } = useGetNewProductsQuery()
  console.log(products)
  const images = [
    { src: sling, modalId: 1 },
    { src: handbag, modalId: 2 },
    { src: wallet, modalId: 3 },
  ];
  
  const productImages = products?.pdImage?.map((img) => `${IMG_URL}${img}`);
  console.log("images", productImages)
  const {refreshToken} = useSelector(state=>state.auth)
  console.log("refresf",refreshToken)

  return (
    <>
      <Banner />
      <section className='background-one '>
        <Container className=''>
          <h2 className='heading text-center'></h2>
          <Row>
            {images.map((image, index) => (
              <Col key={index} lg={4} md={12} className="mb-4">
                <div className="bg-image hover-overlay shadow-1-strong rounded my-5">
                  <img src={image.src} alt="Gallery" className="w-100" />
                  <div className="mask" style={{ backgroundColor: "rgba(251, 251, 251, 0.2)" }} onClick={() => handleShow(image.modalId)}></div>
                </div>


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
              <Cards
              products={products?.all}
              
              />
          </div>

        </Container>
      </section>

    </>
  )
}

export default Home