import type {Schedule} from './schedule-status'
import {Search,X,SlidersHorizontal,RefreshCw} from 'lucide-react'
import {Input} from './ui/input'
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from './ui/select'
import {Button} from './ui/button'
import {accountState,planLabel} from '../lib/display'

export type Account={displayStatus:string;statusReason:string;schedule:Schedule;orgId:string;registrationEvidence:string;maintenancePaused:boolean;id:number;email:string;name:string;platform:string;state:string;plan:string;session:boolean;oauth:boolean;checked:string;proxy:number|null;retryAt:number;orgCreatedAt:string;warmupCount:number;warmupDays:number}
export type AccountFilters=Record<'platform'|'state'|'plan',string>
export const emptyFilters:AccountFilters={platform:'',state:'',plan:''}

export function matchesAccountFilters(a:Account,f:AccountFilters){
 return (!f.platform||a.platform===f.platform)&&(!f.state||a.displayStatus===f.state)&&(!f.plan||(f.plan==='oauth'?a.oauth:a.plan===f.plan))
}

type Option={value:string;label:string}
export function AccountFiltersBar({accounts,value,query,onQueryChange,active,onChange,onReset,onRefresh,loading}:{accounts:Account[];value:AccountFilters;query:string;onQueryChange:(value:string)=>void;active:boolean;onChange:(value:AccountFilters)=>void;onReset:()=>void;onRefresh:()=>void;loading:boolean}){
 function unique(get:(a:Account)=>string,label:(value:string)=>string):Option[]{
  return [...new Set(accounts.map(get))].sort().map(value=>({value,label:label(value)}))
 }
 const fields:{key:keyof AccountFilters;label:string;options:Option[]}[]=[
  {key:'platform',label:'平台',options:unique(a=>a.platform,v=>v||'未知平台')},
  {key:'state',label:'状态',options:unique(a=>a.displayStatus,accountState)},
  {key:'plan',label:'订阅',options:[...unique(a=>a.plan,planLabel).filter(o=>o.value),{value:'oauth',label:'OAuth'}]},
 ]
 return <div className="account-toolbar" aria-label="账号筛选"><div className="account-search"><Search size={16} aria-hidden="true"/><Input aria-label="搜索账号" placeholder="搜索邮箱或账号名…" value={query} onChange={e=>onQueryChange(e.target.value)}/>{query&&<Button variant="ghost" size="icon-sm" aria-label="清空搜索" onClick={()=>onQueryChange('')}><X size={14}/></Button>}</div>{fields.map(({key,label,options})=>{
 const items=[{value:'',label:`全部${label}`},...options]
 return <div className="toolbar-filter" key={key}><Select items={items} value={value[key]} onValueChange={next=>onChange({...value,[key]:next??''})}><SelectTrigger aria-label={`筛选${label}`}><SlidersHorizontal size={14} aria-hidden="true"/><SelectValue/></SelectTrigger><SelectContent align="start" alignItemWithTrigger={false}>{items.map(option=><SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select></div>
 })}{active&&<Button variant="ghost" onClick={onReset}>重置筛选<X size={14}/></Button>}<div className="toolbar-actions"><Button variant="outline" size="icon" aria-label="刷新账号" disabled={loading} onClick={onRefresh}><RefreshCw className={loading?'animate-spin':''}/></Button></div></div>
}
