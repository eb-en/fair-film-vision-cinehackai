export interface StaffLoginCredentials {
  username: string;
  password: string;
}

export interface StaffAuthResponse {
  token: string;
  staff: {
    id: string;
    name: string;
    role?: string;
  };
}

export interface TicketType {
  type: string;
  price: number;
  quantity: number;
  totalPrice: number;
}

export interface SeatCategory {
  category: string;
  total?: number;
  available?: number;
  booked: number;
  price: number;
}

export interface CreateShowDto {
  timestamp: Date;
  screen: string;
  theatre: string;
  theatreData: Record<string, any>;
  movieId: string;
  distributorId: string;
  seatCategories: SeatCategory[];
}

export interface BookingEntry {
  id?: string;
  movieId: string;
  movieName: string;
  theaterName: string;
  screenName: string;
  showTiming: string;
  ticketTypes: TicketType[];
  totalTickets: number;
  totalAmount: number;
  createdAt?: string;
}

export type CreateBookingInput = Omit<BookingEntry, 'id' | 'createdAt'>;
