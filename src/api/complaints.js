import axiosInst from "@/api/axios.instance";

const API_URL = "/complaints";

export const getComplaints = (profileID = "", page, limit, status) => {
  return axiosInst
    .get(
      `${API_URL}?profile_id=${profileID}&page=${page}&limit=${limit}&status=${status}`,
    )
    .then((res) => res.data);
};

export const getComplaintsMessages = (
  profileID = "",
  page,
  limit,
  complaintId,
) => {
  return axiosInst
    .get(
      `${API_URL}/messages?profile_id=${profileID}&page=${page}&limit=${limit}&complaint_id=${complaintId}`,
    )
    .then((res) => res.data);
};

export const sendComplaintMessage = (chatData) => {
  return axiosInst
    .post(`${API_URL}/send-message`, chatData)
    .then((res) => res.data);
};

export const getArchivedComplaints = (
  profileID = "",
  complaintId,
  page,
  limit,
) => {
  return axiosInst
    .get(
      `${API_URL}/archived?profile_id=${profileID}&complaint_id=${complaintId}&page=${page}&limit=${limit}`,
    )
    .then((res) => res.data);
};
