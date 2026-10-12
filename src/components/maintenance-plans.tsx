import {ArrowRight} from 'lucide-react'
import {Card} from './ui/card'
import {Button} from './ui/button'
import {ValueBadge} from './account-badge'
import type {PoolOverview} from './platform-maintenance'
export function MaintenancePlans({value,paused,onOpen}:{value:PoolOverview|null;paused:boolean;onOpen:()=>void}){
 return <Card className="panel maintenance-plan-list"><div className="panel-title"><div><h2>维护计划</h2><p>按平台管理账号池目标与补充策略</p></div></div><div className="maintenance-plan-row"><div><strong>Claude 免费账号池</strong><span>Claude · 单平台维护计划</span></div><div><small>目标账号</small><b>{value?.target??'—'}</b></div><div><small>当前可用</small><b>{value?.ready??'—'}</b></div><div><small>待补充</small><b>{value?.pendingSupply??'—'}</b></div><ValueBadge label={paused?'已暂停':'运行中'} tone={paused?'warning':'success'}/><Button variant="ghost" onClick={onOpen}>编辑计划<ArrowRight/></Button></div></Card>
}
