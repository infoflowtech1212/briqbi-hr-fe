module.exports = {
  apps: [
    {
      name: 'briqbi-hr-backend',
      script: 'dist/server.js',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}
