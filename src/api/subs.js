import axiosInst from "@/api/axios.instance";

const API_URL = "/subscriptions";

export const getSubs = (profileID = "", page, limit) => {
  return axiosInst
    .get(`${API_URL}?profile_id=${profileID}&page=${page}&limit=${limit}`)
    .then((res) => res.data);
};
