import Collection from '@discordjs/collection';
import { connect, Model } from 'mongoose';
import LinkModel, { Link } from '../models/Link';
import { Logger } from 'winston';
import App from '../../server/classes/App';

let i = 0;

type ModelNames = 'link';
type ModelTypes = Link;

const MODELS = {
	link: LinkModel,
};

export default class SettingsProvider {
	public app: App;

	/* cache */
	public link: Collection<string, Link>;

	/* models */
	public LinkModel: Model<Link>;

	public constructor(app: App) {
		/* our cient model */
		this.app = app;

		/* our document collections */
		this.link = new Collection();

		/* our models */
		this.LinkModel = LinkModel;
	}

	/* creates new model with provided data */
	public async new(type: ModelNames, data: object): Promise<ModelTypes> {
		const model = MODELS[type];
		const doc = new model(data);
		// @ts-ignore
		await doc.save();
		this[type].set(doc.id, doc as any);
		this.app.logger.info(`[DATABASE] Made new ${model.modelName} document with ID of ${doc._id}.`);
		return doc;
	}

	/* setting options of an existing document */
	public async set(type: ModelNames, data: object, key: object): Promise<ModelTypes | null> {
		const model = MODELS[type];
		const doc = await model.findOneAndUpdate(data, { $set: key }, { new: true });
		if (!doc) return null;
		this.app.logger.info(`[DATABASE] Edited ${model.modelName} document with ID of ${doc._id}.`);
		this[type].set(doc.id, doc as any);
		return doc;
	}

	/* removes a document with the provider query */
	public async remove(type: ModelNames, data: any): Promise<ModelTypes | null> {
		const model = MODELS[type];
		const doc = await model.findOneAndDelete(data);
		if (!doc) return null;
		this[type].delete(doc.id);
		this.app.logger.info(`[DATABASE] Deleted ${model.modelName} document with ID of ${doc._id}.`);
		return doc;
	}

	/* caching documents */
	public async cacheAll(): Promise<number> {
		const map = Object.entries(MODELS);
		for (const [type, model] of map) await this._cache(type as any, model);
		return i;
	}

	private async _cache(type: ModelNames, model: Model<any>): Promise<any> {
		const collection = this[type];
		const items = await model.find();
		for (const i of items) collection.set(i.id, i);
		return i += items.length;
	}

	/* connecting */
	private async connect(url: undefined | string): Promise<Logger | number> {
		if (url) {
			const start = Date.now();
			try {
				await connect(url, {
					useCreateIndex: true,
					useNewUrlParser: true,
					useFindAndModify: false
				});
			} catch (err) {
				this.app.logger.error(`[SETTINGS] Error when connecting to MongoDB:\n${err.stack}`);
				process.exit(1);
			}
			return this.app.logger.info(`[SETTINGS] Connected to MongoDB in ${Date.now() - start}ms.`);
		}
		this.app.logger.error('[SETTINGS] No MongoDB url provided!');
		return process.exit(1);
	}

	public async init(): Promise<Logger> {
		await this.connect(process.env.MONGO);
		this.cacheAll();
		return this.app.logger.info(`[SETTINGS] Successfully cached ${i} documents.`);
	}
}