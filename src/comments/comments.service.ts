import { Injectable, Req, NotFoundException, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Comment } from './schemas/comment.schema';
import { Model } from 'mongoose';

@Injectable()
export class CommentsService {

  constructor(@InjectModel(Comment?.name) private commentModel: Model<Comment>) { }

  create(createCommentDto: CreateCommentDto) {
    const newComment = this?.commentModel.create(createCommentDto);
    return newComment.then((doc) => doc?.populate(['userId', 'parentId']))
  }

  async findAll() {
    // Populate all fields from User
    const comments = await this?.commentModel?.find()
      .populate('userId')  // Gets all User fields
      .populate('parentId')
      .exec();

    return {
      comments,
      message: "Comments",
      count: comments?.length
    }
  }

  getTopLevelComments() {
    return this?.commentModel?.find(
      {
        parentId: null
      }
    ).populate(["userId", "parentId"]).exec();
  }

  getCommentsByParentId(parentId: string) {
    try {
      return this?.commentModel?.find({
        parentId
      })
        .populate(["userId", "parentId"])
        .exec()
    } catch (error) {
      throw new BadRequestException('Something went wrong', {
        cause: new Error(error?.message),
        description: 'Something wrong happened'
      })
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} comment`;
  }

  update(id: number, updateCommentDto: UpdateCommentDto) {
    return `This action updates a #${id} comment`;
  }

  async remove(id: string) {
    // First get the comment to delete with its data
    const commentToDelete = await this.commentModel
      .findById(id)
      .populate('userId')
      .populate('parentId')
      .lean();

    if (!commentToDelete) {
      throw new NotFoundException('Comment not found');
    }

    // Store the comment data before deletion
    const deletedCommentData = { ...commentToDelete };

    // Delete the comment and all its child comments (replies)
    await this.commentModel.deleteMany({
      $or: [
        { _id: id }, // Delete the main comment
        { parentId: id } // Delete all child comments
      ]
    });

    return {
      comment: deletedCommentData,
      message: "Comment and its replies deleted successfully!"
    };
  }
}
