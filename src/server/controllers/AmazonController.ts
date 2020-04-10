import BaseController from './BaseController';
import App from '../classes/App';
import { Request, Response } from 'express';

export default class AmazonController extends BaseController {
	public constructor(app: App) {
		super('/amazon', app);
	}

	public init(): void {
		this.router.get('/:data', this.redirect.bind(this));
	}

	private redirect(req: Request, res: Response): Response | void {
		return res.redirect(`https://amzn.com/${req.params.data}`);
	}
}
