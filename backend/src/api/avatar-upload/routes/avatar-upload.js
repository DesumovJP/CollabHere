module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/avatar-upload',
      handler: 'avatar-upload.upload',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};


