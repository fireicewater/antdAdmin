const USRKEY = "USER";


export function getAuthority() {
  return localStorage.getItem(USRKEY)
}


export function setAuthority(token: string) {
  return localStorage.setItem(USRKEY, token);
}

