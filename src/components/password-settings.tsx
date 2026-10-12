import {useState} from 'react'
import {useAuth} from './auth'
import {Card} from './ui/card'
import {Input} from './ui/input'
import {Button} from './ui/button'
export function PasswordSettings(){
 const {request}=useAuth()
 const [username,setUsername]=useState(''),[current,setCurrent]=useState(''),[password,setPassword]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState('')
 async function save(){
  setBusy(true)
  try{await request('/console/password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,current,password})});window.location.reload()}
  catch(e){setMessage(e instanceof Error?e.message:'修改失败')}finally{setBusy(false);setCurrent('');setPassword('')}
 }
 return <Card className="panel config-panel"><h2>修改管理台密码</h2><p>修改成功后全部管理台会话失效，需要重新登录。</p><form onSubmit={e=>{e.preventDefault();void save()}}>
 <label className="field">管理台用户名<Input required autoComplete="username" value={username} onChange={e=>setUsername(e.target.value)}/></label>
 <label className="field">当前密码<Input required type="password" autoComplete="current-password" value={current} onChange={e=>setCurrent(e.target.value)}/></label>
 <label className="field">新密码<Input required minLength={12} maxLength={256} type="password" autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)}/></label>
 <Button type="submit" disabled={busy}>更新管理台密码</Button>{message&&<p role="status">{message}</p>}
 </form></Card>
}
