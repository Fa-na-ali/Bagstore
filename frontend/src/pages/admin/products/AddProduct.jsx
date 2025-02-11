import React, { useState, useRef, useCallback  } from 'react';
import { MdOutlineAdd, MdOutlineRemove } from 'react-icons/md';
import { Row, Col, Container, Form, Button, Card ,Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAddProductMutation } from '../../../redux/api/productApiSlice';
import AdminSidebar from '../../../components/AdminSidebar';
import {toast} from 'react-toastify';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const schema = yup.object().shape({
  name: yup.string().required('Product name is required'),
  category: yup.string().required('Category is required'),
  description: yup.string().required('Description is required'),
  price: yup.number().positive().required('Price is required'),
  size: yup.string().required('Size is required'),
  quantity: yup.number().integer().positive().required('Quantity is required'),
  brand: yup.string().required('Brand is required'),
});

const AddProduct = () => {
  const [files, setFiles] = useState([]);
  const [addProduct, { isLoading }] = useAddProductMutation();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };
// Open modal for cropping when an image is clicked
  const handleImageClick = (file) => {
    setSelectedImage(file);
    setShowModal(true);
  };
// Extract cropped image
  const getCroppedImage = useCallback(() => {
    if (!completedCrop || !previewCanvasRef.current || !imgRef.current) {
      return;
    }
    const canvas = previewCanvasRef.current;
    const image = imgRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    ctx.drawImage(
      image,
      completedCrop.x,
      completedCrop.y,
      completedCrop.width,
      completedCrop.height,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, "image/jpeg");
    });
  }, [completedCrop]);

   //Save the cropped image
   const saveCroppedImage = async () => {
    const croppedBlob = await getCroppedImage();
    if (croppedBlob) {
      const croppedFile = new File([croppedBlob], selectedImage.name, { type: "image/jpeg" });
      setFiles((prevFiles) => prevFiles.map((file) => (file === selectedImage ? croppedFile : file)));
      toast.success("Image cropped successfully!");
      setShowModal(false);
    }
  };
//form submit
  const onSubmit = async (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key]);
    });
    files.forEach((file) => {
      formData.append('pdImage', file);
    });
    
    try {
      await addProduct(formData).unwrap();
      toast.success('Product added successfully!');
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
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Row className="mb-3 my-5">
              <Form.Group as={Col}>
                <Form.Label className='caption'>Name of Product</Form.Label>
                <Form.Control {...register('name')} placeholder="Enter Product name" />
                <p className="text-danger">{errors.name?.message}</p>
              </Form.Group>

              <Form.Group as={Col}>
                <Form.Label className='caption'>Category</Form.Label>
                <Form.Control {...register('category')} placeholder="Enter Category" />
                <p className="text-danger">{errors.category?.message}</p>
              </Form.Group>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className='caption'>Description</Form.Label>
              <Form.Control {...register('description')} placeholder="Enter Description" />
              <p className="text-danger">{errors.description?.message}</p>
            </Form.Group>

            <Row className="mb-3">
              <Form.Group as={Col}>
                <Form.Label className='caption'>Price</Form.Label>
                <Form.Control type="number" {...register('price')} placeholder="Enter Price" />
                <p className="text-danger">{errors.price?.message}</p>
              </Form.Group>

              <Form.Group as={Col}>
                <Form.Label className='caption'>Size</Form.Label>
                <Form.Control {...register('size')} placeholder="Enter Size" />
                <p className="text-danger">{errors.size?.message}</p>
              </Form.Group>
            </Row>

            <Row className="mb-3">
              <Form.Group as={Col}>
                <Form.Label className='caption'>Quantity</Form.Label>
                <Form.Control type="number" {...register('quantity')} placeholder="Enter Quantity" />
                <p className="text-danger">{errors.quantity?.message}</p>
              </Form.Group>

              <Form.Group as={Col}>
                <Form.Label className='caption'>Brand</Form.Label>
                <Form.Control {...register('brand')} placeholder="Enter Brand" />
                <p className="text-danger">{errors.brand?.message}</p>
              </Form.Group>
            </Row>

            <Form.Group controlId="formFileMultiple" className="mb-3 my-4">
              <Form.Label className='caption'>Upload Images</Form.Label>
              <Form.Control type="file" multiple onChange={handleFileChange} />
              <p className="text-muted">You can upload multiple images.</p>
            </Form.Group>

            {files.length > 0 && (
              <Container className="mt-3 d-flex">
                {files.map((file, index) => (
                  <Card key={index} style={{ width: "70px", height: "70px", margin: "5px", cursor: "pointer" }} onClick={() => handleImageClick(file)}>
                    <Card.Img variant="top" src={URL.createObjectURL(file)} />
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
        <Modal.Header closeButton>
          <Modal.Title>Crop Image</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedImage && (
            <>
              <ReactCrop
                src={URL.createObjectURL(selectedImage)}
                crop={crop}
                onImageLoaded={(img) => (imgRef.current = img)}
                onChange={(newCrop) => setCrop(newCrop)}
                onComplete={(c) => setCompletedCrop(c)}
              />
              <canvas ref={previewCanvasRef} style={{ display: "none" }} />
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={saveCroppedImage}>Save</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AddProduct;
