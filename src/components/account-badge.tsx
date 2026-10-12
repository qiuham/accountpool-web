import {CheckCircle2,Clock3,CircleAlert,CircleX,Activity,Minus} from 'lucide-react'
import {Badge} from './ui/badge'
import {accountState} from '../lib/display'
type Tone='success'|'warning'|'danger'|'info'|'muted'|'purple'
export function StateBadge({state}:{state:string}){
 const tone:Tone=state==='normal'?'success':state==='abnormal'?'danger':state==='initializing'?'info':state==='login'?'warning':'muted'
 const Icon=tone==='success'?CheckCircle2:tone==='danger'?CircleX:state==='cooldown'?Clock3:tone==='info'?Activity:tone==='warning'?CircleAlert:Minus
 return <Badge variant="outline" className={`pool-badge tone-${tone}`}><Icon aria-hidden="true"/>{accountState(state)}</Badge>
}
export function ValueBadge({label,tone='muted'}:{label:string;tone?:Tone}){
 return <Badge variant="outline" className={`pool-badge tone-${tone}`}>{label}</Badge>
}
