import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AvatarDocument = Avatar & Document;

@Schema()
export class Avatar {
  @Prop({ required: true, unique: true })
  userId: number;

  @Prop({ required: true })
  avatarUrl: string;

  @Prop({ required: true })
  avatarHash: string;
}

export const AvatarSchema = SchemaFactory.createForClass(Avatar);
