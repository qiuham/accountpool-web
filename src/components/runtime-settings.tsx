import {useState,useEffect} from 'react'
import {useAuth} from './auth'
import {Card} from './ui/card'
import {Input} from './ui/input'
import {Button} from './ui/button'

type Policy={gapSeconds:number;cooldownSeconds:number;failureLimit:number;taskTimeoutSeconds:number}
const fields: [keyof Policy,string,number,number][]=[
 ['gapSeconds','注册 / 登录任务最小间隔（秒）',60,86400],
 ['cooldownSeconds','失败后冷却基数（秒）',60,604800],
 ['failureLimit','连续失败暂停阈值',1,100],
 ['taskTimeoutSeconds','任务超时（秒）',60,86400],
]
export function RuntimeSettings(){
 const {request}=useAuth()
 const [value,setValue]=useState<Policy|null>(null),[busy,setBusy]=useState(false),[message,setMessage]=useState('')
 useEffect(()=>{
  let active=true
  request('/console/settings/runtime').then(v=>{if(active)setValue(v)}).catch(error=>{if(active)setMessage(error.message)})
  return ()=>{active=false}
 },[])
 async function save(){
  setBusy(true);setMessage('')
  try{
   const saved=await request('/console/settings/runtime',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(value)})
   setValue(saved);setMessage('已保存到服务端，维护进程下次领取任务前生效；当前任务不变')
  }catch(error){setMessage(error instanceof Error?error.message:'保存失败')}finally{setBusy(false)}
 }
 return <Card className="panel config-panel">
  <h2>注册冷却与执行调度</h2>
  <p>当前平台：Claude · 执行器：Python / Camoufox · 常驻维护容器内启动独立子进程。保存后从下一次任务开始生效。明确失败后进入冷却并自动重试，连续失败延长等待，最长 24 小时；提交结果不明的任务不重复提交。</p>
  <form onSubmit={e=>{e.preventDefault();void save()}}>
   <div className="fields">{fields.map(([key,label,min,max])=><label className="field" key={key}>{label}<Input required type="number" step={1} min={min} max={max} disabled={busy||!value} placeholder="读取中" value={value?.[key]??''} onChange={e=>{if(value)setValue({...value,[key]:e.target.valueAsNumber})}}/></label>)}</div>
   <div className="save-row"><Button type="submit" disabled={busy||!value}>{busy?'保存中…':'保存服务端调度配置'}</Button></div>
  </form>
  {message&&<p role="status">{message}</p>}
 </Card>
}
