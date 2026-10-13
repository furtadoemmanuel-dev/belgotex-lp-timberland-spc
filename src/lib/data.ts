import formatsJson from '../content/formats.json';
import patternsJson from '../content/patterns.json';
import environmentsJson from '../content/environments.json';
import documentsJson from '../content/documents.json';
import benefitsJson from '../content/benefits.json';
import technologiesJson from '../content/technologies.json';
import installJson from '../content/install-steps.json';
import faqJson from '../content/faq.json';
import specsJson from '../content/specs.json';
import badgesJson from '../content/badges.json';

export type FormatId = 'padrao' | 'hb' | 'xl';

export interface Format {
  id: FormatId;
  label: string;
  short: string;
  widthCm: number;
  heightCm: number;
  description: string;
  source: string;
  provisional: boolean;
  thickness: string;
  wear: string;
  useClass: string;
}

export interface Pattern {
  id: string;
  code: string;
  name: string;
  slug: string;
  formats: FormatId[];
  skp: string;
  tone: string;
  note: string;
}

export interface Environment {
  id: string;
  pattern: string;
  format: string;
  type: 'residencial' | 'comercial';
  alt: string;
  caption: string;
}

export const formats = formatsJson as Format[];
export const patterns = patternsJson as Pattern[];
export const environments = environmentsJson as Environment[];
export const documents = documentsJson;
export const benefits = benefitsJson;
export const technologies = technologiesJson;
export const installSteps = installJson;
export const faq = faqJson as { q: string; a: string; cta?: 'consultant' | 'sample' }[];
export const specs = specsJson as typeof specsJson & { rows: string[][] };
export const badges = badgesJson;

export const fmtCm = (n: number): string => n.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
export const fmtSize = (f: Format): string => `${fmtCm(f.widthCm)} × ${fmtCm(f.heightCm)} cm`;
