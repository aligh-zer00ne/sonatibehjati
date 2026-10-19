export interface SMSService {
  // Console OTP generates its own code; shared templates deliver the supplied code.
  sendOTP(phoneNumber: string, code: string): Promise<string | void>;
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
