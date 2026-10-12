import {RefreshCw,Pause,Play,ArrowRight} from 'lucide-react'
import {Card} from './ui/card'
import {Button} from './ui/button'
import {ValueBadge} from './account-badge'
import {SupplySettings} from './supply-settings'
import {ActivitySettings} from './activity-settings'
import {organizationDate,stepLabel} from '../lib/display'
export type PoolOverview={target:number;ready:number;recovering:number;pausedAccounts:number;blocked:number;paid:number;deficit:number;pendingSupply:number;createdToday:number;dailyLimit:number;running:number;queued:number;nextRetry:number}
type Control={paused:boolean;reason:string;reasonText:string}
export function PlatformMaintenance({value,control,busy,updatedAt,jobs,onRefresh,onToggle,onRecords}:{value:PoolOverview|null;control:Control|null;busy:boolean;updatedAt:number;jobs:{id:number;email:string;name:string;kind:string;state:string;startedAt:string;reason:string}[];onRefresh:()=>void;onToggle:()=>void;onRecords:()=>void}){
 const current=jobs.find(j=>j.state==='running')
 const notice=control?.paused?'平台已暂停，新动作等待恢复；正在执行的动作会先完成。':!value?'正在读取维护状态。':value.target===0?'目标为 0：不补充新账号，已有账号仍按维护策略执行。':value.deficit===0?'当前可用账号已达到目标，后续继续按策略维护。':value.createdToday>=value.dailyLimit&&value.pendingSupply>0?'今日新增额度已用完，补充缺口等待下一日；已有账号仍可恢复。':value.pendingSupply>0?'存在待补充名额，执行器按串行策略处理；不会并发注册。':'缺口目前由恢复中、已暂停或邮箱受阻的账号占位，暂不新增替代账号。'
 return <div className="platform-maintenance">
 <Card className="panel maintenance-overview"><div className="panel-title"><div><h2>Claude 账号池</h2><p>维护计划与执行状态</p></div><div className="maintenance-actions"><ValueBadge label={control?.paused?'平台已暂停':'维护已启用'} tone={control?.paused?'warning':'success'}/><Button variant="outline" size="icon" aria-label="刷新维护状态" disabled={busy} onClick={onRefresh}><RefreshCw className={busy?'animate-spin':''}/></Button><Button variant={control?.paused?'default':'outline'} disabled={busy||!control} onClick={onToggle}>{control?.paused?<Play/>:<Pause/>}{control?.paused?'恢复平台维护':'暂停平台维护'}</Button></div></div>
 <p className="maintenance-notice">{notice}</p>
 {control?.reason&&control.reason!=='operator-paused'&&<p className="maintenance-notice text-destructive">异常暂停：{control.reasonText}</p>}
 <section className="maintenance-metrics">{[{label:'目标可用',value:value?.target},{label:'当前可用',value:value?.ready},{label:'待补充',value:value?.pendingSupply},{label:'恢复 / 初始化',value:value?.recovering},{label:'账号暂停',value:value?.pausedAccounts},{label:'受阻 / 不可用',value:value?.blocked}].map(item=><div key={item.label}><span>{item.label}</span><strong>{item.value??'—'}</strong></div>)}</section>
 <div className="maintenance-summary"><span>可用缺口：{value?.deficit??'—'}</span><span>今日新增：{value?.createdToday??'—'} / {value?.dailyLimit??'—'}</span><span>订阅 / OAuth 已排除：{value?.paid??'—'}</span></div>
 </Card>
 <div className="maintenance-workspace"><section className="maintenance-plan"><SupplySettings section="maintenance" onSaved={onRefresh}/><ActivitySettings/></section>
 <Card className="panel config-panel"><div className="maintenance-section-heading"><h2>当前执行</h2><Button variant="ghost" onClick={onRecords}>查看执行记录<ArrowRight/></Button></div>
 <div className="maintenance-execution"><div><span>执行中</span><strong>{value?.running??'—'}</strong></div><div><span>队列等待</span><strong>{value?.queued??'—'}</strong></div><div><span>下一次失败重试</span><strong>{value?.nextRetry?organizationDate(new Date(value.nextRetry*1000).toISOString()):'无重试计划'}</strong></div></div>
 {current?<p>当前：{current.email||current.name} · {stepLabel(current.kind)} · 开始于 {current.startedAt||'刚刚'}</p>:<p>{value?.running?'执行器正在处理任务，详情见执行记录。':'当前没有正在执行的动作。'}</p>}
 <p className="maintenance-update">每 15 秒更新一次状态，不会触发上游请求。最近更新：{updatedAt?new Date(updatedAt).toLocaleTimeString('zh-CN'):'—'}</p>
 </Card></div>
 </div>
}
