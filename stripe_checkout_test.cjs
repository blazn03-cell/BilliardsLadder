const fetch = global.fetch;

(async () => {
    const body = {
        customerId: 'cus_UGVAFri2xtJPkJ',
        priceIds: ['price_1THmhwDvTG8XWAaKP5IdXAic'],
        mode: 'subscription',
        quantities: [1],
        userId: 'test-user'
    };

    const res = await fetch('http://127.0.0.1:5000/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    const text = await res.text();
    console.log('status', res.status);
    console.log(text);
})();
