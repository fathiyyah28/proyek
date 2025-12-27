import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Product } from './entities/product.entity';
import { GlobalStock } from '../stock/entities/global-stock.entity';
import { SalesRecord } from '../sales/entities/sales-record.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GlobalStockHistory, StockHistoryType } from '../stock/entities/global-stock-history.entity';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
        @InjectRepository(GlobalStock)
        private globalStockRepository: Repository<GlobalStock>,
        @InjectRepository(SalesRecord)
        private salesRepository: Repository<SalesRecord>,
        private dataSource: DataSource,
    ) { }

    async create(createProductDto: CreateProductDto) {
        // ATOMIC TRANSACTION: Create Product + GlobalStock together
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 1. Create Product
            const { initialStock, volumePerUnit = 100, ...productData } = createProductDto;

            // Auto-calculate pricePerMl if not provided, assuming `price` is for 30ml
            if (!productData.pricePerMl && productData.price) {
                productData.pricePerMl = productData.price / 30;
            }

            const product = this.productRepository.create(productData);
            const savedProduct = await queryRunner.manager.save(product);

            // Calculate Initial Total ML
            const totalMl = initialStock * volumePerUnit;

            // 2. Create GlobalStock with initialStock (ML)
            const globalStock = this.globalStockRepository.create({
                productId: savedProduct.id,
                quantity: totalMl,
            });
            await queryRunner.manager.save(globalStock);

            // 3. Log Initial History
            const history = queryRunner.manager.create(GlobalStockHistory, {
                productId: savedProduct.id,
                changeAmount: totalMl,
                previousBalance: 0,
                newBalance: totalMl,
                type: StockHistoryType.INITIAL,
                reason: `Initial Create (${initialStock} Units x ${volumePerUnit}ml)`,
            });
            await queryRunner.manager.save(history);

            await queryRunner.commitTransaction();

            // Return product with global stock relation
            return this.productRepository.findOne({
                where: { id: savedProduct.id },
                relations: ['globalStock'],
            });
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async findAll() {
        const products = await this.productRepository.find();
        return products.map(this.normalizeProductPrice);
    }

    async findOne(id: number) {
        const product = await this.productRepository.findOneBy({ id });
        if (!product) {
            throw new NotFoundException(`Produk dengan ID ${id} tidak ditemukan`);
        }
        return this.normalizeProductPrice(product);
    }

    private normalizeProductPrice(product: Product): Product {
        // Ensure pricePerMl exists. If missing, calculate from legacy price (assuming 30ml standard)
        if ((!product.pricePerMl || Number(product.pricePerMl) === 0) && product.price) {
            product.pricePerMl = Number(product.price) / 30;
        }
        // Ensure numbers
        product.pricePerMl = Number(product.pricePerMl);
        return product;
    }

    async update(id: number, updateProductDto: UpdateProductDto) {
        // Check availability first
        await this.findOne(id);
        await this.productRepository.update(id, updateProductDto);
        return this.findOne(id);
    }

    async remove(id: number) {
        const product = await this.findOne(id); // Ensure it exists and not deleted

        // Check if product has sales records (FK constraint)
        const salesCount = await this.salesRepository.count({
            where: { productId: id }
        });

        if (salesCount > 0) {
            throw new BadRequestException(
                `Tidak bisa menghapus produk "${product.name}" karena sudah memiliki ${salesCount} transaksi penjualan`
            );
        }

        // Soft delete
        await this.productRepository.softDelete(id);

        return {
            deleted: true,
            message: `Produk "${product.name}" berhasil dihapus`
        };
    }
}
