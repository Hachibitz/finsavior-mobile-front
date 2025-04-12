import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { catchError, from, mergeMap, Observable, switchMap, throwError } from 'rxjs';
import { AuthService } from '../service/auth.service';
import { Router } from '@angular/router';
import { GoogleAuthService } from '../service/google-auth.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router,
    private googleAuthService: GoogleAuthService
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const publicRoutes = ['/login', '/register', '/landing-page', '/password-forgotten'];
    const currentUrl = this.router.url;

    if (currentUrl.includes('/ticket')) {
      return from(this.authService.getToken()).pipe(
        mergeMap(token => {
          if (token) {
            request = request.clone({
              setHeaders: {
                Authorization: `Bearer ${token}`,
                "ngrok-skip-browser-warning": "69420",
              },
            });
          }
          return next.handle(request);
        })
      );
    }
  
    if (publicRoutes.some(route => currentUrl.startsWith(route))) {
      return next.handle(request);
    }
  
    return from(this.authService.getToken()).pipe(  
      mergeMap(token => {
        if (token) {
          request = request.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "69420",
            },
          });
        }
    
        return next.handle(request).pipe(
          catchError((error: HttpErrorResponse) => {
            if (error.status === 401 || error.status === 403) {
              return from(this.authService.refreshToken()).pipe(
                mergeMap((newToken) => {
                  const clonedRequest = request.clone({
                    setHeaders: {
                      Authorization: `Bearer ${newToken}`,
                      "ngrok-skip-browser-warning": "69420",
                    },
                  });
                  return next.handle(clonedRequest);
                }),
                catchError(refreshError => {
                  return from(this.googleAuthService.observeFirebaseAuthState()).pipe(
                    switchMap(success => {
                      if (success) {
                        return from(this.authService.getToken()).pipe(
                          switchMap(recoveredToken => {
                            if (recoveredToken) {
                              const retryRequest = request.clone({
                                setHeaders: {
                                  Authorization: `Bearer ${recoveredToken}`,
                                  "ngrok-skip-browser-warning": "69420",
                                },
                              });
                              return next.handle(retryRequest);
                            }
    
                            this.router.navigate(['/login']);
                            return throwError(() => refreshError);
                          })
                        );
                      }
    
                      this.router.navigate(['/login']);
                      return throwError(() => refreshError);
                    }),
                    catchError(firebaseError => {
                      this.router.navigate(['/login']);
                      return throwError(() => firebaseError);
                    })
                  );
                })
              );
            }
    
            return throwError(() => error);
          })
        );
      })
    );    
  }
}