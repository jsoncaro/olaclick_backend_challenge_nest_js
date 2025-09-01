import { Module } from '@nestjs/common';
import { sequelizeProvider } from './sequelize.providers';

@Module({
  providers: [sequelizeProvider],
  exports: [sequelizeProvider],
})
export class DatabaseModule {}