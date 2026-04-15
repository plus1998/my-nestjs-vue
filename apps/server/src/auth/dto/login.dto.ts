import { Transform } from 'class-transformer';
import { IsString, Length, Matches } from 'class-validator';

export class LoginDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: '用户名必须是字符串' })
  @Length(3, 32, { message: '用户名长度需要在 3 到 32 个字符之间' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: '用户名只能包含字母、数字和下划线',
  })
  username!: string;

  @IsString({ message: '密码必须是字符串' })
  @Length(8, 128, { message: '密码长度需要在 8 到 128 个字符之间' })
  password!: string;
}
