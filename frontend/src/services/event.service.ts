import api from "@/lib/axios";

export const getEvents = async (sortBy?: string, order?: string) => {
  const params: any = {};
  if (sortBy) params.sortBy = sortBy;
  if (order) params.order = order;
  const response = await api.get("/events", { params });
  return response.data;
};

export const createEvent = async (data: {
  title: string;
  description: string;
  category: string;
  eventDate: string;
  isPublic: boolean;
}) => {
  const response = await api.post("/events", data);
  return response.data;
};

export const getEventById = async (
  id: string
) => {
  const response = await api.get(
    `/events/${id}`
  );

  return response.data;
};

export const deleteEvent = async (
  id: string
) => {
  const response = await api.delete(
    `/events/${id}`
  );

  return response.data;
};

export const updateEvent = async (
  id: string,
  data: any
) => {
  const response = await api.put(
    `/events/${id}`,
    data
  );

  return response.data;
};