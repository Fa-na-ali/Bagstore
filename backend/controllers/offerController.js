const STATUS_CODES = require("../middlewares/statusCodes");
const Offer = require("../models/offerModel");

//create offer
const createOffer = async (req, res) => {
    try {
        console.log("req offer",req.body)
        const { name } = req.body;
        const exists = await Offer.findOne({name: {$regex: new RegExp(`^${name}$`, 'i')}});
        if (exists) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({
               status:"error", 
                message: "Offer already exists"});
        }
        const offers = await Offer.create(req.body);
        return res.status(STATUS_CODES.OK).json({
            status:"success" ,
            message: "Offer added successfully"});
    } catch (err) {
        console.error("Error in create offer:", err);
        return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status:"error",
            message: "An error occurred"});
    }
};

//get offers at admin side
const getoffers = async (req, res) => {
    try {
        const limit = 6;
        const page = Number(req.query.page) || 1;
        const keyword = req.query.keyword
            ? {
                name: {
                    $regex: req.query.keyword,
                    $options: "i",
                },
                
            }
            : {};
            const count = await Offer.countDocuments({ ...keyword });
        const offers = await Offer.find({ ...keyword }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
        
        return res.status(200).json({
            status: "success",
            message: "",
            offers,
            //time: timer,
            count,
            page,
            pages: Math.ceil(count / limit),
            hasMore: page < Math.ceil(count / limit),
        });
    } catch (error) {
        console.log("Error in getting coupons", error);
        return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: "An error occurred"
        });
    }
};

//editing offer  at admin
const editOffer = async (req, res) => {

    const id = req.params.id;
    console.log("Received request to update offer with ID:", id);
    console.log("Request Body:", req.body);
    try {
        const {
            name,
            description,
            activation,
            expiry,
            discount,
            minAmount,
            type,
           
        } = req.body;
        const offer = await Offer.findOne({ _id: id });
        if (!offer) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                status: "error",
                message: "Offer doesn't exists"
            });
        }
       const editedOffer =  await Offer.updateOne({ _id: offer._id }, { $set: { name, description, activation, discount, expiry, minAmount, type} });
        return res.status(STATUS_CODES.OK).json({
            status: "success",
            message: "Coupon updated successfully",
            editedOffer

        });
    } catch (error) {
        console.log("Error in updating coupon" + error)
        return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: "An error occurred" + error
        });
    }
};

//delete offer
const deleteOffer = async (req, res) => {
    try {
        const { id } = req.params;
    const offer = await Offer.findById({ _id: id });
    if(offer){
        offer.status=false
        await offer.save()
        return res.status(STATUS_CODES.OK).json({
            status: "success",
            message: "Offer deleted successfully"
        });

    }
    else{
        return res.status(STATUS_CODES.NOT_FOUND).json({
            status: "error",
            message: "Offer not found",
        });
    }
        
    } catch (error) {
        return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: "An error occurred while retrieving the coupon",
        });
    }  
};


//get offer by id
const getOfferById = async (req, res) => {
    try {
        const { id } = req.params;

        const offer = await Offer.findById(id);

        if (!offer) {
            return res.status(STATUS_CODES.NOT_FOUND).json({
                status: "error",
                message: "Offer not found",
            });
        }

       return  res.status(STATUS_CODES.OK).json({
            status: "success",
            offer,
        });
    } catch (error) {
        console.error("Error fetching coupon:", error);
        return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: "An error occurred while retrieving the coupon",
        });
    }
};

//getting available offers 
const getAllOffers = async (req, res) => {
    try {
        const offers = await Offer.find({status:true});  

        if (!offers.length) {
           return  res.status(STATUS_CODES.NOT_FOUND).json({
                status:"error",
                message:"Offers not found"
            })
            
        }
    
        return res.status(STATUS_CODES.OK).json({ 
            status:"success",
            message:"",
            offers
        });
        
    } catch (error) {
        console.log(error)
       return  res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: "Server Error",
        });
    }
   
}


module.exports = {
    createOffer,
    getOfferById,
    getoffers,
    editOffer,
    deleteOffer,
getAllOffers,
}
