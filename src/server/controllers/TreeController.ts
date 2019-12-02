import { Request, Response } from 'express';
import fetch from 'node-fetch';
import App from '../classes/App';
import BaseController from './BaseController';
import { TeamTrees } from 'teamtrees-api';

export default class TeamTreesController extends BaseController {
    public api: TeamTrees;
    public constructor(app: App) {
        super('/teamtrees', app);
        this.api = new TeamTrees({
            cache: {
                enable: true,
                duration: 1
            },
        });
    }

    public init(): void {
        this.router.get('/', this.gatherTreesData.bind(this));
    }

    private async gatherTreesData(req: Request, res: Response): Promise<Response | void> {
        try {
            const total = await this.api.getTotalTrees();
            const top = await this.api.getMostTrees() as any[];
            const recent = await this.api.getMostRecent() as any[];
            return res.status(200).send({ total, top, recent });
        } catch (err) {
            return res.status(500).send({ error: `${err}` });
        }
    }
}