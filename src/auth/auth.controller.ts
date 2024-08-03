import { Controller, Get, Post, Body, Headers, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { User } from './entities/user.entity';
import { CreateUserDto, LoginUserDto } from './dto';

import { AuthService } from './auth.service';
import { GetUser, RawHeaders } from './decorators';
import { IncomingHttpHeaders } from 'http';
import { UserRoleGuard } from './guards/user-role/auth/guards/user-role.guard';
import { RoleProtected } from './decorators/role-protected.decorator';
import { ValidRoles } from './interfaces';
import { Auth } from './decorators/auth.decorator';
import { ApiTags } from '@nestjs/swagger';



@ApiTags('Auth')

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }
  
  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('check-status')
  @Auth()
  checkAuthStatus(
    @GetUser() user: User
  ) {
    return this.authService.checkAuthStatus( user );
  }
  
  @Get('private')
  @UseGuards( AuthGuard() )
  testingPrivateRoute(
     @Req() request: Express.Request,
     @GetUser() user: User,
     @GetUser('email') userEmail: string,
    
     @RawHeaders() rawHeaders: string[],
     @Headers() headers: IncomingHttpHeaders,
   ) 
  {


    return {
      ok: true,
      message: 'Hola Mundo Private',
      user,
      userEmail,
      rawHeaders,
      headers
    }
  }

   // @SetMetadata('roles', ['admin','super-user'])

   @Get('private2')
   @RoleProtected( ValidRoles.superUser, ValidRoles.admin )
   @UseGuards( AuthGuard(), UserRoleGuard )
   privateRoute2(
     @GetUser() user: User
   ) {
 
     return {
       ok: true,
       user
     }
   }

   @Get('private3')
   @Auth( ValidRoles.admin )
   privateRoute3(
     @GetUser() user: User
   ) {
 
     return {
       ok: true,
       user
     }
   }
}
