export const CART_MESSAGES = {
    ADD_TO_CART_SUCCESS: 'Item added to cart',
    ADD_TO_CART_FAILURE: 'Failed to add item to cart',
    CART_EMPTY_MSG: "Your cart is empty. Please add items before placing an order.",
}

export const WISHLIST_MESSAGES = {
    ADD_SUCCESS: 'Added to Wishlist',
    REMOVE_SUCCESS: 'Removed from Wishlist',
    UPDATE_FAILURE: 'Failed to update wishlist',
    REMOVE_FAILURE: "Error removing product:"
};

export const CATEGORY_MESSAGES = {
    VALIDATION_MSG: "Category must be of atmost 15 characters long",
    CATEGORY_ADD_SUCCESS: 'Category created successfully',
    CATEGORY_ADD_FAILURE: "Unexpected response, try again.",
    CATEGORY_DLT_SUCCESS: " Deleted Successfully",
    CATEGORY_DLT_FAILURE: "Failure in deletion",
    CATEGORY_UPDATE_SUCCESS: "Category updated successfully!",
    CATEGORY_UPDATE_FAILURE: "Failed to update the category.",

}

export const COUPON_MESSAGES = {
    COUPON_ADD_FAILURE: "Failed to add coupon",
    COUPON_DLT_SUCCESS: "Deleted Successfully",
    COUPON_DLT_FAILURE: "Failure in deletion",
    COUPON_UPDATE_SUCCESS: 'Coupon Edited successfully!',
    COUPON_UPDATE_FAILURE: "Error updating coupon",
    COUPON_APPLY_SUCCESS: "",
    COUPON_APPLY_FAILURE: "Failed to apply coupon.",
    COUPON_REMOVE_FAILURE: "Failed to remove coupon."
}

export const OFFER_MESSAGES = {
    OFFER_ADD_FAILURE: "Failed to add offer",
    OFFER_UPDATE_SUCCESS: 'Offer Edited successfully!',
    OFFER_UPDATE_FAILURE: "Error updating offer",
    OFFER_DLT_SUCCESS: " Deleted Successfully",
    OFFER_DLT_FAILURE: "Failed to delete"
}

export const ORDER_MESSAGES = {
    ORDER_STATUS_UPDATE_SUCCESS: "Item status updated successfully",
    ORDER_STATUS_UPDATE_FAILURE: "Error updating item status",
    ORDER_SUCCESS: "Order Placed successfully",
    ORDER_PLACE_FAILURE: "Failed to place order",
    ORDER_CANCEL_FAILURE: "Failed to cancel order. Please try again.",
    ORDER_RETURN_MSG: "Return request sent",
    ORDER_RETURN_FAILURE: "Failed to send return request"

}

export const PRODUCT_MESSAGES = {
    IMG_UPLOAD_MSG: "Please upload at least one image.",
    PRODUCT_ADD_SUCCESS: 'Product added successfully!',
    PRODUCT_ADD_FAILURE: 'Failed to add product',
    PRODUCT_UPDATE_SUCCESS: 'Product Edited successfully!',
    PRODUCT_UPDATE_FAILURE: 'Failed to edit product',
    PRODUCT_DLT_SUCCESS: " Deleted Successfully",
    PRODUCT_DLT_FAILURE: "Failed to delete",
}

export const USER_MESSAGES = {
    USER_DLT_SUCCESS: " Deleted Successfully",
    USER_DLT_FAILURE: "Failed to delete",
    USER_VALIDATION_MSG: "Please enter your email.",
    USER_VALIDATION_EMAIL: "Enter a valid email",
    USER_OTP_SENT: "OTP sent to your email!",
    USER_OTP_SENT_FAILURE: "Failed to send OTP.",
    USER_BLOCK_MSG: "You are blocked",
    USER_LOGIN_ERROR: "Login Error",
    USER_LOGIN_FAILURE: "Login failed. Please check your credentials.",
    USER_OTP_VALIDATION: "Please enter a 6-digit OTP.",
    USER_OTP_SUCCESS: "OTP Verified Successfully!",
    USER_OTP_FAILURE: "Invalid OTP. Please try again.",
    USER_OTP_RESEND_FAIL: "Failed to resend OTP. Try again later.",
    USER_PASSWD_RESET_FAILURE: "Failed to reset password",
    USER_REGISTER_SUCCESS: "User successfully registered",
    USER_REGISTER_FAILURE: "Registration failed",
    USER_ADDRESS_DLT_SUCCESS: "Address deleted successfully!",
    USER_ADDRESS_DLT_FAILURE: "Error deleting address.",
    USER_PIC_SUCCESS: 'Profile pic added successfully!',
    USER_PIC_EDIT_FAILURE: 'Failed to edit product',
    USER_PIC_DLT_FAILURE: "Error deleting image:",
    USER_ADDRESS_ADD_SUCCESS: 'Address added successfully!',
    USER_ADDRESS_ADD_FAILURE: 'Failed to add address',
    USER_PASSWORD_CHANGE_FAILURE: "Something went wrong with password change",
    USER_ADDRESS_EDIT_SUCCESS: "Address Edited successfully!",
    USER_ADDRESS_EDIT_FAILURE: "Failed to update address",
    USER_NAME_VALIDATION: "Name must be maximum of 25 characters long",
    USER_EMAIL_VERIFY: "Email verified & User updated!",
    USER_REFERRAL_CODE_ERROR: "Failed to generate code",

}
export const PAYMENT_MESSAGES = {
    PAYMENT_INITIALIZATION_FAILURE: "Payment initialization failed",
}

export const ERROR_MESSAGE = "Error removing product"

export const PASSWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const ZIP_REGEX = /^[1-9][0-9]{5}$/;
export const PHONE_REGEX = /^\d{10}$/
export const NAME_REGEX = /^[A-Za-z\s]+$/
export const SIZE_REGEX = /^\d+Lx\d+Bx\d+Hcm$/i