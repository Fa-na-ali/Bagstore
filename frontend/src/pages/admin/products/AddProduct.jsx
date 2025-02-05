import React from 'react'

const AddProduct = () => {
  return (
   <>
   <div className="admin-container">
      <AdminSidebar />
      <main className="product-management">
        <article>
          <form onSubmit={submitHandler}>
            <h2>New Product</h2>
            <div>
              <label>Name</label>
              <input
              required
                type="text"
                placeholder="Name"
                value={name}
                
              />
            </div>
            <div>
              <label>Price</label>
              <input
              required
                type="number"
                placeholder="Price"
                value={price}
                
              />
            </div>
            <div>
              <label>Stock</label>
              <input
              required
                type="number"
                placeholder="Stock"
                value={stock}
                
              />
            </div>

            <div>
              <label>Category</label>
              <input
              required
                type="text"
                placeholder="eg. laptop, camera etc"
                value={category}
                
              />
            </div>

            <div>
              <label>Photo</label>
              <input 
              required
              type="file"  />
            </div>

           
            <button type="submit">Create</button>
          </form>
        </article>
      </main>
    </div>
   
   </>
  )
}

export default AddProduct