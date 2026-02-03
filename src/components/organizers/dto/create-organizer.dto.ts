import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/components/users/entities/user.entity';

export class CreateOrganizerDto {
    user: User;
}
