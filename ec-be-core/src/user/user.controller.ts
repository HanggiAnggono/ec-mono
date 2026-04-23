import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BaseAuthController } from 'src/auth/auth.controller';
import { ApiOkResponse } from '@nestjs/swagger';
import { GetProfileDto } from './dto/get-profile.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { AddressDto } from './dto/address.dto';

@Controller('user')
export class UserController extends BaseAuthController {
  constructor(private readonly userService: UserService) {
    super();
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get('profile')
  @ApiOkResponse({ type: GetProfileDto })
  getProfile(@Request() req) {
    const userId = req.user.userId;
    return this.userService.findOne(+userId);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  // ── Address CRUD ──

  @Post('addresses')
  @ApiOkResponse({ type: AddressDto })
  createAddress(@Body() dto: CreateAddressDto) {
    return this.userService.createAddress(dto);
  }

  @Get('addresses/:userId')
  @ApiOkResponse({ type: [AddressDto] })
  getAddresses(@Param('userId') userId: string) {
    return this.userService.getAddresses(+userId);
  }

  @Patch('addresses/:id')
  @ApiOkResponse({ type: AddressDto })
  updateAddress(@Param('id') id: string, @Body() dto: UpdateAddressDto) {
    return this.userService.updateAddress(+id, dto);
  }

  @Delete('addresses/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteAddress(@Param('id') id: string) {
    return this.userService.deleteAddress(+id);
  }
}
