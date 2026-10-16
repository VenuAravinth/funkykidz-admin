export type CustomerStatus = "active" | "inactive";

export type CustomerType = "Retail" | "Wholesale" | "VIP" | "Corporate";

export type CustomerGender = "Male" | "Female" | "Other" | "";

export const customerPaymentTermsOptions = ["Immediate", "7 Days", "15 Days", "30 Days", "45 Days", "60 Days"] as const;

export type CustomerPaymentTerms = (typeof customerPaymentTermsOptions)[number];

export interface CustomerGroup {
  id: string;
  name: string;
  discountPercent: number;
  creditAllowed: boolean;
  creditLimit: number;
  paymentTerms: CustomerPaymentTerms;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  dob?: string;
  gender?: CustomerGender;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  groupId: string;
  customerType: CustomerType;
  allowCredit: boolean;
  creditLimit: number;
  paymentTerms: CustomerPaymentTerms;
  notes?: string;
  status: CustomerStatus;
  createdDate: string;
}
