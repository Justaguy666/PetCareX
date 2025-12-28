import fs from 'fs';
try {
    const env = fs.readFileSync('.env', 'utf8');
    console.log(env);
} catch (err) {
    console.error(err);
}
