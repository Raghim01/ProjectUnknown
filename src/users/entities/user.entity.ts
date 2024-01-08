import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '../enum/user-role.enum';
import { Exclude } from 'class-transformer';

export type UserDocument = User & Document;

@Schema({})
export class User {
  @Prop({ default: () => new Date() })
  @Exclude()
  createdOn: Date;

  @Exclude()
  @Prop({ default: () => new Date() })
  updatedAt: Date;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Exclude()
  @Prop({ required: true })
  password: string;

  @Prop({ enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Prop({ nullable: false, default: false })
  status: boolean;

  @Prop({ nullable: true })
  confirmationToken: string;

  @Prop()
  confirmationTokenExpires: Date;

  @Prop({ nullable: true })
  recoveryToken: string;

  @Prop()
  refreshToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
