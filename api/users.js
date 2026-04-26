const store = require('./_store');

module.exports = function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username } = req.query;
  let results = store.users;

  if (username) {
    results = results.filter((u) => u.username === username);
  }

  return res.status(200).json(results);
};
