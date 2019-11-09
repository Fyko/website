import BaseController from "./BaseController";
import App from "../classes/App";
import { Request, Response } from 'express';

export default class URLController extends BaseController {
    public constructor(app: App) {
        super('/s', app);
    }

    public init(): void {
        this.router.get('/showall', this.displayAll.bind(this));
        this.router.get('/:code', this.show.bind(this));
        this.router.post('/', this.create.bind(this));
        this.router.patch('/', this.update.bind(this));
        this.router.delete('/', this.delete.bind(this));
    }

    private displayAll(req: Request, res: Response): Response | void {
        this.app.logger.verbose(`[/s]: hit displayAll`);
        if (req.query.token !== process.env.TOKEN) return res.render('404.ejs', {
            code: 401,
            error: 'Unauthorized'
        });
		const links = this.app.settings!.link;
		if (!links.size) return res.render('404.ejs', {
            code: 409,
            error: 'There are no short URLs to display'
        });
		return res.status(200).send(links.map(l => l.short));
    }

    private show(req: Request, res: Response): Response | void {
        if (req.query.token !== process.env.TOKEN) return res.render('404.ejs', {
            code: 401,
            error: 'Unauthorized'
        });
		const doc = this.app.settings!.link.find(e => e.short === req.params.code);
		if (!doc) return res.render('404.ejs', {
            code: 404,
            error: 'Short URL not found'
        });
		return res.status(200).send(doc);	
    }

    private async create(req: Request, res: Response): Promise<Response | void> {
        if (req.query.token !== process.env.TOKEN) return res.status(401).send({ code: 401, message: `Unauthorized` });
		const existing = this.app.settings!.link.find(u => u.short === req.body.short);
		if (existing) return res.status(409).send({ code: 409, message: `/${req.body.short} is in use` });
		const doc = await this.app.settings!.new('link', { long: req.body.long, short: req.body.short });
		return res.status(200).send(doc);
    }

    private async update(req: Request, res: Response): Promise<Response | void> {
        if (req.query.token !== process.env.TOKEN) return res.status(401).send({ code: 401, message: `Unauthorized` });
		const existing = this.app.settings!.link.find(u => u.short === req.params.short);
		const { long, short } = req.body;
		if (!long) return res.status(409).send({ code: 409, message: 'Invalid "long" in request body' });
		if (!short || !existing) return res.status(409).send({ code: 409, message: 'Short URL not found' });
		const doc = await this.app!.settings!.set('link', { _id: existing._id }, { long, short });
		return res.status(200).send(doc);
    }

    private async delete(req: Request, res: Response): Promise<Response | void> {
        if (req.query.token !== process.env.TOKEN) return res.status(401).send({ code: 401, message: `Unauthorized` });
		const doc = this.app.settings.link.find(l => l.short === req.params.short);
		if (!doc) return res.status(404).send({ code: 404, message: 'Short URL not found' });
		try {
			await this.app.settings.remove('link', { _id: doc._id });
			return res.status(200).send(doc);
		} catch (error) {
			return res.status(500).send({ error });
		}
    }
}