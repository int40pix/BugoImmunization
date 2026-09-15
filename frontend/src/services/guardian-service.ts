import { apiClient } from './api';
import { PatientSummary } from './patient-service';

export interface GuardianSummary {
    id: number;
    guardian_no: string;
    name: string;
    email: string | null;
    contact_number: string | null;
    status: string;
    patients?: PatientSummary[];
}

export const guardianService = {
    async getAll(): Promise<GuardianSummary[]> {
        return apiClient.get<GuardianSummary[]>('/guardians');
    },

    async getById(id: number): Promise<GuardianSummary> {
        return apiClient.get<GuardianSummary>(`/guardians/${id}`);
    },

    async getDashboard(): Promise<{ guardian: GuardianSummary; patients: PatientSummary[] }> {
        return apiClient.get('/guardian/dashboard');
    },
};
