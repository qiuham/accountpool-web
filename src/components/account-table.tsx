import {useEffect,useState} from 'react'
import {ScheduleStatus} from './schedule-status'
import {PlatformCell} from './platform-cell'
import {Copy} from 'lucide-react'
import {useAuth} from './auth'
import {AlertDialog} from '@base-ui/react/alert-dialog'
import {Checkbox} from './ui/checkbox'
import {Button} from './ui/button'
import {Table,TableHeader,TableBody,TableRow,TableHead,TableCell} from './ui/table'
import {StateBadge,ValueBadge} from './account-badge'
import {planLabel,planTone,registrationDays} from '../lib/display'
import type {Account} from './account-filters'

export function AccountTable({accounts,today,onDetails,onMaintenance,onRestoreMailbox}:{accounts:Account[];today:number;onDetails:(a:Account)=>void;onMaintenance:(ids:number[],paused:boolean)=>Promise<void>;onRestoreMailbox:(id:number)=>Promise<void>}){
 const {request}=useAuth()
 const [copying,setCopying]=useState<number|null>(null),[copyMessage,setCopyMessage]=useState('')
 async function copySession(id:number){
  setCopying(id);setCopyMessage('')
  try{
   const value=await request('/console/accounts/session-key',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})})
   await navigator.clipboard.writeText(value.sessionKey)
   setCopyMessage('SessionKey 已复制')
  }catch{setCopyMessage('复制失败，请检查登录状态和剪贴板权限')}finally{setCopying(null)}
 }
 const [selection,setSelection]=useState<number[]>([])
 const [confirmation,setConfirmation]=useState<{ids:number[];paused:boolean;restoreMailbox?:boolean}|null>(null)
 const [busy,setBusy]=useState(false),[error,setError]=useState('')
 const pageKey=accounts.map(a=>a.id).join(',')
 useEffect(()=>{setSelection([])},[pageKey])
 const selected=selection.filter(id=>accounts.some(a=>a.id===id))
 const all=accounts.length>0&&selected.length===accounts.length
 function confirm(ids:number[],paused:boolean){setError('');setConfirmation({ids,paused})}
 async function apply(){
  if(!confirmation)return
  setBusy(true);setError('')
  try{if(confirmation.restoreMailbox){await onRestoreMailbox(confirmation.ids[0])}else{await onMaintenance(confirmation.ids,confirmation.paused)};setConfirmation(null);setSelection([])}
  catch(e){setError(e instanceof Error?e.message:'操作失败，请重试')}
  finally{setBusy(false)}
 }
 return <>
 {copyMessage&&<p role="status" className="copy-status">{copyMessage}</p>}
 {selected.length>0&&<div className="batch-actions"><strong>已选 {selected.length} 个账号</strong><Button variant="destructive" onClick={()=>confirm(selected,true)}>批量暂停</Button><Button variant="outline" onClick={()=>confirm(selected,false)}>批量恢复</Button><Button variant="ghost" onClick={()=>setSelection([])}>取消选择</Button></div>}
 <Table aria-label="账号列表" className="account-table compact-accounts"><TableHeader><TableRow>
 <TableHead className="selection-cell"><Checkbox aria-label="全选当前页" checked={all} indeterminate={selected.length>0&&!all} disabled={!accounts.length} onCheckedChange={checked=>setSelection(checked?accounts.map(a=>a.id):[])}/></TableHead>
 {['账号','平台','账号状态','执行计划','订阅','对话次数','注册至今天数','操作'].map(label=><TableHead key={label} className={label==='账号'?'account-identity account-identity-head':label==='操作'?'account-actions':['对话次数','注册至今天数'].includes(label)?'metric-cell':undefined}>{label}</TableHead>)}
 </TableRow></TableHeader><TableBody>{accounts.map(a=><TableRow key={a.id} data-state={selected.includes(a.id)?'selected':undefined}>
 <TableCell className="selection-cell"><Checkbox aria-label={`选择 ${a.email||a.name}`} checked={selected.includes(a.id)} onCheckedChange={checked=>setSelection(checked?[...selected,a.id]:selected.filter(id=>id!==a.id))}/></TableCell>
 <TableCell className="account-identity"><div className="account-email-row"><button className="account-link" onClick={()=>onDetails(a)}>{a.email||a.name}</button><Button variant="ghost" size="icon" title="复制 SessionKey" aria-label={`复制 ${a.email||a.name} 的 SessionKey`} disabled={!a.session||copying!==null} onClick={()=>void copySession(a.id)}><Copy size={14}/></Button></div><small className="account-org-id" title={a.orgId}>{a.orgId||"未获取"}</small></TableCell>
 <TableCell><PlatformCell platform={a.platform}/></TableCell>
 <TableCell><span title={a.statusReason}><StateBadge state={a.displayStatus}/></span></TableCell>
 <TableCell><ScheduleStatus value={a.schedule}/></TableCell>
 <TableCell><ValueBadge label={planLabel(a.plan)} tone={planTone(a.plan)}/></TableCell>
 <TableCell className="metric-cell">{a.warmupCount}</TableCell><TableCell className="metric-cell">{registrationDays(a.orgCreatedAt,today)}</TableCell>
 <TableCell className="account-actions"><Button variant="link" className={a.maintenancePaused?'':'text-destructive hover:text-destructive'} size="sm" onClick={()=>confirm([a.id],!a.maintenancePaused)}>{a.maintenancePaused?'恢复维护':'暂停维护'}</Button> {a.state==='mailbox_missing'&&a.registrationEvidence==='confirmed'&&<Button variant="link" size="sm" onClick={()=>{setError('');setConfirmation({ids:[a.id],paused:false,restoreMailbox:true})}}>恢复原邮箱</Button>} {['mailbox_missing','mailbox_config_error'].includes(a.state)&&<Button variant="link" size="sm" onClick={()=>confirm([a.id],false)}>重新检查邮箱</Button>}<Button variant="ghost" size="sm" onClick={()=>onDetails(a)}>详情</Button></TableCell>
 </TableRow>)}</TableBody></Table>
 <AlertDialog.Root open={confirmation!==null} onOpenChange={open=>{if(!open&&!busy)setConfirmation(null)}}><AlertDialog.Portal><AlertDialog.Backdrop className="confirm-backdrop"/><AlertDialog.Popup className="confirm-dialog">
 <AlertDialog.Title>{confirmation?.restoreMailbox?'恢复原邮箱':confirmation?.paused?'暂停维护':'恢复维护'} · {confirmation?.ids.length} 个账号</AlertDialog.Title>
 <AlertDialog.Description>{confirmation?.restoreMailbox?'仅恢复此账号的原邮箱地址，验证收信凭据后继续登录原账号；不会更换地址。':confirmation?.paused?'当前任务执行完后，不再领取这些账号的检查、重登或定时对话任务。账号和登录凭据会保留。':'恢复后按原有计划继续维护；邮箱受阻的账号先重新检查邮箱。此操作不会重建邮箱，也不会立即批量发送消息。'}</AlertDialog.Description>
 {error&&<p role="alert">{error}</p>}<div className="confirm-actions"><Button variant="outline" disabled={busy} onClick={()=>setConfirmation(null)}>取消</Button><Button variant={confirmation?.paused?'destructive':'default'} disabled={busy} onClick={()=>void apply()}>{busy?'处理中…':'确认'}</Button></div>
 </AlertDialog.Popup></AlertDialog.Portal></AlertDialog.Root>
 </>
}
