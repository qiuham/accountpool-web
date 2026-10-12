import {AccountLoginCode} from './account-login-code'
import {ShieldCheck,KeyRound,Clock3,UserRound} from 'lucide-react'
import {Sheet,SheetContent,SheetHeader,SheetTitle,SheetDescription} from './ui/sheet'
import {AccountProxy} from './account-proxy'
import {Card} from './ui/card'
import {ValueBadge} from './account-badge'
import {organizationDate} from '../lib/display'
import type {Account} from './account-filters'

export function AccountDetails({account,onClose,onProxySaved}:{account:Account|null;onClose:()=>void;onProxySaved:(id:number,proxy:number)=>void}){
 return <Sheet open={account!==null} onOpenChange={open=>{if(!open)onClose()}}><SheetContent className="account-sheet" aria-label="账号详情">
 {account&&<><SheetHeader className="account-sheet-heading"><div className="detail-avatar"><UserRound/></div><SheetTitle>{account.email||account.name}</SheetTitle><SheetDescription>账号详情与连接设置</SheetDescription></SheetHeader>
 <div className="account-sheet-body">
 {account.displayStatus==='abnormal'&&account.statusReason&&<Card className="detail-group"><h3>异常原因</h3><p>{account.statusReason}</p></Card>}
 {account.state==='mailbox_missing'&&<Card className="detail-group"><p>收信服务中未找到原邮箱，这不代表 Claude 账号未注册。点击“恢复原邮箱”，验证同名邮箱的收信凭据后继续登录；系统不会换地址或定时重复尝试。</p></Card>}
 <AccountLoginCode key={`login-code-${account.id}`} id={account.id}/>
 <section className="detail-section"><h3><ShieldCheck size={16}/>登录与连接</h3><Card className="detail-group">
 <div><span><KeyRound size={15}/>登录会话</span><ValueBadge label={account.session?'已保存':'未保存'} tone={account.session?'success':'muted'}/></div>
 <div><span><ShieldCheck size={15}/>OAuth 授权</span><ValueBadge label={account.oauth?'已取得':'未取得'} tone={account.oauth?'purple':'muted'}/></div>
 </Card><p className="detail-hint">已保存凭据不代表当前有效，以健康检查结果为准。</p></section>
 <AccountProxy key={`proxy-${account.id}`} id={account.id} current={account.proxy} paused={account.maintenancePaused} onSaved={proxy=>onProxySaved(account.id,proxy)}/>
 <section className="detail-section"><h3><Clock3 size={16}/>时间记录</h3><Card className="detail-group timeline-group">
 <div><span>组织创建日期</span><strong>{organizationDate(account.orgCreatedAt)}</strong></div>
 <div><span>最近检查</span><strong>{account.checked||'未检查'}</strong></div>
 </Card></section>
 </div></>}
 </SheetContent></Sheet>
}
