import {
  IsOptional,
  IsString,
  MaxLength,
  IsUrl,
  ValidateIf,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  /** URL ảnh đại diện. Bỏ qua, gửi null hoặc "" để xóa ảnh. */
  @IsOptional()
  @ValidateIf((o) => o.imageUrl != null && String(o.imageUrl).length > 0)
  @IsString()
  @MaxLength(2048)
  @IsUrl({ require_protocol: true, protocols: ['https', 'http'] })
  imageUrl?: string | null;
}
