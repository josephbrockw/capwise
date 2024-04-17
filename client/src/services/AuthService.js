export const getUser = () => {
  const auth = JSON.parse(window.localStorage.getItem('app.auth'));
  if (auth) {
    const [, payload,] = auth.access.split('.');
    const decoded = JSON.parse(window.atob(payload));
    // Remove token fields from user information
    return decoded;
  }
  return undefined;
}

export const removeAppStorage = () => {
  Object.keys(window.localStorage).forEach((key) => {
    if (key.startsWith('app.')) {
      window.localStorage.removeItem(key);
    }
  });
}

