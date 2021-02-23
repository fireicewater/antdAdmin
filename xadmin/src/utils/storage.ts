type storageType = {
  value: any,
  expires?: number
  startTime?: number
}

export function setLocalItem(key: string, value: any, expireTime?: number) {
  let obj: storageType = {
    value
  }
  if (expireTime) {
    obj.expires = expireTime;
    obj.startTime = new Date().getTime();
  }
  localStorage.setItem(key, JSON.stringify(obj))
}

export function getLocaleItem(key: string) {
  const json = localStorage.getItem(key);
  if (json) {
    let item = JSON.parse(json) as storageType;
    if (item.expires && item.startTime) {
      const now = new Date().getTime();
      if (now - item.startTime > item.expires * 1000) {
        localStorage.removeItem(key);
        return null;
      }
    }
    return item.value;
  }
  return null;
}
