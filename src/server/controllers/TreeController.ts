import { Request, Response } from 'express';
import fetch from 'node-fetch';
import App from '../classes/App';
import BaseController from './BaseController';

interface User {
    name: string;
    amount: number;
    message: string;
    timestamp: number;
    image: string;
    top: number | null;
}

interface TeamTreesResponse {
    total?: number;
    top?: User[];
    recent?: User[];
}

export default class TeamTreesController extends BaseController {
    public constructor(app: App) {
        super('/teamtrees', app);
    }

    public init(): void {
        this.router.get('/', this.gatherTreesData.bind(this));
    }

    private async gatherTreesData(req: Request, res: Response): Promise<Response | void> {
        try {
            const _data: TeamTreesResponse = { };
            const get = await fetch('https://teamtrees.org/');
            const data = await get.text();
    
            const _totalMatch = data.match(/<div id="totalTrees" class="counter" data-count="\d+">/g);
            if (_totalMatch?.length) _data.total = parseInt(_totalMatch[0].match(/\d+/g)![0], 10);
    
            const _topMatch = data.match(/<div class="media pt-3" data-trees-top="(\d+)">(.*?)<\/div>/gms);
            if  (_topMatch?.length) {
                _data.top = _topMatch.reduce((pre: User[], val, i: number): User[] => {
                    const _user = this._parseUser(val, i, true);
                    pre.push(_user);
                    return pre;
                }, []);
            }
    
            const _recentMatch  = data.match(/<div class="media pt-3">(.*?)<\/div>/gms);
            if  (_recentMatch?.length) {
                _data.recent = _recentMatch.reduce((pre: User[], val: string, i: number): User[] => {
                    const _user = this._parseUser(val, i);
                    pre.push(_user);
                    return pre;
                }, []);
            };
    
            return res.status(200).send(_data);
        } catch (err) {
            return res.status(500).send({ error: `${err}` });
        }
    }

    private _parseUser(user: string, i: number, top = false): User {
        const name = (user.match(/<strong.*?>(.*?)<\/strong>/m) || [])[1];
        const amount = (user.match(/<span.*?class="(feed-tree-count.*)">(.*) tree.*<\/span>/m) || [])[2];
        const message = (user.match(/<span.*?class="((?!feed-datetime|feed-tree-count).)*">(.*?)<\/span>/m) || [])[2];
        const date = (user.match(/<span.*?>(.*(\d+:\d+:\d+).*)<\/span>/m) || [])[1];
        const image = (user.match(/<img.*?src="(.*?)">/m) || [])[1];
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