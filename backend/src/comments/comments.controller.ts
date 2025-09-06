import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentEntity } from './entities/comment.entity';
import { CommentsService } from './comments.service';

@Controller('comments')
@ApiTags('Comments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @ApiCreatedResponse({ type: CommentEntity })
  create(@Req() req: any, @Body() dto: CreateCommentDto) {
    return this.commentsService.create(req.user.id, dto);
  }

  @Get()
  @ApiOkResponse({ type: CommentEntity, isArray: true })
  @ApiQuery({ name: 'userId', required: false, type: Number })
  @ApiQuery({ name: 'trackId', required: false, type: Number })
  findAll(@Query('userId') userId?: string, @Query('trackId') trackId?: string) {
    const u = userId ? Number(userId) : undefined;
    const t = trackId ? Number(trackId) : undefined;
    return this.commentsService.findAll({ userId: u, trackId: t });
  }

  @Get(':id')
  @ApiOkResponse({ type: CommentEntity })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: CommentEntity })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.commentsService.update(id, { id: req.user.id, isAdmin: req.user.isAdmin }, dto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: CommentEntity })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.commentsService.remove(id, { id: req.user.id, isAdmin: req.user.isAdmin });
  }
}

