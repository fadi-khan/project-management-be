import { BadRequestException, ConsoleLogger, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { User } from 'src/database/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SignUpDto } from './dto/signUp.dto';
import * as bcrypt from 'bcrypt';
import { SignInDto } from './dto/signIn.dto';
import { UserRole } from 'src/enums/UserType';
import { CookieOptions, Response } from 'express';

@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async validateUser(email: string, password: string) {
        const user = await this.userRepo.findOne({
            where: { email },
        });

        if (!user) return null;

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return null;

        return user;
    }


     async signUp(signupDto: SignUpDto) { 

        const existing = await this.userRepo.findOne({ where: { email: signupDto.email } });

        if (existing) {
            throw new BadRequestException("User already exists !");
        }
        const bycryptPassword = await bcrypt.hash(signupDto.password, 10);

        try {
            const user = this.userRepo.create({
                name: signupDto.name,
                email: signupDto.email,
                password: bycryptPassword,
                role: UserRole.MEMBER

            })
            await this.userRepo.save(user);
            return {message:"User created successfully"};
        } catch (error) {

            console.log(error)
            throw new BadRequestException("Something went wrong! . Please try again")
        }


    }




    async signIn(signInDto: SignInDto, res: Response) {
        const user = await this.userRepo.findOne({ where: { email: signInDto.email } });

        if (!user) {
            throw new NotFoundException("User not found with this email !")
        };

        const pwMatches = await bcrypt.compare(signInDto.password, user.password);
        if (!pwMatches) throw new ForbiddenException("Email or Password is wrong");

        const tokens = await this.getTokens(user.id, user.email);
        await this.updateRTHash(user.id, tokens.refresh_token);
        this.setAuthCookies(res, tokens)
        return {
            message: "User logged in successfully",
            user: {email: user.email , name: user.name , role: user.role}

        };
    }



    async getTokens(id: number, email: string) {

        const payload = {
            sub: id,
            email
        }

        const access_token = await this.jwtService.signAsync(payload, {
            expiresIn: this.configService.get("JWT_EXPIRES_IN"),
            secret: this.configService.get("JWT_SECRET")
        })

        const refresh_token = await this.jwtService.signAsync(payload, {
            expiresIn: this.configService.get("JWT_REFRESH_EXPIRES_IN"),
            secret: this.configService.get("JWT_REFRESH_SECRET")
        })

        return { access_token, refresh_token }
    }

    async updateRTHash(id: number, rt: string) {

        const bycryptRefreshToken = await bcrypt.hash(rt, 10);

        await this.userRepo.update(id, { refreshToken: bycryptRefreshToken });

    }

    async refreshTokens(userId: number, refreshToken: string, res: Response) {

        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user || !user.refreshToken) {
            throw new ForbiddenException("Access Denied");
        }
        const rtMatch = await bcrypt.compare(refreshToken, user.refreshToken);
        if (!rtMatch) {
            throw new ForbiddenException("Access Denied");
        }

        const tokens = await this.getTokens(userId, user.email)

        await this.updateRTHash(userId, tokens.refresh_token)
        this.setAuthCookies(res, tokens)

        return tokens;


    }

    async logout(userId: number, res: Response) {
        await this.userRepo.update({ id: userId }, { refreshToken: null })
        this.clearCookies(res)

    }



    private setAuthCookies = (res: Response, tokens: { access_token: string; refresh_token: string }) => {
        const isProduction = process.env.NODE_ENV === 'production';

        const commonOptions: CookieOptions = {
            httpOnly: true,
            secure: true,
            sameSite: 'none', 
            path: '/',
          
        };

        res.cookie('access_token', tokens.access_token, {
            ...commonOptions,
            maxAge: 15 * 60 * 1000,
        });

        res.cookie('refresh_token', tokens.refresh_token, {
            ...commonOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
    };

    private clearCookies(res: Response) {
    const isProduction = process.env.NODE_ENV === 'production';

    const cookieOptions: CookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'none', 
        path: '/',
      
    };

    res.clearCookie('access_token', cookieOptions);
    res.clearCookie('refresh_token', cookieOptions);
}


}
