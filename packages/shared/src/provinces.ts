// Internal map IDs follow the bundled, licensed province outline asset.
export const iranProvinces = [
  ['IR-01', 'آذربایجان شرقی'],
  ['IR-02', 'آذربایجان غربی'],
  ['IR-03', 'اردبیل'],
  ['IR-04', 'اصفهان'],
  ['IR-05', 'ایلام'],
  ['IR-06', 'بوشهر'],
  ['IR-07', 'تهران'],
  ['IR-08', 'چهارمحال و بختیاری'],
  ['IR-10', 'خوزستان'],
  ['IR-11', 'زنجان'],
  ['IR-12', 'سمنان'],
  ['IR-13', 'سیستان و بلوچستان'],
  ['IR-14', 'فارس'],
  ['IR-15', 'کرمان'],
  ['IR-16', 'کردستان'],
  ['IR-17', 'کرمانشاه'],
  ['IR-18', 'کهگیلویه و بویراحمد'],
  ['IR-19', 'گیلان'],
  ['IR-20', 'لرستان'],
  ['IR-21', 'مازندران'],
  ['IR-22', 'مرکزی'],
  ['IR-23', 'هرمزگان'],
  ['IR-24', 'همدان'],
  ['IR-25', 'یزد'],
  ['IR-26', 'قم'],
  ['IR-27', 'گلستان'],
  ['IR-28', 'قزوین'],
  ['IR-29', 'خراسان جنوبی'],
  ['IR-30', 'خراسان رضوی'],
  ['IR-31', 'خراسان شمالی'],
  ['IR-32', 'البرز'],
].map(([code, name]) => ({ code: code!, name: name! }));
export const provinceKey = (name: string) =>
  name
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/آ/g, 'ا')
    .replace(/استان/g, '')
    .replace(/[\s\u200c\-ـ]/g, '');
const aliases: Record<string, string[]> = {
  'IR-08': ['چهار محال بختیاری'],
  'IR-18': ['کهکیلویه و بویراحمد', 'کهگیلویه بویر احمد'],
  'IR-13': ['سیستان بلوچستان'],
};
export const provinceKeys = (code: string) => {
  const province = iranProvinces.find((p) => p.code === code);
  return province ? [...new Set([province.name, ...(aliases[code] ?? [])].map(provinceKey))] : [];
};
export function provinceCode(name: string) {
  const key = provinceKey(name);
  return iranProvinces.find((p) => provinceKeys(p.code).includes(key))?.code ?? 'unknown';
}
