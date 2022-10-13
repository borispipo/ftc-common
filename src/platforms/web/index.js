const Platform = {
    OS: 'web',
    select: (obj) => ('web' in obj ? obj.web : obj.default),
    get isTesting() {
      if (process.env.NODE_ENV === 'test') {
        return true;
      }
      return false;
    }
  };
  
  export default Platform;