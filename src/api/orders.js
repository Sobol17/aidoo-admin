import axiosInst from "@/api/axios.instance";

const API_URL = "/orders";

export const getOrders = (profileID = "", status, page, limit) => {
  return axiosInst
    .get(
      `${API_URL}?profile_id=${profileID}&status=${status}&page=${page}&limit=${limit}`,
    )
    .then((res) => res.data);
};
