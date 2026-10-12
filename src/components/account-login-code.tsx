import {useEffect,useRef,useState} from 'react'
import {Mail,Copy,RefreshCw} from 'lucide-react'
import {useAuth} from './auth'
import {Button} from './ui/button'
import {Card} from './ui/card'
import {organizationDate} from '../lib/display'
type Result={kind:'code'|'link'|'empty'|'stale'|'unknown_time';code?:string;receivedAt?:string}
export function AccountLoginCode({id}:{id:number}){
 const {request}=useAuth()
 const [result,setResult]=useState<Result|null>(null),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[cooldown,setCooldown]=useState(false)
 const alive=useRef(true)
 useEffect(()=>{alive.current=true;return()=>{alive.current=false}},[])
 async function load(){
  setBusy(true);setResult(null);setMessage('')
  try{const value=await request('/console/accounts/login-code',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})});if(alive.current)setResult(value)}
  catch(e){if(alive.current)setMessage(e instanceof Error?e.message:'读取失败')}
  finally{if(alive.current){setBusy(false);setCooldown(true)}}
 }
 useEffect(()=>{if(!cooldown)return;const timer=setTimeout(()=>setCooldown(false),5000);return()=>clearTimeout(timer)},[cooldown])
 useEffect(()=>{if(!result?.code)return;const timer=setTimeout(()=>setResult(null),60000);return()=>clearTimeout(timer)},[result])
 async function copy(){try{await navigator.clipboard.writeText(result?.code||'');setMessage('验证码已复制')}catch{setMessage('复制失败，请手动选择验证码')}}
 const descriptions={empty:'未找到登录邮件，请先在登录页面发送验证码。',stale:'最新登录邮件已超过 10 分钟，请重新获取。',unknown_time:'邮件收信时间不明，请重新发送后读取。',link:'最新邮件是登录链接，没有可复制的数字验证码。',code:'仅显示最近 10 分钟内的邮件，是否有效以登录页面为准。'}
 return <section className="detail-section"><h3><Mail size={16}/>邮箱验证码</h3><Card className="detail-group login-code-card"><Button variant="outline" disabled={busy||cooldown} onClick={()=>void load()}><RefreshCw size={15} className={busy?'animate-spin':''}/>{busy?'正在读取…':cooldown?'5 秒后可重试':'获取最新验证码'}</Button>
 {result?.kind==='code'&&<div className="login-code-value"><code>{result.code}</code><Button variant="ghost" size="icon" aria-label="复制验证码" onClick={()=>void copy()}><Copy size={16}/></Button></div>}
 {result&&<p>{descriptions[result.kind]}</p>}{result?.receivedAt&&<small>收信时间：{organizationDate(result.receivedAt)}</small>}
 <p role="status">{message}</p></Card><p className="detail-hint">仅读取邮箱，不会发送登录邮件；验证码显示 1 分钟后自动隐藏。</p></section>
}
