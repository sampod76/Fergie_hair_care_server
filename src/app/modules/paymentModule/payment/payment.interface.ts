type BusinessProfile = {
  mcc?: string;
  name?: string;
  product_description?: string;
  support_address?: Address;
};

type Address = {
  city: string;
  country: string;
  countryShortForm: string;
  line1?: string;
  line2?: string;
  postalCode: string;
  state: string;
};

type BankInfo = {
  account_holder_name: string;
  account_holder_type: string;
  account_number: string;
  countryShortForm: string;
  currency: string;
  routing_number: string;
};

export type ICreateStripeConnectAccount = {
  fullName?: string;
  phoneNumber: string;
  dateOfBirth: Date;
  userId: string;
  address: Address;
  bankInfo: BankInfo;
  business_profile?: BusinessProfile;
  company_address?: Address;
};

///
//
//
type CardDetails = {
  reference: string;
  reference_status: string;
  reference_type: string;
  type: string;
};

type DestinationDetails = {
  card: CardDetails;
  type: string;
};

export type IRefund = {
  id: string;
  object: string;
  amount: number;
  balance_transaction: string;
  charge: string;
  created: number;
  currency: string;
  destination_details: DestinationDetails;
  metadata: any; // You can define a more specific type for metadata if needed
  payment_intent: string;
  reason: string | null;
  receipt_number: string | null;
  source_transfer_reversal: any | null; // You can define a more specific type if needed
  status: string;
  transfer_reversal: any | null; // You can define a more specific type if needed
};

//
//
//
type FeeDetail = {
  /* Define properties of fee detail if needed */
};

export type IBalanceTransaction = {
  id: string;
  object: string;
  amount: number;
  available_on: number;
  created: number;
  currency: string;
  description: string | null;
  exchange_rate: number | null;
  fee: number;
  fee_details: FeeDetail[];
  net: number;
  reporting_category: string;
  source: string;
  status: 'available' | string;
  type: string;
};
