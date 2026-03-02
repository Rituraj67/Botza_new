/* Quick API smoke-test — run with: node test-api.js */
const http = require('http');

function request(method, path, body) {
    return new Promise((resolve, reject) => {
        const payload = body ? JSON.stringify(body) : null;
        const options = {
            hostname: 'localhost',
            port: 3001,
            path,
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
            },
        };
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
                try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
                catch { resolve({ status: res.statusCode, body: data }); }
            });
        });
        req.on('error', reject);
        if (payload) req.write(payload);
        req.end();
    });
}

async function run() {
    let pass = 0, fail = 0;

    function check(label, actual, expected) {
        if (actual === expected) {
            console.log(`  ✓ ${label}`);
            pass++;
        } else {
            console.error(`  ✗ ${label}  (got ${actual}, expected ${expected})`);
            fail++;
        }
    }

    console.log('\n=== BOTZA API Smoke Tests ===\n');

    // 1. Health
    console.log('1. Health check');
    const h = await request('GET', '/api/health');
    check('status 200', h.status, 200);
    check('body.status = ok', h.body.status, 'ok');

    // 2. Register
    console.log('\n2. Register user');
    const reg = await request('POST', '/api/auth/register', {
        email: 'demo@botza.com', password: 'botza123', role: 'admin'
    });
    check('status 201', reg.status, 201);

    // 3. Duplicate register
    console.log('\n3. Duplicate register → 409');
    const dup = await request('POST', '/api/auth/register', {
        email: 'demo@botza.com', password: 'botza123'
    });
    check('status 409', dup.status, 409);

    // 4. Login — correct
    console.log('\n4. Login (correct)');
    const login = await request('POST', '/api/auth/login', {
        email: 'demo@botza.com', password: 'botza123'
    });
    check('status 200', login.status, 200);
    check('has token', typeof login.body.token, 'string');

    // 5. Login — wrong password
    console.log('\n5. Login (wrong password) → 401');
    const bad = await request('POST', '/api/auth/login', {
        email: 'demo@botza.com', password: 'wrongpw'
    });
    check('status 401', bad.status, 401);

    // 6. Newsletter subscribe
    console.log('\n6. Newsletter subscribe');
    const sub = await request('POST', '/api/newsletter/subscribe', {
        email: 'subscriber@example.com'
    });
    check('status 201', sub.status, 201);

    // 7. Newsletter duplicate → 200 (friendly)
    console.log('\n7. Newsletter duplicate');
    const subDup = await request('POST', '/api/newsletter/subscribe', {
        email: 'subscriber@example.com'
    });
    check('status 200', subDup.status, 200);

    // 8. Demo request
    console.log('\n8. Demo request');
    const demo = await request('POST', '/api/contact/demo', {
        name: 'John Doe', email: 'john@corp.com', message: 'I want a demo'
    });
    check('status 201', demo.status, 201);

    // 9. Access request
    console.log('\n9. Request access');
    const access = await request('POST', '/api/contact/request-access', {
        email: 'access@corp.com'
    });
    check('status 201', access.status, 201);

    // 10. Missing email validation
    console.log('\n10. Validation — missing email');
    const noEmail = await request('POST', '/api/newsletter/subscribe', {});
    check('status 400', noEmail.status, 400);

    console.log(`\n==================`);
    console.log(`PASSED: ${pass}  FAILED: ${fail}`);
    console.log('==================\n');
    process.exit(fail > 0 ? 1 : 0);
}

run().catch((err) => { console.error('Test runner error:', err); process.exit(1); });
