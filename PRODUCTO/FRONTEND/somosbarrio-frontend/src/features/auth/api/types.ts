export interface UserDto {
  id: string
  email: string
  firstName: string
  lastName: string
  roles: string[]
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  expiresInSec: number
  user: UserDto
}
