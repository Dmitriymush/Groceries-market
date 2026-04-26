const store = require('../_store');

module.exports = function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'GET') {
    const { userId } = req.query;
    let items = store.groceries;
    if (userId) {
      items = items.filter((g) => g.userId === Number(userId));
    }
    return res.status(200).json(items);
  }

  if (req.method === 'POST') {
    const item = { ...req.body, id: store.nextId++ };
    store.groceries.push(item);
    return res.status(201).json(item);
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
