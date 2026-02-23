import api from '../api/axios';

export const getAllMenuItems = async () => {
  const response = await api.get('/menu');
  return response.data;
};

export const getMenuByCategory = async (category) => {
  const response = await api.get(`/menu/category/${category}`);
  return response.data;
};

export const createMenuItem = async (menuData) => {
  const response = await api.post('/menu', menuData);
  return response.data;
};

export const updateMenuItem = async (id, menuData) => {
  const response = await api.put(`/menu/${id}`, menuData);
  return response.data;
};

export const toggleAvailability = async (id) => {
  const response = await api.put(`/menu/${id}/toggle`);
  return response.data;
};

export const deleteMenuItem = async (id) => {
  const response = await api.delete(`/menu/${id}`);
  return response.data;
};
