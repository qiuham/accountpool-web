import {useEffect,useMemo,useState} from 'react'
import {Activity,MessageSquare} from 'lucide-react'
export type ActivityTimer={label:string;reason:string;readyAt:number}
export type Schedule={label:string;reason:string;readyAt:number;serverTime:number;check:ActivityTimer;chat:ActivityTimer}
export function remainingTime(seconds:number){
 const total=Math.max(0,Math.ceil(seconds))
 if(total===0)return '等待调度'
 return [Math.floor(total/3600),Math.floor(total%3600/60),total%60].map(n=>String(n).padStart(2,'0')).join(':')
}
const specialLabels:Record<string,string>={'执行中':'执行中','排队中':'排队中','已暂停':'已暂停','执行受阻':'执行受阻','等待代理':'执行受阻','已停止':'已停止','已移交':'已移交'}
function timerLabel(value:string){const labels:Record<string,string>={'已到期':'等待调度','待首次执行':'首次待调度','等待重试':'等待重试调度','待执行':'等待调度','待检查':'等待检查通过','需检查':'等待检查恢复'};return labels[value]||value}
export function ScheduleStatus({value}:{value:Schedule}){
 const anchor=useMemo(()=>({local:Date.now(),server:value.serverTime}),[value])
 const [tick,setTick]=useState(Date.now())
 useEffect(()=>{setTick(Date.now());if(!value.check.readyAt&&!value.chat.readyAt)return;const id=window.setInterval(()=>setTick(Date.now()),1000);return()=>clearInterval(id)},[value])
 const serverNow=anchor.server+(tick-anchor.local)/1000
 const inlineRunning=value.check.label==='执行中'||value.chat.label==='执行中'
 const special=value.label==='执行中'&&inlineRunning?undefined:specialLabels[value.label]
 return <div className="schedule-cell" title={value.reason}>
 {special&&<div className="schedule-special" data-status={value.label}><span className="schedule-dot"/>{special}</div>}
 <div className="schedule-clocks">
 {([{name:'检查',timer:value.check,Icon:Activity},{name:'对话',timer:value.chat,Icon:MessageSquare}]).map(({name,timer,Icon})=><div key={name} className="schedule-clock" title={timer.reason} aria-label={name+'计划'}>
 <span className="schedule-clock-label"><Icon size={13} aria-hidden="true"/>{name}</span>
 <span className="schedule-clock-value" data-retry={timer.label==='重试'} data-timed={timer.readyAt>0}>
 {timer.label==='重试'&&<span className="schedule-retry">重试</span>}{timer.readyAt?remainingTime(timer.readyAt-serverNow):timerLabel(timer.label)}
 </span></div>)}
 </div></div>
}
