// src/services/auth.js
export const loginUser = async (username, password) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // Mock user database
  const users = {
    admin: {
      password: 'admin123',
      role: 'admin',
      name: 'Administrator',
      token: 'mock-admin-token-123'
    },
    user: {
      password: 'user123',
      role: 'user',
      name: 'Regular User',
      token: 'mock-user-token-456'
    }
  };

  const user = users[username];

  if (!user || user.password !== password) {
    throw new Error('Invalid username or password');
  }

  return {
    username,
    role: user.role,
    name: user.name,
    token: user.token
  };
};

export const registerUser = async (userData) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    username: userData.username,
    role: 'user',
    name: `${userData.firstName} ${userData.lastName}`,
    token: `mock-new-user-token-${Date.now()}`
  };
};