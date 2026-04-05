// 인증 응답 DTO
// Auth response DTO
export class AuthResponseDto {
  accessToken!: string;
  user!: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
  };
}
