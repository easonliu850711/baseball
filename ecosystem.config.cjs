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
        SYNC_TOKEN: 'baseball-apikey-202605',
        BASEBALL_DB_PATH: 'C:\\studio-imori\\baseball\\prod\\data\\baseball.db',
      },
    },
  ],
}
