import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '.';


@Entity({ name: 'product_images' })
export class ProductImage {

    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    url: string;

    //de la siguiente forma se genera la relacion entre tablas

    @ManyToOne(
        () => Product,
        ( product ) => product.images,
        {  onDelete: 'CASCADE' }
    )
    product: Product
}