import {useEffect,useState} from 'react'
import {Dialog} from '@base-ui/react/dialog'
import {X} from 'lucide-react'
import {JsonView,defaultStyles,darkStyles} from 'react-json-view-lite'
import 'react-json-view-lite/dist/index.css'
import {useAuth} from './auth'
import {Button} from './ui/button'
type Trace={source:string;at:string;durationMs:number;request:{method:string;url:string};response:null|{status:number};error?:string}
export function JobDetails({id,dark,onClose}:{id:number|null;dark:boolean;onClose:()=>void}){
 const {request}=useAuth()
 const [traces,setTraces]=useState<Trace[]|null>(null),[error,setError]=useState('')
 useEffect(()=>{
  setTraces(null);setError('')
  if(id===null)return
  const controller=new AbortController()
  request('/console/jobs/detail?id='+id,{signal:controller.signal}).then(value=>{if(!controller.signal.aborted)setTraces(value.httpTraces)}).catch(()=>{if(!controller.signal.aborted)setError('读取报文失败，请关闭后重试')})
  return ()=>controller.abort()
 },[id])
 return <Dialog.Root open={id!==null} onOpenChange={open=>{if(!open)onClose()}}><Dialog.Portal><Dialog.Backdrop className="proxy-dialog-backdrop"/><Dialog.Popup className="proxy-dialog job-detail-dialog">
 <div className="proxy-dialog-heading"><div><Dialog.Title>请求 / 响应报文 · #{id}</Dialog.Title><Dialog.Description>按请求时间排列，敏感字段已脱敏</Dialog.Description></div><Dialog.Close render={<Button variant="ghost" size="icon" aria-label="关闭执行详情"/>}><X/></Dialog.Close></div>
 <div className="job-detail-body">{error?<p role="alert">{error}</p>:traces===null?<p role="status">正在读取…</p>:traces.length===0?<p>暂无采集报文。旧记录未采集，执行中的任务结束后可查看；报文保留 7 天。</p>:traces.map((trace,index)=><section key={index}><h3>{trace.request.method} · {trace.response?.status??'无响应'} · {trace.durationMs} ms</h3><p style={{overflowWrap:'anywhere'}}>{trace.request.url}</p><div className="job-json"><JsonView data={trace} style={dark?darkStyles:defaultStyles} shouldExpandNode={level=>level<3}/></div></section>)}</div>
 </Dialog.Popup></Dialog.Portal></Dialog.Root>
}
