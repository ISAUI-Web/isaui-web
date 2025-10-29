import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolUsuario } from '../../usuario/usuario.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RolUsuario[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true; // Si no se especifican roles, se permite el acceso
    }
    const { user } = context.switchToHttp().getRequest();
    
    // El ADMIN_GENERAL siempre tiene acceso
    if (user.rol === RolUsuario.ADMIN_GENERAL) {
      return true;
    }

    return requiredRoles.some((rol) => user.rol?.includes(rol));
  }
}
