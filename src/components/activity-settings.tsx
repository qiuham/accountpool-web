import {useEffect,useState} from 'react'
import {useAuth} from './auth'
import {Card} from './ui/card'
import {Checkbox} from './ui/checkbox'
import {Input} from './ui/input'
import {Button} from './ui/button'
import {Plus,Trash2} from 'lucide-react'
type Activity={enabled:boolean;intervalHours:number;prompts:string[]}
export function ActivitySettings(){
 const {request}=useAuth()
 const [value,setValue]=useState<Activity|null>(null),[busy,setBusy]=useState(false),[message,setMessage]=useState('')
 useEffect(()=>{request('/console/settings/activity').then(setValue).catch(e=>setMessage(e.message))},[])
 async function save(){
  setBusy(true)
  try{setValue(await request('/console/settings/activity',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(value)}));setMessage('网页对话计划已保存，下次巡检生效')}
  catch(e){setMessage(e instanceof Error?e.message:'保存失败')}finally{setBusy(false)}
 }
 return <Card className="panel config-panel"><h2>定时对话</h2><p>仅对已登录且健康检查通过的免费账号执行。每次发一条消息并等待完整回复；订阅 / OAuth 账号不参与。每次执行从消息列表中随机选择一条发送。</p>
 {value&&<form onSubmit={e=>{e.preventDefault();void save()}}>
 <label className="toggle-field"><Checkbox checked={value.enabled} onCheckedChange={checked=>setValue({...value,enabled:checked})}/>启用定时对话</label>
 <label className="field">对话周期（小时）<Input required type="number" min={1} max={720} value={value.intervalHours} onChange={e=>setValue({...value,intervalHours:e.target.valueAsNumber})}/></label>
 <div className="prompt-list"><div className="prompt-list-heading"><h3>消息列表 · {value.prompts.length}</h3><Button type="button" variant="outline" disabled={value.prompts.length>=100} onClick={()=>setValue({...value,prompts:[...value.prompts,'']})}><Plus size={15}/>添加消息</Button></div>
 {value.prompts.map((prompt,index)=><div className="prompt-list-row" key={index}><label className="field">消息 {index+1}<textarea required maxLength={2000} rows={2} value={prompt} onChange={e=>setValue({...value,prompts:value.prompts.map((p,i)=>i===index?e.target.value:p)})}/></label><Button type="button" variant="ghost" size="icon" aria-label={`删除消息 ${index+1}`} disabled={value.prompts.length===1} onClick={()=>setValue({...value,prompts:value.prompts.filter((_,i)=>i!==index)})}><Trash2 size={16}/></Button></div>)}
 </div>
 <Button type="submit" disabled={busy}>保存定时对话计划</Button>
 </form>}{message&&<p role="status">{message}</p>}</Card>
}
