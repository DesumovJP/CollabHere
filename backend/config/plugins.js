module.exports = ({ env }) => ({
  graphql: {
    enabled: true,
    config: {
      playgroundAlways: true,
      defaultLimit: 10,
      maxLimit: 20,
      apolloServer: {
        introspection: true,
      },
      depthLimit: 10,
      amountLimit: 100,
    },
  },
  'users-permissions': {
    enabled: true,
    config: {
      jwt: {
        expiresIn: '7d',
      },
      register: {
        allowedFields: ['username', 'email', 'password', 'slug', 'location', 'phoneNumber'],
      },
    },
  },
  upload: {
    config: {
      sizeLimit: 250 * 1024 * 1024, // 250mb
      breakpoints: {}, // Вимикаємо responsive formats
    },
  },
});

