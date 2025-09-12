import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class BonoService {
    constructor(private dataSource: DataSource) { }

    async getTableNames(): Promise<string[]> {
        const result = await this.dataSource.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
    `);
        return result.map((row) => row.TABLE_NAME);
    }
}
