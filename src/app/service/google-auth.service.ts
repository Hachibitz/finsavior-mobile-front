import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithCredential,
  signInWithPopup, 
  UserCredential, 
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { app } from '../config/firebase-config';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth.service';
import { GOOGLE_LOGIN } from 'src/environments/environment';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { isPlatform, Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {

  private firebaseAuth = getAuth(app);
  private googleProvider = new GoogleAuthProvider();
  isWeb = Capacitor.getPlatform() === 'web';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private platform: Platform
  ) {
    this.platform.ready().then(() => {
      if (isPlatform('capacitor') && (isPlatform('android') || isPlatform('ios'))) {
        GoogleAuth.initialize();
      }
    });
  }

  async signIn(): Promise<{ idToken: string }> {
    if (this.isWeb) {
      return this.signInWeb();
    } else {
      return this.signInNative();
    }
  }

  // Implementação para ambiente web usando signInWithPopup
  private async signInWeb(): Promise<{ idToken: string }> {
    try {
      const result: UserCredential = await signInWithPopup(this.firebaseAuth, this.googleProvider);
      if (result && result.user) {
        const idToken = await result.user.getIdToken();
        return { idToken };
      } else {
        throw new Error('Falha ao obter as credenciais do usuário.');
      }
    } catch (error) {
      throw error;
    }
  }

  private async signInNative(): Promise<{ idToken: string }> {
    try {
      const googleUser = await GoogleAuth.signIn();
      const credential = GoogleAuthProvider.credential(googleUser.authentication.idToken);
      const firebaseUserCredential = await signInWithCredential(this.firebaseAuth, credential);
      const idToken = await firebaseUserCredential.user.getIdToken();
      return { idToken };
    } catch (error) {
      console.error('Erro ao logar com Google no app:', error);
      throw error;
    }
  }

  observeFirebaseAuthState(): Promise<boolean> {
    return new Promise((resolve) => {
      onAuthStateChanged(this.firebaseAuth, async (user) => {
        if (user) {
          try {
            await this.trySilentLoginAndRefreshBackendToken();
            resolve(true);
          } catch (error) {
            resolve(false);
          }
        } else {
          resolve(false);
        }
      });
    });
  }
  

  async trySilentLoginAndRefreshBackendToken(): Promise<void> {
    const user = this.firebaseAuth.currentUser;
    if (user) {
      try {
        const firebaseIdToken = await user.getIdToken();
        await this.googleRefreshSignIn(firebaseIdToken);
      } catch (error) {
        console.error(error);
      }
    } else {
      console.log('User not logged in.');
    }
  }

  async googleRefreshSignIn(firebaseIdToken: String): Promise<{ accessToken: string; refreshToken: string }> {
    return new Promise<{ accessToken: string; refreshToken: string }>((resolve, reject) => {
        this.http.post<{ accessToken: string; refreshToken: string }>(GOOGLE_LOGIN, firebaseIdToken).subscribe({
            next: (result: { accessToken: string; refreshToken: string }) => {
                this.authService.setTokens(result.accessToken, result.refreshToken);
                resolve(result);
            },
            error: (e: HttpErrorResponse) => {
                reject(e);
            },
        });
    });
  }

  async getGoogleProfile(): Promise<{ name: string; email: string }> {
    const user = this.firebaseAuth.currentUser;
    console.log(user)
  
    if (!user) {
      throw new Error('Usuário não está logado no Firebase.');
    }
  
    const name = user.displayName ?? 'Usuário';
    const email = user.email ?? '';
  
    return { name, email };
  }  

  async logoutFromGoogle(): Promise<void> {
    try {
      await signOut(this.firebaseAuth);

      if (!this.isWeb) {
        await GoogleAuth.signOut();
      }
    } catch (error) {
      console.error('Erro ao deslogar do Firebase/Google:', error);
    }
  }
}
