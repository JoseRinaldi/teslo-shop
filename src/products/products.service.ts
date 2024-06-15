import { PaginationDto } from './../common/dtos/pagination_dto';
import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product, ProductImage } from './entities';
import { DataSource, Repository } from 'typeorm';
import {validate as isUUID} from 'uuid';
@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');

  constructor(

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,

  ) {}

  async create(createProductDto: CreateProductDto) {

    try {

      //const product = this.productRepository.create(createProductDto);

      const { images = [], ...productDetails } = createProductDto;

      const product = this.productRepository.create({
        ...productDetails,
        images: images.map( image => this.productImageRepository.create({ url: image }) )
      });
    
      await this.productRepository.save( product );

      //return product;
      //return { ...product, images: images };
      return { ...product, images };
      
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto:PaginationDto) {

    const {limit=10, offset=0} = paginationDto;



    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations:{
        images: true,
      }
    });
    // return this.productRepository.find({
    //   take: limit,
    //   skip: offset,
    //   relations:{
    //     images: true,
    //   }
    // });

    return products.map( ( product ) => ({// el map sirve para transformar un arreglo en otra cosa, un arreglo modificado
      ...product,
      images: product.images.map( img => img.url )
    }))
  }

  async findOne(term: string) {

    let product:Product;

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({id: term});
    } else {
      //product = await this.productRepository.findOneBy({slug: term});
      const queryBuiler = this.productRepository.createQueryBuilder('prod');

      product = await queryBuiler
      .where('UPPER(title) =:title or slug =:slug',{
        title: term.toUpperCase(),
        slug: term.toLowerCase(),
      })
      .leftJoinAndSelect('prod.images','prodImages')// leer typeorm eager
      .getOne();
        
    }
    //const product = await this.productRepository.findOneBy({id});

    if ( !product ) 
      throw new NotFoundException(`Product with ${ term } not found`);

    return product;
  }

  async findOnePlain( term: string ) { 
    //desestructuro tomo las imagenes por un lado y si no viene nada le instancio un array vacio, el resto del objeto esta en rest
    const { images = [], ...rest } = await this.findOne( term );
    return {
      ...rest,
      images: images.map( image => image.url )//tomo el array images y devuelvo uno transformado en solo con urls 
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const { images, ...toUpdate } = updateProductDto;// del updateProductDto se toman las imagenes y el resto del objeto por separados


    const product = await this.productRepository.preload({ id, ...toUpdate });//id sin redundancia

    // const product = await this.productRepository.preload({
    //   id: id, esto en EMAC6 es redundante basta con poner id si el campo del objeto y la variable tienen el mismo nombre
    //   ...updateProductDto,
    //   images:[],
    // });
    
    if ( !product ) throw new NotFoundException(`Product with id: ${ id } not found`);

    // Create query runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

      if( images ) {
        await queryRunner.manager.delete( ProductImage, { product: { id } });

        product.images = images.map( 
          image => this.productImageRepository.create({ url: image }) 
        )
      }
      
      // await this.productRepository.save( product );
      await queryRunner.manager.save( product );

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return this.findOnePlain( id );
      
    } catch (error) {

      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDBExceptions(error);
    }
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

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');

    try {
      return await query
        .delete()
        .where({})
        .execute();

    } catch (error) {
      this.handleDBExceptions(error);
    }

  }
}
