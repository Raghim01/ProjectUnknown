import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  Inject,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { AccessTokenGuard } from 'src/common/guards/accessToken.guard';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { User } from '../entities/user.entity';
import { Role } from 'src/common/decorators/role.decorator';
import { UserRole } from '../enum/user-role.enum';
import { RolesGuard } from 'src/common/guards/role.guard';
import {
  CACHE_MANAGER,
  Cache,
  CacheInterceptor,
  CacheKey,
  CacheTTL,
} from '@nestjs/cache-manager';

@Controller('users')
export class UsersController {
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Post(':admin')
  @UseGuards(AccessTokenGuard)
  @Role(UserRole.ADMIN)
  @UseGuards(AuthGuard(), RolesGuard)
  async createAdminUser(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.createAdminUser(createUserDto);
    return {
      user,
      message: 'Admin user created successfully!',
    };
  }

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(30)
  @CacheKey('all-users')
  @Get()
  @UseGuards(AccessTokenGuard)
  @UseGuards(AuthGuard())
  async findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(AccessTokenGuard)
  @UseGuards(AuthGuard())
  @Get(':current-user')
  async getCurrentUser(@GetUser() user: User): Promise<User> {
    return user;
  }

  @Role(UserRole.ADMIN)
  @UseGuards(AuthGuard(), RolesGuard, AccessTokenGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @UseGuards(AccessTokenGuard)
  @Role(UserRole.ADMIN)
  @UseGuards(AuthGuard(), RolesGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @UseGuards(AccessTokenGuard)
  @UseGuards(AuthGuard())
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
