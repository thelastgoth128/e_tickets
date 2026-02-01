import { SetMetadata } from "@nestjs/common";
import { UserRole } from "src/components/users/entities/user.entity";


export const ROLES_KEY = "roles"
export const Roles = (...roles:[UserRole,...UserRole[]]) => SetMetadata('roles',roles)