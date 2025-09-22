import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamRepository } from '../../../domain/repositories/team.repository';
import { Team } from '../../../domain/entities/team.entity';

@Injectable()
export class TeamRepositoryTypeOrm implements TeamRepository {
  private teamRepository: Repository<Team>;

  constructor(
    @InjectRepository(Team)
    teamRepository: Repository<Team>,
  ) {
    this.teamRepository = teamRepository;
  }

  async findById(id: number): Promise<Team | null> {
    return this.teamRepository.findOne({
      where: { id },
    });
  }

  async findByCode(teamCode: string): Promise<Team | null> {
    return this.teamRepository.findOne({
      where: { teamCode },
    });
  }

  async findAll(): Promise<Team[]> {
    return this.teamRepository.find();
  }

  async findByStatus(status: string): Promise<Team[]> {
    return this.teamRepository.find({
      where: { status },
    });
  }

  async create(team: Partial<Team>): Promise<Team> {
    const newTeam = this.teamRepository.create(team);
    return this.teamRepository.save(newTeam);
  }

  async update(id: number, team: Partial<Team>): Promise<Team> {
    await this.teamRepository.update(id, team);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.teamRepository.delete(id);
  }

  async findActiveTeams(): Promise<Team[]> {
    return this.teamRepository.find({
      where: { status: 'active' },
    });
  }

  async findByName(name: string): Promise<Team | null> {
    return this.teamRepository.findOne({
      where: { name },
    });
  }
}
