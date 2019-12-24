import BaseController from './BaseController';
import App from '../classes/App';
import { Request, Response } from 'express';

export default class BotController extends BaseController {
	public constructor(app: App) {
		super('/bot', app);
	}

	public init(): void {
		this.router.get('/', this.createBot.bind(this));
	}

	private createBot(req: Request, res: Response): void {
		const { id, p } = req.query;
		if (!id || !p)
			return res.render('404.ejs', {
				code: 409,
				error: `Invalid ${id ? 'permissions value (?p=)' : 'bot ID (?id=)'} supplied.`,
			});
		return res.redirect(`https://discordapp.com/oauth2/authorize?client_id=${id}&permissions=${p}&scope=bot`);
	}
}
