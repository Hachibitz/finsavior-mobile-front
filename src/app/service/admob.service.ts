import { Injectable } from '@angular/core';
import {
  AdMob,
  AdOptions,
  RewardAdPluginEvents,
  AdMobRewardItem,
  RewardAdOptions,
  AdmobConsentDebugGeography,
  AdmobConsentStatus,
  RewardInterstitialAdOptions
} from '@capacitor-community/admob';
import { FsCoinService } from './fs-coin-service';
import { UserService } from './user.service';
import { PlanCoverageEnum } from '../model/payment.model';

@Injectable({ providedIn: 'root' })
export class AdmobService {

  rewardUnitId = 'ca-app-pub-8908695655155734/3818568263';
  rewardUnitIdTesting = 'ca-app-pub-3940256099942544/5224354917'; // ID de teste do AdMob
  rewardUnitInterstitialId = 'ca-app-pub-8908695655155734/9208595934';

  constructor(
    private fsCoinService: FsCoinService,
    private userService: UserService,
  ) {}

  async initialize() {
    await AdMob.initialize();

    // Solicita consentimento apenas se necessário (GDPR/LGPD)
    const consentInfo = await AdMob.requestConsentInfo({
      debugGeography: AdmobConsentDebugGeography.NOT_EEA, // ou .EEA para testes
      //testDeviceIdentifiers: ['YOUR_TEST_DEVICE_ID'] // opcional em produção
    });

    if (
      consentInfo.isConsentFormAvailable &&
      consentInfo.status === AdmobConsentStatus.REQUIRED
    ) {
      await AdMob.showConsentForm();
    }
  }

  async showRewardedInterstitial(): Promise<AdMobRewardItem | null> {
    return new Promise(async (resolve, reject) => {
      // Listener: Anúncio carregado
      AdMob.addListener(RewardAdPluginEvents.Loaded, () => {
        console.log('Rewarded interstitial ad loaded');
      });

      // Listener: Falha ao carregar
      AdMob.addListener(RewardAdPluginEvents.FailedToLoad, (err) => {
        console.warn('Rewarded interstitial ad failed to load', err);
        reject(err);
      });

      // Listener: Usuário recompensado
      AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward: AdMobRewardItem) => {
        console.log('User rewarded (interstitial)', reward);
        this.fsCoinService.earnCoins()
        resolve(reward);
      });

      // Listener: Anúncio fechado sem recompensa
      AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
        console.log('Rewarded interstitial ad dismissed');
        resolve(null);
      });

      // Prepara e exibe o anúncio
      const options: RewardInterstitialAdOptions = {
        adId: this.rewardUnitInterstitialId,
        isTesting: false
      };

      try {
        await AdMob.prepareRewardInterstitialAd(options);
        await AdMob.showRewardInterstitialAd();
      } catch (err) {
        console.error('Erro ao exibir interstitial', err);
        reject(err);
      }
    });
  }

  async showRewardedAd(): Promise<AdMobRewardItem | null> {
    if(await this.checkUserPlan()) {
      console.log('Usuário com plano pago, não exibindo anúncio');
      return null;
    }
    
    return new Promise(async (resolve, reject) => {
      AdMob.addListener(RewardAdPluginEvents.Loaded, () => {
        console.log('Rewarded ad loaded');
      });

      AdMob.addListener(RewardAdPluginEvents.FailedToLoad, (err) => {
        console.warn('Rewarded failed to load', err);
        reject(err);
      });

      AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward: AdMobRewardItem) => {
        console.log('User rewarded', reward);
        resolve(reward);
      });

      AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
        console.log('Rewarded ad dismissed');
        resolve(null);
      });

      const options: RewardAdOptions = {
        adId: this.rewardUnitId,
        isTesting: false
      };

      await AdMob.prepareRewardVideoAd(options);
      await AdMob.showRewardVideoAd();
    });
  }

  private async checkUserPlan(): Promise<boolean> {
    try {
      const result = await this.userService.getProfileData();
      return result?.plan?.planId !== PlanCoverageEnum.FREE.planId;
    } catch (error) {
      console.error('Erro ao verificar plano do usuário:', error);
      return false;
    }
  }
}
