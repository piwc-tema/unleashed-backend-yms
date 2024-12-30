import { PartialType } from '@nestjs/swagger';
import { CreateSomeDto } from './create-some.dto';

export class UpdateSomeDto extends PartialType(CreateSomeDto) {}
