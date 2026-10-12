import {chromium} from 'playwright'
import assert from 'node:assert/strict'
const browser=await chromium.launch({executablePath:'/home/ham/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',headless:true})
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[]
 page.on('pageerror',e=>errors.push(e.message))
 let account={id:1,name:'external',email:'person@hotmail.com',mailboxEmail:'receipt@example.test',platform:'claude',state:'login_required',displayStatus:'abnormal',statusReason:'需要登录',maintenancePaused:true,schedule:{label:'已暂停',reason:'',readyAt:0,serverTime:0,check:{label:'已暂停',reason:'',readyAt:0},chat:{label:'已暂停',reason:'',readyAt:0}},orgId:'',registrationEvidence:'unknown',plan:'',session:false,oauth:false,checked:'',proxy:null,retryAt:0,orgCreatedAt:'',warmupCount:0,warmupDays:0},saved
 await page.route('**/console/**',async route=>{
 const p=new URL(route.request().url()).pathname;let json={}
 if(p==='/console/auth/status')json={authenticated:true,initialized:true}
 else if(p==='/console/accounts')json=[account]
 else if(p==='/console/accounts/mailbox'){saved=route.request().postDataJSON();account={...account,mailboxEmail:saved.mailboxEmail};json={mailboxEmail:saved.mailboxEmail}}
 else if(p==='/console/proxies')json=[]
 else if(p==='/console/jobs')json={items:[],page:1,total:0}
 else if(p==='/console/scheduler')json={paused:false,reason:''}
 else if(p==='/console/pool')json={target:5,ready:0,deficit:5}
 else if(p==='/console/settings/supply')json={target:5,daily:2,checkHours:1,registrationGapMinutes:60,prefix:'claude',registrationDomain:'example.test',domains:['example.test'],mailBase:'',sequenceDigits:3}
 else if(p==='/console/settings/activity')json={enabled:false,intervalHours:24,prompts:['hello']}
 await route.fulfill({json})
 })
 await page.goto('http://127.0.0.1:5190/admin')
 await page.getByRole('button',{name:'详情',exact:true}).click()
 assert.equal(await page.getByRole('heading',{name:'邮箱信息',exact:true}).count(),0)
 assert.equal(await page.getByText('收件邮箱',{exact:true}).count(),0)
 assert.equal(await page.getByRole('button',{name:'保存收件邮箱',exact:true}).count(),0)
 await page.screenshot({path:'/home/ham/accountpool-remove-forwarding/details.png',animations:'disabled'})
 assert.deepEqual(errors,[])
 console.log('PASS: forwarding fields and controls removed')
}finally{await browser.close()}
