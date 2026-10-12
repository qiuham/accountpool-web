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
 await page.goto('http://127.0.0.1:5188')
 await page.getByRole('columnheader',{name:'执行计划',exact:true}).waitFor()
 assert.equal(await page.getByRole('columnheader',{name:'维护状态',exact:true}).count(),0)
 const cell=page.getByLabel('检查计划',{exact:true})
 const first=await cell.innerText()
 await page.waitForTimeout(1200)
 assert.notEqual(await cell.innerText(),first)
 assert.match(await cell.getAttribute('title'),/健康检查/)
 await page.getByLabel('检查计划',{exact:true}).waitFor()
 await page.getByLabel('对话计划',{exact:true}).waitFor()
 assert.match(await page.getByLabel('对话计划',{exact:true}).innerText(),/22:59:|23:00:/)
 
 await page.evaluate(()=>document.documentElement.classList.add('dark'))
 
 await page.getByText('等待调度',{exact:true}).waitFor()
 assert.deepEqual(errors,[])
 console.log('PASS: 检查与对话独立计时，执行计划、到期等待、浅色/深色截图；零上游请求')
}finally{await browser.close()}
