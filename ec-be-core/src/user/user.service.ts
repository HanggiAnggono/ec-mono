import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Address } from './entities/address.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
  ) {
    this.userRepository = userRepository;
    this.addressRepository = addressRepository;
  }
  create(createUserDto: CreateUserDto) {
    return this.userRepository.save(createUserDto);
  }

  findAll() {
    return this.userRepository.find();
  }

  findOne(id: number) {
    return this.userRepository.findOne({ where: { id } });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.userRepository.update(id, updateUserDto);
  }

  remove(id: number) {
    return this.userRepository.delete(id);
  }

  // ── Address CRUD ──

  async createAddress(createAddressDto: CreateAddressDto): Promise<Address> {
    const { userId, ...data } = createAddressDto;
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const address = this.addressRepository.create({ ...data, user });
    return this.addressRepository.save(address);
  }

  getAddresses(userId: number): Promise<Address[]> {
    return this.addressRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  getAddress(addressId: number): Promise<Address> {
    return this.addressRepository.findOneOrFail({ where: { id: addressId } });
  }

  async updateAddress(
    addressId: number,
    updateAddressDto: UpdateAddressDto,
  ): Promise<Address> {
    const address = await this.addressRepository.findOneOrFail({
      where: { id: addressId },
    });
    Object.assign(address, updateAddressDto);
    return this.addressRepository.save(address);
  }

  async deleteAddress(addressId: number): Promise<void> {
    await this.addressRepository.delete(addressId);
  }
}
