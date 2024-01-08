import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../entities/user.entity';
import { Model } from 'mongoose';
import { UserRole } from '../enum/user-role.enum';
import * as crypto from 'crypto';
import { paginate } from 'src/common/pagination/pagination';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserDocument> {
    const createdUser = new this.userModel(createUserDto);
    createdUser.role = UserRole.USER;
    return await createdUser.save();
  }

  async createAdminUser(createUserDto: CreateUserDto): Promise<UserDocument> {
    const createdUser = new this.userModel(createUserDto);
    createdUser.role = UserRole.ADMIN;
    return await this.createUser(createUserDto);
  }

  async findAll() {
    return paginate(
      this.userModel
        .find({}, '_id name email role status createdOn updatedAt')
        .lean(),
    );
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findOne(
      { _id: id },
      { _id: 1, email: 1, name: 1, role: 1, refreshToken: 1 },
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<UserDocument> {
    return await this.userModel.findOne({ email: email }).lean().exec();
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument> {
    return await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
  }

  async remove(id: string) {
    return await this.userModel.findByIdAndDelete(id).exec();
  }
}
