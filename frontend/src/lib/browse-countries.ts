/** Cùng danh sách với menu lọc trang chủ — khớp `GET /movies?country=` */
export const BROWSE_COUNTRIES = [
  'Việt Nam',
  'Hàn Quốc',
  'Trung Quốc',
  'Âu Mỹ',
  'Nhật Bản',
  'Thái Lan',
] as const;

export const COUNTRY_SELECT_CUSTOM = '__custom__';

export type BrowseCountry = (typeof BROWSE_COUNTRIES)[number];

export function splitCountryForForm(stored: string | null | undefined): {
  preset: string;
  custom: string;
} {
  if (!stored?.trim()) return { preset: '', custom: '' };
  if ((BROWSE_COUNTRIES as readonly string[]).includes(stored)) {
    return { preset: stored, custom: '' };
  }
  return { preset: COUNTRY_SELECT_CUSTOM, custom: stored };
}

export function countryFromPresetAndCustom(
  preset: string,
  custom: string,
): string | null {
  if (!preset) return null;
  if (preset === COUNTRY_SELECT_CUSTOM) return custom.trim() || null;
  return preset;
}
