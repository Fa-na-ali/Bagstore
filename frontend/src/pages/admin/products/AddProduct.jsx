import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Row, Col, Container, Form, Button, Card, Modal } from 'react-bootstrap';
import { MdOutlineAdd } from "react-icons/md";
import { MdOutlineRemove } from "react-icons/md";
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { useAddProductMutation } from '../../../redux/api/productApiSlice';
import AdminSidebar from '../../../components/AdminSidebar';
import { toast } from 'react-toastify';
import { useFetchCategoriesQuery } from '../../../redux/api/categoryApiSlice';
import { useGetAllOffersToAddQuery } from '../../../redux/api/usersApiSlice';


const AddProduct = () => {
  const { data: off } = useGetAllOffersToAddQuery()
  const offers = off?.offers
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [brand, setBrand] = useState("");
  const [offer, setOffer] = useState("")
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [croppedImages, setCroppedImages] = useState([]);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const cropperRef = useRef(null);
  const [addProduct, { isLoading }] = useAddProductMutation();
  const { data } = useFetchCategoriesQuery();
  const categories = data?.all
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!name) newErrors.name = 'Name of Product is required';
    if (!category) newErrors.category = 'Category is required';
    if (!description) newErrors.description = 'Description is required';
    if (!price || price <= 0) newErrors.price = 'Price must be greater than 0';
    if (!color) newErrors.color = 'Color is required';
    if (!brand) newErrors.brand = 'Brand is required';
    if (quantity <= 0) newErrors.quantity = 'Quantity must be greater than 0';
    if (files.length === 0) newErrors.files = 'At least one image is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    setImageToCrop(URL.createObjectURL(selectedFiles[0]));
    setShowModal(true);
  };

  const handleCrop = () => {
    if (cropperRef.current) {
      const croppedCanvas = cropperRef.current.cropper.getCroppedCanvas();
      if (croppedCanvas) {
        croppedCanvas.toBlob((blob) => {
          if (blob) {

            const file = new File([blob], `image-${Date.now()}.webp`, { type: "image/webp" });

            setCroppedImages((prevImages) => [...prevImages, file]); 
          }
        }, "image/webp");
      }
    }
    setShowModal(false);
  };
  //on submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    try {
      const productData = new FormData();
      productData.append("name", name);
      productData.append("description", description);
      productData.append("price", price);
      productData.append("offer", offer);
      productData.append("category", category);
      productData.append("quantity", quantity);
      productData.append("brand", brand);
      productData.append("color", color);
      productData.append("size", size);
      if (croppedImages.length === 0) {
        toast.error("Please upload at least one image.");
        return;
      }
      croppedImages.forEach((file) => {
        productData.append('pdImage', file);
      });
      const { data } = await addProduct(productData).unwrap()
      toast.success('Product added successfully!');
      navigate('/admin/products')
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to add product');
    }
  };

  return (
    <Container fluid>
      <Row className="g-0">
        <Col lg={2} className="d-none d-lg-block">
          <AdminSidebar />
        </Col>
        <Col lg={9} className="p-4 background-one vw-75">
          <h2 className='text-center my-5 heading'>ADD PRODUCT</h2>
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3 my-5">
              <Form.Group as={Col} controlId="formName">
                <Form.Label className='caption'>Name of Product</Form.Label>
                <Form.Control type="text" placeholder="Enter Product name" value={name}
                  onChange={(e) => setName(e.target.value)}
                  isInvalid={!!errors.name} />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} controlId="formGridCategory">
                <Form.Label className="caption">Category</Form.Label>
                <Form.Select className="text-secondary"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  isInvalid={!!errors.category}>
                  <option value="">Choose...</option>
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

              <Form.Group as={Col} controlId="formGridPrice">
                <Form.Label className='caption'>Price</Form.Label>
                <Form.Control type="number" placeholder="Enter Price" value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  isInvalid={!!errors.price} />
                <Form.Control.Feedback type="invalid">
                  {errors.price}
                </Form.Control.Feedback>
              </Form.Group>
            </Row>

            <Form.Group className="mb-3" controlId="formDesc">
              <Form.Label className='caption'>Description</Form.Label>
              <Form.Control type="text" placeholder="Enter Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                isInvalid={!!errors.description}
              />
              <Form.Control.Feedback type="invalid">
                {errors.description}
              </Form.Control.Feedback>
            </Form.Group>

            <Row className="mb-3">

              <Form.Group as={Col} controlId="offer">
                <Form.Label className="caption">Offer</Form.Label>
                <Form.Select name="offer" value={offer} onChange={(e) => setOffer(e.target.value)}>
                  <option value="none">None</option>
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
                  isInvalid={!!errors.color}>
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
                <Form.Control type="text" placeholder="Enter Brand" value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  isInvalid={!!errors.brand} />
                <Form.Control.Feedback type="invalid">
                  {errors.brand}
                </Form.Control.Feedback>
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
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="text-center"
                    style={{ width: '70px' }}
                    isInvalid={!!errors.quantity}
                  />

                  <Button className="px-3 ms-2 button-custom" onClick={() => setQuantity(quantity + 1)}>
                    <MdOutlineAdd />
                  </Button>
                </div>
                <Form.Control.Feedback type="invalid">
                  {errors.quantity}
                </Form.Control.Feedback>
              </div>

              <Form.Group as={Col} controlId="formGridsize">
                <Form.Label className='caption'>Size</Form.Label>
                <Form.Control type="string" placeholder="Enter size" value={size}
                  onChange={(e) => setSize(e.target.value)}
                  isInvalid={!!errors.size} />
                <Form.Control.Feedback type="invalid">
                  {errors.size}
                </Form.Control.Feedback>
              </Form.Group>
            </Row>
            <Form.Group className="mb-3 my-4">
              <Form.Label className='caption'>Upload Images</Form.Label>
              <Form.Control type="file" multiple onChange={handleFileChange} />
              <p className="text-muted">You can upload multiple images.</p>
            </Form.Group>
            {croppedImages.length > 0 && (
              <Container className="mt-3 d-flex">
                {croppedImages.map((image, index) => (
                  <Card key={index} style={{ width: "70px", height: "70px", margin: "5px" }}>
                    <Card.Img variant="top" src={URL.createObjectURL(image)} />
                  </Card>
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
  );
};

export default AddProduct;
