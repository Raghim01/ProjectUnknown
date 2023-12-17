import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from 'src/users/services/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import * as argon2 from 'argon2';
import { AuthDto } from '../dto/auth.dto';
import * as dotenv from 'dotenv';
import { JwtHelper } from 'src/common/jwt/token-helper.functions';
import { UpdatePasswordDto } from '../dto/update-user_password.dto';
import { MailService } from 'src/common/mail/mail.service';
import { User, UserDocument } from 'src/users/entities/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomBytes } from 'crypto';
import { RecoverPasswordDto } from '../dto/recover-password.dto';
dotenv.config();

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private usersService: UsersService,
    private jwtHelper: JwtHelper,
    private mailService: MailService,
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

    const newUser = await this.usersService.createUser({
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

    await this.mailService.sendUserConfirmation(newUser);

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

  async confirmEmail(confirmationToken: string) {
    const result = await this.userModel.updateOne(
      { confirmationToken: confirmationToken },
      { $set: { confirmationToken: null, status: true } },
    );

    if (result.modifiedCount === 0) {
      throw new NotFoundException('Token invalid or not updated.');
    }

    return result;
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

  async sendRecoverEmail(email: string) {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.recoveryToken = randomBytes(32).toString('hex');
    await user.save();

    await this.mailService.sendPasswordRecover(user);
  }

  async recoverPassword(
    recoverToken: string,
    recoverPasswordDto: RecoverPasswordDto,
  ) {
    const user = await this.userModel.findOne({ recoveryToken: recoverToken });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (
      recoverPasswordDto.newPassword !== recoverPasswordDto.confirmNewPassword
    ) {
      throw new HttpException(
        'Password must be the same',
        HttpStatus.BAD_REQUEST,
      );
    }

    user.password = await this.jwtHelper.hashData(
      recoverPasswordDto.newPassword,
    );

    await this.usersService.update(user.id, user);

    return { message: 'Password recovered successfully' };
  }

  async logout(userId: string) {
    return this.usersService.update(userId, { refreshToken: null });
  }
}
