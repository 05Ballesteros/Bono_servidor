import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as XLSX from 'xlsx';
import { join } from 'path';

export interface EmpleadoInfo {
    numeroEmpleado: string;
    nombreCompleto: string;
    fechaIngreso: Date | null;
    sueldoBaseMensual: number;
    faltas: number;
    diasLicencia: number;
}

@Injectable()
export class BonoService {
    constructor(private dataSource: DataSource) { }

    async calculo_Bono(): Promise<EmpleadoInfo[]> {
        const basePath = join(__dirname, '..', '..', 'files');

        // Leer archivo de empleados
        const empleadosPath = join(basePath, 'Empleados.xlsx');
        const empleadosSheet = XLSX.readFile(empleadosPath).Sheets['Hoja1'];
        const empleadosData: any[] = XLSX.utils.sheet_to_json(empleadosSheet, { defval: '' });

        // Leer archivo de faltas
        const faltasPath = join(basePath, 'Faltas.xlsx');
        const faltasSheet = XLSX.readFile(faltasPath).Sheets['Hoja1'];
        const faltasData: any[] = XLSX.utils.sheet_to_json(faltasSheet, { defval: '' });

        // Leer archivo de licencias
        const licenciasPath = join(basePath, 'Licencias.xlsx');
        const licenciasSheet = XLSX.readFile(licenciasPath).Sheets['Hoja1'];
        const licenciasData: any[] = XLSX.utils.sheet_to_json(licenciasSheet, { defval: '' });

        // Construir resultado
        const resultado: EmpleadoInfo[] = empleadosData.map(emp => {
            const numeroEmpleado = emp['NEmpleado']?.toString() ?? '';
            const nombreCompleto = emp['NombreCompleto']?.toString() ?? '';

            // Convertir la fecha desde número Excel (si aplica) a Date
            let fechaIngreso: Date | null = null;
            const rawFecha = emp['FechaIngreso'];
            if (typeof rawFecha === 'number') {
                // Si es número Excel, parsearlo
                const parsedFecha = XLSX.SSF.parse_date_code(rawFecha) as { y: number, m: number, d: number };
                if (parsedFecha) {
                    fechaIngreso = new Date(Date.UTC(parsedFecha.y, parsedFecha.m - 1, parsedFecha.d));
                }
            }
            else if (typeof rawFecha === 'string') {
                // Intentar parsear desde texto
                const parts = rawFecha.split('/');
                if (parts.length === 3) {
                    const [dd, mm, yyyy] = parts.map(p => parseInt(p));
                    if (!isNaN(dd) && !isNaN(mm) && !isNaN(yyyy)) {
                        fechaIngreso = new Date(yyyy, mm - 1, dd);
                    }
                } else {
                    const parsed = new Date(rawFecha);
                    fechaIngreso = isNaN(parsed.getTime()) ? null : parsed;
                }
            }

            const sueldoBaseMensual = parseFloat(emp['SueldoBMensual']) || 0;

            const falta = faltasData.find(f => f['NEmpleado']?.toString() === numeroEmpleado);
            const faltas = falta ? parseInt(falta['Faltas']) || 0 : 0;

            const licencia = licenciasData.find(l => l['NEmpleado']?.toString() === numeroEmpleado);
            const diasLicencia = licencia ? parseInt(licencia['DLicencia']) || 0 : 0;

            return {
                numeroEmpleado,
                nombreCompleto,
                fechaIngreso,
                sueldoBaseMensual,
                faltas,
                diasLicencia,
            };
        });

        return resultado;
    }

}
