/**
 * Configuração da LP. Lida no build a partir das variáveis de ambiente (ver .env.example).
 * Os valores entram no HTML estático; nenhum segredo deve ser colocado aqui.
 */
const env = import.meta.env;

const read = (key: string, fallback: string): string => {
  // String(): o Vite entrega "true"/"false" do ambiente já como booleano
  const value = String(env[key] ?? '').trim();
  return value ? value : fallback;
};

export const config = {
  whatsappNumber: read('WHATSAPP_NUMBER', '554291391436').replace(/\D/g, ''),
  campaignCode: read('CAMPAIGN_CODE', 'LP-TIMBERLAND-SPC'),
  leadEndpoint: read('LEAD_ENDPOINT', ''),
  simulatorUrl: read('SIMULATOR_URL', 'https://www.belgotex.com.br/produtos/pisos-vinilicos-lvt/timberland'),
  privacyUrl: read('PRIVACY_URL', 'https://www.belgotex.com.br/politica-de-privacidade'),
  cookiesUrl: read('COOKIES_URL', 'https://www.belgotex.com.br/politica-de-cookies'),
  gtmId: read('GTM_ID', ''),
  siteUrl: read('SITE_URL', 'https://timberland.belgotex.com.br'),
  /** Versão de aprovação (npm run build:approval): pede aos buscadores para não indexar. */
  noindex: read('NOINDEX', '') === 'true',
  productUrl: 'https://www.belgotex.com.br/produtos/pisos-vinilicos-lvt/timberland',
  mainSiteUrl: 'https://www.belgotex.com.br',
} as const;

export type Config = typeof config;
