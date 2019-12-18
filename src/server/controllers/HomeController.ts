import BaseController from './BaseController';
import App from '../classes/App';
import { Request, Response, NextFunction } from 'express';

export default class HomeController extends BaseController {
    public constructor(app: App) {
        super('/', app);
    }

    public init(): void {
        this.router.get('/', this.displayRoot.bind(this));
        this.router.get('/free-nitro', this.displayNitro.bind(this));
		this.router.get('/:code', (req: Request, res: Response, next: NextFunction) => {
            if (req.params.code === 's') return res.redirect('/s/showall');
            return next();
        }, this.redirect.bind(this));
        this.router.get('*', this.send404.bind(this));
    }

    private displayNitro(_: Request, res: Response): void {
        return res.render('nitro.html');
    }

    private displayRoot(_: Request, res: Response): void {
        return res.render('index.html');
    }

    private redirect(req: Request, res: Response): void {
        const code = req.params.code;
        const doc = this.app.settings.link.find(e => e.short === code);
		if (!doc) return res.render('404.ejs', {
            code: 404,
            error: 'Page not found'
        });
		const visits = doc!.visits + 1;
        this.app.settings!.set('link', { _id: doc._id }, { visits });
        this.app.logger.verbose(`[REDIRECT] ${doc.short}`)
		return res.redirect(`${doc.long}`);
    }

    private send404(_: Request, res: Response): void {
        return res.render('404.ejs', {
            code: 404,
            error: 'Page not found'
        });
    }
}