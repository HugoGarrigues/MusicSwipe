import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { TracksModule } from './tracks/tracks.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { FollowsModule } from './follows/follows.module';
import { RatingsModule } from './ratings/ratings.module';
import { LikesModule } from './likes/likes.module';
import { CommentsModule } from './comments/comments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule, 
    TracksModule, 
    UsersModule, 
    AuthModule,
    FollowsModule,
    RatingsModule,
    LikesModule,
    CommentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
