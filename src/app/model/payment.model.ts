import { AnalysisTypeEnum } from "./ai-advice.model";

export interface Plan {
  planId: string;
  planDs: string;
}

export const PlanEnum: Plan[] = [
  { planId: "1L", planDs: "FREE" },
  { planId: "P-2BA47576SC596340BMZMJJRQ", planDs: "PLUS" },
  { planId: "3L", planDs: "PREMIUM" },
];

export const PlanCoverageEnum = {
  FREE: { planId: "1L", coverages: [AnalysisTypeEnum.FREE] },
  PLUS: {
    planId: "P-2BA47576SC596340BMZMJJRQ",
    coverages: [
      AnalysisTypeEnum.FREE,
      AnalysisTypeEnum.TRIMESTER,
      AnalysisTypeEnum.ANNUAL,
    ],
  },
  PREMIUM: {
    planId: "3L",
    coverages: [
      AnalysisTypeEnum.FREE,
      AnalysisTypeEnum.TRIMESTER,
      AnalysisTypeEnum.ANNUAL,
    ],
  },
};

export const PLANS_LIST = [
  {
    id: "P-2TA181839T788105KMZLY6NY",
    name: "PREMIUM",
    price: 10.99,
  },
  {
    id: "P-2BA47576SC596340BMZMJJRQ",
    name: "PLUS",
    price: 5.99,
  },
];

export interface SubscriptionRequest {
  planId: string;
  externalUserId: string;
  subscriptionId: string;
  intent: string;
  status: string;
  purchaseUnits: PurchaseUnit[];
  payer: Payer;
  createTime: Date;
}

export interface Payer {
  name: Name;
  externalEmailAddress: string;
  externalPayerId: string;
}

export interface Name {
  fullName: string;
  givenName: string;
  surName: string;
}

export interface Payee {
  emailAddress: string;
  merchantId: string;
}

export interface PurchaseAmount {
  currencyCode: string;
  value: string;
}

export interface PurchaseUnit {
  referenceId: string;
  amount: PurchaseAmount;
  payee: Payee;
}

export interface SubscriptionPaypalData {
  id: string;
  intent: string;
  status: string;
  purchase_units: PurchaseUnitPaypalDetails[];
  payer: PayerPaypalDetails;
  create_time: string;
  links: Link[];
}

export interface PurchaseUnitPaypalDetails {
  reference_id: string;
  amount: PurchaseAmount;
  payee: Payee;
  shipping: Shipping;
}

export interface Shipping {
  name: Name;
  address: AddressPaypalDetails;
}

export interface AddressPaypalDetails {
  address_line_1: string;
  address_line_2: string;
  admin_area_2: string;
  admin_area_1: string;
  postal_code: string;
  country_code: string;
}

export interface PayerPaypalDetails {
  name: NamePaypalDetails;
  email_address: string;
  payer_id: string;
  address: AddressPaypalDetails;
}

export interface NamePaypalDetails {
  full_name: string;
  given_name: string;
  surname: string;
}

export interface Link {
  href: string;
  rel: string;
  method: string;
}
