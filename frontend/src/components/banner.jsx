import React from "react";
import { Carousel } from "react-bootstrap";

const banner = () => {
  return (
   <>



    <Carousel fade>
      <Carousel.Item>
        <img
          className="d-block w-100"
          src="https://mdbcdn.b-cdn.net/img/Photos/Slides/img%20(15).webp"
          alt="Sunset Over the City"
        />
        <Carousel.Caption>
          <h5>First slide label</h5>
          <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
        </Carousel.Caption>
      </Carousel.Item>

      <Carousel.Item>
        <img
          className="d-block w-100"
          src="https://mdbcdn.b-cdn.net/img/Photos/Slides/img%20(22).webp"
          alt="Canyon at Night"
        />
        <Carousel.Caption>
          <h5>Second slide label</h5>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </Carousel.Caption>
      </Carousel.Item>

      <Carousel.Item>
        <img
          className="d-block w-100"
          src="https://mdbcdn.b-cdn.net/img/Photos/Slides/img%20(23).webp"
          alt="Cliff Above a Stormy Sea"
        />
        <Carousel.Caption>
          <h5>Third slide label</h5>
          <p>Praesent commodo cursus magna, vel scelerisque nisl consectetur.</p>
        </Carousel.Caption>
      </Carousel.Item>
    </Carousel>

   
   </>
  )
}

export default banner