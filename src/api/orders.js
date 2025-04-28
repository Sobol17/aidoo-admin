import axiosInst from "@/api/axios.instance";

const API_URL = "/orders";

export const getOrders = (profileID = "", status, search, page, limit) => {
  return axiosInst
    .get(
      `${API_URL}?profile_id=${profileID}&status=${status}&page=${page}&limit=${limit}&search=${search}`,
    )
    .then((res) => res.data);
};
