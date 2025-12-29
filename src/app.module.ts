import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BonoModule } from './bono/bono.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: '',
      port: ,
      username: '#',
      password: '',
      database: '',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      //synchronize: true, // ⚠️ Solo en desarrollo. No usar en producción.
      options: {
        encrypt: false,                 // Deshabilita cifrado para probar si ese es el problema
        trustServerCertificate: true,  // Ignorar problemas de certificado (útil en dev)
      },
    }),
    BonoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
