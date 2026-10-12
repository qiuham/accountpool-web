import {chromium} from 'playwright'
import {execFileSync} from 'node:child_process'
import assert from 'node:assert/strict'
const password=process.env.POOL_VERIFY_PASSWORD
if(!password)throw new Error('Set POOL_VERIFY_PASSWORD')
const user=execFileSync('ssh',['-S','/tmp/accountpool-deploy-ssh','root@64.83.46.92',`python3 -c "import sqlite3; print(sqlite3.connect('/opt/accountpool/state/data/backend/pool.db').execute('select username from console_admin where id=1').fetchone()[0])"`],{encoding:'utf8'}).trim()
const browser=await chromium.launch({executablePath:'/home/ham/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',headless:true})
try{
 const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[]
 page.on('pageerror',e=>errors.push(e.message))
 await page.goto('https://account.ocpquant.com:8443/login')
 await page.getByLabel('用户名',{exact:true}).fill(user)
 await page.getByLabel('密码',{exact:true}).fill(password)
 await page.getByRole('button',{name:'登录',exact:true}).click()
 await page.waitForURL('**/admin')
 await page.getByRole('button',{name:'配置中心',exact:true}).click()
 assert.equal(await page.getByLabel('收件域名 1',{exact:true}).inputValue(),'hamqiu.com')
 assert.ok((await page.getByRole('combobox',{name:'自动注册域名',exact:true}).innerText()).includes('hamqiu.com'))
 await page.getByRole('button',{name:'切换深色模式',exact:true}).click()
 await page.screenshot({path:'/home/ham/accountpool-release-mail-health/deployed-settings.png',animations:'disabled',fullPage:true})
 await page.getByRole('button',{name:'账号池',exact:true}).click()
 await page.getByRole('button',{name:'详情',exact:true}).first().click()
 assert.equal(await page.getByText('收件邮箱',{exact:true}).count(),0)
 await page.keyboard.press('Escape')
 await page.getByRole('button',{name:'退出登录',exact:true}).click()
 await page.waitForURL('**/login');assert.deepEqual(errors,[])
 console.log('PASS: deployed HTTPS login/admin, multi-domain settings, registration-domain selector, separate account mailbox fields, dark theme, logout; no page errors')
}finally{await browser.close()}
