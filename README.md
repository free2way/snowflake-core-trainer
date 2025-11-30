# Snowflake Core Trainer - Next.js 版本

这是 Snowflake Core Trainer 的 Next.js 版本，已经从 Vite + React 改造为前后端分离架构。

## 🎯 主要改进

### 安全性提升
- **API 密钥安全存储**：Gemini API 密钥现在安全存储在服务器端环境变量中
- **前后端分离**：前端无法直接访问敏感的 API 密钥
- **防止密钥泄露**：确保 API 密钥不会在前端代码或浏览器中暴露

### 技术升级
- 从 Vite + React 升级到 Next.js 15
- 使用 App Router 架构
- TypeScript 支持
- Tailwind CSS 样式
- API 路由处理所有 AI 功能

## 🚀 快速开始

### 1. 环境准备
确保你有 Node.js 18+ 和 npm。

### 2. 安装依赖
```bash
npm install
```

### 3. 配置 API 密钥
编辑 `.env.local` 文件，将你的 Gemini API 密钥填入：
```
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 4. 启动开发服务器
```bash
npm run dev
```

应用将在 http://localhost:3000 启动。

### 5. 构建生产版本
```bash
npm run build
npm start
```

## 📁 项目结构

```
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── explain/       # 解释生成API
│   │   ├── quiz/          # 测验生成API
│   │   ├── lab/           # 实验生成API
│   │   └── chat/          # 聊天API
│   ├── layout.tsx         # 根布局
│   ├── page.tsx          # 主页面
│   └── globals.css       # 全局样式
├── components/            # React 组件
│   ├── ModuleView.tsx    # 学习模块组件
│   ├── QuizView.tsx      # 测验组件
│   ├── LabView.tsx       # 实验组件
│   ├── TutorChat.tsx     # AI 聊天组件
│   └── MarkdownRenderer.tsx # Markdown 渲染组件
├── lib/                   # 工具库
│   ├── types.ts          # TypeScript 类型定义
│   └── constants.ts      # 课程常量
├── .env.local            # 环境变量（API 密钥）
├── package.json          # 项目配置
├── tailwind.config.js    # Tailwind CSS 配置
└── next.config.js        # Next.js 配置
```

## 🔒 安全特性

1. **API 密钥保护**
   - 所有 Gemini API 调用通过 Next.js API 路由处理
   - API 密钥仅存储在服务器端环境变量中
   - 前端代码无法访问敏感凭据

2. **环境隔离**
   - 开发环境：使用 `.env.local`
   - 生产环境：通过服务器环境变量配置

3. **错误处理**
   - API 错误不会暴露敏感信息
   - 统一的错误响应格式

## 🛠️ 技术栈

- **前端**：Next.js 15, React 19, TypeScript
- **样式**：Tailwind CSS
- **图标**：Lucide React
- **AI**：Google Gemini API
- **构建**：Next.js 内置构建工具

## 📱 功能特性

1. **学习模块**：结构化的 SnowPro Core 考试内容
2. **AI 解释**：点击"Ask AI Tutor"获取详细解释
3. **实践测验**：AI 生成的选择题
4. **动手实验**：SQL 实践场景
5. **AI 聊天助手**：实时问答

## 🔧 开发命令

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm start` - 启动生产服务器
- `npm run lint` - 代码检查

## ⚠️ 重要提示

1. **API 密钥安全**：永远不要在前端代码中硬编码 API 密钥
2. **环境变量**：在生产环境中使用环境变量管理敏感信息
3. **HTTPS**：生产环境建议使用 HTTPS

## 📖 使用说明

1. 选择学习模块
2. 查看关键要点
3. 点击"Ask AI Tutor"获取 AI 解释
4. 切换到"Quiz"进行练习测试
5. 切换到"Lab"进行实践实验
6. 使用右下角的 AI 聊天助手提问

享受你的 SnowPro Core 考试准备之旅！❄️
