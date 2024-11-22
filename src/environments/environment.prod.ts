export const environment = {
  production: true
};

export const URL_BASE_DEV = 'https://e3b3-187-19-226-220.ngrok-free.app'

export const USER_SERVICE = "/users";
export const BILL_SERVICE = "/bills";
export const AUTH_SERVICE = "/auth";
export const AI_ADVICE_SERVICE = "/ai-advice";
export const PAYMENT_SERVICE = '/payment';
export const TERMS_AND_PRIVACY_SERVICE = '/terms-and-privacy';

export const SERVICE_LOGIN = URL_BASE_DEV + AUTH_SERVICE + '/login-auth';
export const SIGNUP_SERVICE = URL_BASE_DEV + AUTH_SERVICE + '/signup';
export const VALIDATE_TOKEN_SERVICE = URL_BASE_DEV + AUTH_SERVICE + '/validate-token';
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
export const LOAD_PAYMENT_CARD_TABLE_DATA = URL_BASE_DEV + BILL_SERVICE + '/load-payment-card-table-data';
export const DELETE_ITEM_MAIN_TABLE = URL_BASE_DEV + BILL_SERVICE + '/delete-item-table-main';
export const DELETE_ITEM_CARD_TABLE = URL_BASE_DEV + BILL_SERVICE + '/delete-item-table-card';
export const EDIT_ITEM_MAIN_TABLE = URL_BASE_DEV + BILL_SERVICE + '/edit-item-table-main';
export const EDIT_ITEM_CARD_TABLE = URL_BASE_DEV + BILL_SERVICE + '/edit-item-table-card';
export const GENERATE_AI_ADVICE = URL_BASE_DEV + AI_ADVICE_SERVICE + '/generate-ai-advice-and-insights';
export const DELETE_AI_ANALYSIS = URL_BASE_DEV + AI_ADVICE_SERVICE + '/delete-analysis';
export const GET_AI_ADVICE = URL_BASE_DEV + AI_ADVICE_SERVICE + '/get-ai-advice-and-insights';
export const CREATE_SUBSCRIPTION = URL_BASE_DEV + PAYMENT_SERVICE + '/create-subscription';

export const CLIENT_ID = 'ARBQ9WR2ziMtCYL7jaVFixfJqueUZFrFx1W_tlWdqTCjJf8wSoST6DZrRq9JQb3tqvOVDHmJ9drge69f';
export const CLIENT_SECRET = 'EL4A37GecMI5wji0sOuJ1MT8lQGR9PJzjZozSCxkBup3p1bih2A5irWjZWNSkFYaQURk5ZHbejWxdQPr';

export const GET_TERMS = URL_BASE_DEV + TERMS_AND_PRIVACY_SERVICE + '/get-terms';
export const GET_PRIVACY_POLICY = URL_BASE_DEV + TERMS_AND_PRIVACY_SERVICE + '/get-privacy-policy';