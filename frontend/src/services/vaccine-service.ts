import { apiClient } from './api';

export interface VaccineItem {
    id: number;
    name: string;
    description: string | null;
    category: 'routine' | 'optional';
    required_doses: number;
}

export interface VaccineBatchItem {
    id: number;
    vaccine_id: number;
    batch_number: string;
    quantity: number;
    expiration_date: string;
    manufacturer: string | null;
    is_archived: boolean;
}

export const vaccineService = {
    async getAll(): Promise<VaccineItem[]> {
        return apiClient.get<VaccineItem[]>('/vaccines');
    },

    async getInventory(): Promise<VaccineBatchItem[]> {
        return apiClient.get<VaccineBatchItem[]>('/vaccine-inventory');
    },

    async getArchivedInventory(): Promise<VaccineBatchItem[]> {
        return apiClient.get<VaccineBatchItem[]>('/vaccine-inventory/archived');
    },
};
