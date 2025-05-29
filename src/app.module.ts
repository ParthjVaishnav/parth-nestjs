import { Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './login+register/auth/auth.module';

import { VisitorModule } from './team A/employee_sends_visitor_data/visitor.module';
import { AppointmentModule } from './team B/appointment/appointment.module';
import { MailService } from './team B/mail/mail.service';
import { UsersModule } from './team B/users/users.module';
import { UserRolesModule } from './user-roles/user-roles.module';
import { SettingsModule } from './Dictionary Setting/settings.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '123456',
      database: 'CURD',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      autoLoadEntities: true,
      synchronize: true, // ⚠️ Set to false in production
      logging: true,
    }),
    
    AuthModule,
    
    VisitorModule,
    AppointmentModule,
    UsersModule,
    UserRolesModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [AppService, MailService],
})
export class AppModule {
  private readonly logger = new Logger(AppModule.name);

  constructor() {
    this.logger.log('AppModule initialized');
    this.logger.log('Loaded modules: ItemModule, AuthModule, MailModule, VisitorModule, AppointmentModule, UsersModule, UserRolesModule, SettingsModule');
  }
} 