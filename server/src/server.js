import app from './app.js';
import getEnv from './utils/env.util.js';

const PORT = getEnv('PORT', 3000);

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});