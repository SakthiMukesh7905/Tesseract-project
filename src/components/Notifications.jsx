import { createContext, useContext, useState } from "react";
const Context = createContext({unread:0,setUnread:()=>{}});

export function NotificationsProvider({children}) {  // Named export (imported with curly braces elsewhere)
  const [unread,setUnread]=useState(3);
  return <Context.Provider value={{unread,setUnread}}>{children}</Context.Provider>;
}
export const useNotifications=()=>useContext(Context);  // Named export
