import express, { Application } from 'express';
import morgan from 'morgan';
import 'reflect-metadata';
import { useContainer, useExpressServer } from 'routing-controllers';
import Container from 'typedi';

async function bootstrap() {
	useContainer(Container);

	const app: Application = express();

	app.use(morgan('dev'));

	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));

	useExpressServer(app, {
		controllers: [__dirname + '/controllers/*.ts'],
		middlewares: [__dirname + '/middlewares/global/*.middleware.ts'],
		defaultErrorHandler: false,
	});

	app.listen(3000);

	console.info('Server running on http://localhost:3000');
}

void bootstrap();
