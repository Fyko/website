import BaseController from './BaseController';
import App from '../classes/App';
import { Request, Response } from 'express';

export default class ToolsController extends BaseController {
	public constructor(app: App) {
		super('/tools', app);
	}

	public init(): void {
		this.router.get('/fees/:AMOUNT', this._translateFeeds.bind(this));
	}

	private async _translateFeeds(req: Request, res: Response): Promise<Response | void> {
		try {
			const { amount } = req.params;
			if (!amount) return res.status(409).send({ code: 409, message: 'No AMOUNT param provided - /fees/:AMOUNT' });
			const num = parseInt(amount, 10);

			return res.status(200).send({
				code: 200,
				message: JSON.stringify({
					paypal: this.makeFee(num, 0.029, 0.3),
					ebay: this.makeFee(num, 0.129),
					goat: this.makeFee(num, 0.095, 5),
					grailed: this.makeFee(num, 0.089),
					stockx: {
						1: this.makeFee(num, 0.095),
						2: this.makeFee(num, 0.09),
						3: this.makeFee(num, 0.085),
						4: this.makeFee(num, 0.08),
					},
				}),
			});
		} catch {
			return res.status(500).send({ code: 500, error: 'Internal server error.' });
		}
	}

	private makeFee(value: number, multiplier: number, extra?: number): number {
		let gen = value - value * multiplier;
		if (extra) gen -= extra;
		return gen;
	}
}
