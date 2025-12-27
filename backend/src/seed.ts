import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { User, UserRole } from './users/entities/user.entity';
import { Branch } from './branches/entities/branch.entity';
import { Product } from './products/entities/product.entity';
import { GlobalStock } from './stock/entities/global-stock.entity';
import { BranchStock } from './stock/entities/branch-stock.entity';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const dataSource = app.get(DataSource);

    console.log('Seeding database...');

    // Repositories
    const userRepository = dataSource.getRepository(User);
    const branchRepository = dataSource.getRepository(Branch);
    const productRepository = dataSource.getRepository(Product);
    const globalStockRepository = dataSource.getRepository(GlobalStock);
    const branchStockRepository = dataSource.getRepository(BranchStock);

    // 1. Create Branches
    const branchesData = [
        { name: 'Cabang Pusat', location: 'Jakarta Pusat', contact: '021-111111' },
        { name: 'Cabang Jakarta Selatan', location: 'Jakarta Selatan', contact: '021-222222' },
    ];

    const branches: Branch[] = [];
    for (const branchData of branchesData) {
        let branch = await branchRepository.findOneBy({ name: branchData.name });
        if (!branch) {
            branch = branchRepository.create(branchData);
            await branchRepository.save(branch);
            console.log(`Created branch: ${branch.name}`);
        }
        branches.push(branch);
    }

    // 2. Create Users
    const passwordHash = await bcrypt.hash('password123', 10);
    const usersData = [
        {
            name: 'Owner User',
            email: 'owner@example.com',
            password: passwordHash,
            role: UserRole.OWNER,
            branch: undefined,
        },
        {
            name: 'Employee User',
            email: 'employee@example.com',
            password: passwordHash,
            role: UserRole.EMPLOYEE,
            branch: branches[0], // Assign to first branch
        },
        {
            name: 'Customer User',
            email: 'customer@example.com',
            password: passwordHash,
            role: UserRole.CUSTOMER,
            branch: undefined,
        },
    ];

    for (const userData of usersData) {
        let user = await userRepository.findOneBy({ email: userData.email });
        if (user) {
            // Update existing user
            user.password = userData.password;
            user.role = userData.role;
            user.branch = userData.branch as Branch; // Cast to Branch to satisfy type
            await userRepository.save(user);
            console.log(`Updated user: ${user.email}`);
        } else {
            // Create new user
            user = userRepository.create(userData);
            await userRepository.save(user);
            console.log(`Created user: ${user.email}`);
        }
    }

    // 3. Create Products and Stock
    const productsData = [
        {
            name: 'Parfum A',
            description: 'Floral scent, very popular.',
            price: 500000,
            category: 'Floral',
            imageUrl: 'https://via.placeholder.com/150',
        },
        {
            name: 'Parfum B',
            description: 'Woody scent, masculine.',
            price: 750000,
            category: 'Woody',
            imageUrl: 'https://via.placeholder.com/150',
        },
    ];

    for (const productData of productsData) {
        let product = await productRepository.findOneBy({ name: productData.name });
        if (!product) {
            product = productRepository.create(productData);
            await productRepository.save(product);
            console.log(`Created product: ${product.name}`);

            // Create Global Stock
            const globalStock = globalStockRepository.create({
                product: product,
                quantity: 100, // Initial global stock
            });
            await globalStockRepository.save(globalStock);

            // Distribute some stock to branches
            for (const branch of branches) {
                const branchStock = branchStockRepository.create({
                    branch: branch,
                    product: product,
                    quantity: 20, // Initial branch stock
                });
                await branchStockRepository.save(branchStock);
            }
        }
    }

    console.log('Seeding completed!');
    await app.close();
}

bootstrap();
