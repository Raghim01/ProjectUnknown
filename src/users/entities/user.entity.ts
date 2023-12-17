import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';
import { UserRole } from '../enum/user-role.enum';

export type UserDocument = User & Document;

@Schema({})
export class User {
  @Prop({ default: () => new Date() })
  createdOn: Date;

  @Prop({ default: () => new Date() })
  updatedAt: Date;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Prop({ nullable: false, default: false })
  status: boolean;

  @Prop({ nullable: true })
  confirmationToken: string;

  @Prop({ nullable: true })
  recoveryToken: string;

  @Prop()
  refreshToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
