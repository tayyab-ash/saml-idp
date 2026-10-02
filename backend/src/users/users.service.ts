import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { publicUser } from './user.mapper';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const users = await this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    return users.map(publicUser);
  }

  async get(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return publicUser(user);
  }

  async create(dto: CreateUserDto) {
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email.toLowerCase(),
          passwordHash: await bcrypt.hash(dto.password, 10),
          firstName: dto.firstName,
          lastName: dto.lastName,
          username: dto.username,
        },
      });
      return publicUser(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('A user with this email already exists');
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.get(id);
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          email: dto.email?.toLowerCase(),
          passwordHash: dto.password ? await bcrypt.hash(dto.password, 10) : undefined,
          firstName: dto.firstName,
          lastName: dto.lastName,
          username: dto.username,
        },
      });
      return publicUser(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('A user with this email already exists');
      }
      throw error;
    }
  }

  async remove(id: string, actorId: string) {
    if (id === actorId) {
      throw new ConflictException('You cannot delete the account you are signed in with');
    }
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (user.isAdmin) {
      const admins = await this.prisma.user.count({ where: { isAdmin: true } });
      if (admins <= 1) throw new ConflictException('The last admin cannot be deleted');
    }
    await this.prisma.user.delete({ where: { id } });
    return { ok: true };
  }
}
