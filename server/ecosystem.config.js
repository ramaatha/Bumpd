module.exports = {
  apps: [
    {
      name: "Bumpd",
      script: "./bin/www",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      env_production: {
        NODE_ENV: "production",
        PORT: 80,
      },
    },
  ],
};
