import { Bot, Cable, Gauge, Network, ShieldCheck } from 'lucide-react';
import type { Domain, QuizQuestion } from './types';

export const EXAM_META = {
  code: 'COF-C03',
  questions: 100,
  minutes: 115,
  passScore: 750,
  updated: '2026.09',
};

export const DOMAINS: Domain[] = [
  {
    id: 'architecture', number: '01', shortTitle: '架构与 AI', weight: 31, icon: Network,
    title: 'Snowflake AI Data Cloud 功能与架构',
    description: '建立整个平台的心智模型：三层架构、对象体系、计算与存储，以及 COF-C03 新增的 AI/ML 与应用开发能力。',
    topics: [
      {
        id: 'three-layers', title: '三层架构与平台特性', kicker: 'Architecture', minutes: 18,
        summary: 'Snowflake 将集中式存储、独立计算和云服务分离扩展。考试常用“性能、并发、元数据分别属于哪一层”来检验理解。',
        objectives: ['区分 Database Storage、Query Processing 与 Cloud Services 的职责', '解释 multi-cluster shared data 架构如何消除资源争用', '识别 SaaS、跨云区域与版本发布机制的边界'],
        examNotes: ['数据以压缩列式微分区存储在云对象存储中。', '虚拟仓库不保存永久数据；每个仓库拥有独立本地缓存。', '身份验证、元数据、优化器与事务协调属于 Cloud Services。'],
        trap: '扩大仓库只扩展计算，不会扩大存储；并发压力通常考虑多集群，而单条慢查询先看查询计划与仓库大小。',
      },
      {
        id: 'objects-tools', title: '对象体系、接口与工具', kicker: 'Objects & tools', minutes: 16,
        summary: '从 organization → account → database → schema → object 梳理对象作用域，并知道 Snowsight、CLI、驱动和连接器各适合什么任务。',
        objectives: ['区分账户对象、数据库对象与模式对象', '理解参数由 account、user、session 等层级继承与覆盖', '为浏览器、CI、IDE 与应用连接选择正确工具'],
        examNotes: ['账户角色可跨数据库授权；数据库角色的权限局限于所在数据库。', 'Snowflake CLI 面向自动化与对象部署；Snowsight 面向交互式管理。', 'Sequence、stage、file format、stream、task 都是常考对象。'],
        trap: 'SnowSQL 是传统 SQL 命令行客户端；涉及 Streamlit、Git、Snowpark Container Services 的现代自动化优先考虑 Snowflake CLI。',
      },
      {
        id: 'compute-storage', title: '虚拟仓库与存储内部机制', kicker: 'Compute & storage', minutes: 22,
        summary: '掌握仓库尺寸、多集群、自动挂起/恢复与 Gen2 仓库，并理解微分区、聚簇、表和视图类型之间的关系。',
        objectives: ['比较 resize 与 multi-cluster 对性能、并发和成本的影响', '说明微分区元数据如何支持 pruning', '比较 permanent、transient、temporary、dynamic 与 Iceberg table'],
        examNotes: ['仓库每升一级，通常计算资源约翻倍；计费按运行秒数且每次启动有最低计费。', 'Standard scaling policy 更重视性能；Economy 更重视成本。', 'Iceberg table 使用开放表格式，可由 Snowflake 管理或使用外部目录。'],
        trap: '自动聚簇是无服务器服务，不在用户虚拟仓库上运行；视图不存结果，物化视图才存储维护后的结果。',
      },
      {
        id: 'ai-apps', title: 'Cortex、Snowpark 与应用开发', kicker: 'New in C03', minutes: 20,
        summary: 'COF-C03 明确纳入 Snowflake Cortex、Cortex Search/Analyst、Notebooks、Streamlit in Snowflake、Snowpark 与 Snowflake ML。',
        objectives: ['为非结构化搜索和结构化自然语言分析选择 Cortex 服务', '区分 AISQL、Cortex Search、Cortex Analyst 的使用场景', '解释 Snowpark pushdown、Notebooks 与 Streamlit 的角色'],
        examNotes: ['Cortex Search 面向非结构化文本的低延迟混合检索与 RAG。', 'Cortex Analyst 通过语义模型/语义视图回答结构化数据问题。', 'Snowpark 将 DataFrame 逻辑下推到 Snowflake 执行，避免大规模数据移动。'],
        trap: '需要对结构化指标做自然语言问答时选 Analyst；需要在文档中检索相关段落时选 Search。',
      },
    ],
  },
  {
    id: 'governance', number: '02', shortTitle: '账户与治理', weight: 20, icon: ShieldCheck,
    title: '账户管理与数据治理',
    description: '覆盖组织与账户、访问控制、身份安全、治理策略，以及监控成本和使用情况的管理能力。',
    topics: [
      {
        id: 'accounts-roles', title: '组织、账户与访问控制', kicker: 'RBAC', minutes: 22,
        summary: 'RBAC 与 DAC 共同决定“谁能对什么对象做什么”。核心是把权限授予角色，再把角色授予用户或其他角色。',
        objectives: ['解释系统角色的职责与最小权限原则', '区分 OWNERSHIP、USAGE、SELECT 与 MANAGE GRANTS', '使用 future grants、managed access schema 与 database roles'],
        examNotes: ['SECURITYADMIN 可管理授权；USERADMIN 管理用户和角色；SYSADMIN 管理业务对象。', '访问模式对象通常同时需要父数据库和模式上的 USAGE。', '托管访问模式将对象授权决策集中到模式所有者或有 MANAGE GRANTS 的角色。'],
        trap: 'ACCOUNTADMIN 不应作为日常操作角色；权限优先授予自定义角色，而不是直接授予用户。',
      },
      {
        id: 'identity-security', title: '身份、网络与加密安全', kicker: 'Security', minutes: 18,
        summary: '认证确认身份，授权决定权限。考试会组合 MFA、SSO、密钥对、OAuth、网络策略与私有连接场景。',
        objectives: ['为人类用户与服务用户选择认证方式', '理解 network policy、PrivateLink/Private Service Connect 的作用', '说明端到端加密与周期性密钥轮换'],
        examNotes: ['服务到服务连接优先使用密钥对或 OAuth，而非共享密码。', '网络策略可在账户与用户层级限制来源 IP。', 'Business Critical 支持更高级的私有连接与安全能力。'],
        trap: '网络策略限制网络来源但不替代身份认证；MFA 提升登录安全但不授予任何对象权限。',
      },
      {
        id: 'governance-policies', title: '分类、标签与治理策略', kicker: 'Governance', minutes: 20,
        summary: '使用分类和标签发现敏感数据，再通过 masking、row access、projection 与 aggregation policy 控制消费方式。',
        objectives: ['区分 dynamic masking 与 row access policy', '理解 tags、classification 与 tag-based masking', '了解 access history 与对象依赖追踪'],
        examNotes: ['Masking policy 控制列值如何呈现；row access policy 决定哪些行可见。', '策略在查询时动态执行，结果可基于 CURRENT_ROLE 等上下文变化。', 'Access History 用于审计读写路径和列级访问。'],
        trap: 'Secure View 隐藏定义和部分优化细节，但治理策略才是可复用的动态访问控制机制。',
      },
      {
        id: 'cost-observability', title: '成本、预算与可观测性', kicker: 'FinOps', minutes: 16,
        summary: 'COF-C03 将管理能力扩展到 credits、resource monitors、budgets、ACCOUNT_USAGE 与 INFORMATION_SCHEMA。',
        objectives: ['比较 resource monitor 与 budget 的覆盖范围', '选择 QUERY_HISTORY、WAREHOUSE_METERING_HISTORY 等视图', '区分实时/低延迟函数与有延迟的 ACCOUNT_USAGE 视图'],
        examNotes: ['Resource monitor 主要监控用户管理的虚拟仓库 credits。', 'Budgets 可覆盖更广的计算成本并提供预测与通知。', 'ACCOUNT_USAGE 保留期更长但存在延迟；INFORMATION_SCHEMA 延迟更低、范围更局部。'],
        trap: 'Resource monitor 不能全面阻止所有 serverless feature 成本；先明确要控制的成本来源。',
      },
    ],
  },
  {
    id: 'loading', number: '03', shortTitle: '装载与连接', weight: 18, icon: Cable,
    title: '数据装载、卸载与连接',
    description: '从文件与流式入口到 COPY、Snowpipe、非结构化数据、卸载和客户端连接，形成端到端数据移动能力。',
    topics: [
      {
        id: 'stages-copy', title: 'Stage、File Format 与 COPY', kicker: 'Bulk load', minutes: 22,
        summary: '批量装载的标准链路是文件 → stage → COPY INTO table。命名 stage 和 file format 提升复用与安全性。',
        objectives: ['区分 user、table、named internal stage 与 external stage', '配置 file format、storage integration 和 directory table', '使用 COPY 选项处理错误、去重与列映射'],
        examNotes: ['PUT 将本地文件上传到 internal stage；云存储使用 external stage。', 'COPY 默认基于文件元数据避免重复装载同一文件。', 'VALIDATION_MODE 可在不装载数据的情况下检查文件错误。'],
        trap: 'ON_ERROR=CONTINUE 可能产生部分装载；生产任务要结合 load history 与错误阈值。',
        practice: { title: '创建可复用装载链路', sql: "CREATE FILE FORMAT csv_orders TYPE = CSV SKIP_HEADER = 1;\nCREATE STAGE raw_orders FILE_FORMAT = csv_orders;\nCOPY INTO orders FROM @raw_orders MATCH_BY_COLUMN_NAME = CASE_INSENSITIVE;", note: '命名对象便于集中管理格式和凭据。' },
      },
      {
        id: 'continuous-load', title: 'Snowpipe 与流式摄取', kicker: 'Continuous', minutes: 18,
        summary: 'Snowpipe 根据云事件自动触发微批文件装载；Snowpipe Streaming 通过 SDK/高性能架构直接写入行数据。',
        objectives: ['比较 COPY、Snowpipe 与 Snowpipe Streaming', '理解 pipe、云事件通知与 serverless compute', '使用 load history 诊断延迟或重复数据'],
        examNotes: ['Snowpipe 是文件驱动且使用 Snowflake 管理的 serverless compute。', 'Snowpipe Streaming 适合低延迟行摄取，不需要先写 stage 文件。', 'AUTO_INGEST 将 pipe 与云通知集成。'],
        trap: 'Snowpipe 不是定时任务，也不使用你指定的虚拟仓库；它仍然通过 COPY 定义装载逻辑。',
      },
      {
        id: 'semi-unstructured', title: '半结构化与非结构化数据', kicker: 'VARIANT', minutes: 18,
        summary: 'VARIANT、OBJECT、ARRAY 与路径语法处理半结构化数据；非结构化文件通过 stage、directory table 和文件 URL 被发现与访问。',
        objectives: ['使用 PARSE_JSON、路径表达式与 FLATTEN', '了解 STRIP_OUTER_ARRAY 等文件格式选项', '为非结构化文件生成 scoped、stage 或 presigned URL'],
        examNotes: ['VARIANT 可保存不同基础类型，路径提取结果通常仍是 VARIANT。', 'FLATTEN 是 table function，用于展开 ARRAY 或 OBJECT。', 'Directory table 保存 staged files 的目录元数据，而不是文件内容。'],
        trap: '外部表查询外部文件数据；directory table 只提供文件级元数据，两者用途不同。',
      },
      {
        id: 'unload-connect', title: '卸载、驱动与网络连接', kicker: 'Connectivity', minutes: 16,
        summary: 'COPY INTO location 导出查询结果；驱动、连接器和合作伙伴工具通过统一认证与网络控制连接 Snowflake。',
        objectives: ['使用 COPY INTO @stage 卸载并控制分片与格式', '区分 JDBC、ODBC、Python Connector、Spark Connector', '理解 account identifier、region 与私有连接配置'],
        examNotes: ['卸载到 stage 使用 COPY INTO <location>，装载到表使用 COPY INTO <table>。', 'SINGLE=TRUE 便于单文件交付，但可能限制并行性与文件大小。', 'Storage integration 避免在 stage 定义中直接保存长期云凭据。'],
        trap: '外部 stage 的 URL 指向存储位置；访问授权最好交给 storage integration 而非硬编码 access key。',
      },
    ],
  },
  {
    id: 'performance', number: '04', shortTitle: '性能与转换', weight: 21, icon: Gauge,
    title: '性能优化、查询与转换',
    description: '从 Query Profile 和缓存诊断瓶颈，再选择仓库、聚簇、搜索优化、SQL 或管道对象完成正确优化。',
    topics: [
      {
        id: 'diagnose', title: 'Query Profile 与仓库调优', kicker: 'Diagnose first', minutes: 20,
        summary: '先从 Query History/Profile 找到扫描、spill、排队或数据倾斜，再决定改 SQL、放大仓库或增加集群。',
        objectives: ['识别 remote/local spill、queue、bytes scanned 等信号', '区分 scale up 与 scale out', '理解 auto-suspend、auto-resume 和查询超时参数'],
        examNotes: ['单条查询因 spill 变慢可尝试放大仓库或减少中间数据。', '并发查询排队更适合 multi-cluster warehouse。', 'Query Acceleration Service 可把部分可并行扫描工作卸载到共享计算资源。'],
        trap: '盲目放大仓库不一定减少扫描数据；必须先看 Query Profile 的主导瓶颈。',
      },
      {
        id: 'caching-optimization', title: '缓存、聚簇与优化服务', kicker: 'Pruning', minutes: 22,
        summary: '结果缓存、本地仓库缓存和远程存储处在不同层；优化服务的选择取决于查询形态，而非“全部开启”。',
        objectives: ['区分 persisted result cache 与 warehouse cache', '理解 clustering depth 与自动聚簇', '比较 search optimization、materialized view 与 query acceleration'],
        examNotes: ['可复用的确定性查询结果通常可直接命中持久结果缓存。', '暂停仓库会逐步丢失本地缓存，恢复不会恢复旧缓存。', 'Search Optimization 适合高选择性 point lookup，也支持部分 substring/半结构化场景。'],
        trap: '聚簇键更适合超大表上反复出现的选择性过滤；小表或高变更表可能维护成本大于收益。',
      },
      {
        id: 'sql-transform', title: 'SQL、事务与半结构化转换', kicker: 'Querying', minutes: 20,
        summary: '掌握 DDL/DML、MERGE、窗口函数、CTE、事务行为及 VARIANT 转换，重点理解执行语义而非背语法。',
        objectives: ['为 upsert 选择 MERGE 并理解 matched/not matched 分支', '使用窗口函数与 QUALIFY 过滤分析结果', '理解 autocommit、显式事务与 DDL 行为'],
        examNotes: ['QUALIFY 对窗口函数结果过滤，作用类似 HAVING 对聚合结果过滤。', 'MERGE 可在一个原子语句中执行 insert/update/delete 分支。', 'LATERAL FLATTEN 将每个输入行与其嵌套元素相关联。'],
        trap: 'WHERE 在窗口函数计算前执行；需要按 ROW_NUMBER 等结果筛选时使用 QUALIFY。',
        practice: { title: '半结构化订单明细展开', sql: "SELECT o.id, i.value:sku::string AS sku, i.value:qty::number AS qty\nFROM raw_orders o,\nLATERAL FLATTEN(input => o.payload:items) i\nQUALIFY ROW_NUMBER() OVER (PARTITION BY o.id, sku ORDER BY o.loaded_at DESC) = 1;", note: 'LATERAL 保留当前订单行上下文，QUALIFY 在窗口计算后过滤。' },
      },
      {
        id: 'pipelines-code', title: 'Streams、Tasks、动态表与代码扩展', kicker: 'Pipelines', minutes: 22,
        summary: 'Streams 记录 CDC 偏移，Tasks 编排执行，Dynamic Tables 以目标延迟声明式刷新；UDF/存储过程/Snowpark 处理自定义逻辑。',
        objectives: ['组合 stream + task 构建增量管道', '使用 task graph、触发任务和重试', '在 dynamic table 与 stream/task 之间做架构选择'],
        examNotes: ['Stream 保存变化跟踪偏移，不复制表数据。', 'Task 可使用虚拟仓库或 serverless compute，并可构成 DAG。', 'Dynamic Table 由目标结果与 TARGET_LAG 驱动，不需手写调度和 MERGE。'],
        trap: '目标是声明“结果应保持多新”时优先动态表；需要逐步控制业务过程和副作用时使用 task graph。',
      },
    ],
  },
  {
    id: 'collaboration', number: '05', shortTitle: '协作与保护', weight: 10, icon: Bot,
    title: '数据协作',
    description: '安全分享数据产品，并理解 Marketplace、listings、Clean Rooms、复制故障转移与持续数据保护之间的边界。',
    topics: [
      {
        id: 'sharing-listings', title: 'Secure Sharing、Listings 与 Marketplace', kicker: 'Share, do not copy', minutes: 20,
        summary: 'Secure Data Sharing 通过服务层元数据授权让消费者读取提供方数据，无需复制数据或支付存储费。',
        objectives: ['解释 share、provider、consumer 与 imported database', '区分 direct share、private listing 与 Marketplace listing', '了解 reader account 的适用对象与计费责任'],
        examNotes: ['消费者通常为查询使用自己的计算资源。', 'Reader account 让没有 Snowflake 账户的消费者访问分享数据，计算成本由提供方承担。', 'Listings 为跨区域/跨云交付、发现、条款与使用分析提供更完整能力。'],
        trap: 'Share 不是数据库副本；提供方的数据变更对消费者可用性取决于分享对象和刷新，无需重新传输。',
      },
      {
        id: 'clean-rooms', title: 'Data Clean Rooms 与隐私协作', kicker: 'Privacy', minutes: 16,
        summary: 'Clean Rooms 允许多方在受控模板和策略下联合分析，避免向参与者暴露对方原始敏感数据。',
        objectives: ['识别 clean room 与普通 secure share 的差异', '理解 join、column、activation 与分析模板控制', '匹配广告衡量、重叠分析等隐私协作场景'],
        examNotes: ['参与方保留原始数据控制权。', '允许的分析逻辑与输出由模板和策略约束。', '聚合阈值等控制降低重新识别风险。'],
        trap: '需要让消费者自由查询明细时用 share；需要“只允许预定义联合分析”时用 clean room。',
      },
      {
        id: 'protection-clone', title: 'Time Travel、Fail-safe 与克隆', kicker: 'Protection', minutes: 18,
        summary: 'Time Travel 面向用户自助恢复与历史查询；Fail-safe 是不可配置的最后恢复窗口；zero-copy clone 共享既有微分区。',
        objectives: ['使用 AT/BEFORE、UNDROP 与 retention 参数', '比较 permanent、transient、temporary 表的保护行为', '解释 zero-copy clone 的存储和后续写入成本'],
        examNotes: ['Standard 版本通常最多 1 天 Time Travel；更高版本可为永久对象配置更长保留期。', '永久对象在 Time Travel 后进入 7 天 Fail-safe；Fail-safe 由 Snowflake 支持处理。', '克隆初始仅创建元数据，新旧对象修改后各自承担新增存储。'],
        trap: 'Fail-safe 不是备份策略，用户不能直接查询或执行 UNDROP；短期开发数据可考虑 transient 以避免 Fail-safe 成本。',
      },
      {
        id: 'replication', title: '复制、故障转移与连续性', kicker: 'Business continuity', minutes: 16,
        summary: '复制将账户/数据库对象送往其他区域或云；failover group 在灾难时提升目标为主账户，属于业务连续性方案。',
        objectives: ['区分 database replication 与 replication/failover group', '理解刷新频率、RPO、RTO 和跨云成本', '辨认可复制的账户对象与依赖关系'],
        examNotes: ['Replication group 组织多个数据库和受支持账户对象一起复制。', 'Failover group 在复制能力之上提供受控提升与回切。', '复制产生物理副本，与 secure sharing 的实时元数据访问不同。'],
        trap: '跨区域只读协作优先考虑 listing/share；需要在区域故障后接管业务才需要 failover 设计。',
      },
    ],
  },
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  { id: 'q1', domainId: 'architecture', prompt: '某团队的单条大型查询频繁发生 remote spill。第一步最合理的操作是什么？', options: ['启用多集群仓库', '查看 Query Profile，并评估放大仓库或减少中间数据', '增加 Time Travel 保留期', '创建 Reader Account'], answer: 1, explanation: 'Remote spill 表示中间数据超出本地内存/磁盘能力。先看 Profile 定位算子，再考虑 scale up 或 SQL 优化；多集群主要解决并发排队。', reference: 'Performance / Query Profile' },
  { id: 'q2', domainId: 'architecture', prompt: '应用需要对文档集合做低延迟语义与关键词混合检索，为 RAG 返回相关片段。应选择哪项？', options: ['Cortex Analyst', 'Cortex Search', 'Snowflake ML Registry', 'Resource Monitor'], answer: 1, explanation: 'Cortex Search 面向非结构化文本检索；Cortex Analyst 面向语义模型上的结构化数据问答。', reference: 'Cortex AI' },
  { id: 'q3', domainId: 'governance', prompt: '要让不同角色看到同一列的不同脱敏结果，应使用什么？', options: ['Network Policy', 'Row Access Policy', 'Dynamic Data Masking Policy', 'Resource Monitor'], answer: 2, explanation: 'Masking policy 在查询时根据上下文重写列值；row access policy 控制行是否可见。', reference: 'Data Governance' },
  { id: 'q4', domainId: 'governance', prompt: '关于托管访问模式（managed access schema），哪项正确？', options: ['对象所有者可自由授予其对象权限', '只有模式所有者或拥有 MANAGE GRANTS 的角色集中管理授权', '其中不能创建 future grants', '仅 ACCOUNTADMIN 可以查询其中对象'], answer: 1, explanation: '托管访问模式集中对象授权，避免每个对象所有者分散管理权限。', reference: 'Access Control' },
  { id: 'q5', domainId: 'loading', prompt: '需要每秒持续摄取事件，且不想先把数据写成 stage 文件。最佳选择是？', options: ['COPY INTO', 'Snowpipe 文件自动摄取', 'Snowpipe Streaming', 'External Table refresh'], answer: 2, explanation: 'Snowpipe Streaming 通过客户端直接进行低延迟行摄取，不要求文件先落地到 stage。', reference: 'Continuous Loading' },
  { id: 'q6', domainId: 'loading', prompt: '哪个对象保存 stage 中文件的路径、大小和更新时间等元数据？', options: ['Directory Table', 'Dynamic Table', 'Materialized View', 'Stream'], answer: 0, explanation: 'Directory table 是 stage 上的隐式目录元数据层，不存文件内容。', reference: 'Unstructured Data' },
  { id: 'q7', domainId: 'performance', prompt: '大量短查询在高峰期排队，但单条查询运行速度正常。最佳仓库策略是什么？', options: ['增加聚簇键', '启用 multi-cluster auto-scale', '扩大 Time Travel', '将永久表改为 transient'], answer: 1, explanation: '排队是并发容量问题，scale out 到多个集群比单纯 scale up 更匹配。', reference: 'Warehouse Concurrency' },
  { id: 'q8', domainId: 'performance', prompt: '需要按 ROW_NUMBER() 的结果保留每组最新一行，应使用哪个子句过滤？', options: ['WHERE', 'QUALIFY', 'HAVING', 'SAMPLE'], answer: 1, explanation: 'QUALIFY 在窗口函数计算后执行，专门适合过滤窗口函数结果。', reference: 'SQL Transformations' },
  { id: 'q9', domainId: 'collaboration', prompt: '合作双方只能运行预先批准的重叠分析，且不能看到对方原始客户明细。应选择？', options: ['Reader Account', 'Data Clean Room', 'Zero-copy Clone', 'External Stage'], answer: 1, explanation: 'Data Clean Room 用模板、策略和阈值约束多方分析，并保留各方对原始数据的控制。', reference: 'Data Clean Rooms' },
  { id: 'q10', domainId: 'collaboration', prompt: '关于 Fail-safe，哪项正确？', options: ['用户可直接用 AT 查询', '可设为 0–90 天', '永久对象通常在 Time Travel 后进入 7 天恢复窗口', '它是跨区域故障转移服务'], answer: 2, explanation: 'Fail-safe 是 Time Travel 之后由 Snowflake 支持处理的 7 天最后恢复窗口，不是用户可查询功能。', reference: 'Continuous Data Protection' },
];

export const TOTAL_TOPICS = DOMAINS.reduce((sum, domain) => sum + domain.topics.length, 0);
