export const setTutorialCookie = (gameId: string) => {
  const name = `musclebrain_tutorial_${gameId}`;
  const value = "shown";
  const days = 365;
  const date = new Date();
  
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
};

export const hasTutorialBeenShown = (gameId: string): boolean => {
  if (typeof document === 'undefined') return false; // Server-side safety
  
  const name = `musclebrain_tutorial_${gameId}=`;
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return true;
    }
  }
  return false;
};

export const resetAllTutorials = () => {
  if (typeof document === 'undefined') return;
  
  const cookies = document.cookie.split(";");

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    const trimmedName = name.trim();
    
    if (trimmedName.startsWith('musclebrain_tutorial_')) {
        document.cookie = `${trimmedName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    }
  }
  
  console.log('All tutorial cookies reset');
};
