export interface Event {
  id: string;
  title: string;
  description?: string;
  category: string;
  eventDate: string;
  isPublic: boolean;
  createdAt: string;

  createdBy?: {
    id: string;
    name: string;
    email?: string;
  };
}