import { AnalysisTypeEnum } from "./ai-advice.model";

export interface Plan {
  planId: string;
  planDs: string;
}

export const PlanEnum: Plan[] = [
  { planId: "1L", planDs: "FREE" },
  { planId: "prod_S4glYFmVdBHCgV", planDs: "BASIC" },
  { planId: "prod_S4gn06jEDZZ0Sk", planDs: "BASIC" },
  { planId: "prod_S4goVk8ymnbNd7", planDs: "PLUS" },
  { planId: "prod_S4goyrBbOeFrR2", planDs: "PLUS" },
  { planId: "prod_S4gsYwP1g3VUYG", planDs: "PREMIUM" },
  { planId: "prod_S4gq1Q2s1Et4tm", planDs: "PREMIUM" },
];


export const PlanCoverageEnum = {
  FREE: {
    planId: "1L",
    coverages: [AnalysisTypeEnum.FREE],
  },
  BASIC: {
    planIdList: ["prod_S4glYFmVdBHCgV", "prod_S4gn06jEDZZ0Sk"],
    coverages: [AnalysisTypeEnum.FREE, AnalysisTypeEnum.TRIMESTER],
  },
  PLUS: {
    planIdList: ["prod_S4goVk8ymnbNd7", "prod_S4goyrBbOeFrR2"],
    coverages: [AnalysisTypeEnum.FREE, AnalysisTypeEnum.TRIMESTER, AnalysisTypeEnum.ANNUAL],
  },
  PREMIUM: {
    planIdList: ["prod_S4gsYwP1g3VUYG", "prod_S4gq1Q2s1Et4tm"],
    coverages: [AnalysisTypeEnum.FREE, AnalysisTypeEnum.TRIMESTER, AnalysisTypeEnum.ANNUAL],
  },
};

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
