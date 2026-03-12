fetch('https://jbgpfypnjhfzkitbrode.supabase.co/rest/v1/saved_posts?limit=1', {
  method: 'GET',
  headers: {
    'apikey': 'sb_publishable_BLVrVkOQWh5yu7_J94n_UQ_rWE09ky3',
    'Authorization': 'Bearer sb_publishable_BLVrVkOQWh5yu7_J94n_UQ_rWE09ky3'
  }
}).then(res => res.json()).then(data => console.log(JSON.stringify(data))).catch(console.error);
