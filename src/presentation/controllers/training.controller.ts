import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TrainingService } from '../../application/services/training.service';
import { CreateTrainingSessionDto } from '../dto/create-training-session.dto';
import { UpdateTrainingSessionDto } from '../dto/update-training-session.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { TeamAccessGuard } from '../../shared/guards/team-access.guard';
import { TeamAccess } from '../../shared/decorators/team-access.decorator';

@ApiTags('Training')
@Controller('training')
@UseGuards(JwtAuthGuard, TeamAccessGuard)
@ApiBearerAuth()
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Post()
  @ApiOperation({ summary: '새 훈련 세션 생성' })
  @ApiResponse({ status: 201, description: '훈련 세션 생성 성공' })
  @TeamAccess('CREATE_SESSION')
  async create(@Body() createTrainingSessionDto: CreateTrainingSessionDto) {
    console.log('🔍 TrainingController.create 호출됨');
    console.log('📝 받은 훈련 세션 데이터:', {
      sessionName: createTrainingSessionDto.sessionName,
      scenarioId: createTrainingSessionDto.scenarioId,
      teamId: createTrainingSessionDto.teamId,
      startTime: createTrainingSessionDto.startTime,
      endTime: createTrainingSessionDto.endTime,
      status: createTrainingSessionDto.status,
      createdBy: createTrainingSessionDto.createdBy,
    });

    try {
      const result = await this.trainingService.create(
        createTrainingSessionDto,
      );
      console.log('✅ TrainingController.create 성공');
      console.log('🔍 반환된 result:', result);
      console.log('🔍 result 타입:', typeof result);
      console.log(
        '🔍 result 키들:',
        result ? Object.keys(result) : 'result is null/undefined',
      );
      return { success: true, data: result };
    } catch (error) {
      console.error('❌ TrainingController.create 실패:', error);
      return { success: false, error: error.message };
    }
  }

  @Get()
  @ApiOperation({ summary: '모든 훈련 세션 조회' })
  @ApiResponse({ status: 200, description: '훈련 세션 목록 조회 성공' })
  async findAll() {
    const sessions = await this.trainingService.findAll();
    console.log('🔍 DB에서 조회된 세션들:', sessions);
    return { success: true, data: sessions };
  }

  @Get(':id')
  @ApiOperation({ summary: '특정 훈련 세션 조회' })
  @ApiResponse({ status: 200, description: '훈련 세션 조회 성공' })
  findOne(@Param('id') id: string) {
    return this.trainingService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '훈련 세션 정보 수정' })
  @ApiResponse({ status: 200, description: '훈련 세션 수정 성공' })
  update(
    @Param('id') id: string,
    @Body() updateTrainingSessionDto: UpdateTrainingSessionDto,
  ) {
    return this.trainingService.update(+id, updateTrainingSessionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '훈련 세션 삭제' })
  @ApiResponse({ status: 200, description: '훈련 세션 삭제 성공' })
  remove(@Param('id') id: string) {
    return this.trainingService.remove(+id);
  }
}
