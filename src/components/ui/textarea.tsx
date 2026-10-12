import type {ComponentProps} from 'react'
import {cn} from '@/lib/utils'
export function Textarea({className,...props}:ComponentProps<'textarea'>){
 return <textarea data-slot="textarea" className={cn('flex min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50',className)} {...props}/>
}
