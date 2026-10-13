import { initAnalytics } from './analytics';
import { initWhatsApp } from './whatsapp';
import { initConsent } from './consent';
import { captureUtms } from './utm';
import { initAperture, initFloor } from './aperture';
import { initLayers } from './layers';

export function initPage(cfg: { whatsapp: string; campaign: string; gtmId: string }): void {
  captureUtms();
  initAnalytics();
  initWhatsApp(cfg.whatsapp, cfg.campaign);
  initConsent(cfg.gtmId);
  initAperture();
  initFloor();
  initLayers();
  document.querySelector('[data-consent-reopen]')?.addEventListener('click', () => {
    try {
      localStorage.removeItem('lp_timberland_consent_v1');
    } catch {
      /* ignora */
    }
    location.reload();
  });
}
