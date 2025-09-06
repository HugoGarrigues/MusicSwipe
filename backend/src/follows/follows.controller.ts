import { 
  Controller, 
  Post, 
  Delete, 
  Get, 
  Body, 
  Param, 
  ParseIntPipe, 
  UseGuards, 
  Req 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FollowsService } from './follows.service';
import { FollowStatsDto, UserFollowInfoDto } from './dto/follow-response.dto';
import { FollowUserDto } from './dto/follow-user.dto';
import { FollowEntity } from './entities/follow.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('follows')
@ApiTags('follows')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post()
  @ApiOperation({ summary: 'Suivre un utilisateur' })
  @ApiResponse({ 
    status: 201, 
    description: 'Utilisateur suivi avec succès',
    type: FollowEntity
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 403, description: 'Impossible de se suivre soi-même' })
  @ApiResponse({ status: 404, description: 'Utilisateur à suivre non trouvé' })
  @ApiResponse({ status: 409, description: 'Déjà en train de suivre cet utilisateur' })
  followUser(@Body() followUserDto: FollowUserDto, @Req() req: any) {
    return this.followsService.followUser(req.user.id, followUserDto);
  }

  @Delete(':userId')
  @ApiOperation({ summary: 'Ne plus suivre un utilisateur' })
  @ApiResponse({ 
    status: 200, 
    description: 'Utilisateur non suivi avec succès',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'Message de confirmation' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Vous ne suivez pas cet utilisateur' })
  unfollowUser(@Param('userId', ParseIntPipe) userId: number, @Req() req: any) {
    return this.followsService.unfollowUser(req.user.id, userId);
  }

  @Get('stats/:userId')
  @ApiOperation({ summary: 'Obtenir les statistiques de suivi d\'un utilisateur' })
  @ApiResponse({ 
    status: 200, 
    description: 'Statistiques de suivi',
    type: FollowStatsDto
  })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  getFollowStats(@Param('userId', ParseIntPipe) userId: number) {
    return this.followsService.getFollowStats(userId);
  }

  @Get('following/:userId')
  @ApiOperation({ summary: 'Obtenir la liste des utilisateurs suivis' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste des utilisateurs suivis',
    type: [UserFollowInfoDto]
  })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  getFollowing(@Param('userId', ParseIntPipe) userId: number, @Req() req: any) {
    return this.followsService.getFollowing(userId, req.user.id);
  }

  @Get('followers/:userId')
  @ApiOperation({ summary: 'Obtenir la liste des followers' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste des followers',
    type: [UserFollowInfoDto]
  })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  getFollowers(@Param('userId', ParseIntPipe) userId: number, @Req() req: any) {
    return this.followsService.getFollowers(userId, req.user.id);
  }

  @Get('check/:userId')
  @ApiOperation({ summary: 'Vérifier si l\'utilisateur connecté suit un autre utilisateur' })
  @ApiResponse({ 
    status: 200, 
    description: 'Statut de suivi',
    schema: {
      type: 'object',
      properties: {
        isFollowing: { type: 'boolean', description: 'True si l\'utilisateur suit l\'autre' }
      }
    }
  })
  checkFollowing(@Param('userId', ParseIntPipe) userId: number, @Req() req: any) {
    return this.followsService.isFollowing(req.user.id, userId).then((isFollowing) => ({ isFollowing }));
  }
}
