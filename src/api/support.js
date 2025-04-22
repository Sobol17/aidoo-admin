import axiosInst from "@/api/axios.instance";

const API_URL = "/support";

export const getSupports = (profileID = "", page, limit) => {
  return axiosInst
    .get(`${API_URL}?profile_id=${profileID}&page=${page}&limit=${limit}`)
    .then((res) => res.data);
};

export const getSupportMessages = (profileID = "", page, limit, chatId) => {
  return axiosInst
    .get(
      `${API_URL}/messages?profile_id=${profileID}&page=${page}&limit=${limit}&chat_id=${chatId}`,
    )
    .then((res) => res.data);
};

export const sendMessage = (chatData) => {
  return axiosInst
    .post(`${API_URL}/send-message`, chatData)
    .then((res) => res.data);
};
