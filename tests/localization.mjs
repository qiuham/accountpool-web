import {chromium} from 'playwright'
import assert from 'node:assert/strict'
const browser=await chromium.launch({executablePath:'/home/ham/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',headless:true})
try {
 const page=await browser.newPage()
 const errors=[];page.on('pageerror',e=>errors.push(e.message))
 await page.route('**/console/**',async route=>{
  const path=new URL(route.request().url()).pathname
  const values={
   '/console/auth/status':{authenticated:true,initialized:true},
   '/console/accounts':[],
   '/console/jobs':{items:[{id:1,name:'fixture',email:'fixture@example.invalid',kind:'register, check',state:'failed',reason:'crashed-before-report',attempts:1}],total:1,page:1},
   '/console/scheduler':{paused:true,reason:'scheduler-error: inspect task outcome before resume',reasonText:'调度异常，请检查最近执行记录后恢复'},
   '/console/pool':{target:4,ready:0,recovering:1,pausedAccounts:0,blocked:0,paid:0,deficit:4,pendingSupply:3,createdToday:0,dailyLimit:5,running:0,queued:0,nextRetry:0},
   '/console/settings/supply':{target:4,daily:5,checkHours:1,prefix:'fixture',sequenceDigits:3,registrationGapMinutes:60},
   '/console/settings/activity':{enabled:false,intervalHours:24,prompts:[]}
  }
  await route.fulfill({json:values[path]??{}})
 })
 await page.goto('http://127.0.0.1:5188')
 await page.getByRole('heading',{name:'账号池',exact:true}).waitFor()
 assert.match(await page.title(),/accountpool/)
 assert.equal(await page.locator('.brand').innerText(),'accountpool')
 await page.getByRole('button',{name:'执行记录',exact:true}).click()
 await page.getByText('登录 / 注册 → 健康检查',{exact:true}).waitFor()
 await page.getByRole('button',{name:'维护计划',exact:true}).click()
 await page.getByRole('button',{name:'编辑计划'}).click()
 await page.getByText('异常暂停：调度异常，请检查最近执行记录后恢复',{exact:true}).waitFor()
 const body=await page.locator('body').innerText()
 assert.ok(!body.includes('scheduler-error'))
 assert.ok(!body.includes('crashed-before-report'))
 assert.deepEqual(errors,[])
 console.log('PASS: accountpool brand, Chinese compound steps and pause reason; raw codes hidden; no browser errors')
} finally {await browser.close()}
