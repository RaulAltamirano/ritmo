export default {
  locales: [
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'English' }
  ],
  defaultLocale: 'es',
  vueI18n: {
    fallbackLocale: 'es',
    messages: {
      es: {
        title: 'Ritmo - Gestión de Proyectos',
        login: {
          title: 'Iniciar Sesión',
          email: 'Email',
          password: 'Contraseña',
          submit: 'Iniciar Sesión'
        },
        profile: {
          title: 'Perfil',
          logout: 'Cerrar Sesión'
        }
      },
      en: {
        title: 'Ritmo - Project Management',
        login: {
          title: 'Login',
          email: 'Email',
          password: 'Password',
          submit: 'Login'
        },
        profile: {
          title: 'Profile',
          logout: 'Logout'
        }
      }
    }
  },
  strategy: 'no_prefix'
}
}
