// bono.controller.ts
import { Controller, Get, Post } from '@nestjs/common';
import { BonoService } from './bono.service';

@Controller('bono')
export class BonoController {
    constructor(private readonly bonoService: BonoService) { }
    @Post()
    async Calculo_bono() {
        const bono = await this.bonoService.calculo_Bono();
        return bono;
    }
}
