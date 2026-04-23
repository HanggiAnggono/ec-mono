import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { SaveAddressDto } from './dto/save-address.dto';
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

  async saveAddress(saveAddressDto: SaveAddressDto): Promise<Address> {
    const { userId, ...addressData } = saveAddressDto;
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    let existing = await this.addressRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (existing) {
      Object.assign(existing, addressData);
      return this.addressRepository.save(existing);
    }

    const address = this.addressRepository.create({
      ...addressData,
      user,
    });
    return this.addressRepository.save(address);
  }

  getAddress(userId: number): Promise<Address | null> {
    return this.addressRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }
}
