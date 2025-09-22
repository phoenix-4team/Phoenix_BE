import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../domain/entities/user.entity';
import { UserDomainService } from '../../../domain/services/user-domain.service';

export interface CreateUserRequest {
  loginId: string;
  password: string;
  name: string;
  email: string;
  teamId?: number;
  userCode?: string;
  oauthProvider?: string;
  oauthProviderId?: string;
  profileImageUrl?: string;
}

export interface CreateUserResponse {
  success: boolean;
  user?: any;
  error?: string;
}

@Injectable()
export class CreateUserUseCase {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly userDomainService: UserDomainService,
  ) {}

  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    try {
      console.log('🔍 CreateUserUseCase.execute 호출됨:', { request });

      // Validate email uniqueness (OAuth 사용자와 일반 사용자 통합 처리)
      const existingUserByEmail = await this.userDomainService.isEmailUnique(
        request.email,
      );
      console.log('🔍 이메일 중복 확인 결과:', existingUserByEmail);

      if (!existingUserByEmail) {
        // 기존 사용자가 OAuth 사용자인지 확인
        const existingUser = await this.userRepository.findOne({
          where: { email: request.email },
        });
        if (existingUser && existingUser.oauthProvider) {
          console.log('🔄 OAuth 사용자 발견 - 일반 회원가입으로 전환');
          // OAuth 사용자를 일반 사용자로 전환
          try {
            await this.userRepository.update(existingUser.id, {
              loginId: request.loginId,
              password: request.password,
              name: request.name,
              oauthProvider: null,
              oauthProviderId: null,
            });
            const updatedUser = await this.userRepository.findOne({
              where: { id: existingUser.id },
            });
            console.log('✅ OAuth 사용자를 일반 사용자로 전환 완료');
            return {
              success: true,
              user: updatedUser,
            };
          } catch (error) {
            console.error('❌ OAuth 사용자 전환 실패:', error);
            return {
              success: false,
              error: 'Failed to convert OAuth user to regular user',
            };
          }
        } else {
          console.log('❌ 이메일 중복됨 (일반 사용자)');
          return {
            success: false,
            error: 'Email already exists',
          };
        }
      }

      // Validate login ID uniqueness
      const existingUserByLoginId =
        await this.userDomainService.isLoginIdUnique(request.loginId);
      console.log('🔍 로그인 ID 중복 확인 결과:', existingUserByLoginId);
      if (!existingUserByLoginId) {
        console.log('❌ 로그인 ID 중복됨');
        return {
          success: false,
          error: 'Login ID already exists',
        };
      }

      // Create user
      console.log('🔍 사용자 생성 시작');
      const newUser = this.userRepository.create({
        loginId: request.loginId,
        password: request.password,
        name: request.name,
        email: request.email,
        teamId: request.teamId,
        userCode: request.userCode,
        oauthProvider: request.oauthProvider,
        oauthProviderId: request.oauthProviderId,
        profileImageUrl: request.profileImageUrl,
        useYn: 'Y',
        userLevel: 1,
        userExp: 0,
        totalScore: 0,
        completedScenarios: 0,
        currentTier: '초급자',
        levelProgress: 0.0,
        nextLevelExp: 100,
        isActive: true,
      });
      const user = await this.userRepository.save(newUser);
      console.log('🔍 사용자 생성 완료:', { user });

      return {
        success: true,
        user,
      };
    } catch (error) {
      console.error('❌ CreateUserUseCase 오류:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      return {
        success: false,
        error: error.message || 'Failed to create user',
      };
    }
  }
}
