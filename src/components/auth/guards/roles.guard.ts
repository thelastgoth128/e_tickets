import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLES_KEY } from 'src/components/decorators/roles.decorators';
import { UserRole } from 'src/components/users/entities/user.entity';


@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector:Reflector){}
  canActivate(
    context: ExecutionContext,
  ): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY,[
      context.getHandler(),
      context.getClass(),
    ])
    if (!requiredRoles){
      return true
    }
    const user = context.switchToHttp().getRequest().user;
    const hasRequiredRole = requiredRoles.some((role)=>user.role===role)
    return hasRequiredRole;
  }
}
