import axios from "axios";
import router from "../router";

const axiosInst = axios.create({
  // baseURL: 'https://backb2b.etfp.ru/api/',
  headers: {
    Authorization: "Bearer " + localStorage.getItem("access_token"),
  },
  withCredentials: true,
});

axiosInst.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (
      error.response &&
      error.response.status === 401 &&
      router.currentRoute.value.path !== "/auth" &&
      router.currentRoute.value.path !== "/reset"
    ) {
      localStorage.removeItem("access_token");
      sessionStorage.removeItem("access_token");
    }
    return Promise.reject(error);
  },
);

export default axiosInst;
