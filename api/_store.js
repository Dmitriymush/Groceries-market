// In-memory store for Vercel serverless demo
// Data resets on cold start — intentional for a demo deployment

const store = {
  users: [
    {
      id: 1,
      username: 'demo',
      password: 'demo123',
      name: 'Demo User',
      token: 'mock-jwt-token-demo-user',
    },
  ],
  groceries: [
    { id: 1, name: 'Milk', amount: 2, unit: 'liters', bought: false, userId: 1, createdAt: '2026-04-20T10:00:00Z' },
    { id: 2, name: 'Bread', amount: 1, unit: 'pcs', bought: false, userId: 1, createdAt: '2026-04-20T10:01:00Z' },
    { id: 3, name: 'Apples', amount: 5, unit: 'pcs', bought: true, userId: 1, createdAt: '2026-04-20T10:02:00Z' },
    { id: 4, name: 'Chicken', amount: 1, unit: 'kg', bought: false, userId: 1, createdAt: '2026-04-20T10:03:00Z' },
    { id: 5, name: 'Rice', amount: 2, unit: 'packs', bought: false, userId: 1, createdAt: '2026-04-20T10:04:00Z' },
  ],
  nextId: 6,
};

module.exports = store;
