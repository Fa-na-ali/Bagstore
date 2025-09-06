import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useDeleteImageMutation, useGetProductByIdQuery, useUpdateProductMutation } from '../../../redux/api/productApiSlice';
import { Row, Col, Container, Form, Button, Modal } from 'react-bootstrap';
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
import { NAME_REGEX, PRODUCT_MESSAGES, SIZE_REGEX } from '../../../constants/messageConstants';


const EditProduct = () => {

  const { id } = useParams();
  const navigate = useNavigate();
  const { data: off } = useGetAllOffersToAddQuery()
  const offers = off?.offers
  const { data, refetch } = useGetProductByIdQuery(id);
  const product = data?.product
  const [update, { isLoading }] = useUpdateProductMutation();
  const { data: datas } = useFetchCategoriesQuery();
  const categories = datas?.all
  const [deleteImage] = useDeleteImageMutation();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    category: "",
    offer: "",
    quantity: 0,
    brand: "",
    color: "",
    size: "",
  });
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [croppedImages, setCroppedImages] = useState([]);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const cropperRef = useRef(null);
  const [croppingIndex, setCroppingIndex] = useState(null);

  const validate = () => {
    const newErrors = {};
    if (!formData.name || formData.name.length > 25 || !NAME_REGEX.test(formData.name)) newErrors.name = 'Name must be atmost 25 characters long';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.description || formData.description.length > 200) newErrors.description = 'Description should be of atmost 200 characters long';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (!formData.color) newErrors.color = 'Color is required';
    if (!formData.brand || formData.brand.length > 15) newErrors.brand = 'Brand must be of atmost 15 characters long';
    if (!formData.size || formData.size.length > 20 || !SIZE_REGEX.test(formData.size)) newErrors.size = "Size is required"
    if (formData.quantity < 0) newErrors.quantity = 'Quantity must be greater than 0';
    if (files.length === 0) newErrors.files = 'At least one image is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (product && !formData.name) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || 0,
        category: product?.category?._id || "",
        offer: product.offer || "",
        quantity: product.quantity || 0,
        brand: product.brand || "",
        color: product.color || "",
        size: product.size || "",
      });
      if (product?.pdImage) {
        setFiles(product.pdImage);
      }
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };


  //on upload
  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files)
    const fileURLs = newFiles.map((file) => URL.createObjectURL(file));
    setFiles((prevFiles) => {
      const updatedFiles = [...prevFiles, ...fileURLs];
      return updatedFiles;
    });

  }

  //to remove image
  const removeImage = async (id, index, e) => {
    e.preventDefault();
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
    if (!validate()) {
      return;
    }
    const productData = new FormData();
    productData.append("name", formData.name);
    productData.append("description", formData.description);
    productData.append("price", formData.price);
    productData.append("category", formData.category);
    productData.append("offer", formData.offer);
    productData.append("quantity", formData.quantity);
    productData.append("brand", formData.brand);
    productData.append("color", formData.color);
    productData.append("size", formData.size);

    let finalImages = croppedImages.length ? croppedImages : files;

    const convertedFiles = await Promise.all(
      finalImages.map(async (file) => {
        if (file instanceof File) return file;
        const response = await fetch(file);
        const blob = await response.blob();
        return new File([blob], `image-${Date.now()}.webp`, { type: "image/webp" });
      })
    );

    convertedFiles.forEach((file) => productData.append("pdImage", file));

    try {
      await update({ id: product?._id, formData: productData }).unwrap()
      toast.success(PRODUCT_MESSAGES.PRODUCT_UPDATE_SUCCESS);
      refetch()
      navigate('/admin/products')
    } catch (error) {
      toast.error(error?.data?.message || `${PRODUCT_MESSAGES.PRODUCT_UPDATE_FAILURE}`);
    }
  };

  return (

    <>
      <div className="d-flex">
        <AdminSidebar />
        <div className="main-content-wrapper background-one flex-grow-1">
          <Container fluid className="mt-4 p-4">
            <Row className="g-0">
              <Col lg={9} >
                <h2 className='text-center my-5 heading'>EDIT PRODUCT</h2>
                <Form onSubmit={handleSubmit}>
                  <Row className="mb-3 my-5">
                    <Form.Group as={Col} controlId="formName">
                      <Form.Label className='caption'>Name of Product</Form.Label>
                      <Form.Control type="text" name="name" value={formData.name}
                        onChange={handleChange}
                        isInvalid={!!errors.name} />
                      <Form.Control.Feedback type="invalid">
                        {errors.name}
                      </Form.Control.Feedback>

                    </Form.Group>
                    <Form.Group as={Col} controlId="formGridPrice">
                      <Form.Label className='caption'>Price</Form.Label>
                      <Form.Control type="number" name="price" value={formData.price}
                        onChange={handleChange}
                        isInvalid={!!errors.price}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.price}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group as={Col} controlId="formGridCategory">
                      <Form.Label className="caption">Category</Form.Label>
                      <Form.Select className="text-secondary"
                        value={formData.category}
                        name="category"
                        onChange={handleChange}
                        isInvalid={!!errors.category}
                      >
                        <option value=""></option>
                        {categories?.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.category}
                      </Form.Control.Feedback>
                    </Form.Group>

                  </Row>
                  <Form.Group className="mb-3" controlId="formDesc">
                    <Form.Label className='caption'>Description</Form.Label>
                    <Form.Control type="text"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      isInvalid={!!errors.description}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.description}
                    </Form.Control.Feedback>

                  </Form.Group>
                  <Row className="mb-3">

                    <Form.Group as={Col} controlId="offer">
                      <Form.Label className="caption">Offer</Form.Label>
                      <Form.Select name="offer" value={formData.offer} onChange={handleChange}>
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
                      <Form.Select className='text-secondary' name="color" value={formData.color}
                        onChange={handleChange}
                        isInvalid={!!errors.color}
                      >
                        <option value="">Choose...</option>
                        <option value="Beige">Beige</option>
                        <option value="Brown">Brown</option>
                        <option value="White">White</option>
                        <option value="Black">Black</option>
                        <option value="Pink">Pink</option>
                        <option value="Green">Green</option>
                        <option value="Red">Red</option>
                        <option value="Orange">Orange</option>
                        <option value="Violet">Violet</option>
                        <option value="Blue">Blue</option>
                        <option value="Yellow">Yellow</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.color}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group as={Col} controlId="formGridBrand">
                      <Form.Label className='caption'>Brand</Form.Label>
                      <Form.Control type="text" name="brand" value={formData.brand}
                        onChange={handleChange}
                        isInvalid={!!errors.brand}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.brand}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Row>

                  <Row>
                    <div style={{ maxWidth: '300px' }}>
                      <Form.Label className="mb-2 caption" >Quantity</Form.Label>
                      <div className="d-flex align-items-center">
                        <Button className="px-3 me-2 button-custom" onClick={() => setFormData(prevData => ({ ...prevData, quantity: Math.max(0, prevData.quantity - 1) }))}>
                          <MdOutlineRemove />
                        </Button>

                        <Form.Control
                          type="number"
                          name="quantity"
                          min="0"
                          value={formData.quantity}
                          onChange={handleChange}
                          className="text-center"
                          style={{ width: '70px' }}
                          isInvalid={!!errors.quantity}
                        />

                        <Button className="px-3 ms-2 button-custom" onClick={() => setFormData(prevData => ({ ...prevData, quantity: prevData.quantity + 1 }))}>
                          <MdOutlineAdd />
                        </Button>
                      </div>
                      <Form.Control.Feedback type="invalid">
                        {errors.quantity}
                      </Form.Control.Feedback>
                    </div>

                    <Form.Group as={Col} controlId="formGridsize">
                      <Form.Label className='caption'>Size</Form.Label>
                      <Form.Control type="string" value={formData.size}
                        onChange={handleChange}
                        name="size"
                        isInvalid={!!errors.size}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.size}
                      </Form.Control.Feedback>
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
                            onClick={(e) => removeImage(product._id, index, e)}
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
        </div>
      </div>
    </>
  )
}

export default EditProduct