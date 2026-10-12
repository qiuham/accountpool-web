# AccountPool 管理台

React / Vite / shadcn。Go API 提供初始化、登录会话、账号和任务列表、调度控制、配置和代理登记。

## 本地开发

后端先运行 `accountpool serve`（默认 127.0.0.1:8787），前端执行：

```sh
npm ci
npm run dev
```

访问 http://localhost:5188。第一次启动在后端日志找到初始化密钥，在页面创建管理员。
管理台密码与邮箱管理员密码、CRS 导出接口账号相互独立。
会话采用 HttpOnly、SameSite=Strict Cookie，刷新不退出，24 小时后重新登录。
部署 HTTPS 时反向代理需正确传递 Host 和 X-Forwarded-Proto。

## 测试

`npm run build` 检查生产构建。
浏览器验收使用真实 Go 服务及独立空数据库，不运行 maintenance，不访问上游：

```sh
POOL_TEST_SETUP_KEY=local-test-setup-key npm test
```

测试只允许用于空白测试实例：它创建管理员、保存测试邮箱参数、登记测试代理。
可用 POOL_TEST_URL 指定测试地址、PLAYWRIGHT_CHROMIUM_EXECUTABLE 指定浏览器。

## Docker

保持本仓库与 accountpool 为同级目录，在后端仓库执行 `docker compose up -d --build`。
web 容器通过服务名 api 访问后端；不使用开发服务器代理。
前端镜像支持 NODE_IMAGE、NGINX_IMAGE 构建参数，可指定镜像仓库。

## 当前边界

仅实现 Claude / Camoufox，尚无其他平台适配器。
邮箱地址使用前缀加随机字符；不显示尚未实现的序号配置。
代理支持登记和状态查询，编辑、删除及网页绑定待补。
账号列表是凭据存在性展示；“已保存”不代表会话已实时验证。
