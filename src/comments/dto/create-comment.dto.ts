import { IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Types } from "mongoose";

export class CreateCommentDto {
    @IsString()
    @IsNotEmpty()
    text: string;

    @IsNotEmpty()
    userId: Types.ObjectId;

    parentId?: Types.ObjectId;
}
