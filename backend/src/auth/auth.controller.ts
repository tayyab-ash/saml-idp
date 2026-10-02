import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AdminGuard } from './admin.guard';
import { AuthService } from './auth.service';
import { AdminLoginDto } from './dto';

@Controller('auth/admin')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  login(@Body() dto: AdminLoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @Get('me')
  @UseGuards(AdminGuard)
  me(@Req() req: { admin: { id: string } }) {
    return this.auth.me(req.admin.id);
  }
}
