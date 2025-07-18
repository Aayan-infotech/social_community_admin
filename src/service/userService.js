// services/userService.js
import axios from "axios";

export const getUsersPaginated = async ({ queryKey }) => {
  const [_key, page, search] = queryKey;
  const params = new URLSearchParams({ page, limit: 10 });
  if (search) params.append("search", search);
  const { data } = await axios.get(`/users/get-all-users?${params.toString()}`);
  return data?.data;
};

export const deleteUser = async ({ slug }) => {
  return await axios.delete(`/users/delete-user/${slug}`);
};
