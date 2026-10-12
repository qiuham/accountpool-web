import {chromium} from 'playwright'
import assert from 'node:assert/strict'
const browser=await chromium.launch({executablePath:'/home/ham/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',headless:true})
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});let auth=false,activity={enabled:true,intervalHours:24,prompts:['hello']};const errors=[]
 page.on('pageerror',e=>errors.push(e.message))
 await page.route('**/console/**',async route=>{
 const p=new URL(route.request().url()).pathname;let json={}
 if(p==='/console/auth/status')json={authenticated:auth,initialized:true}
 else if(p==='/console/auth/login'){auth=true;json={success:true}}
 else if(p==='/console/auth/logout'){auth=false;json={success:true}}
 else if(p==='/console/settings/activity'){if(route.request().method()==='PUT')activity=route.request().postDataJSON();json=activity}
 else if(p==='/console/settings/supply')json={target:5,daily:2,checkHours:1,registrationGapMinutes:60,prefix:'claude',registrationDomain:'example.test',domains:['example.test'],mailBase:'',sequenceDigits:3}
 else if(p==='/console/accounts'||p==='/console/proxies')json=[]
 else if(p==='/console/jobs')json={items:[],page:1,total:0}
 else if(p==='/console/scheduler')json={paused:false,reason:''}
 else if(p==='/console/pool')json={target:5,ready:5,deficit:0}
 await route.fulfill({json})
 })
 await page.goto('http://127.0.0.1:5188/admin');await page.waitForURL('**/login')
 assert.equal(await page.getByText('使用管理台账号登录，与邮箱服务管理员密码无关。').count(),0)
 assert.equal(await page.locator('aside').count(),0)
 const icon=await page.locator('link[rel=icon]').getAttribute('href');assert.equal((await page.request.get('http://127.0.0.1:5188'+icon)).status(),200)
 await page.screenshot({path:'/home/ham/accountpool-release-ui/login.png'})
 await page.getByLabel('用户名',{exact:true}).fill('fixture');await page.getByLabel('密码',{exact:true}).fill('fixture-password');await page.getByRole('button',{name:'登录',exact:true}).click();await page.waitForURL('**/admin')
 await page.getByRole('button',{name:'维护计划',exact:true}).click();await page.getByRole('button',{name:'编辑计划'}).click()
 await page.getByRole('button',{name:'添加消息'}).click();await page.getByLabel('消息 2',{exact:true}).fill('second message')
 await page.getByRole('button',{name:'保存定时对话计划'}).click();await page.getByText('网页对话计划已保存，下次巡检生效').waitFor();assert.deepEqual(activity.prompts,['hello','second message'])
 await page.getByRole('button',{name:'删除消息 1',exact:true}).click();await page.getByRole('button',{name:'保存定时对话计划'}).click();await page.waitForTimeout(300);assert.deepEqual(activity.prompts,['second message'])
 await page.screenshot({path:'/home/ham/accountpool-release-ui/messages.png'})
 await page.goto('http://127.0.0.1:5188/login');await page.waitForURL('**/admin')
 await page.getByRole('button',{name:'退出登录'}).click();await page.waitForURL('**/login')
 assert.deepEqual(errors,[]);console.log('PASS: login/admin guards, logout, removed copy, favicon, prompt list add/delete/save')
}finally{await browser.close()}
