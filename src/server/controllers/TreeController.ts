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
            const _data = { };

            const total = await this.api.getTotalTrees();
            const top = await this.api.getMostTrees() as any[];
            const recent = await this.api.getMostRecent() as any[];
    
            return res.status(200).send(JSON.stringify({ total, top, recent }));
        } catch (err) {
            return res.status(500).send({ error: `${err}` });
        }
    }

    private _parseUser(user: string, i: number, top = false): User {
        const name = user.match(/<strong.*?>(.*?)<\/strong>/m)![1];
        const amount = user.match(/<span.*?class="(feed-tree-count.*)">(.*) tree.*<\/span>/m)![1];
        const message = user.match(/<span.*?class="((?!feed-datetime|feed-tree-count).)*">(.*?)<\/span>/m)![2];
        const date = user.match(/<span.*?>(.*(\d+:\d+:\d+).*)<\/span>/m)![1];
        const image = user.match(/<img.*?src="(.*?)">/m)![1];
        return {
            name,
            amount: parseInt(amount, 10),
            message,
            timestamp: new Date(date).getTime(),
            image:  `https://teamtrees.org/${image}`,
            top: top ? i + 1 : null
        };
    }
}