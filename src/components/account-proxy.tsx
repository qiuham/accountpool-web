import {useEffect,useState} from 'react'
import {useAuth} from './auth'
import type {Proxy} from './proxies'
import {Button} from './ui/button'
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from './ui/select'
export function AccountProxy({id,current,paused,onSaved}:{id:number;current:number|null;paused:boolean;onSaved:(proxy:number)=>void}){
 const {request}=useAuth()
 const [rows,setRows]=useState<Proxy[]>([]),[value,setValue]=useState(current?.toString()||'0'),[busy,setBusy]=useState(false),[message,setMessage]=useState('')
 useEffect(()=>{setValue(current?.toString()||'0');setMessage('');request('/console/proxies').then(setRows).catch(e=>setMessage(e.message))},[id,current])
 async function save(){
  setBusy(true);setMessage('')
  try{await request('/console/accounts/proxy',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,proxyId:Number(value)})});onSaved(Number(value));setMessage('绑定已更新，账号仍保持暂停')}
  catch(e){setMessage(e instanceof Error?e.message:'保存失败')}finally{setBusy(false)}
 }
 const items=[{value:'0',label:'不使用代理（直连）'},...rows.map(p=>({value:String(p.id),label:`#${p.id} ${p.url}`}))]
 return <section className="detail-section"><h3>账号代理</h3><p className="detail-hint">代理可选；不使用代理时直连。修改前先暂停维护并等待任务结束。</p><div className="proxy-binding"><Select items={items} value={value} disabled={!paused||busy} onValueChange={v=>setValue(v??'')}><SelectTrigger aria-label="选择账号代理"><SelectValue placeholder="未绑定代理"/></SelectTrigger><SelectContent>{items.map(item=><SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent></Select><Button disabled={!paused||busy||!value||Number(value)===(current??0)} onClick={()=>void save()}>保存绑定</Button></div>{message&&<p role="status">{message}</p>}</section>
}
