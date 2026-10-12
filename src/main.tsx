import {ExecutorStatus} from './components/executor-status'
import {JobDetails} from './components/job-details'
import {AccountDetails} from './components/account-details'
import {AccountTable} from './components/account-table'
import {ValueBadge} from './components/account-badge'
import {AccountFiltersBar,emptyFilters,matchesAccountFilters,type Account} from './components/account-filters'
import {PlatformMaintenance,type PoolOverview} from './components/platform-maintenance'
import {MaintenancePlans} from './components/maintenance-plans'
import {jobState,stepLabel} from './lib/display'
import {useEffect,useState} from 'react'
import {createRoot} from 'react-dom/client'
import {Moon,Sun,Layers,RefreshCw} from 'lucide-react'
import {AuthProvider,useAuth} from './components/auth'
import {RuntimeSettings} from './components/runtime-settings'
import {SupplySettings} from './components/supply-settings'
import {PasswordSettings} from './components/password-settings'
import {Proxies} from './components/proxies'
import {Button} from './components/ui/button'
import {Card} from './components/ui/card'
import {Table,TableHeader,TableBody,TableRow,TableHead,TableCell} from './components/ui/table'
import '@fontsource-variable/geist'
import '@fontsource-variable/noto-sans-sc'
import './index.css'
type Job={id:number;email:string;name:string;kind:string;state:string;reason:string;attempts:number;created:string;startedAt:string;finishedAt:string}
function App(){
 const {request,logout}=useAuth()
 const [page,setPage]=useState('账号池')
 const [maintenanceDetail,setMaintenanceDetail]=useState(false),[accounts,setAccounts]=useState<Account[]>([]),[jobs,setJobs]=useState<Job[]>([]),[query,setQuery]=useState('')
 const [jobPage,setJobPage]=useState(1),[jobTotal,setJobTotal]=useState(0)
 const [overview,setOverview]=useState<PoolOverview|null>(null),[updatedAt,setUpdatedAt]=useState(0)
 const [selectedJob,setSelectedJob]=useState<number|null>(null)
 const [today,setToday]=useState(Date.now())
 useEffect(()=>{const timer=window.setInterval(()=>setToday(Date.now()),60000);return ()=>window.clearInterval(timer)},[])
 const [columnFilters,setColumnFilters]=useState(emptyFilters)
 const [pagination,setPagination]=useState(1),[selected,setSelected]=useState<Account|null>(null)
 const [control,setControl]=useState<{paused:boolean;reason:string;reasonText:string}|null>(null),[error,setError]=useState(''),[loading,setLoading]=useState(false)
 const [dark,setDark]=useState(()=>document.documentElement.classList.contains('dark'))
 function toggle(){const next=!dark;document.documentElement.classList.toggle('dark',next);setDark(next);localStorage.setItem('pool-theme',next?'dark':'light')}
 async function refresh(targetJobPage=jobPage){
  setLoading(true);setError('')
  try{
   setAccounts(await request('/console/accounts'))
   const result=await request(`/console/jobs?page=${targetJobPage}`)
   setJobs(result.items);setJobPage(result.page);setJobTotal(result.total)
   setControl(await request('/console/scheduler'))
   setOverview(await request('/console/pool'));setUpdatedAt(Date.now())
  }catch(e){setError(e instanceof Error?e.message:'读取失败')}finally{setLoading(false)}
 }
 useEffect(()=>{void refresh()},[])
 useEffect(()=>{if(!['账号池','维护计划','维护计划详情','执行记录'].includes(page))return;void refresh();const timer=window.setInterval(()=>{if(!document.hidden)void refresh()},15000);return ()=>clearInterval(timer)},[page])
 async function pause(){
  if(!control)return
  setLoading(true)
  try{setControl(await request('/console/scheduler',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({paused:!control.paused})}))}
  catch(e){setError(e instanceof Error?e.message:'操作失败')}finally{setLoading(false)}
 }
 const filtered=accounts.filter(a=>matchesAccountFilters(a,columnFilters)&&(a.email+' '+a.name).toLowerCase().includes(query.toLowerCase()))
 const currentPage=Math.min(pagination,Math.max(1,Math.ceil(filtered.length/20)))
 const visible=filtered.slice((currentPage-1)*20,currentPage*20)
 return <div className="shell"><aside><div className="brand"><span className="logo"><Layers/></span>AccountPool</div><nav style={{marginTop:32}}>{['账号池','维护计划','执行记录','代理管理','配置中心'].map(label=><button key={label} className={page===label?'nav-active':''} onClick={()=>{setPage(label);if(label==='维护计划')setMaintenanceDetail(false)}}>{label}</button>)}</nav></aside>
 <main><header><b>{page}</b><div><Button variant="ghost" size="icon" aria-label={dark?'切换浅色模式':'切换深色模式'} onClick={toggle}>{dark?<Sun/>:<Moon/>}</Button><Button variant="ghost" onClick={()=>void logout()}>退出登录</Button></div></header>
 <div className={`content ${page==='账号池'||page==='执行记录'?'list-content':''}`}><div className="page-heading"><h1>{page}</h1></div>
 {error&&<p role="alert">{error}</p>}
 {page==='账号池'&&<>
 <section className="stats pool-summary-stats">{[{label:'目标可用',value:overview?.target},{label:'当前可用',value:overview?.ready},{label:'待补充',value:overview?.pendingSupply},{label:'恢复 / 初始化',value:overview?.recovering},{label:'账号暂停',value:overview?.pausedAccounts}].map(item=><Card className="stat" key={item.label}><div>{item.label}</div><strong>{item.value??'—'}</strong></Card>)}</section>
 <Card className="panel list-panel"><div className="panel-title"><h2>账号列表 · {accounts.length}</h2></div>

 <AccountFiltersBar onRefresh={()=>void refresh()} loading={loading} accounts={accounts} value={columnFilters} query={query} active={!!query||!!columnFilters.platform||!!columnFilters.state||!!columnFilters.plan} onQueryChange={value=>{setQuery(value);setPagination(1)}} onChange={value=>{setColumnFilters(value);setPagination(1)}} onReset={()=>{setColumnFilters(emptyFilters);setQuery('');setPagination(1)}}/>
 <AccountTable onRestoreMailbox={async(id)=>{
 await request('/console/accounts/restore-mailbox',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})})
 await refresh()
 }} accounts={visible} today={today} onDetails={setSelected} onMaintenance={async(ids,paused)=>{
 await request('/console/accounts/maintenance',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ids,paused})})
 setAccounts(previous=>previous.map(a=>ids.includes(a.id)?{...a,maintenancePaused:paused}:a))
 setSelected(previous=>previous&&ids.includes(previous.id)?{...previous,maintenancePaused:paused}:previous)
 }}/>

 {!loading&&accounts.length>0&&!filtered.length&&<div className="empty" role="status">没有符合筛选条件的账号，请调整条件或重置筛选。</div>}
 {!loading&&!accounts.length&&<div className="empty">暂无账号，请先完成邮箱、代理和供给配置。</div>}
 <div className="table-footer"><span>筛选结果 {filtered.length} / {accounts.length} 个账号</span><div><Button variant="outline" disabled={currentPage===1} onClick={()=>setPagination(currentPage-1)}>上一页</Button><span>{currentPage}</span><Button variant="outline" disabled={currentPage*20>=filtered.length} onClick={()=>setPagination(currentPage+1)}>下一页</Button></div></div></Card></>}
 {page==='执行记录'&&<><Card className="panel list-panel"><div className="panel-title"><h2>执行记录 · {jobTotal}</h2><Button variant="outline" size="icon" aria-label="刷新执行记录" disabled={loading} onClick={()=>void refresh()}><RefreshCw/></Button></div><Table aria-label="执行记录" className="account-table"><TableHeader><TableRow>{['账号','步骤','状态','执行时间','完成时间','详情'].map(x=><TableHead key={x}>{x}</TableHead>)}</TableRow></TableHeader><TableBody>{jobs.map(j=><TableRow key={j.id}><TableCell>{j.email||j.name||'账号已移除'}</TableCell><TableCell>{stepLabel(j.kind)}</TableCell><TableCell><ValueBadge label={jobState(j.state)} tone={j.state==='ok'?'success':j.state==='running'?'info':j.state==='failed'?'danger':j.state==='blocked'?'warning':'muted'}/></TableCell><TableCell>{j.startedAt||'未开始'}</TableCell><TableCell>{j.finishedAt||(j.state==='running'?'执行中':'—')}</TableCell><TableCell><Button variant="link" onClick={()=>setSelectedJob(j.id)}>查看详情</Button></TableCell></TableRow>)}</TableBody></Table>{!jobs.length&&<div className="empty">暂无任务</div>}<div className="table-footer"><span>共 {jobTotal} 条任务 · 每页 20 条</span><div><Button variant="outline" disabled={loading||jobPage===1} onClick={()=>void refresh(jobPage-1)}>上一页</Button><span>{jobPage} / {Math.max(1,Math.ceil(jobTotal/20))}</span><Button variant="outline" disabled={loading||jobPage*20>=jobTotal} onClick={()=>void refresh(jobPage+1)}>下一页</Button></div></div></Card></>}
 {page==='维护计划'&&!maintenanceDetail&&<MaintenancePlans value={overview} paused={!!control?.paused} onOpen={()=>{setMaintenanceDetail(true);setPage('维护计划详情')}}/>}
 {page==='维护计划详情'&&<><div className="detail-back"><Button variant="ghost" onClick={()=>{setMaintenanceDetail(false);setPage('维护计划')}}>← 返回维护计划</Button></div><PlatformMaintenance value={overview} control={control} busy={loading} updatedAt={updatedAt} jobs={jobs} onRefresh={()=>void refresh()} onToggle={()=>void pause()} onRecords={()=>setPage('执行记录')}/></>}
 {page==='配置中心'&&<><SupplySettings section="mailbox"/><ExecutorStatus/><RuntimeSettings/><PasswordSettings/></>}
 {page==='代理管理'&&<Proxies/>}
 </div></main>
 <JobDetails id={selectedJob} dark={dark} onClose={()=>setSelectedJob(null)}/>
 <AccountDetails onProxySaved={(id,proxy)=>{
 setAccounts(previous=>previous.map(a=>a.id===id?{...a,proxy:proxy||null}:a))
 setSelected(previous=>previous?.id===id?{...previous,proxy:proxy||null}:previous)
 }} account={selected} onClose={()=>setSelected(null)}/>
 </div>
}
createRoot(document.getElementById('root')!).render(<AuthProvider><App/></AuthProvider>)
