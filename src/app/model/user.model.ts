import { AnalysisTypeEnum } from "./ai-advice.model";
import { Plan } from "./payment.model";

export interface LoginRequest {
  userLogin: string;
  password: string;
  rememberMe: boolean;
}

export interface SignUpRequest {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  passwordConfirmation: string;
  agreement: boolean;
}

export interface SignUpResponse {
  message: string;
}

export interface DeleteAccountAndDataRequest {
  username: string;
  password: string;
  confirmation: boolean;
}

export interface DeleteAccountAndDataResponse {
  status: string;
  message: string;
}

export interface ChangeAccountPasswordRequest {
  username: string;
  currentPassword: string;
  newPassword: string;
}

export interface UserData {
  username: string;
  email: string;
  plan: Plan;
  profilePicture: ArrayBuffer;
}

export interface UploadProfilePictureRequest {
  name: string;
  profilePicture: File;
}