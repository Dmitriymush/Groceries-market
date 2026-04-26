const store = require('../_store');

module.exports = function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  const id = Number(req.query.id);
  const index = store.groceries.findIndex((g) => g.id === id);

  if (req.method === 'PATCH') {
    if (index === -1) return res.status(404).json({ error: 'Not found' });
    store.groceries[index] = { ...store.groceries[index], ...req.body };
    return res.status(200).json(store.groceries[index]);
  }

  if (req.method === 'DELETE') {
    if (index === -1) return res.status(404).json({ error: 'Not found' });
    store.groceries.splice(index, 1);
    return res.status(200).json({});
  }

  if (req.method === 'GET') {
    if (index === -1) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json(store.groceries[index]);
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
