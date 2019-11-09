import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '..', '.env') });

import App from "./server/classes/App";

(async () => {
    const app = new App();

    return app.init();
})();