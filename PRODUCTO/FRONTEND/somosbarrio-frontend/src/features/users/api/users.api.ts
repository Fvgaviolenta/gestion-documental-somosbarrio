import { api } from '@/shared/lib/axios';

// Modelo de usuario basado en las entidades del backend
export interface User {
    id: string;
    email: string;
    firstName?: string;  
    lastName?: string;   
    roles: string[];
    enabled: boolean;
}

// Interfaz para mapear la respuesta paginada de Spring Boot
export interface PagedResponse<T> {
    content: T[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
}

// Estructura de datos requerida para el formulario de creación (Contrato exacto de Swagger)
export interface CreateUserDTO {
    email: string;
    password: string;  
    firstName: string; 
    lastName: string;  
    roles: string[]; 
}

export const usersApi = {
    /**
     * Obtiene la lista completa de usuarios registrados.
     * Endpoint exclusivo para el rol ADMINISTRADOR.
     */
    getAll: async (): Promise<User[]> => {
        const response = await api.get<PagedResponse<User>>('/users');
        return response.data?.content ?? [];
    },

    /**
     * Registra un nuevo usuario (Administrador o Colaborador) en el sistema.
     */
    create: async (data: CreateUserDTO): Promise<User> => {
        const response = await api.post<User>('/users', data);
        return response.data;
    },

    /**
     * Deshabilita o elimina un usuario por su ID.
     */
    delete: async (id: string): Promise<void> => {
        await api.delete(`/users/${id}`);
    }
};