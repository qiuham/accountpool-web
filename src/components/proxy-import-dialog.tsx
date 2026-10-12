import {useState} from 'react'
import {Dialog} from '@base-ui/react/dialog'
import {Plus,X,LoaderCircle} from 'lucide-react'
import {Button} from './ui/button'
import {Textarea} from './ui/textarea'

export function ProxyImportDialog({onImport}:{onImport:(urls:string[])=>Promise<void>}){
 const [open,setOpen]=useState(false),[text,setText]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('')
 const urls=text.split(/\r?\n/).map(v=>v.trim()).filter(Boolean)
 function changeOpen(next:boolean){
  if(busy)return
  setOpen(next);setError('')
  if(!next)setText('')
 }
 async function submit(){
  if(busy||!urls.length||urls.length>100)return
  setBusy(true);setError('')
  try{await onImport(urls);setOpen(false);setText('')}
  catch(e){setError(e instanceof Error?e.message:'添加失败，请重试')}
  finally{setBusy(false)}
 }
 return <Dialog.Root open={open} onOpenChange={changeOpen}>
 <Dialog.Trigger render={<Button/>}><Plus/>添加代理</Dialog.Trigger>
 <Dialog.Portal><Dialog.Backdrop className="proxy-dialog-backdrop"/><Dialog.Popup className="proxy-dialog">
 <div className="proxy-dialog-heading"><div><Dialog.Title>添加代理</Dialog.Title><Dialog.Description>支持一次添加多个代理，每行一个，最多 100 个。</Dialog.Description></div><Dialog.Close disabled={busy} render={<Button variant="ghost" size="icon" aria-label="关闭添加代理"/>}><X/></Dialog.Close></div>
 <form onSubmit={e=>{e.preventDefault();void submit()}}>
 <div className="proxy-dialog-body"><label htmlFor="proxy-import-urls">代理地址</label>
 <Textarea id="proxy-import-urls" aria-label="代理地址列表" aria-describedby="proxy-import-help" aria-invalid={!!error||urls.length>100} disabled={busy} autoComplete="off" spellCheck={false} placeholder={'http://host:8080\nsocks5://user:password@host:1080'} value={text} onChange={e=>{setText(e.target.value);setError('')}}/>
 <div id="proxy-import-help" className="proxy-import-help"><span>支持 HTTP、HTTPS、SOCKS5；重复地址自动跳过。</span><span className={urls.length>100?'text-destructive':''}>{urls.length} / 100</span></div>
 {error&&<p role="alert" className="text-destructive">{error}</p>}
 </div>
 <div className="proxy-dialog-footer"><Dialog.Close disabled={busy} render={<Button variant="outline" type="button"/>}>取消</Dialog.Close><Button type="submit" disabled={busy||!urls.length||urls.length>100}>{busy?<><LoaderCircle className="animate-spin"/>正在保存…</>:'保存代理'}</Button></div>
 </form></Dialog.Popup></Dialog.Portal>
 </Dialog.Root>
}
