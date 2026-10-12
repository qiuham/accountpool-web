import {useEffect,useState} from 'react'
import {useAuth} from './auth'
import {Card} from './ui/card'
type Status={online:boolean;heartbeatAt:number;running:number;paused:boolean;mode:string}
export function ExecutorStatus(){
 const {request}=useAuth()
 const [value,setValue]=useState<Status|null>(null),[error,setError]=useState('')
 useEffect(()=>{let active=true;async function refresh(){try{const result=await request('/console/executor');if(active){setValue(result);setError('')}}catch(e){if(active)setError(e instanceof Error?e.message:'状态读取失败')}}
 void refresh();const timer=setInterval(()=>void refresh(),15000);return()=>{active=false;clearInterval(timer)}},[])
 return <Card className="panel config-panel"><h2>执行器状态</h2>{error?<p role="alert">{error}</p>:value?<dl className="detail-group"><div><span>运行方式</span><strong>{value.mode}</strong></div><div><span>进程心跳</span><strong className={value.online?'text-green-600':'text-destructive'}>{value.online?'在线':'离线'}</strong></div><div><span>平台调度</span><strong>{value.paused?'已暂停':'已启用'}</strong></div><div><span>正在执行</span><strong>{value.running}</strong></div><div><span>最近心跳</span><strong>{value.heartbeatAt?new Date(value.heartbeatAt*1000).toLocaleString():'未收到'}</strong></div></dl>:<p>正在读取…</p>}</Card>
}
