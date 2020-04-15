import BaseController from './BaseController';
import App from '../classes/App';
import { Request, Response } from 'express';
import { stripIndents } from 'common-tags';

export default class AmazonController extends BaseController {
	public constructor(app: App) {
		super('/djs', app);
	}

	public init(): void {
		this.router.get('/usage', this.showUsage.bind(this));
		this.router.get('/', this.redirect.bind(this));
	}

	private showUsage(_: Request, res: Response): Response | void {
		const base = `https://fyko.net/djs?`;
		return res.status(200).send(stripIndents`
			Query Parameters:

			b = branch [stable]
			c = class
			t = typedef
			p = prop
			e = event

			q = query

			Examples:
			${base}c=UserManager&p=fetch
			${base}t=BanInfo
			${base}b=master&c=Client&p=memberUpdate&e=1
			${base}b=master&q=User.tag (API will replace and encode the . to #)
		`);
	}

	private redirect(req: Request, res: Response): Response | void {
		if (!/\?.+/.test(req.url)) return this.showUsage(req, res);
		/*
			b = branch
			c = class
			t = typedef
			p = prop
			e = event

			q = query
		*/
		const { b, c, t, p, q, e } = req.params;
		const url = q
			? `https://discord.js.org/#/docs/main/${b ?? 'stable'}/${c ? 'class' : 'typedef'}/${c ? c : t}${
					c ? `scrollTo?${e ? 'e' : ''}${p}` : ''
			  }`
			: `https://discord.js.org/#/docs/main/stable/search?q=${encodeURIComponent(q.replace('.', '#'))}`;
		return res.redirect(url);
	}
}
