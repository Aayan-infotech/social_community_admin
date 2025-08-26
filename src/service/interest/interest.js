import axios from "axios";

// Base URL for interest categories API
const BASE_URL = "interests";

// Get all interest categories with pagination, search, and sorting
export const getAllInterestCategories = async (
  page = 1,
  limit = 10,
  search = "",
  sortBy = "",
  sortOrder = "asc",
  typeFilter = ""
) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    // Add search parameter
    if (search && search.trim()) {
      params.append("search", search);
    }
    
    // Add sorting parameters
    if (sortBy) {
      params.append("sortBy", sortBy);
      params.append("sortOrder", sortOrder);
    }

    // Add type filter
    if (typeFilter) {
      params.append("type", typeFilter);
    }
    
    const response = await axios.get(`${BASE_URL}/getCategory?${params}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch interest categories");
  }
};

// Create new interest category
export const createInterestCategory = async (categoryData) => {
  try {
    const response = await axios.post(`${BASE_URL}/addCategory`, categoryData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to create interest category");
  }
};

// Update interest category
export const updateInterestCategory = async (id, categoryData) => {
  try {
    const response = await axios.put(`${BASE_URL}/updateCategory/${id}`, categoryData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update interest category");
  }
};

// Delete interest category
export const deleteInterestCategory = async (id) => {
  try {
    const response = await axios.delete(`${BASE_URL}/deleteCategory/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to delete interest category");
  }
};



export const getAllInterests = async (
  page = 1,
  limit = 10,
  search = "",
  sortBy = "",
  sortOrder = "asc",
  typeFilter = "",
  categoryFilter = ""
) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    // Add search parameter
    if (search && search.trim()) {
      params.append("search", search);
    }

    // Add sorting parameters
    if (sortBy) {
      params.append("sortBy", sortBy);
      params.append("sortOrder", sortOrder);
    }

    // Add type filter
    if (typeFilter) {
      params.append("type", typeFilter);
    }

    // Add category filter
    if (categoryFilter) {
      params.append("category", categoryFilter);
    }

    const response = await axios.get(`${BASE_URL}/list?${params}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch interests");
  }
};

export const createInterest = async (interestData) => {
  try {
    const response = await axios.post(`${BASE_URL}/add`, interestData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to create interest");
  }
};


export const deleteInterest = async (id) => {
  try {
    const response = await axios.delete(`${BASE_URL}/delete/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to delete interest");
  }
};


export const updateInterest = async (id, interestData) => {
  try {
    const response = await axios.put(`${BASE_URL}/update/${id}`, interestData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update interest");
  }
};