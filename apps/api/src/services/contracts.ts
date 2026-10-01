export interface SMSService {
  sendOTP(phoneNumber: string, code: string): Promise<void>;
}
export interface ShippingAddress {
  province: string;
  city: string;
  latitude?: number;
  longitude?: number;
}
export interface ShippingService {
  calculateShipping(address: ShippingAddress): Promise<number>;
}
export interface Coordinates {
  latitude: number;
  longitude: number;
}
export interface MapService {
  locate(): Promise<Coordinates>;
}
export interface GeocodingService {
  reverse(coordinates: Coordinates): Promise<string | null>;
}
export interface PaymentService {
  createPayment(orderId: string): Promise<{ redirectUrl: string }>;
}
