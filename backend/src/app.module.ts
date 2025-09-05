import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { TracksModule } from './tracks/tracks.module';

@Module({
  imports: [PrismaModule, TracksModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
