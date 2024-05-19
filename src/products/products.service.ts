import { PaginationDto } from './../common/dtos/pagination_dto';
import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');

  constructor(

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

  ) {}

  async create(createProductDto: CreateProductDto) {

    try {

      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save( product );

      return product;
      
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  findAll(paginationDto:PaginationDto) {

    const {limit=10, offset=0} = paginationDto;



    return this.productRepository.find({
      take: limit,
      skip: offset,
      //TODO: relaciones
    });
  }

  async findOne(id: string) {
    const product = await this.productRepository.findOneBy({id});

    if ( !product ) 
      throw new NotFoundException(`Product with ${ id } not found`);

    return product;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  async remove(id: string) {
    //return this.productRepository.delete(id); esto hice yo funciona

    const product = await this.findOne( id );
    await this.productRepository.remove( product );
  }

  private handleDBExceptions( error: any ) {

    if ( error.code === '23505' )
      throw new BadRequestException(error.detail);
    
    this.logger.error(error)
    // console.log(error)
    throw new InternalServerErrorException('Unexpected error, check server logs');

  }
}
