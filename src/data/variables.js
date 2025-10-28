import { atom } from 'nanostores';

export const isEnglish = atom(false);
export let defaultLang = 'es';

export function getLangFromUrl(url) {
    // FORZAR ESPAÑOL: Ya no se permite inglés en el portal
    return 'es';
  }

export async function getLangBoolean() {
   
    let pivote = isEnglish.value;

    return pivote;
  }

export const selectedCountry = atom(
  typeof window !== 'undefined' && localStorage.getItem('selectedCountry')
    ? localStorage.getItem('selectedCountry')
    : 'mex'
);

selectedCountry.subscribe((value) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('selectedCountry', value);
  }
});
