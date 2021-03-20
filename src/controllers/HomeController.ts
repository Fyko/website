import BaseController from './BaseController';
import type App from '../structures/App';
import type { Request, Response, NextFunction } from 'express';

export default class HomeController extends BaseController {
	public constructor(app: App) {
		super('/', app);
	}

	public init(): void {
		this.router.get('/', this.displayRoot.bind(this));
		this.router.get(
			'/:code',
			(req: Request, res: Response, next: NextFunction) => {
				if (req.params.code === 's') return res.redirect('/s/showall');
				return next();
			},
			this.redirect.bind(this),
		);
		this.router.get('*', this.send404.bind(this));
	}

	private displayRoot(_: Request, res: Response): void {
		return res.render('index.html');
	}

	private async redirect(req: Request, res: Response): Promise<void> {
		const code = req.params.code;

		const doc = await this.app.prisma.link.findFirst({ where: { short: code } });
		if (!doc)
			return res.render('404.ejs', {
				code: 404,
				error: 'Page not found',
			});

		const visits = doc.visits + 1;
		void this.app.prisma.link.update({
			where: {
				id: doc.id,
			},
			data: {
				visits,
			},
		});

		this.app.logger.verbose(`[REDIRECT] ${doc.short}`);
		return res.redirect(doc.long);
	}

	private send404(_: Request, res: Response): void {
		return res.render('404.ejs', {
			code: 404,
			error: 'Page not found',
		});
	}
}
