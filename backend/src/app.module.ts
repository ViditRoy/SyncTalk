import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ModuleService } from './module/module.service';
import { ModuleController } from './module/module.controller';
import { ConversationModule } from './conversation/conversation.module';
import { MessageModule } from './message/message.module';
import { NotificationModule } from './notification/notification.module';
import { PresenceModule } from './presence/presence.module';
import { RateLimitModule } from './rate-limit/rate-limit.module';
import { ChatGateway } from './chat/chat.gateway';
//import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    // TypeOrmModule.forRoot({
    //   type: 'postgres',
    //   host: process.env.DB_HOST || 'localhost',
    //   port: parseInt(process.env.DB_PORT || '5432'),
    //   username: process.env.DB_USER
    //   password: process.env.DB_PASS,
    //   database: process.env.DB_NAME,
    //   entities: [__dirname + '/**/*.entity{.ts,.js}'],
    //   synchronize: true,
    // }),
    AuthModule,
    UserModule,
    ConversationModule,
    MessageModule,
    NotificationModule,
    PresenceModule,
    RateLimitModule,
  ],
  controllers: [AppController, ModuleController],
  providers: [AppService, ModuleService, ChatGateway],
})
export class AppModule {}
