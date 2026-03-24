# My NestJS Vue

一个基于 `NestJS + Vue + TypeORM + MySQL + Redis` 的 monorepo 项目。

目前仓库结构：

- `apps/server`：后端服务
- `apps/web`：前端应用
- `packages/api-contract`：前后端共享的接口类型

前端生产构建产物会由后端服务统一托管，所以生产环境通常只需要启动后端进程。

## 环境要求

- Node.js 20 及以上
- pnpm 10
- MySQL 8 及以上
- Redis 6 及以上

## 环境变量

项目现在统一使用仓库根目录的环境变量文件。

1. 复制示例文件

```bash
cp .env.example .env
```

2. 按实际环境修改 `.env`

关键变量说明：

- `PORT`：后端服务端口
- `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_NAME`：MySQL 连接信息
- `REDIS_HOST` / `REDIS_PORT` / `REDIS_PASSWORD`：Redis 连接信息
- `SESSION_SECRET`：会话密钥，生产环境必须使用高强度随机值
- `VITE_API_BASE_URL`：前端请求后端的基础地址

注意：

- 开发环境中，`VITE_API_BASE_URL` 通常填写 `http://localhost:3000`
- 生产环境中，如果前后端同域部署，建议在构建前改成线上后端地址
- `VITE_` 开头的变量会在前端构建时写入产物，修改后需要重新构建前端

## 安装依赖

```bash
pnpm install
```

## 数据库迁移

### 首次初始化

1. 确保 MySQL 已创建目标数据库

```sql
CREATE DATABASE my_app_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 确认根目录 `.env` 中的数据库配置正确

3. 执行迁移

```bash
pnpm --filter @my-nestjs-vue/server db:migration:run
```

### 查看待执行迁移

```bash
pnpm --filter @my-nestjs-vue/server db:migration:show
```

### 生成新迁移

当你修改了实体结构后，可以生成新的迁移文件：

```bash
pnpm --filter @my-nestjs-vue/server db:migration:generate
```

生成后的文件位于 `apps/server/src/database/migrations`。

注意：

- 迁移命令同样读取根目录 `.env`
- 生产环境不要依赖 `synchronize` 自动建表，当前项目已关闭该行为

## 本地运行

### 启动全部服务

```bash
pnpm dev
```

默认情况下：

- 前端开发服务运行在 Vite 默认端口
- 后端服务运行在 `http://localhost:3000`

### 分开启动

启动后端：

```bash
pnpm dev:server
```

启动前端：

```bash
pnpm dev:web
```

### 常用检查

类型检查：

```bash
pnpm typecheck
```

构建：

```bash
pnpm build
```

后端健康检查：

```bash
curl http://localhost:3000/health
```

## 生产部署

### 部署方式

当前项目推荐按下面的方式部署：

1. 准备 MySQL 和 Redis
2. 在部署环境注入根目录 `.env` 中对应的环境变量
3. 安装依赖
4. 执行数据库迁移
5. 构建前端和后端
6. 启动后端服务

后端会自动托管前端构建产物，因此生产环境只需要对外暴露后端端口。

### 部署步骤

1. 安装依赖

```bash
pnpm install --frozen-lockfile
```

2. 配置生产环境变量

建议直接由部署平台注入环境变量；如果使用文件，也应放在仓库根目录 `.env`。

至少需要配置：

- `NODE_ENV=production`
- `PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `REDIS_HOST`
- `REDIS_PORT`
- `REDIS_PASSWORD`
- `SESSION_SECRET`
- `VITE_API_BASE_URL`

3. 执行迁移

```bash
pnpm --filter @my-nestjs-vue/server db:migration:run
```

4. 构建项目

```bash
pnpm build
```

5. 启动服务

```bash
pnpm start
```

`pnpm start` 会先构建，再启动后端。如果你已经提前构建完成，也可以直接运行：

```bash
pnpm --filter @my-nestjs-vue/server start
```

### 生产部署注意事项

- 前端环境变量在构建时生效，变更 `VITE_API_BASE_URL` 后必须重新执行 `pnpm build`
- 数据库迁移应在应用正式接流量前执行
- `SESSION_SECRET` 不能使用示例值
- 如果 Redis 配置错误，后端启动时会因为会话存储不可用而失败
- 对外只需要暴露后端端口，前端静态资源由后端统一提供

## 常见问题

### 1. 前端接口地址不对

先检查根目录 `.env` 中的 `VITE_API_BASE_URL`，然后重新执行：

```bash
pnpm --filter @my-nestjs-vue/web build
```

### 2. 迁移执行失败

重点检查：

- MySQL 是否已启动
- 数据库是否已创建
- `.env` 中的 `DB_*` 配置是否正确
- 当前数据库账号是否有建表和修改表结构权限

### 3. 服务启动后访问空白页

先确认是否已经执行过：

```bash
pnpm build
```

如果只启动了后端但没有前端构建产物，后端无法提供最新的页面资源。
