import BaseController from './BaseController';
import App from '../classes/App';
import { Request, Response } from 'express';
import fetch from 'node-fetch';

const HTMLREGEX = /https?:\/\/cdn.discordapp.com\/attachments\/\d{17,19}\/\d{17,19}\/.*?.(?:html)/;

export default class TranscriptController extends BaseController {
	public constructor(app: App) {
		super('/transcript', app);
	}

	public init(): void {
		this.router.get('/', this.showTranscript.bind(this));
	}

	private async showTranscript(req: Request, res: Response): Promise<Response | void> {
		try {
			const { uri } = req.query;
			const match = uri ? HTMLREGEX.test(`${uri}`) : null;
			if (!uri || !match)
				return res.render('404.ejs', {
					code: 409,
					error: 'Invalid "URI" supplied.',
				});
			const get = await fetch(`${uri}`);
			const text = await get.text();
			res.set('Content-Type', 'text/html');
			return res.send(Buffer.from(text));
		} catch {
			return res.render('404.ejs', {
				code: 500,
				error: 'Umm... something happened 🦗',
			});
		}
	}
}
