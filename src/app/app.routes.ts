import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.page').then( m => m.RegisterPage)
  },
  {
    path: 'terms-and-privacy-dialog',
    loadComponent: () => import('./terms-and-privacy-dialog/terms-and-privacy-dialog.page').then( m => m.TermsAndPrivacyDialogPage)
  },
  {
    path: 'password-forgotten',
    loadComponent: () => import('./password-forgotten/password-forgotten.page').then( m => m.PasswordForgottenPage)
  },
  {
    path: 'main-page',
    loadComponent: () => import('./main-page/main-page.page').then( m => m.MainPageComponent),
    children: [
      {
        path: 'debits',
        loadComponent: () => import('./main-debits/main-debits.page').then(m => m.MainDebitsPage)
      },
      {
        path: 'assets',
        loadComponent: () => import('./main-assets/main-assets.page').then(m => m.MainAssetsPage)
      },
      {
        path: 'summary',
        loadComponent: () => import('./main-summary/main-summary.page').then(m => m.MainSummaryPage)
      },
      {
        path: 'ai-analysis',
        loadComponent: () => import('./ai-analysis/ai-analysis.page').then( m => m.AiAnalysisPage)
      },
      {
        path: 'card-details',
        loadComponent: () => import('./main-card-details/main-card-details.page').then( m => m.MainCardDetailsPage)
      },
    ]
  },
];
