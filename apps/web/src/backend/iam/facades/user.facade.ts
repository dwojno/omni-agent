import { Injectable } from '@nestjs/common';

import { UserRepository } from '../repositories/user.repository.js';
import type { User, UserInsert } from '../repositories/user.repository.js';

@Injectable()
export class UserFacade {
  constructor(private readonly repo: UserRepository) { }

  async create(data: UserInsert): Promise<User> {
    return this.repo.create(data);
  }

  async findById(id: string): Promise<User | null> {
    return this.repo.findById(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findByEmail(email);
  }

  async update(id: string, data: Partial<Omit<UserInsert, 'id'>>): Promise<User | null> {
    return this.repo.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return this.repo.delete(id);
  }
}
