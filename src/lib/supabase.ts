/**
 * Compatibility shim — re-exports types from api.ts.
 * All Supabase SDK usage has been removed; this file only exports types.
 */

export type {
  Order,
  OrderFormat,
  OrderStatus,
  PaymentMethod,
  DeliveryMethod,
  Book,
  BookStatus,
  PromoSettings,
  ContactSettings,
  PaymentChannel,
  PaymentsSettings,
  BankSettings,
} from "@/lib/api";
