import { IsObject, IsString } from 'class-validator';

export class UpdateFormSectionDto {
  @IsString()
  formId: string;

  @IsObject()
  data: Record<string, any>;
}
