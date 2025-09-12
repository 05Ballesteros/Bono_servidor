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
    diasTrabajados: number;
    bonoCalculado: number;
}

@Injectable()
export class BonoService {
    constructor(private dataSource: DataSource) { }

    async calculo_Bono(): Promise<EmpleadoInfo[]> {
        const basePath = join(__dirname, '..', '..', 'files');

        // Leer archivos
        const empleadosSheet = XLSX.readFile(join(basePath, 'Empleados.xlsx')).Sheets['Hoja1'];
        const empleadosData: any[] = XLSX.utils.sheet_to_json(empleadosSheet, { defval: '' });

        const faltasSheet = XLSX.readFile(join(basePath, 'Faltas.xlsx')).Sheets['Hoja1'];
        const faltasData: any[] = XLSX.utils.sheet_to_json(faltasSheet, { defval: '' });

        const licenciasSheet = XLSX.readFile(join(basePath, 'Licencias.xlsx')).Sheets['Hoja1'];
        const licenciasData: any[] = XLSX.utils.sheet_to_json(licenciasSheet, { defval: '' });

        const empleadosFiltrados = empleadosData.filter(emp => {
            const estatus = emp['Estatus']?.toString().trim().toLowerCase();
            return ['activa'].includes(estatus); // Puedes agregar más estatus
        });

        const resultado: EmpleadoInfo[] = empleadosFiltrados.map(emp => {
            const numeroEmpleado = emp['NEmpleado']?.toString() ?? '';
            const nombreCompleto = emp['NombreCompleto']?.toString() ?? '';
            let fechaIngreso: Date | null = null;

            const rawFecha = emp['FechaIngreso'];
            if (typeof rawFecha === 'number') {
                const parsed = XLSX.SSF.parse_date_code(rawFecha);
                if (parsed) {
                    fechaIngreso = new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d));
                }
            } else if (typeof rawFecha === 'string') {
                const parts = rawFecha.split('/');
                if (parts.length === 3) {
                    const [dd, mm, yyyy] = parts.map(p => parseInt(p));
                    fechaIngreso = new Date(yyyy, mm - 1, dd);
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

            // 💡 Calcular días trabajados
            let diasTrabajados = 0;
            const fechaLimite = new Date(Date.UTC(2024, 8, 29)); // 29 septiembre 2024
            const finPeriodo = new Date(Date.UTC(2025, 8, 1)); // 1 septiembre 2025

            if (fechaIngreso && fechaIngreso <= fechaLimite) {
                diasTrabajados = 360 - faltas - diasLicencia;
            } else if (fechaIngreso) {
                const diaIngreso = fechaIngreso.getUTCDate();

                // Calcular quincenas completas
                const quincenasCompletas = this.calcularQuincenasCompletas(fechaIngreso, finPeriodo);

                if (diaIngreso === 1 || diaIngreso === 16) {
                    diasTrabajados = (quincenasCompletas * 15) + 13;
                } else if (diaIngreso >= 2 && diaIngreso <= 15) {
                    const diasIniciales = 15 - diaIngreso + 1;
                    diasTrabajados = diasIniciales + (quincenasCompletas * 15) + 13;
                } else if (diaIngreso >= 17 && diaIngreso <= 31) {
                    const diasIniciales = 15 - (diaIngreso - 16);
                    diasTrabajados = diasIniciales + (quincenasCompletas * 15) + 13;
                }
            }
            const bonoCalculado = (diasTrabajados / 360) * (sueldoBaseMensual / 2);
            return {
                numeroEmpleado,
                nombreCompleto,
                fechaIngreso,
                sueldoBaseMensual,
                faltas,
                diasLicencia,
                diasTrabajados,
                bonoCalculado,
            };
        });

        console.log("Cantidad de usuarios:", resultado.length);
        return resultado;
    }

    private calcularQuincenasCompletas(inicio: Date, fin: Date): number {
        let count = 0;
        let actual = new Date(Date.UTC(inicio.getUTCFullYear(), inicio.getUTCMonth(), inicio.getUTCDate()));

        while (actual < fin) {
            const dia = actual.getUTCDate();
            if (dia === 1 || dia === 16) {
                count++;
            }

            // Avanza al siguiente 1 o 16
            if (dia < 16) {
                actual.setUTCDate(16);
            } else {
                actual.setUTCMonth(actual.getUTCMonth() + 1);
                actual.setUTCDate(1);
            }
        }

        return count;
    }
}
