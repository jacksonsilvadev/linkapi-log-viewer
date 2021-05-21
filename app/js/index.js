import 'typeface-roboto';
import 'vue-json-viewer/style.css';
import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/dist/vuetify.css';
import '../css/vuetify-custom.css';
import en from './locales/en.json';
import es from './locales/es.json';

import Vue from 'vue';
import Vuetify from 'vuetify';
import VueI18n from 'vue-i18n';
import JsonViewer from 'vue-json-viewer';
import '../css/main.css';
import '../css/main-dark.css';

import App from './App.vue';

Vue.use(Vuetify);
Vue.use(VueI18n);
Vue.use(JsonViewer);

const i18n = new VueI18n({
  locale: navigator.language,
  fallbackLocale: 'en',
  messages: {
    en, es
  },
  silentTranslationWarn: true
});

new Vue({
  el: '#app',
  i18n,
  vuetify: new Vuetify({
    icons: {
      iconfont: 'mdi', // default - only for display purposes
    },
    theme: {
      themes: {
        light: {
          primary: '#3CC896',
          secondary: '#B7BFD1',
        },
        dark: {
          primary: '#3CC896',
          secondary: '#B7BFD1',
        },
      },
    }
  }),
  render: (h) => h(App)
});

document.addEventListener('dragover', (event) => {
  event.preventDefault();
  return false;
}, false);

document.addEventListener('drop', (event) => {
  event.preventDefault();
  return false;
}, false);
