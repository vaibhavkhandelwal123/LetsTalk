import axios from "axios";
export const baseURL = "https://letstalk-backend-gpfn.onrender.com";
export const httpClient = axios.create({
    baseURL: baseURL,
    headers: {
    "Content-Type": "text/plain",
  },
})