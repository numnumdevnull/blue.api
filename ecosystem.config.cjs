module.exports = {
  apps: [
    {
      name: 'blue-api',
      script: 'src/index.js',
      cwd: '/home/dev/blue.com.ua/blue.api',

      // Один процесс на одно ядро — обычно достаточно для API.
      // Если позже захочешь масштабировать — поменяешь на 'max' или число.
      instances: 1,
      exec_mode: 'fork',

      // Перезапуск при падении
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',

      // Если процесс вдруг ест больше 500 МБ — рестарт
      max_memory_restart: '500M',

      // Не следить за файлами — в проде это вредно
      watch: false,

      // Переменные окружения
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },

      // Логи
      out_file: '/home/dev/blue.com.ua/blue.api/logs/out.log',
      error_file: '/home/dev/blue.com.ua/blue.api/logs/error.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
