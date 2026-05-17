import { api } from '@/shared/lib/axios';

// Modelo de usuario basado en las entidades del backend
export interface User {
    id: string;
    email: string;
    fullName?: string;
    roles: string[];
    enabled: boolean;
}

// Estructura de datos requerida para el formulario de creación
export interface CreateUserDTO {
    email: string;
    fullName?: string;
    roles: string[]; // Ej: ['COLABORADOR'] o ['ADMINISTRADOR']
}

export const usersApi = {
    /**
     * Obtiene la lista completa de usuarios registrados.
     * Endpoint exclusivo para el rol ADMINISTRADOR.
     */
    getAll: async (): Promise<User[]> => {
        const response = await api.get<User[]>('/api/v1/users');
        return response.data;
    },

    /**
     * Registra un nuevo usuario (Administrador o Colaborador) en el sistema.
     */
    create: async (data: CreateUserDTO): Promise<User> => {
        const response = await api.post<User>('/api/v1/users', data);
        return response.data;
    },

    /**
     * Deshabilita o elimina un usuario por su ID.
     */
    delete: async (id: string): Promise<void> => {
        await api.delete(`/api/v1/users/${id}`);
    }
};