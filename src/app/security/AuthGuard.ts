import { Injectable } from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from "@angular/router";
import { AuthService } from "../service/auth.service";
import { GoogleAuthService } from "../service/google-auth.service";

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router, private googleAuthService: GoogleAuthService) {}

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    const isAuthenticated = await this.authService.isAuthenticated();
  
    if (isAuthenticated) return true;
  
    const firebaseRestored = await this.googleAuthService.observeFirebaseAuthState();
    if (firebaseRestored) {
      return true;
    }
  
    this.router.navigate(["/login"]);
    return false;
  }  
  
}
