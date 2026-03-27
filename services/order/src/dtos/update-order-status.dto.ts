import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'] })
  @IsEnum(['pending', 'paid', 'shipped', 'delivered', 'cancelled'])
  status!: string;
}
