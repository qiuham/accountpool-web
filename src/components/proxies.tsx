import {useEffect,useState} from 'react'
import {RefreshCw,Search} from 'lucide-react'
import {proxyState} from '../lib/display'
import {useAuth} from './auth'
import {Card} from './ui/card'
import {Input} from './ui/input'
import {ProxyImportDialog} from './proxy-import-dialog'
import {Button} from './ui/button'
import {ValueBadge} from './account-badge'
import {Table,TableHeader,TableBody,TableRow,TableHead,TableCell} from './ui/table'
export type Proxy={id:number;url:string;credentialsConfigured:boolean;state:string;cooldown:string;failures:number;geo:string;boundAccounts:number}
export function Proxies(){
 const {request}=useAuth()
 const [rows,setRows]=useState<Proxy[]>([]),[query,setQuery]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[page,setPage]=useState(1)
 async function refresh(){setBusy(true);setMessage('');try{setRows(await request('/console/proxies'))}catch(e){setMessage(e instanceof Error?e.message:'读取失败')}finally{setBusy(false)}}
 useEffect(()=>{void refresh()},[])
 async function add(urls:string[]){
  const next=await request('/console/proxies',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({urls})})
  setRows(next);setPage(1);setMessage('代理已保存，重复地址自动跳过')
 }
 const filtered=rows.filter(p=>(p.url+' '+p.geo+' '+p.id).toLowerCase().includes(query.toLowerCase()))
 const current=Math.min(page,Math.max(1,Math.ceil(filtered.length/20)))
 return <Card className="panel list-panel proxy-panel"><div className="panel-title"><div><h2>代理列表 · {rows.length}</h2><p>绑定让账号保持固定出口；新增代理不会自动更换已有账号的出口。</p></div></div>
 <div className="account-toolbar"><div className="account-search"><Search size={16}/><Input aria-label="搜索代理" placeholder="搜索地址、地区或编号…" value={query} onChange={e=>{setQuery(e.target.value);setPage(1)}}/></div><div className="toolbar-actions"><Button variant="outline" size="icon" aria-label="刷新代理" disabled={busy} onClick={()=>void refresh()}><RefreshCw className={busy?'animate-spin':''}/></Button><ProxyImportDialog onImport={add}/></div></div>
 {message&&<p className="panel-message" role="status">{message}</p>}
 <Table aria-label="代理列表"><TableHeader><TableRow>{['代理地址','状态','绑定账号','认证','失败次数','地区'].map(x=><TableHead key={x}>{x}</TableHead>)}</TableRow></TableHeader><TableBody>{filtered.slice((current-1)*20,current*20).map(p=><TableRow key={p.id}><TableCell><strong>#{p.id}</strong> {p.url}</TableCell><TableCell><ValueBadge label={proxyState(p.state,p.cooldown)} tone={p.state==='available'&&!p.cooldown?'success':'muted'}/></TableCell><TableCell>{p.boundAccounts}</TableCell><TableCell>{p.credentialsConfigured?'已配置':'无需认证'}</TableCell><TableCell>{p.failures}</TableCell><TableCell>{p.geo||'—'}</TableCell></TableRow>)}</TableBody></Table>
 {!filtered.length&&<p className="empty">没有符合条件的代理</p>}
 <div className="table-footer"><span>共 {filtered.length} 个代理</span><div><Button variant="outline" disabled={current===1} onClick={()=>setPage(current-1)}>上一页</Button><span>{current}</span><Button variant="outline" disabled={current*20>=filtered.length} onClick={()=>setPage(current+1)}>下一页</Button></div></div>
 </Card>
}
