import {chromium} from 'playwright'
import {execFileSync} from 'node:child_process'
import assert from 'node:assert/strict'
const user=execFileSync('ssh',['-S','/tmp/accountpool-deploy-ssh','root@64.83.46.92',`python3 -c "import sqlite3;print(sqlite3.connect('/opt/accountpool/state/data/backend/pool.db').execute('select username from console_admin where id=1').fetchone()[0])"`],{encoding:'utf8'}).trim()
const browser=await chromium.launch({executablePath:'/home/ham/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',headless:true})
try{
 const page=await browser.newPage({viewport:{width:1440,height:1100}})
 const base='https://account.ocpquant.com:8443'
 assert.equal((await page.request.get(base+'/console/executor')).status(),401)
 await page.goto(base+'/login')
 await page.getByLabel('用户名',{exact:true}).fill(user)
 await page.getByLabel('密码',{exact:true}).fill(process.env.POOL_VERIFY_PASSWORD)
 await page.getByRole('button',{name:'登录',exact:true}).click()
 await page.waitForURL('**/admin')
 await page.getByRole('button',{name:'配置中心',exact:true}).click()
 await page.getByRole('heading',{name:'执行器状态',exact:true}).waitFor()
 const response=await page.request.get(base+'/console/executor')
 assert.equal(response.status(),200)
 const status=await response.json()
 assert.equal(status.online,true)
 assert.equal(await page.getByRole('button',{name:'重新连接',exact:true}).count(),0)
 await page.getByRole('heading',{name:'执行器状态',exact:true}).scrollIntoViewIfNeeded()
 await page.screenshot({path:'/home/ham/accountpool-unified/executor-status.png',animations:'disabled'})
 await page.reload();await page.getByRole('button',{name:'账号池',exact:true}).waitFor()
 console.log('PASS: unified HTTPS login/admin reload; executor authenticated, online; reconnect absent')
}finally{await browser.close()}
