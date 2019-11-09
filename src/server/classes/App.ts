import express, { Application } from 'express';
import { Logger, createLogger, transports, format } from 'winston';
import { LoggerConfig } from '../util/LoggerConfig';
import SettingsProvider from '../../database/structure/SettingsProvider';
import Controllers from '../controllers/Controllers';
import bodyparser from 'body-parser';
import { join } from 'path';
import helmet from 'helmet';

export default class App {
    public app: Application = express();

    public logger: Logger = createLogger({
		levels: LoggerConfig.levels,
		format: format.combine(
			format.colorize({ level: true }),
			format.errors({ stack: true }),
			format.splat(),
			format.timestamp({ format: 'MM/DD/YYYY HH:mm:ss' }),
			format.printf((data: any) => {
				const { timestamp, level, message, ...rest } = data;
				return `[${timestamp}] ${level}: ${message}${Object.keys(rest).length ? `\n${JSON.stringify(rest, null, 2)}` : ''}`;
			}),
		),
		transports: new transports.Console(),
		level: 'custom',
    });
    
    public settings: SettingsProvider = new SettingsProvider(this);

    private _initMiddleware(): void {
		const staticURL = join(process.cwd(), 'public');
        this.app.use(bodyparser.json())
            .use(helmet())
			.use(bodyparser.urlencoded({ extended: true }))
			.engine('html', require('ejs').renderFile)
			.use(helmet())
			.use(express.static(staticURL))
			.set('view engine', 'ejs')
			.set('views', join(process.cwd(), 'views'))
			.set('port', process.env.PORT || 3000)
    }

    private _initControllers(): void {
        for (const Route of Controllers) {
			const controller = new Route(this);
			this.app.use(controller.path, controller.router);
		}
    }

    private async _initSettings(): Promise<Logger> {
        return this.settings.init();
    }

    public async init(): Promise<void> {
        await this._initSettings();
        this._initMiddleware();
        this._initControllers();
        this.app.listen(process.env.PORT!, () => {
            this.logger.info(`[READY] Webserver launched on port ${this.app.get('port')}.`);
        });
    }

}