import BaseController from './BaseController';
import type App from '../structures/App';
import type { Request, Response } from 'express';

export default class BotController extends BaseController {
	public constructor(app: App) {
		super('/bot', app);
	}

	public init(): void {
		this.router.get('/', this.createBot.bind(this));
	}

	private createBot(req: Request, res: Response): void {
		const { id, p } = req.query;
		if (!id)
			return res.render('404.ejs', {
				code: 409,
				error: `Invalid bot ID supplied.`,
			});
		return res.redirect(`https://discord.com/oauth2/authorize?client_id=${id}&permissions=${p ?? 0}&scope=bot`);
	}
}
