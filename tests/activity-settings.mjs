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
 else if(p==='/console/settings/activity'){json=route.request().method()==='PUT'?route.request().postDataJSON():{enabled:true,intervalHours:24,prompts:['hello']}}
 await route.fulfill({json})
 })
 await page.goto('http://127.0.0.1:5190/admin')

 await page.getByRole('button',{name:'维护计划',exact:true}).click()
 await page.getByRole('button',{name:'编辑计划',exact:true}).click()
 await page.getByRole('button',{name:'添加消息',exact:true}).click()
 await page.getByLabel('消息 2',{exact:true}).fill('第二条测试消息')
 await page.getByLabel('对话周期（小时）',{exact:true}).fill('8')
 await page.getByRole('button',{name:'保存定时对话计划',exact:true}).click()
 await page.getByText('网页对话计划已保存，下次巡检生效').waitFor()
 assert.equal(await page.getByRole('checkbox',{name:'启用定时对话'}).getAttribute('aria-checked'),'true')
 assert.equal(await page.getByRole('button',{name:'暂停平台维护',exact:true}).count(),1)
 assert.equal(await page.locator('textarea').nth(1).inputValue(),'第二条测试消息')
 await page.screenshot({path:'/home/ham/accountpool-readonly-mail/activity-settings.png',animations:'disabled',fullPage:true})
 assert.deepEqual(errors,[])
 console.log('PASS: add message, change interval, save list; activity and platform remain enabled')
}finally{await browser.close()}
