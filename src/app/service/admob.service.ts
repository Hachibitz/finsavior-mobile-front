import { Injectable } from '@angular/core';
import {
  AdMob,
  AdOptions,
  RewardAdPluginEvents,
  AdMobRewardItem,
  RewardAdOptions,
  AdmobConsentDebugGeography,
  AdmobConsentStatus
} from '@capacitor-community/admob';

@Injectable({ providedIn: 'root' })
export class AdmobService {

  rewardUnitId = 'ca-app-pub-8908695655155734/3818568263';
  rewardUnitIdTesting = 'ca-app-pub-3940256099942544/5224354917'; // ID de teste do AdMob

  constructor() {}

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

  async showRewardedAd(): Promise<AdMobRewardItem | null> {
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
}
