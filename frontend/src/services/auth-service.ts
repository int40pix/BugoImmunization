import { apiClient } from './api';

export interface UserProfile {
    id: number;
    name: string;
    email: string;
    role: string | null;
    account_status: string | null;
    must_change_password: boolean;
}

export const authService = {
    async getCurrentUser(): Promise<UserProfile> {
        return apiClient.get<UserProfile>('/api/user');
    },

    async requestPasswordReset(email: string): Promise<{ message: string }> {
        return apiClient.post<{ message: string }>('/forgot-password', { email });
    },
};
