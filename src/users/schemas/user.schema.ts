import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  userId: number;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  last_name: string;

  @Prop({ required: true })
  first_name: string;

  @Prop({ required: true })
  avatarUrl: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
