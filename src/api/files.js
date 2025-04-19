import axiosInst from "@/api/axios.instance";

const API_URL = "/files";

export const uploadFile = (binaryFile) =>
  axiosInst.post(`${API_URL}`, binaryFile).then((res) => res.data);

export const getFileById = (fileId) =>
  axiosInst.get(`${API_URL}/${fileId}`).then((res) => res.data);
