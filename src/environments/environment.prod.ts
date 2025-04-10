export const environment = {
  production: true,
};

export const URL_BASE_DEV = 'https://www.finsavior.com.br/api'

export const USER_SERVICE = "/user";
export const BILL_SERVICE = "/bill";
export const AUTH_SERVICE = "/auth";
export const AI_ADVICE_SERVICE = "/ai-advice";
export const PAYMENT_SERVICE = '/payment';
export const TERMS_AND_PRIVACY_SERVICE = '/terms-and-privacy';

export const GOOGLE_LOGIN = URL_BASE_DEV + AUTH_SERVICE + '/login-google';
export const SERVICE_LOGIN = URL_BASE_DEV + AUTH_SERVICE + '/login-auth';
export const VALIDATE_LOGIN = URL_BASE_DEV + AUTH_SERVICE + '/validate-login';
export const SIGNUP_SERVICE = URL_BASE_DEV + AUTH_SERVICE + '/signup';
export const VALIDATE_TOKEN_SERVICE = URL_BASE_DEV + AUTH_SERVICE + '/validate-token';
export const REFRESH_TOKEN = URL_BASE_DEV + AUTH_SERVICE + '/refresh-token';
export const DELETE_ACCOUNT_AND_DATA = URL_BASE_DEV + USER_SERVICE + '/delete-account';
export const CHANGE_ACCOUNT_PASSWORD = URL_BASE_DEV + USER_SERVICE + '/change-password';
export const PASSWORD_RESET = URL_BASE_DEV + AUTH_SERVICE + '/reset-password';
export const PASSWORD_RESET_REQUEST = URL_BASE_DEV + AUTH_SERVICE + '/password-recovery';
export const USER_PROFILE = URL_BASE_DEV + USER_SERVICE + '/profile-data';
export const GET_PROFILE_DATA = URL_BASE_DEV + USER_SERVICE + '/get-profile-data';
export const BILLS_SERVICE_BILL_REGISTER = URL_BASE_DEV + BILL_SERVICE + '/bill-register';
export const BILLS_SERVICE_CARD_PAYMENT_REGISTER = URL_BASE_DEV + BILL_SERVICE + '/card-payment-register';
export const LOAD_MAIN_TABLE_DATA = URL_BASE_DEV + BILL_SERVICE + '/load-main-table-data';
export const LOAD_CARD_TABLE_DATA = URL_BASE_DEV + BILL_SERVICE + '/load-card-table-data';
export const LOAD_ASSETS_TABLE_DATA = URL_BASE_DEV + BILL_SERVICE + '/load-assets-table-data';
export const LOAD_PAYMENT_CARD_TABLE_DATA = URL_BASE_DEV + BILL_SERVICE + '/load-payment-card-table-data';
export const DELETE_ITEM = URL_BASE_DEV + BILL_SERVICE + '/delete';
export const EDIT_ITEM = URL_BASE_DEV + BILL_SERVICE + '/edit';
export const GENERATE_AI_ADVICE = URL_BASE_DEV + AI_ADVICE_SERVICE + '/generate-ai-advice-and-insights';
export const DELETE_AI_ANALYSIS = URL_BASE_DEV + AI_ADVICE_SERVICE + '/delete-analysis';
export const GET_AI_ADVICE = URL_BASE_DEV + AI_ADVICE_SERVICE + '/get-ai-advice-and-insights';
export const GET_AI_ADVICE_BY_ID = URL_BASE_DEV + AI_ADVICE_SERVICE + '/get-ai-advice';
export const VALIDATE_HAS_COVERAGE = URL_BASE_DEV + AI_ADVICE_SERVICE + '/validate-has-coverage';
export const CREATE_SUBSCRIPTION = URL_BASE_DEV + PAYMENT_SERVICE + '/subscription/create-subscription';
export const CREATE_CHECKOUT = URL_BASE_DEV + PAYMENT_SERVICE + '/subscription/create-checkout';
export const CANCEL_SUBSCRIPTION = URL_BASE_DEV + PAYMENT_SERVICE + '/subscription/cancel';
export const UPDATE_SUBSCRIPTION = URL_BASE_DEV + PAYMENT_SERVICE + '/subscription/update';
export const CUSTOMER_PORTAL = URL_BASE_DEV + PAYMENT_SERVICE + '/subscription/customer-portal';
export const TICKET_CONTACT = URL_BASE_DEV + '/contact';

export const CLIENT_ID = 'ARBQ9WR2ziMtCYL7jaVFixfJqueUZFrFx1W_tlWdqTCjJf8wSoST6DZrRq9JQb3tqvOVDHmJ9drge69f';
export const CLIENT_SECRET = 'EL4A37GecMI5wji0sOuJ1MT8lQGR9PJzjZozSCxkBup3p1bih2A5irWjZWNSkFYaQURk5ZHbejWxdQPr';

export const GET_TERMS = URL_BASE_DEV + TERMS_AND_PRIVACY_SERVICE + '/get-terms';
export const GET_PRIVACY_POLICY = URL_BASE_DEV + TERMS_AND_PRIVACY_SERVICE + '/get-privacy-policy';