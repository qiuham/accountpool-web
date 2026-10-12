import {useEffect,useState} from 'react'
import {useAuth} from './auth'
import {Card} from './ui/card'
import {Input} from './ui/input'
import {Button} from './ui/button'
import {Plus,Trash2} from 'lucide-react'
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from './ui/select'
type Supply={sequenceDigits:number;registrationGapMinutes:number;target:number;daily:number;checkHours:number;prefix:string;mailBase:string;registrationDomain:string;domains:string[];mailPasswordConfigured:boolean}
export function SupplySettings({section,onSaved}:{section:'maintenance'|'mailbox';onSaved?:()=>void}){
 const {request}=useAuth()
 const [value,setValue]=useState<Supply|null>(null),[password,setPassword]=useState(''),[clear,setClear]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState('')
 useEffect(()=>{request('/console/settings/supply').then(setValue).catch(e=>setMessage(e.message))},[])
 async function save(){
  if(!value)return
  setBusy(true);setMessage('')
  try{
   const latest:Supply=await request('/console/settings/supply')
   const {mailPasswordConfigured,...data}=section==='maintenance'?{...latest,registrationGapMinutes:value.registrationGapMinutes,target:value.target,daily:value.daily,checkHours:value.checkHours}:{...latest,sequenceDigits:value.sequenceDigits,prefix:value.prefix,mailBase:value.mailBase,registrationDomain:value.registrationDomain,domains:value.domains}
   void mailPasswordConfigured
   const next=await request('/console/settings/supply',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,...(section==='mailbox'?(clear?{mailPassword:''}:password?{mailPassword:password}:{}):{})})})
   setValue(next);setPassword('');setClear(false);onSaved?.();setMessage('配置已保存，下次维护循环使用新配置')
  }catch(e){setMessage(e instanceof Error?e.message:'保存失败')}finally{setBusy(false)}
 }
 const domainOptions=[{value:'',label:'请选择注册域名'},...[...new Set(value?.domains.filter(Boolean))].map(domain=>({value:domain,label:domain}))]
 return <Card className="panel config-panel"><h2>{section==='maintenance'?'维护计划':'邮箱服务'}</h2><p>{section==='maintenance'?'目标为 0 时仅停止补充；订阅 / OAuth 账号不计入免费池。账号暂停会保留名额，不自动换号。':'配置收信服务与管理员凭据，邮箱命名为前缀加递增序号；已有地址不变，删除或失败不回收序号。'}</p>
 {value&&<form onSubmit={e=>{e.preventDefault();void save()}}>
  {section==='maintenance'&&<div className="fields">{([['target','目标账号数',0,10000],['registrationGapMinutes','平台注册间隔（分钟）',1,1440],['daily','每日新增上限（含失败）',1,1000],['checkHours','检查周期（小时）',1,720]] as const).map(([key,label,min,max])=><label className="field" key={key}>{label}<Input required type="number" min={min} max={max} value={value[key]} onChange={e=>setValue({...value,[key]:e.target.valueAsNumber})}/></label>)}</div>}
  {section==='mailbox'&&<>{([['prefix','邮箱前缀'],['mailBase','邮箱服务地址']] as const).map(([key,label])=><label className="field" key={key}>{label}<Input value={value[key]} onChange={e=>setValue({...value,[key]:e.target.value})}/></label>)}
  <div className="mail-domains"><div className="mail-domains-heading"><span>收件域名</span><Button type="button" variant="outline" size="sm" disabled={value.domains.length>=100} onClick={()=>setValue({...value,domains:[...value.domains,'']})}><Plus size={14}/>添加域名</Button></div>
 {value.domains.map((domain,index)=><div className="mail-domain-row" key={index}><Input aria-label={`收件域名 ${index+1}`} required placeholder="example.com" value={domain} onChange={e=>{
 const next=e.target.value.trim().toLowerCase();setValue({...value,domains:value.domains.map((d,i)=>i===index?next:d),registrationDomain:value.registrationDomain===domain&&domain!==''?next:value.registrationDomain})
 }}/><Button type="button" variant="ghost" size="icon" aria-label={`删除域名 ${index+1}`} onClick={()=>setValue({...value,domains:value.domains.filter((_,i)=>i!==index),registrationDomain:value.registrationDomain===domain?'':value.registrationDomain})}><Trash2 size={15}/></Button></div>)}
 <p className="detail-hint">各域名需在 Cloudflare 配好邮件路由，并加入同一邮箱服务的 DOMAINS 配置。</p></div>
 <label className="field">自动注册域名<Select items={domainOptions} value={value.registrationDomain} onValueChange={domain=>setValue({...value,registrationDomain:domain??''})}><SelectTrigger aria-label="自动注册域名"><SelectValue/></SelectTrigger><SelectContent>{domainOptions.map(item=><SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent></Select></label>
 <label className="field">序号最少位数<Input required type="number" min={1} max={12} value={value.sequenceDigits} onChange={e=>setValue({...value,sequenceDigits:e.target.valueAsNumber})}/></label>
  <p>格式示例：{value.prefix.toLowerCase()}{String(1).padStart(Math.min(12,Math.max(1,value.sequenceDigits||1)),"0")}@{value.registrationDomain||"域名"}（示例不是下次序号）</p>
  <label className="field">邮箱管理员密码<Input type="password" autoComplete="new-password" disabled={clear} placeholder={value.mailPasswordConfigured?'已配置，留空保留':'未配置'} value={password} onChange={e=>setPassword(e.target.value)}/></label>
  <label><input type="checkbox" checked={clear} onChange={e=>setClear(e.target.checked)}/> 清除已保存邮箱密码</label></>}
  <div className="save-row"><Button type="submit" disabled={busy}>{section==='maintenance'?'保存维护计划':'保存配置'}</Button></div>
 </form>}{message&&<p role="status">{message}</p>}</Card>
}
