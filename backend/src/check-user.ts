import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { User } from './users/entities/user.entity';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const dataSource = app.get(DataSource);
    const userRepository = dataSource.getRepository(User);

    const email = 'owner@example.com';
    const passwordToCheck = 'password123';

    const fs = require('fs');
    const log = (msg) => {
        console.log(msg);
        fs.appendFileSync('check-output.txt', msg + '\n');
    };

    log(`Checking user: ${email}`);
    const user = await userRepository.findOneBy({ email });

    if (!user) {
        log('User NOT FOUND in database.');
    } else {
        log('User FOUND.');
        log(`Stored Password Hash: ${user.password}`);

        const isMatch = await bcrypt.compare(passwordToCheck, user.password);
        log(`Comparing with '${passwordToCheck}': ${isMatch ? 'MATCH' : 'NO MATCH'}`);

        const newHash = await bcrypt.hash(passwordToCheck, 10);
        log(`Expected Hash format (example): ${newHash}`);
    }

    await app.close();
}

bootstrap();
