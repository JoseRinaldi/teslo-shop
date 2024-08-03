import { PaginationDto } from './../common/dtos/pagination_dto';
import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Auth } from '../auth/decorators/auth.decorator'
import { ValidRoles } from 'src/auth/interfaces';
import { GetUser } from 'src/auth/decorators';
import { User } from 'src/auth/entities/user.entity';

@Controller('products')
@Auth()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Auth(ValidRoles.admin)
  create(@Body() createProductDto: CreateProductDto,
  @GetUser() user: User,) {
    return this.productsService.create(createProductDto,user);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.productsService.findAll(paginationDto);
  }

  // @Get(':id')
  // findOne(@Param('id',ParseUUIDPipe) id: string) {
  //   return this.productsService.findOnePlain(id);
  // }
  @Get(':term')
  findOne(@Param( 'term' ) term: string) {
    return this.productsService.findOnePlain( term );
  }

  @Patch(':id')
  @Auth(ValidRoles.admin)
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateProductDto: UpdateProductDto, 
    @GetUser() user: User,) {
    return this.productsService.update( id, updateProductDto, user);
  }

  @Delete(':id')
  @Auth(ValidRoles.admin)
  remove(@Param('id',ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
