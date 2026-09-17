# Snowpath — SnowPro Core COF-C03 备考工作台

面向 2026 年 SnowPro Core（COF-C03）的中文学习应用。内容已从旧版 COF-C02 的六域结构重编为 COF-C03 的五个考试域，并加入 Cortex、Iceberg、Snowpark、动态表、数据治理、成本管理与 Data Clean Rooms 等新版主题。

## 本地运行

```bash
npm install
npm run dev
```

访问 `http://localhost:3000`。

默认登录信息：

- 用户名：`admin`
- 密码：`admin1234`

生产环境可通过 `APP_USERNAME` 与 `APP_PASSWORD` 环境变量覆盖默认凭据。

## 验证

```bash
npm run typecheck
npm run build
```

学习进度保存在浏览器 Local Storage 中，登录会话使用 HttpOnly Cookie。
