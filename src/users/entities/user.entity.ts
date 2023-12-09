import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '../enum/user-role.enum';
import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type UserDocument = User & Document;

@Schema({})
export class User {
  @CreateDateColumn()
  createdOn: Date = new Date();

  @UpdateDateColumn()
  updatedAt: Date = new Date();

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Prop({ nullable: false, default: true })
  status: boolean;

  @Prop({ nullable: true })
  confirmationToken: string;

  @Prop({ nullable: true })
  recoveryToken: string;

  @Prop()
  refreshToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
