import {chromium} from 'playwright'
import assert from 'node:assert/strict'
const browser=await chromium.launch({executablePath:'/home/ham/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',headless:true})
try{
 const page=await browser.newPage()
 const now=Math.floor(Date.now()/1000)
 const account={id:1,email:'fixture@example.invalid',name:'fixture',platform:'claude',state:'registering',displayStatus:'login',statusReason:'登录尚未完成',schedule:{label:'等待冷却',reason:'平台注册 / 登录全局间隔',readyAt:now+4,serverTime:now,check:{label:'周期',reason:'下一次健康检查',readyAt:now+3},chat:{label:'周期',reason:'下一次定时对话',readyAt:now+23*3600}},maintenancePaused:false,plan:'claude_free',session:false,oauth:false,orgId:'',checked:'',proxy:null,retryAt:0,orgCreatedAt:'',warmupCount:0,warmupDays:0}
 const errors=[];page.on('pageerror',e=>errors.push(e.message))
 await page.route('**/console/**',async route=>{
  const path=new URL(route.request().url()).pathname
  await route.fulfill({json:path==='/console/auth/status'?{authenticated:true,initialized:true}:path==='/console/accounts'?[account]:path==='/console/jobs'?{items:[],page:1,total:0}:path==='/console/scheduler'?{paused:false,reason:'',reasonText:''}:{}})
 })
 await page.goto('http://127.0.0.1:5190')
 await page.getByRole('columnheader',{name:'执行计划',exact:true}).waitFor()
 assert.equal(await page.getByRole('columnheader',{name:'维护状态',exact:true}).count(),0)
 for(const active of ['check','chat']){
  account.schedule.label='执行中'
  account.schedule.check={label:'周期',reason:'',readyAt:now+3600}
  account.schedule.chat={label:'周期',reason:'',readyAt:now+3600}
  account.schedule[active]={label:'执行中',reason:'',readyAt:0}
  await page.reload()
  const current=page.getByLabel(active==='check'?'检查计划':'对话计划',{exact:true})
  await current.getByText('执行中',{exact:true}).waitFor()
  assert.equal(await page.locator('.schedule-special').count(),0)
  assert.equal(await page.getByText('执行中',{exact:true}).count(),1)
  assert.match(await page.getByLabel(active==='check'?'对话计划':'检查计划',{exact:true}).innerText(),/\d{2}:\d{2}:\d{2}/)
 }
 await page.screenshot({path:'/home/ham/accountpool-inline-running/screenshot.png',animations:'disabled'})
 assert.deepEqual(errors,[])
 console.log('PASS: running shown only in its timer slot; other timer preserved')
}finally{await browser.close()}
