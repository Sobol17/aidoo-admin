import axiosInst from "@/api/axios.instance";

const API_URL = "/stats";

export const getStats = (profileID = "") => {
  return axiosInst
    .get(`${API_URL}?profile_id=${profileID}`)
    .then((res) => res.data);
};
