import { Routes } from '@angular/router';
import { AuthGuard } from './security/AuthGuard';

export const routes: Routes = [
  {
    path: 'home',
    redirectTo: 'landing-page',
    //loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'landing-page',
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
    path: 'password-forgotten',
    loadComponent: () => import('./password-forgotten/password-forgotten.page').then( m => m.PasswordForgottenPage)
  },
  {
    path: 'password-forgotten/:token',
    loadComponent: () => import('./password-forgotten/password-forgotten.page').then(m => m.PasswordForgottenPage)
  },
  {
    path: 'main-page',
    canActivate: [AuthGuard],
    loadComponent: () => import('./main-page/main-page.page').then( m => m.MainPageComponent),
    children: [
      {
        path: 'debits',
        canActivate: [AuthGuard],
        loadComponent: () => import('./main-debits/main-debits.page').then(m => m.MainDebitsPage)
      },
      {
        path: 'assets',
        canActivate: [AuthGuard],
        loadComponent: () => import('./main-assets/main-assets.page').then(m => m.MainAssetsPage)
      },
      {
        path: 'summary',
        canActivate: [AuthGuard],
        loadComponent: () => import('./main-summary/main-summary.page').then(m => m.MainSummaryPage)
      },
      {
        path: 'ai-analysis',
        canActivate: [AuthGuard],
        loadComponent: () => import('./ai-analysis/ai-analysis.page').then( m => m.AiAnalysisPage)
      },
      {
        path: 'card-details',
        canActivate: [AuthGuard],
        loadComponent: () => import('./main-card-details/main-card-details.page').then( m => m.MainCardDetailsPage)
      },
      {
        path: 'subscription',
        canActivate: [AuthGuard],
        loadComponent: () => import('./subscription/subscription.page').then( m => m.SubscriptionPage)
      },
    ]
  },
  {
    path: 'my-account',
    canActivate: [AuthGuard],
    loadComponent: () => import('./my-account/my-account.page').then( m => m.MyAccountPage)
  },
  {
    path: 'billtypes-guide',
    canActivate: [AuthGuard],
    loadComponent: () => import('./billtypes-guide/billtypes-guide.page').then( m => m.BilltypesGuidePage)
  },
  {
    path: 'landing-page',
    loadComponent: () => import('./landing-page/landing-page.page').then( m => m.LandingPagePage)
  },
  {
    path: 'ticket',
    loadComponent: () => import('./ticket/ticket.page').then( m => m.TicketPage)
  },
  {
    path: 'savi-ai-assistant-chat',
    loadComponent: () => import('./chat-ai/chat-ai.page').then( m => m.ChatAiPage)
  },
];
