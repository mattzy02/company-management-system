import { registerAs } from '@nestjs/config';

// register app config
export default registerAs('app', () => ({
  // port to run the server on
  port: parseInt(process.env.PORT || '3000', 10),
  // database config
  database: {
    // database host
    host: process.env.DB_HOST,
    // database port
    port: parseInt(process.env.DB_PORT || '3306', 10),
    // database username
    username: process.env.DB_USERNAME,
    // database password
    password: process.env.DB_PASSWORD,
    // database name
    database: process.env.DB_DATABASE,
  },
})); 