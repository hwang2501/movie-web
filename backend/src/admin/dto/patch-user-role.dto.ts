import { IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

export class PatchUserRoleDto {
  @IsEnum(Role)
  role!: Role;
}
