// bono.controller.ts
import { Controller, Get } from '@nestjs/common';
import { BonoService } from './bono.service';

@Controller('bono')
export class BonoController {
    constructor(private readonly tableService: BonoService) { }
    @Get('ping')
    ping() {
        return { message: 'pong' };
    }


    @Get('/tablas')
    async obtenerTablas() {
        const tablas = await this.tableService.getTableNames();
        console.log("LLEGA");
        return { tablas };
    }
}
