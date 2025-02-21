import { useContext } from "react";
import AppWebsocketContext from "../context/AppWebsocketContext";


export default function useAppWebsocket() {
  const appWs = useContext(AppWebsocketContext)
  if (!appWs) {
    throw new Error('useAppWebsocket must be used within a AppWebsocketProvider')
  }
  return appWs
} 