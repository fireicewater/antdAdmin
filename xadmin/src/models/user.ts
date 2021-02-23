import {useCallback, useState} from 'react'
import {AccountLogin, AuthParam} from "@/services/auth"
import {UserInterface} from "@/pages/User/service"
import {setLocalItem} from "@/utils/storage"

const USERKEY = "user";

export default function useAuthModel() {
  const [user, setUser] = useState<UserInterface>();

  const login = useCallback(async (params: AuthParam) => {
    const {data} = await AccountLogin(params);
    const token = data.token;
    //token
    setLocalItem(USERKEY, token, data.expireTime);
    setUser(data.user);
  }, [])

  const loginOut = useCallback(async () => {

  }, [])

  return {
    user,
    login,
    loginOut
  }
}
