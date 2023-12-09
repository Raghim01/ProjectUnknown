import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { UsersService } from 'src/users/services/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import * as argon2 from 'argon2';
import { AuthDto } from '../dto/auth.dto';
import * as dotenv from 'dotenv';
import { JwtHelper } from 'src/common/jwt/token-helper.functions';
import { UpdatePasswordDto } from '../dto/update-user_password.dto';
import { UserRole } from 'src/users/enum/user-role.enum';

dotenv.config();

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtHelper: JwtHelper,
  ) {}

  async signUp(createUserDto: CreateUserDto): Promise<any> {
    const userExists = await this.usersService.findByEmail(createUserDto.email);
    if (userExists) {
      throw new BadRequestException('User already exists');
    }

    //hash password
    const hash = await this.jwtHelper.hashData(createUserDto.password);
    const passwordMatches = await argon2.verify(
      hash,
      createUserDto.confirmPassword,
    );

    if (!passwordMatches) {
      throw new BadRequestException('Password is incorrect');
    }

    const newUser = await this.usersService.create({
      ...createUserDto,
      password: hash,
    });

    const tokens = await this.jwtHelper.getTokens(
      newUser._id,
      newUser.email,
      newUser.name,
      newUser.role,
    );
    await this.jwtHelper.updateRefreshToken(newUser.id, tokens.refreshToken);

    return { newUser, tokens };
  }

  async signIn(data: AuthDto) {
    const userExists = await this.usersService.findByEmail(data.email);
    if (!userExists) {
      throw new BadRequestException('User dont exist');
    }

    const passwordMatches = await argon2.verify(
      userExists.password,
      data.password,
    );
    if (!passwordMatches) {
      throw new BadRequestException('Password is incorrect');
    }

    const tokens = await this.jwtHelper.getTokens(
      userExists._id,
      userExists.email,
      userExists.name,
      userExists.role,
    );

    await this.jwtHelper.updateRefreshToken(
      userExists._id,
      tokens.refreshToken,
    );

    return { userExists, tokens };
  }

  async updateUserPassword(
    email: string,
    updateUserPassword: UpdatePasswordDto,
  ) {
    const existingUser = await this.usersService.findByEmail(email);
    if (!existingUser) {
      throw new BadRequestException('User dont exist');
    }

    const passwordMatches = await argon2.verify(
      existingUser.password,
      updateUserPassword.confirmPassword,
    );
    if (!passwordMatches) {
      throw new BadRequestException('Password provided by you is incorrect');
    }

    existingUser.password = await this.jwtHelper.hashData(
      updateUserPassword.newPassword,
    );

    const tokens = await this.jwtHelper.getTokens(
      existingUser._id,
      existingUser.email,
      existingUser.name,
      existingUser.role,
    );
    await this.jwtHelper.updateRefreshToken(
      existingUser._id,
      tokens.refreshToken,
    );

    await this.usersService.update(existingUser._id, existingUser);
  }

  async logout(userId: string) {
    return this.usersService.update(userId, { refreshToken: null });
  }
}
