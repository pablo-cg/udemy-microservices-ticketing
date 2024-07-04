// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
        },
      ],
      script: [
        {
          src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.min.js',
          tagPosition: 'bodyClose',
        },
      ],
    },
  },

  // modules: ['@unlok-co/nuxt-stripe'],
  // stripe: {
  //   client: {
  //     key: '',
  //   },
  // },
});
