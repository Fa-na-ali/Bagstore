import React from "react";
import { Carousel } from "react-bootstrap";
import bannerImage1 from "../assets/images/banner1.webp"
import bannerImage2 from "../assets/images/banner2.webp"
import bannerImage3 from "../assets/images/banner3.webp"

const Banner = () => {
  return (
   <>



    <Carousel fade>
      <Carousel.Item>
        <img
          className="d-block w-100"
          src={bannerImage1}
          alt="Sunset Over the City"
        />
      </Carousel.Item>

      <Carousel.Item>
        <img
          className="d-block w-100"
          src={bannerImage2}
          alt="Canyon at Night"
        />
      </Carousel.Item>

      <Carousel.Item>
        <img
          className="d-block w-100"
          src={bannerImage3}
          alt="Cliff Above a Stormy Sea"
        />
      </Carousel.Item>
    </Carousel>

   
   </>
  )
}

export default Banner