module.exports = {
  apps: [
    {
      name: 'baseball-prod',
      cwd: 'C:\\studio-imori\\baseball\\prod',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3004',
      env: {
        NODE_ENV: 'production',
        PORT: '3004',
        SYNC_TOKEN: process.env.SYNC_TOKEN,
        BASEBALL_DB_PATH: process.env.BASEBALL_DB_PATH,
      },
    },
  ],
}
