import {Card} from './ui/card'
import {Button} from './ui/button'
import {Input} from './ui/input'
type Props={initialized:boolean;username:string;password:string;setupKey:string;busy:boolean;error:string;setUsername:(v:string)=>void;setPassword:(v:string)=>void;setSetupKey:(v:string)=>void;login:()=>Promise<void>}
export function LoginPage({initialized,username,password,setupKey,busy,error,setUsername,setPassword,setSetupKey,login}:Props){
 return <div style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:24}}>
  <Card className="panel config-panel" style={{width:'100%',maxWidth:440}}>
   <div className="brand">AccountPool</div><h1>{initialized?'登录管理台':'初始化管理台'}</h1>
   {!initialized&&<p>首次使用，请设置管理员账号和密码。</p>}
   <form onSubmit={e=>{e.preventDefault();void login()}}>
    {!initialized&&<label className="field">初始化密钥<Input required type="password" autoComplete="off" value={setupKey} onChange={e=>setSetupKey(e.target.value)}/></label>}
    <label className="field">用户名<Input required maxLength={80} autoComplete="username" value={username} onChange={e=>setUsername(e.target.value)}/></label>
    <label className="field">密码<Input required minLength={initialized?1:12} maxLength={256} type="password" autoComplete={initialized?'current-password':'new-password'} value={password} onChange={e=>setPassword(e.target.value)}/></label>
    {error&&<p role="alert">{error}</p>}
    <div className="save-row"><Button type="submit" disabled={busy}>{busy?'处理中…':initialized?'登录':'创建管理员'}</Button></div>
   </form>
  </Card>
 </div>
}
