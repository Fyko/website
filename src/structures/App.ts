import express, { Application } from 'express';
import Controllers from '../controllers/Controllers';
import { json, urlencoded } from 'body-parser';
import { join } from 'path';
import helmet from 'helmet';
import { renderFile } from 'ejs';
import { PrismaClient } from '@prisma/client';
import { logger } from '../util/logger';

export default class App {
	public app: Application = express();

	public logger = logger;

	public prisma = new PrismaClient();

	private _initMiddleware(): void {
		const staticURL = join(process.cwd(), 'public');
		this.app
			.use(json())
			.use(helmet())
			.use(urlencoded({ extended: true }))
			// @ts-ignore
			.engine('html', renderFile) // eslint-disable-line @typescript-eslint/no-misused-promises
			.use(helmet())
			.use(express.static(staticURL))
			.set('view engine', 'ejs')
			.set('views', join(process.cwd(), 'views'))
			.set('port', process.env.PORT ?? 3000);
	}

	private _initControllers(): void {
		for (const Route of Controllers) {
			const controller = new Route(this);
			this.app.use(controller.path, controller.router);
		}
	}

	public async init(): Promise<void> {
		await this.prisma.$connect();
		this._initMiddleware();
		this._initControllers();
		this.app.listen(process.env.PORT!, () => {
			this.logger.info(`[READY] Webserver launched on port ${this.app.get('port')}.`);
		});
	}
}
