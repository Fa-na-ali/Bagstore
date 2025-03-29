import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useDeleteImageMutation, useGetProductByIdQuery, useUpdateProductMutation } from '../../../redux/api/productApiSlice';
import { Row, Col, Container, Form, Button, Card, Modal } from 'react-bootstrap';
import { MdOutlineAdd } from "react-icons/md";
import { MdOutlineRemove } from "react-icons/md";
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import AdminSidebar from '../../../components/AdminSidebar';
import { toast } from 'react-toastify';
import { useFetchCategoriesQuery } from '../../../redux/api/categoryApiSlice';
import { MdDelete } from "react-icons/md";
import { Image as BootstrapImage } from "react-bootstrap";
import { useGetAllOffersToAddQuery } from '../../../redux/api/usersApiSlice';
const EditProduct = () => {

  const { id } = useParams();
  const navigate = useNavigate();
  const { data: off } = useGetAllOffersToAddQuery()
    console.log(off)
    const offers = off?.offers

  const { data, refetch, isLoading, isError } = useGetProductByIdQuery(id);
  console.log("product", data)
  const product = data?.product
  console.log(product?.category?.name)
  const [update, { isLoading: isUpdating }] = useUpdateProductMutation();
  const { data: datas } = useFetchCategoriesQuery();
  const categories = datas?.all
  const [deleteImage] = useDeleteImageMutation();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState("");
  const [offer,setOffer] = useState("")
  const [quantity, setQuantity] = useState(0);
  const [brand, setBrand] = useState("");
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [files, setFiles] = useState([]);
  const [upload, setUpload] = useState([])
  const [croppedImages, setCroppedImages] = useState([]);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const cropperRef = useRef(null);
  const [croppingIndex, setCroppingIndex] = useState(null);

  const imageBaseUrl = "http://localhost:5004/uploads/";
  const productImages = product?.pdImage.map((img) => `${imageBaseUrl}${img}`);


  useEffect(() => {
    if (product) {
      setName(product.name || "");
      setDescription(product.description || "");
      setPrice(product.price || 0);
      setOffer(product.offer || "")
      setCategory(product?.category?._id || "");
      setQuantity(product.quantity || 1);
      setBrand(product.brand || "");
      setColor(product.color || "");
      setSize(product.size || "");

      if (product?.pdImage) {
        setFiles(product.pdImage.map((img) => `${imageBaseUrl}${img}`));
      }

    }

  }, [product,]);

  //on upload
  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files)
    //  console.log("image up",newFiles)
    const fileURLs = newFiles.map((file) => URL.createObjectURL(file));
    setFiles((prevFiles) => {
      const updatedFiles = [...prevFiles, ...fileURLs];
      //  console.log("Updated length", updatedFiles);  // Correctly logs updated length
      return updatedFiles;
    });
    // console.log("length", files)
  }
  //to remove image
  const removeImage = async (id, index) => {
    console.log("idddddd", id)
    console.log("index", index)
    try {
      if (index >= 0 && index < product?.pdImage.length) {
        await deleteImage({ id, index }).unwrap();
      }

      setFiles((prevImages) => prevImages.filter((_, i) => i !== index));

    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };
  //to crop
  const openCropModal = (image, index) => {
    setCroppingIndex(index);
    setImageToCrop(image);
    setShowModal(true);
  };
  const handleCrop = () => {
    if (cropperRef.current) {
      const croppedCanvas = cropperRef.current.cropper.getCroppedCanvas();
      if (croppedCanvas) {
        croppedCanvas.toBlob((blob) => {
          if (blob) {

            const file = new File([blob], `image-${Date.now()}.webp`, { type: "image/webp" });
            const objectURL = URL.createObjectURL(file);

            setCroppedImages((prevImages) => {
              const updatedImages = [...prevImages];
              updatedImages[croppingIndex] = objectURL;
              return updatedImages;
            });


          }
        }, "image/webp");
      }
    }
    setShowModal(false);
  }
  //to update
  const handleSubmit = async (e) => {
    e.preventDefault();


    const productData = new FormData();
    productData.append("name", name);
    productData.append("description", description);
    productData.append("price", price);
    productData.append("category", category);
    productData.append("offer", offer);
    productData.append("quantity", quantity);
    productData.append("brand", brand);
    productData.append("color", color);
    productData.append("size", size);

    let finalImages = croppedImages.length ? croppedImages : files;

    // Convert Object URLs to actual File objects
    const convertedFiles = await Promise.all(
      finalImages.map(async (file) => {
        if (file instanceof File) return file;

        // Fetch image from Object URL (blob:http://...)
        const response = await fetch(file);
        const blob = await response.blob();

        // Convert Blob to File
        return new File([blob], `image-${Date.now()}.webp`, { type: "image/webp" });
      })
    );

    // Append images to FormData
    convertedFiles.forEach((file) => productData.append("pdImage", file));


    console.log("prooo", productData)
    console.log("pp", { name, description, price, category, quantity,offer, color, brand, productId: product._id, images: convertedFiles, })
    try {
      const { data } = await update({ id: product?._id, formData: productData }).unwrap()
      toast.success('Product Edited successfully!');
      navigate('/admin/products')
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to edit product');
    }
  };

  return (

    <>
      <Container fluid>
        <Row className="g-0">
          <Col lg={2} className="d-none d-lg-block">
            <AdminSidebar />
          </Col>
          <Col lg={9} className="p-4 background-one vw-75">
            <h2 className='text-center my-5 heading'>EDIT PRODUCT</h2>
            <Form onSubmit={handleSubmit}>
              <Row className="mb-3 my-5">
                <Form.Group as={Col} controlId="formName">
                  <Form.Label className='caption'>Name of Product</Form.Label>
                  <Form.Control type="text" value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Form.Group>
                <Form.Group as={Col} controlId="formGridPrice">
                  <Form.Label className='caption'>Price</Form.Label>
                  <Form.Control type="number" value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </Form.Group>

                <Form.Group as={Col} controlId="formGridCategory">
                  <Form.Label className="caption">Category</Form.Label>
                  <Form.Select className="text-secondary"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value=""></option>
                    {categories?.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </Form.Select>

                </Form.Group>

              </Row>
              <Form.Group className="mb-3" controlId="formDesc">
                <Form.Label className='caption'>Description</Form.Label>
                <Form.Control type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}

                />

              </Form.Group>
              <Row className="mb-3">

                <Form.Group as={Col} controlId="offer">
                  <Form.Label className="caption">Offer</Form.Label>
                  <Form.Select name="offer" value={offer} onChange={(e) => setOffer(e.target.value)}>
                    <option value="">None</option>
                    {offers
                      ?.filter((offer) => offer.type === "products")
                      .map((offer) => (
                        <option key={offer.name} value={offer.name}>
                          {offer.name}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group as={Col} controlId="formGridColor">
                  <Form.Label className='caption'>Color</Form.Label>
                  <Form.Select className='text-secondary' value={color}
                    onChange={(e) => setColor(e.target.value)}
                  >
                    <option value="">Choose...</option>
                    <option value="Beige">Beige</option>
                    <option value="Brown">Brown</option>
                    <option value="White">White</option>
                    <option value="Black">Black</option>
                    <option value="Pink">Pink</option>
                    <option value="Green">Green</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group as={Col} controlId="formGridBrand">
                  <Form.Label className='caption'>Brand</Form.Label>
                  <Form.Control type="text" value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                  />

                </Form.Group>
              </Row>

              <Row>
                <div style={{ maxWidth: '300px' }}>
                  <Form.Label className="mb-2 caption" >Quantity</Form.Label>
                  <div className="d-flex align-items-center">
                    <Button className="px-3 me-2 button-custom" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                      <MdOutlineRemove />
                    </Button>

                    <Form.Control
                      type="number"
                      min="0"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="text-center"
                      style={{ width: '70px' }}

                    />

                    <Button className="px-3 ms-2 button-custom" onClick={() => setQuantity(quantity + 1)}>
                      <MdOutlineAdd />
                    </Button>
                  </div>

                </div>

                <Form.Group as={Col} controlId="formGridsize">
                  <Form.Label className='caption'>Size</Form.Label>
                  <Form.Control type="string" value={size}
                    onChange={(e) => setSize(e.target.value)}
                  />

                </Form.Group>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label className="caption">Upload Images</Form.Label>
                <Form.Control type="file" multiple accept="image/*" onChange={handleFileChange} />
              </Form.Group>

              {(files.length > 0) && (
                <Container className="mt-3 d-flex">
                  {files.map((image, index) => (
                    <div key={index} className="position-relative">
                      <BootstrapImage
                        src={croppedImages[index] || image}
                        alt={`product-img-${index}`}
                        className="border rounded"
                        style={{ width: "100px", height: "100px", cursor: "pointer" }}
                        onClick={() => openCropModal(image, index)}
                      />

                      <Button
                        variant="danger"
                        size="sm"
                        className="position-absolute top-0 end-0"
                        onClick={() => removeImage(product._id, index)}
                      >
                        <MdDelete />
                      </Button>
                    </div>
                  ))}

                </Container>
              )}
              <Button className='button-custom w-100 my-5' type="submit" disabled={isLoading}>
                {isLoading ? 'Uploading...' : 'Submit'}
              </Button>
            </Form>
          </Col>
        </Row>



        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Body>
            <Cropper
              ref={cropperRef}
              style={{ height: 400, width: "100%" }}
              zoomTo={0.5}
              initialAspectRatio={1}
              preview=".img-preview"
              src={imageToCrop}
              viewMode={1}
              minCropBoxHeight={10}
              minCropBoxWidth={10}
              background={false}
              responsive={true}
              autoCropArea={1}
              checkOrientation={false}
              guides={true}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCrop}>
              Crop & Save
            </Button>
          </Modal.Footer>
        </Modal>

      </Container>


    </>
  )
}

export default EditProduct