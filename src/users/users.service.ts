import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import { Comment } from '../comments/schemas/comment.schema';

@Injectable()
export class UsersService {

  constructor(
    @InjectModel(User?.name) private userModel: Model<User>,
    @InjectModel(Comment?.name) private commentModel: Model<Comment>
  ) { }

  create(createUserDto: CreateUserDto) {
    const savedUser = new this.userModel(createUserDto);

    return savedUser.save();
  }

  findAll() {
    return this?.userModel?.find().exec();
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async remove(id: string) {
    if (!mongoose?.Types?.ObjectId?.isValid(id)) throw new BadRequestException("Invalid Id");

    // First get the user to delete
    const userToDelete = await this.userModel.findById(id).lean();
    if (!userToDelete) throw new NotFoundException("User not found");

    // Update all comments by this user to set userId to null
    await this.commentModel.updateMany(
      { userId: id },
      { $set: { userId: null } }
    );

    // Delete the user
    const deletedUser = await this.userModel.findByIdAndDelete(id).lean();

    return {
      user: deletedUser,
      message: "User deleted successfully. Their comments have been preserved but are now anonymous."
    }
  }
}
