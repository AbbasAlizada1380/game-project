import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_URL = `${BASE_URL}/agreements/`;
const CUSTOMER_API =  `${BASE_URL}/api/customers/`;

const api = {
  getAgreements: () => axios.get(API_URL),
  getCustomers: () => axios.get(CUSTOMER_API),
  createAgreement: (data) => axios.post(API_URL, data),
  updateAgreement: (id, data) => axios.put(`${API_URL}${id}/`, data),
  deleteAgreement: (id) => axios.delete(`${API_URL}${id}/`),
};

export default api;
