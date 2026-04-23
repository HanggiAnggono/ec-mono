import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BaseAuthController } from 'src/auth/auth.controller';
import { ApiOkResponse } from '@nestjs/swagger';
import { GetProfileDto } from './dto/get-profile.dto';
import { SaveAddressDto } from './dto/save-address.dto';
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

  @Post('address')
  @ApiOkResponse({ type: AddressDto })
  saveAddress(@Body() saveAddressDto: SaveAddressDto) {
    return this.userService.saveAddress(saveAddressDto);
  }

  @Get('address/:userId')
  @ApiOkResponse({ type: AddressDto })
  getAddress(@Param('userId') userId: string) {
    return this.userService.getAddress(+userId);
  }
}
