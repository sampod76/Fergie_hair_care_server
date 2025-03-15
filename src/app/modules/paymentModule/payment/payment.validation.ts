import { z } from 'zod';

const createStripePaymentBodyData = z.object({
  products: z.array(
    z.object({
      name: z.string({ required_error: 'Product name is required' }).optional(),
      img: z.string().url().optional(),
      price: z.number().optional(),
      quantity: z.number().optional().default(1),
      productId: z.string({ required_error: 'productId is required' }),
      currency: z.string().default('usd'),
      isTrial: z.boolean().optional(),
    }),
  ),
});

export type IStripePaymentData = z.infer<typeof createStripePaymentBodyData>;

//
//
//
//--------------------------
const BusinessProfileSchema = z.object({
  mcc: z.string().optional(),
  name: z.string({ required_error: 'Business profile name is required' }),
  product_description: z.string({
    required_error: 'product_description is required',
  }),
  // support_address: z
  //   .object({
  //     city: z.string().optional(),
  //     countryShortForm: z.string().optional(),
  //     line1: z.string().optional(),
  //     line2: z.string().optional(),
  //     postal_code: z.string().optional(),
  //     state: z.string().optional(),
  //   })
  //   .optional(),
});

const AddressSchema = z
  .object({
    city: z.string({ required_error: 'city is required' }),
    countryShortForm: z.string({
      required_error: 'countryShortForm is required',
    }),
    line1: z.string().optional(),
    line2: z.string().optional(),
    postal_code: z.string({ required_error: 'postalCode is required' }),
    state: z.string({ required_error: 'state is required' }),
  })
  .optional();

const createStripeConnectAccount = z.object({
  body: z.object({
    // fullName: z.string().optional(),
    // phoneNumber: z
    //   .string({ required_error: 'phone number is required' })
    //   .optional(),
    // dateOfBirth: z
    //   .string({ required_error: 'date of birth is required' })
    //   .optional(),

    address: AddressSchema,
    bankInfo: z.object({
      account_holder_name: z.string({
        required_error: 'account_holder_name is required',
      }),
      account_holder_type: z.string({
        required_error: 'account holder is required',
      }),
      account_number: z.string({
        required_error: 'account number is required',
      }),
      countryShortForm: z
        .string({
          required_error: 'countryShortForm is required',
        })
        .optional(),
      currency: z.string({ required_error: 'currency is required' }),
      // routing_number: z.string({ required_error: 'routing_number is required' }),
      routing_number: z.string().optional(),
    }),
    business_profile: BusinessProfileSchema,
    company_address: AddressSchema.optional(),
  }),
});
const createPaymentStripeZodSchema = z.object({
  body: createStripePaymentBodyData,
});
//
//
const transferZod = z.object({
  body: z.object({
    bags: z.array(z.string()),
    shopId: z.string().optional(),
    percentage: z.number().optional(),
  }),
});
export type IZodCreateStripeConnectAccountType = z.infer<
  typeof createStripeConnectAccount
>;

export const PaymentValidation = {
  createPaymentStripeZodSchema,
  createStripeConnectAccount,
  transferZod,
};
