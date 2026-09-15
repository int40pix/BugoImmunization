import { apiClient } from './api';

export interface PatientSummary {
    id: number;
    patient_id: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    sex: string;
    status: string;
}

export const patientService = {
    async getAll(): Promise<PatientSummary[]> {
        return apiClient.get<PatientSummary[]>('/patients');
    },

    async getById(id: number): Promise<PatientSummary> {
        return apiClient.get<PatientSummary>(`/patients/${id}`);
    },
};
