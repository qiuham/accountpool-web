const accountStates:Record<string,string>={normal:'正常',login:'待登录',initializing:'初始化中',abnormal:'异常',disabled:'已停用'}
const jobStates:Record<string,string>={pending:'等待执行',running:'执行中',ok:'已完成',failed:'执行失败',blocked:'已暂停',cancelled:'已取消'}
const proxyStates:Record<string,string>={available:'可用',in_use:'使用中',cooling:'冷却中',cooldown:'冷却中',burned:'已失效',disabled:'已禁用'}
const steps:Record<string,string>={register:'登录 / 注册',onboard:'首次引导',warmup:'网页对话',session:'获取会话',check:'健康检查',oauth:'获取 OAuth'}
const plans:Record<string,string>={claude_max_5x:'Max 5x',claude_max_20x:'Max 20x',max_5x:'Max 5x',max_20x:'Max 20x',claude_free:'免费版',free:'免费版',claude_pro:'Pro 订阅',pro:'Pro 订阅',claude_max:'Max 订阅',max:'Max 订阅',claude_team:'团队版',team:'团队版',enterprise:'企业版'}
export function accountState(value:string){return accountStates[value]??'未知状态'}
export function jobState(value:string){return jobStates[value]??'未知状态'}
export function proxyState(value:string,cooldown:string){
 const timestamp=Date.parse(cooldown.replace(' ','T')+'Z')
 return value==='available'&&Number.isFinite(timestamp)&&timestamp>Date.now()?'冷却中':proxyStates[value]??'未知状态'
}
export function stepLabel(value:string){return value.split(',').map(step=>steps[step.trim()]??'未知步骤').join(' → ')}
export function planLabel(value:string){return value?(plans[value]??'其他订阅'):'未检查'}

const shanghaiDateTime=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'})
const shanghaiDate=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'})
export function organizationDate(value:string){
 const date=new Date(value)
 return value&&Number.isFinite(date.getTime())?shanghaiDateTime.format(date):'未获取'
}
export function registrationDays(value:string,now:number){
 const date=new Date(value)
 if(!value||!Number.isFinite(date.getTime()))return '—'
 // Compare calendar dates rather than rounding elapsed hours.
 return Math.max(0,Math.round((Date.parse(shanghaiDate.format(now)+'T00:00:00Z')-Date.parse(shanghaiDate.format(date)+'T00:00:00Z'))/86400000))
}

export function planTone(value:string):'muted'|'info'|'purple'|'warning'{
 if(value.endsWith('20x'))return 'warning'
 if(value.endsWith('5x')||value==='claude_max'||value==='max')return 'purple'
 if(['claude_pro','pro','claude_team','team','enterprise'].includes(value))return 'info'
 return 'muted'
}
