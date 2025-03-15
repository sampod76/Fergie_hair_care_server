import { Types } from 'mongoose';
import { z } from 'zod';

// Define the schema for a non-subscription transaction
export const NonSubscriptionTransaction = z.object({
  transactionIdentifier: z.string(),
  revenueCatIdentifier: z.string(),
  productIdentifier: z.string(),
  purchaseDate: z.string(),
});

// Define the schema for entitlements
const Entitlements = z.object({
  all: z.object({}).optional(),
  active: z.object({}).optional(),
  verification: z.enum(['VerificationResult.notRequested']),
});

// // Define the schema for purchase dates
// const PurchaseDates = z.object({
//   [z.string()]: z.string(),
// });

// // Define the schema for expiration dates
// const ExpirationDates = z.object({
//   [z.string()]: z.nullable(z.string()),
// });

// Define the full schema for purchase data
const PurchaseData = z.object({
  entitlements: Entitlements,
  // allPurchaseDates: PurchaseDates,
  activeSubscriptions: z.array(z.unknown()),
  allPurchasedProductIdentifiers: z.array(z.string()),
  nonSubscriptionTransactions: z.array(NonSubscriptionTransaction),
  firstSeen: z.string(),
  originalAppUserId: z.string(),
  // allExpirationDates: ExpirationDates,
  requestDate: z.string(),
  latestExpirationDate: z.nullable(z.string()),
  originalPurchaseDate: z.string(),
  originalApplicationVersion: z.string(),
  managementURL: z.nullable(z.string()),
});
const Purchase_Body_Data = z.object({
  metaData: PurchaseData.deepPartial(),
  productIds: z.array(z.string().or(z.instanceof(Types.ObjectId))),
  packageId: z.string().optional(),
  // only works package renewal
  isRenew: z.boolean().optional(),
  orderId: z.string().optional(),
});

const createManualPayment = z
  .object({
    body: Purchase_Body_Data,
  })
  .refine(({ body }) => {
    return true;
  });

export const PaymentHistoryValidation = {
  createManualPayment,
  Purchase_Body_Data,
};
