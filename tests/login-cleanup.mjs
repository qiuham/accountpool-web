import {chromium} from 'playwright'
import assert from 'node:assert/strict'
const browser=await chromium.launch({executablePath:'/home/ham/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',headless:true})
try{
 const page=await browser.newPage()
 await page.route('**/console/auth/status',r=>r.fulfill({json:{authenticated:false,initialized:true}}))
 await page.goto('http://127.0.0.1:5190/login')
 await page.getByRole('button',{name:'登录',exact:true}).waitFor()
 assert.equal(await page.getByRole('button',{name:'重新连接',exact:true}).count(),0)
 assert.equal(await page.getByRole('button').count(),1)
 await page.screenshot({path:'/home/ham/accountpool-login-cleanup/login.png',animations:'disabled'})
 console.log('PASS: login page only has login action; reconnect removed')
}finally{await browser.close()}
