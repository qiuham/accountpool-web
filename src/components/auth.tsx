import {createContext,useContext,useEffect,useState} from 'react'
import type {ReactNode} from 'react'
import {LoginPage} from './login-page'

type Auth={request:(path:string,init?:RequestInit)=>Promise<any>;logout:()=>Promise<void>}
const Context=createContext<Auth|null>(null)
export function useAuth(){const value=useContext(Context);if(!value)throw new Error('登录组件未初始化');return value}
export function AuthProvider({children}:{children:ReactNode}){
 const [authenticated,setAuthenticated]=useState(false),[initialized,setInitialized]=useState(true),[loading,setLoading]=useState(true)
 const [username,setUsername]=useState(''),[password,setPassword]=useState(''),[setupKey,setSetupKey]=useState('')
 const [busy,setBusy]=useState(false),[error,setError]=useState('')
 async function status(){
  setLoading(true);setError('')
  try{
   const response=await fetch('/console/auth/status',{credentials:'same-origin'})
   if(!response.ok)throw new Error('管理服务未就绪')
   const body=await response.json();setInitialized(body.initialized);setAuthenticated(body.authenticated)
  }catch{setError('连接管理服务失败，请检查服务是否启动')}
  finally{setLoading(false)}
 }
 useEffect(()=>{void status()},[])
 // Two page URLs; authentication also guards direct navigation and Back.
 useEffect(()=>{
  if(loading)return
  const route=()=>{const path=authenticated?'/admin':'/login';if(location.pathname!==path)history.replaceState(null,'',path);document.title=(authenticated?'管理后台':'登录')+' · AccountPool'}
  route();window.addEventListener('popstate',route)
  return()=>window.removeEventListener('popstate',route)
 },[authenticated,loading])
 async function request(path:string,init:RequestInit={}){
  let response:Response
  try{response=await fetch(path,{...init,credentials:'same-origin'})}
  catch(error){if(error instanceof DOMException&&error.name==='AbortError')throw error;throw new Error('连接服务失败，请检查网络后重试')}
  if(response.status===401){setAuthenticated(false);setError('登录已过期，请重新登录');throw new Error('登录已过期')}
  let body:any
  try{body=await response.json()}catch{throw new Error('服务返回了无效响应，请稍后重试')}
  if(!response.ok||body.success===false)throw new Error(body.error||'请求失败')
  return body
 }
 async function login(){
  setBusy(true);setError('')
  try{
   await request(initialized?'/console/auth/login':'/console/auth/setup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password,...(!initialized?{setupKey}:{})})})
   setInitialized(true);setAuthenticated(true);setSetupKey('')
  }catch(error){setError(error instanceof Error?error.message:'登录失败')}finally{setPassword('');setBusy(false)}
 }
 async function logout(){
  try{await request('/console/auth/logout',{method:'POST'});setAuthenticated(false)}
  catch(error){setError(error instanceof Error?error.message:'退出失败，请重试')}
 }
 if(loading)return <div className="content">正在连接管理服务…</div>
 if(!authenticated)return <LoginPage {...{initialized,username,password,setupKey,busy,error,setUsername,setPassword,setSetupKey,login}}/>
 return <Context.Provider value={{request,logout}}>{error&&<p role="alert">{error}</p>}{children}</Context.Provider>
}
