import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  usersApi,
  type CreateUserDTO,
  type UpdateUserDTO,
} from '@/features/users/api/users.api';

// Factoría de claves para mantener el caché de usuarios ordenado
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

/**
 * Hook para obtener la lista completa de usuarios (Solo ADMINISTRADOR).
 */
export function useUsers() {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: () => usersApi.getAll(),
  });
}

/**
 * Hook para registrar un nuevo usuario e invalidar el caché automáticamente.
 */
export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserDTO) => usersApi.create(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

/**
 * Hook para eliminar/deshabilitar un usuario del sistema.
 */
export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDTO }) =>
      usersApi.update(id, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}