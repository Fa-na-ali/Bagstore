import React from 'react'

const Home = () => {
  return (
   <>
   <section class="container my-5">
        <h2 class="text-center">Featured Products</h2>
        <div class="row mt-4">
            <div class="col-md-4">
                <div class="card">
                    <img src="https://via.placeholder.com/300" class="card-img-top" alt="Bag 1"/>
                    <div class="card-body text-center">
                        <h5 class="card-title">Classic Leather Bag</h5>
                        <p class="card-text">$99.99</p>
                        <a href="#" class="btn btn-outline-primary">Add to Cart</a>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card">
                    <img src="https://via.placeholder.com/300" class="card-img-top" alt="Bag 2"/>
                    <div class="card-body text-center">
                        <h5 class="card-title">Modern Backpack</h5>
                        <p class="card-text">$79.99</p>
                        <a href="#" class="btn btn-outline-primary">Add to Cart</a>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card">
                    <img src="https://via.placeholder.com/300" class="card-img-top" alt="Bag 3"/>
                    <div class="card-body text-center">
                        <h5 class="card-title">Luxury Handbag</h5>
                        <p class="card-text">$129.99</p>
                        <a href="#" class="btn btn-outline-primary">Add to Cart</a>
                    </div>
                </div>
            </div>
        </div>
    </section>

   
    <section class="bg-light py-5">
        <div class="container">
            <h2 class="text-center">What Our Customers Say</h2>
            <div class="row mt-4">
                <div class="col-md-4">
                    <div class="testimonial text-center p-4">
                        <p>"Amazing quality! The leather bag is just perfect!"</p>
                        <h6>- Sarah M.</h6>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="testimonial text-center p-4">
                        <p>"Great customer service and fast delivery."</p>
                        <h6>- David R.</h6>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="testimonial text-center p-4">
                        <p>"Stylish bags at affordable prices. Love my new handbag!"</p>
                        <h6>- Emily W.</h6>
                    </div>
                </div>
            </div>
        </div>
    </section>
   
   
   
   
   
   </>
  )
}

export default Home