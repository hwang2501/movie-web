import { IsBoolean } from 'class-validator';

export class PatchUserLockDto {
  @IsBoolean()
  locked!: boolean;
}
