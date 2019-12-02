const { TeamTrees } = require('teamtrees-api');
const teamTrees = new TeamTrees();

(async () => {
    teamTrees.getMostTrees().then(console.log);
})()