import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { catchError, from, mergeMap, Observable, switchMap, throwError } from 'rxjs';
import { AuthService } from '../service/auth.service';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class TokenInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
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
          catchError(error => {
            if (error.status === 401) {
              return from(this.authService.refreshToken()).pipe(
                mergeMap(newToken => {
                  const clonedRequest = request.clone({
                    setHeaders: {
                      Authorization: `Bearer ${newToken}`,
                      "ngrok-skip-browser-warning": "69420",
                    },
                  });
  
                  return next.handle(clonedRequest);
                }),
                catchError(refreshError => {
                  this.router.navigate(['login']);
                  return throwError(() => refreshError);
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
