import i18next from 'i18next';
import he from './hebrew.json';
import en from './english.json';
i18next.init({
  lng: 'en',
  debug: true,
  resources: {
    en: {
      translation: en
    },
    he: {
      translation: he
    }
  }
});

export default i18next.t;