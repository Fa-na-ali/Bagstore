import React, { useEffect, useState, useRef } from "react";
import { Container, Row, Col, Card, Button, Image as BootstrapImage, Form, Modal } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { Link, useNavigate, useParams } from "react-router";
import { useDeleteAddressMutation, useDeleteUserImageMutation, useProfileQuery, useUploadImageMutation } from "../../redux/api/usersApiSlice";
import { toast } from "react-toastify";
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';


const Account = () => {

    const navigate = useNavigate()
    const { data: users, refetch } = useProfileQuery()
    const [deleteAddress] = useDeleteAddressMutation();
    console.log("useraccount", users)
    const user = users?.user

    const [files, setFiles] = useState([]);
    const [croppedImages, setCroppedImages] = useState([]);
    const [imageToCrop, setImageToCrop] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [upload] = useUploadImageMutation()
    const cropperRef = useRef(null);
    const [croppingIndex, setCroppingIndex] = useState(null);
    const [deleteImage] = useDeleteUserImageMutation();

    const imageBaseUrl = "http://localhost:5004/uploads/";



    useEffect(() => {
        if (user?.image) {
            setFiles(user.image.map((img) => `${imageBaseUrl}${img}`));
        }
        refetch();
    }, [refetch, user]);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this address?")) {
            try {
                await deleteAddress(id).unwrap();
                toast.success("Address deleted successfully!");
                refetch();
            } catch (error) {
                console.error("Failed to delete address", error);
                toast.error("Error deleting address.");
            }
        }
    };

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files)
        //  console.log("image up",newFiles)
        const fileURLs = newFiles.map((file) => URL.createObjectURL(file));
        setFiles((prevFiles) => {
            const updatedFiles = [...prevFiles, ...fileURLs];
            //  console.log("Updated length", updatedFiles);  // Correctly logs updated length
            return updatedFiles;
        });

    }

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

    const handleSubmit = async (e) => {
        e.preventDefault();


        const userData = new FormData();


        let finalImages = croppedImages.length ? croppedImages : files;

        // Convert Object URLs to actual File objects
        const convertedFiles = await Promise.all(
            finalImages.map(async (file) => {
                if (file instanceof File) return file;
                const response = await fetch(file);
                const blob = await response.blob();

                // Convert Blob to File
                return new File([blob], `image-${Date.now()}.webp`, { type: "image/webp" });
            })
        );

        // Append images to FormData
        convertedFiles.forEach((file) => userData.append("image", file));


        for (let [key, value] of userData.entries()) {
            console.log(key, value);
        }
        console.log("pp", { images: convertedFiles, })
        try {
            const { data } = await upload({ id: user?._id, userData }).unwrap()
            toast.success('Profile pic added successfully!');
            refetch();
        } catch (error) {
            console.log(error)
            toast.error(error?.data?.message || 'Failed to edit product');
        }
    };

    const removeImage = async (id, index) => {
        console.log("idddddd", id)
        console.log("index", index)
        try {
          if (index >= 0 && index < user?.image.length) {
            await deleteImage({ id, index }).unwrap();
          }
    
          setFiles((prevImages) => prevImages.filter((_, i) => i !== index));
    
        } catch (error) {
          console.error("Error deleting image:", error);
        }
      };


    return (
        <>
            <section className="my-custom-min-height background" >
                <Container className="py-5">
                    <Row className="d-flex justify-content-center align-items-center">
                        <Col lg={12} className="mb-4 mb-lg-0">
                            <Card className="mb-3" style={{ borderRadius: ".5rem" }}>
                                <Row className="g-0">
                                    <Col md={4} className="text-center text-white d-flex flex-column align-items-center justify-content-center background-two" style={{ borderTopLeftRadius: ".5rem", borderBottomLeftRadius: ".5rem" }}>
                                        {(files.length > 0) && (
                                            <Container className="mt-3 d-flex justify-content-center align-items-center">
                                                {files.map((image, index) => (
                                                    <div key={index} className="position-relative">
                                                        <BootstrapImage
                                                            src={croppedImages[index] || image}
                                                            alt={`product-img-${index}`}
                                                            className="rounded-circle"
                                                            style={{ width: "100px", height: "100px", cursor: "pointer" }}
                                                            onClick={() => openCropModal(image, index)}
                                                        />
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            className="position-absolute top-0 end-0"
                                                            onClick={() => removeImage(user?._id, index)}
                                                        >
                                                            <MdDelete />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </Container>
                                        )}
                                        {files.length === 0 && croppedImages.length === 0 && (
                                            <Form.Group className="text-center">
                                                <Form.Control
                                                    type="file"
                                                    id="fileInput"
                                                    style={{ display: "none" }}
                                                    onChange={handleFileChange}
                                                    accept="image/*"
                                                />
                                                <Button onClick={() => document.getElementById('fileInput').click()} className="mt-3">
                                                    Upload Image
                                                </Button>
                                            </Form.Group>
                                        )}

                                        {(files.length > 0 || croppedImages.length > 0) && (
                                            <Form.Group className="text-center">
                                                <Button onClick={handleSubmit} className="mt-3">
                                                    Set as Profile pic
                                                </Button>
                                            </Form.Group>
                                        )}
                                        <h5 className="mt-4">{user?.name}</h5>
                                        <Link to='/account/edit' style={{ textDecoration: "none", color: "inherit" }}>
                                            <FaEdit className="mb-4" />
                                        </Link>
                                    </Col>
                                    <Col md={8}>
                                        <Card.Body className="p-4">
                                            <h3 className="heading text-center">PROFILE</h3>
                                            <hr className="mt-0 mb-4" />
                                            <Row className="pt-1">
                                                <Col xs={6} className="mb-3">
                                                    <h6 className="caption">Email</h6>
                                                    <p className="text-muted">{user?.email}</p>
                                                </Col>
                                                <Col xs={6} className="mb-3">
                                                    <h6 className="caption">Phone</h6>
                                                    <p className="text-muted">{user?.phone}</p>
                                                </Col>
                                            </Row>
                                            <Row className="pt-1">
                                                <Col xs={6} className="mb-3">
                                                    <Button className="button-custom" onClick={() => { navigate(`/change-password`) }}>Change Password</Button>
                                                </Col>
                                                <Col xs={6} className="mb-3">
                                                    <Button className="button-custom" onClick={() => { navigate(`/account/referrals/${user._id}`) }}>Referrals</Button>
                                                </Col>

                                            </Row>
                                            <h6 className="caption">Address</h6>
                                            <hr className="mt-0 mb-4" />
                                            <Row className="pt-1">
                                                {user?.address?.length > 0 ? (
                                                    user.address.map((address, index) => (
                                                        <Col xs={6} className="mb-3" key={address._id}>
                                                            <Card style={{ height: '170px' }}>
                                                                <Card.Body>
                                                                    <div className="d-flex justify-content-between">
                                                                        <Card.Title className="caption">{`Address ${index + 1}`}</Card.Title>
                                                                        <div>
                                                                            <Button variant="outline-primary" size="sm" className="me-2" onClick={() => { navigate(`/account/edit-address/${address._id}`) }}><FaEdit /></Button>
                                                                            <Button variant="outline-danger" size="sm" onClick={() => handleDelete(address._id)}><FaTrash /></Button>
                                                                        </div>
                                                                    </div>

                                                                    <Card.Text className="text-muted">
                                                                        {address.houseName},{address.town},{address.street},
                                                                        {address.state}, {address.zipcode}, {address.country} <br />
                                                                        <strong>Phone:</strong> {address.phone}
                                                                    </Card.Text>
                                                                </Card.Body>
                                                            </Card>
                                                        </Col>
                                                    ))) : (
                                                    <Col xs={6} className="mb-3">
                                                        <Card>
                                                            <Card.Body>
                                                                <p className="text-muted text-center">No addresses added yet.</p>
                                                            </Card.Body>
                                                        </Card>
                                                    </Col>
                                                )}
                                                <Col xs={6} className="mb-3">
                                                    <Card className="background-two" style={{ height: '170px' }}>
                                                        <Card.Body>
                                                            <Link to='/account/add-address' style={{ textDecoration: "none", color: "white" }}>
                                                                <Card.Title className="text-center mt-5">+ Add Address</Card.Title>
                                                            </Link>

                                                        </Card.Body>
                                                    </Card>
                                                </Col>
                                            </Row>

                                        </Card.Body>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </section>

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
        </>
    );
};

export default Account;
