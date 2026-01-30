

import { Body, Controller, Get, Post, Req, Res, UseGuards, ValidationPipe } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signIn.dto';
import { SignUpDto } from './dto/signUp.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RTGuard } from './guards/rt.guard';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService,
    ) { }

    // will use local guard when not return auth service logged in method 
    @ApiResponse({ status: 200, description: "logged in successfully" })
    @Post('sign-in')
    async signIn(@Body() signInDto: SignInDto , @Res({ passthrough: true }) res: Response ) {
        return await this.authService.signIn(signInDto , res);

    }

     @ApiResponse({ status: 200, description: "logged in successfully" })
    @Post('sign-up')
    async signUp(@Body() signUpDto: SignUpDto) {
        return await this.authService.signUp(signUpDto);


    }

     @UseGuards(JwtAuthGuard)
    @Post('logout')
    async logout(@Req() req, @Res({ passthrough: true }) res: Response) {
        const user = req.user;
        return this.authService.logout(user.sub,res)
    }

    @UseGuards(RTGuard)
    @Post('refresh-token')
    async refreshToken(@Req() req, @Res({ passthrough: true }) res: Response) {
        const { sub: userId, refreshToken } = req.user
        const tokens = await this.authService.refreshTokens(userId, refreshToken , res)
        return { access_token: tokens.access_token };
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    profile(@Req() req) {
        return req.user;
    }

}
