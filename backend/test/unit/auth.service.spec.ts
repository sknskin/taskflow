import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '@/auth/auth.service';
import { PrismaService } from '@/prisma/prisma.service';

// PrismaService 모의 객체 타입
// PrismaService mock type
type PrismaServiceMock = {
  user: {
    upsert: jest.Mock;
    findUnique: jest.Mock;
  };
};

// JwtService 모의 객체 타입
// JwtService mock type
type JwtServiceMock = {
  sign: jest.Mock;
  verify: jest.Mock;
};

// ConfigService 모의 객체 타입
// ConfigService mock type
type ConfigServiceMock = {
  getOrThrow: jest.Mock;
};

describe('AuthService', () => {
  let service: AuthService;
  let prismaMock: PrismaServiceMock;
  let jwtMock: JwtServiceMock;
  let configMock: ConfigServiceMock;

  // 테스트용 고정 데이터
  // Fixed test data
  const TEST_USER_ID = 'user-cuid-001';
  const TEST_USER_EMAIL = 'test@example.com';
  const TEST_USER_NAME = 'Test User';
  const TEST_GOOGLE_ID = 'google-123';
  const TEST_ACCESS_TOKEN = 'access.token.value';
  const TEST_REFRESH_TOKEN = 'refresh.token.value';

  const mockUser = {
    id: TEST_USER_ID,
    email: TEST_USER_EMAIL,
    name: TEST_USER_NAME,
    avatarUrl: null,
    googleId: TEST_GOOGLE_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    // 각 테스트 전 모의 객체 초기화
    // Initialize mocks before each test
    prismaMock = {
      user: {
        upsert: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    jwtMock = {
      sign: jest.fn().mockReturnValue(TEST_ACCESS_TOKEN),
      verify: jest.fn(),
    };

    configMock = {
      getOrThrow: jest.fn().mockImplementation((key: string) => {
        const configMap: Record<string, string> = {
          JWT_SECRET: 'test-jwt-secret',
          JWT_EXPIRES_IN: '15m',
          JWT_REFRESH_SECRET: 'test-refresh-secret',
          JWT_REFRESH_EXPIRES_IN: '7d',
        };
        return configMap[key] ?? '';
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: JwtService, useValue: jwtMock },
        { provide: ConfigService, useValue: configMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  // ─────────────────────────────────────────────
  // handleGoogleLogin
  // ─────────────────────────────────────────────
  describe('handleGoogleLogin', () => {
    const googleUser = {
      googleId: TEST_GOOGLE_ID,
      email: TEST_USER_EMAIL,
      name: TEST_USER_NAME,
      avatarUrl: null,
    };

    it('신규 유저를 upsert하고 accessToken과 user를 반환한다', async () => {
      // should upsert user and return accessToken + user
      prismaMock.user.upsert.mockResolvedValue(mockUser);

      const result = await service.handleGoogleLogin(googleUser);

      expect(prismaMock.user.upsert).toHaveBeenCalledWith({
        where: { googleId: TEST_GOOGLE_ID },
        update: {
          email: TEST_USER_EMAIL,
          name: TEST_USER_NAME,
          avatarUrl: null,
        },
        create: {
          googleId: TEST_GOOGLE_ID,
          email: TEST_USER_EMAIL,
          name: TEST_USER_NAME,
          avatarUrl: null,
        },
      });

      expect(result).toMatchObject({
        accessToken: TEST_ACCESS_TOKEN,
        user: {
          id: TEST_USER_ID,
          email: TEST_USER_EMAIL,
          name: TEST_USER_NAME,
          avatarUrl: null,
        },
      });
    });

    it('jwtService.sign을 올바른 페이로드와 옵션으로 호출한다', async () => {
      // should call jwtService.sign with correct payload and options
      prismaMock.user.upsert.mockResolvedValue(mockUser);

      await service.handleGoogleLogin(googleUser);

      expect(jwtMock.sign).toHaveBeenCalledWith(
        { sub: TEST_USER_ID, email: TEST_USER_EMAIL },
        { secret: 'test-jwt-secret', expiresIn: '15m' },
      );
    });
  });

  // ─────────────────────────────────────────────
  // refreshAccessToken
  // ─────────────────────────────────────────────
  describe('refreshAccessToken', () => {
    it('유효한 refresh token으로 새 access token을 발급한다', async () => {
      // should issue new access token with valid refresh token
      const jwtPayload = { sub: TEST_USER_ID, email: TEST_USER_EMAIL };
      jwtMock.verify.mockReturnValue(jwtPayload);
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.refreshAccessToken(TEST_REFRESH_TOKEN);

      expect(jwtMock.verify).toHaveBeenCalledWith(TEST_REFRESH_TOKEN, {
        secret: 'test-refresh-secret',
      });
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: TEST_USER_ID },
      });
      expect(result).toEqual({ accessToken: TEST_ACCESS_TOKEN });
    });

    it('refresh token이 만료되거나 유효하지 않으면 UnauthorizedException을 던진다', async () => {
      // should throw UnauthorizedException when refresh token is invalid
      jwtMock.verify.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await expect(service.refreshAccessToken('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('payload의 userId에 해당하는 유저가 없으면 UnauthorizedException을 던진다', async () => {
      // should throw UnauthorizedException when user not found by payload sub
      const jwtPayload = { sub: 'non-existent-id', email: 'none@example.com' };
      jwtMock.verify.mockReturnValue(jwtPayload);
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.refreshAccessToken(TEST_REFRESH_TOKEN)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // ─────────────────────────────────────────────
  // getProfile
  // ─────────────────────────────────────────────
  describe('getProfile', () => {
    it('userId로 유저 프로필을 반환한다', async () => {
      // should return user profile by userId
      const profileData = {
        id: TEST_USER_ID,
        email: TEST_USER_EMAIL,
        name: TEST_USER_NAME,
        avatarUrl: null,
        createdAt: new Date(),
      };
      prismaMock.user.findUnique.mockResolvedValue(profileData);

      const result = await service.getProfile(TEST_USER_ID);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: TEST_USER_ID },
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          createdAt: true,
        },
      });
      expect(result).toEqual(profileData);
    });

    it('유저가 없으면 UnauthorizedException을 던진다', async () => {
      // should throw UnauthorizedException when user not found
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('no-such-id')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // ─────────────────────────────────────────────
  // generateRefreshToken (public 메서드)
  // generateRefreshToken (public method)
  // ─────────────────────────────────────────────
  describe('generateRefreshToken', () => {
    it('refresh secret으로 토큰을 서명하여 반환한다', () => {
      // should sign and return token with refresh secret
      jwtMock.sign.mockReturnValue(TEST_REFRESH_TOKEN);

      const token = service.generateRefreshToken(TEST_USER_ID, TEST_USER_EMAIL);

      expect(jwtMock.sign).toHaveBeenCalledWith(
        { sub: TEST_USER_ID, email: TEST_USER_EMAIL },
        { secret: 'test-refresh-secret', expiresIn: '7d' },
      );
      expect(token).toBe(TEST_REFRESH_TOKEN);
    });
  });
});
