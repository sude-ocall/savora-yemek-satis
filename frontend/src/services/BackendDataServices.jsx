import http from "./http-common";

const config = (token) => ({
    headers: {
        Authorization: `Bearer ${token}`
    }
});

class BackendDataService {

    /*********************** USERS ***********************/
    registerUser(data) {
        return http.post("/users/register", data);
    }

    loginUser(data) {
        return http.post("/users/login", data);
    }

    getUserProfile(token) {
        return http.get("/users/profile", config(token));
    }

    updateUserProfile(data, token) {
        return http.put("/users/profile", data, config(token));
    }

    updatePassword(data, token) {
        return http.put("/users/password", data, config(token));
    }

    deleteUser(token) {
        return http.delete("/users/account", config(token));
    }

    addAddress(data, token) {
        return http.post("/users/addresses", data, config(token));
    }

    deleteAddress(index, token) {
        return http.delete(`/users/addresses/${index}`, config(token));
    }

    addCreditCard(data, token) {
        return http.post("/users/cards", data, config(token));
    }

    deleteCreditCard(index, token) {
        return http.delete(`/users/cards/${index}`, config(token));
    }

    /*********************** SELLERS ***********************/
    registerSeller(data) {
        return http.post("/sellers/register", data);
    }

    loginSeller(data) {
        return http.post("/sellers/login", data);
    }

    updateSellerProfile(data, token) {
        return http.put("/sellers/profile", data, config(token));
    }

    getSellers() {
        return http.get("/sellers/");
    }

    /*********************** PRODUCTS ***********************/
    getProducts() {
        return http.get("/products/");
    }

    getProductById(id) {
        return http.get(`/products/${id}`);
    }

    createProduct(data, token) {
        return http.post("/products/", data, config(token));
    }

    updateProduct(id, data, token) {
        return http.put(`/products/${id}`, data, config(token));
    }

    deleteProduct(id, token) {
        return http.delete(`/products/${id}`, config(token));
    }

    /*********************** ORDERS ***********************/
    createOrder(data, token) {
        return http.post("/orders/", data, config(token));
    }

    getUserOrders(token) {
        return http.get("/orders/", config(token));
    }

    cancelOrder(id, token) {
        return http.delete(`/orders/${id}`, config(token));
    }

    updateOrderStatus(id, data, token) {
        return http.put(`/orders/${id}/status`, data, config(token));
    }

    getSellerOrders(token) {
        return http.get("/orders/seller", config(token));
    }

    /*********************** OFFERS ***********************/
    createOfferRequest(data, token) {
        return http.post("/offers/", data, config(token));
    }

    getUserOffers(token) {
        return http.get("/offers/my", config(token));
    }

    acceptOffer(data, token) {
        return http.post("/offers/accept", data, config(token));
    }

    getOpenOffers(token) {
        return http.get("/offers/open", config(token));
    }

    addRestaurantOffer(offerId, data, token) {
        return http.post(`/offers/${offerId}`, data, config(token));
    }
    /*********************** REVIEWS ***********************/
    getReviews(sellerId) {
        return http.get(`/reviews/${sellerId}`);
    }

    addReview(sellerId, data, token) {
        return http.post(`/reviews/${sellerId}`, data, config(token));
    }

}

export default new BackendDataService();