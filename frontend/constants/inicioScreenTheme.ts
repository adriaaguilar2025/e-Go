/** Shared light/dark palette for map (index) and garage (car) tab screens. */
export type InicioScreenTheme = {
  screenBg: string;
  mutedText: string;
  cardBg: string;
  titleText: string;
  subtitleText: string;
  border: string;
  inputBorder: string;
  textPrimary: string;
  textEmphasis: string;
  handle: string;
  infoTitle: string;
  promotorText: string;
  menuBackdrop: string;
  themeSegmentBg: string;
  themeOptionActiveBg: string;
  themeOptionText: string;
  themeOptionTextActive: string;
  errorBannerBg: string;
  reportBackdrop: string;
  formBorder: string;
  chipBg: string;
  chipText: string;
  secondaryButtonBg: string;
  secondaryButtonText: string;
  labelText: string;
};

export const INICIO_SCREEN_THEME: Record<'dark' | 'light', InicioScreenTheme> = {
  dark: {
    screenBg: '#0f172a',
    mutedText: '#94a3b8',
    cardBg: '#1e293b',
    titleText: '#f1f5f9',
    subtitleText: '#94a3b8',
    border: '#334155',
    inputBorder: '#334155',
    textPrimary: '#f1f5f9',
    textEmphasis: '#e2e8f0',
    handle: '#475569',
    infoTitle: '#f1f5f9',
    promotorText: '#cbd5e1',
    menuBackdrop: 'rgba(0,0,0,0.55)',
    themeSegmentBg: '#334155',
    themeOptionActiveBg: '#0f172a',
    themeOptionText: '#cbd5e1',
    themeOptionTextActive: '#f1f5f9',
    errorBannerBg: '#7f1d1d',
    reportBackdrop: 'rgba(0,0,0,0.6)',
    formBorder: '#475569',
    chipBg: '#334155',
    chipText: '#cbd5e1',
    secondaryButtonBg: '#334155',
    secondaryButtonText: '#e2e8f0',
    labelText: '#cbd5e1',
  },
  light: {
    screenBg: '#f5f5f5',
    mutedText: '#64748b',
    cardBg: '#fff',
    titleText: '#1a1a1a',
    subtitleText: '#6b7280',
    border: '#e2e8f0',
    inputBorder: '#e5e7eb',
    textPrimary: '#1f2937',
    textEmphasis: '#111827',
    handle: '#e2e8f0',
    infoTitle: '#1e293b',
    promotorText: '#94a3b8',
    menuBackdrop: 'rgba(0,0,0,0.4)',
    themeSegmentBg: '#f1f5f9',
    themeOptionActiveBg: '#ffffff',
    themeOptionText: '#475569',
    themeOptionTextActive: '#111827',
    errorBannerBg: '#fee2e2',
    reportBackdrop: 'rgba(0,0,0,0.45)',
    formBorder: '#d1d5db',
    chipBg: '#f8fafc',
    chipText: '#4b5563',
    secondaryButtonBg: '#f3f4f6',
    secondaryButtonText: '#374151',
    labelText: '#374151',
  },
};

export function getInicioScreenPalette(scheme: 'light' | 'dark'): InicioScreenTheme {
  return INICIO_SCREEN_THEME[scheme];
}
