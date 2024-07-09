import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from "typeorm";



@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: string;

    @Column('text',{
        unique: true,
    })
    email: string;

    @Column('text',{
        select: false,
    })
    password: string;

    @Column('text')
    fullName: string;

    @Column('bool',{
        default: true,
    })
    isActive: boolean;

    @Column('text',{
        array: true,
        default: ['user']  //por defecto da el rol de user
    })
    roles: string[];

    @BeforeInsert()
    checkFieldsBeforeInsert() {
        this.email = this.email.toLowerCase().trim();
    }

    @BeforeUpdate()
    checkFieldsBeforeUpdate() {
        this.checkFieldsBeforeInsert();   
    }
}

