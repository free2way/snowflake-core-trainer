import type { DetailSection, Lab, OfficialLink } from './types';

type TopicEnrichment = {
  detailSections: DetailSection[];
  officialLinks: OfficialLink[];
  lab: Lab;
};

const DOCS = {
  architecture: 'https://docs.snowflake.com/en/user-guide/intro-key-concepts',
  trial: 'https://docs.snowflake.com/en/user-guide/admin-trial-account',
  sample: 'https://docs.snowflake.com/en/user-guide/sample-data-using',
  loading: 'https://docs.snowflake.com/en/user-guide/data-load-overview',
  snowpipe: 'https://docs.snowflake.com/en/user-guide/data-load-snowpipe-intro',
  streaming: 'https://docs.snowflake.com/en/user-guide/snowpipe-streaming/data-load-snowpipe-streaming-overview',
  pipelines: 'https://docs.snowflake.com/en/user-guide/data-pipelines-intro',
  rowPolicy: 'https://docs.snowflake.com/en/user-guide/security-row-intro',
  cache: 'https://docs.snowflake.com/en/user-guide/performance-query-warehouse-cache',
  storagePerf: 'https://docs.snowflake.com/en/user-guide/performance-query-storage',
  queryPerf: 'https://docs.snowflake.com/en/user-guide/performance-query-options',
  warehouseLoad: 'https://docs.snowflake.com/en/user-guide/warehouses-load-monitoring',
  sharing: 'https://docs.snowflake.com/en/user-guide/data-sharing-intro',
  cortexSearch: 'https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-search/cortex-search-overview',
  cortexAnalyst: 'https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-analyst',
};

const setupSql = `USE ROLE ACCOUNTADMIN;
CREATE WAREHOUSE IF NOT EXISTS COF_C03_WH
  WAREHOUSE_SIZE = 'XSMALL'
  AUTO_SUSPEND = 60
  AUTO_RESUME = TRUE
  INITIALLY_SUSPENDED = TRUE;
CREATE DATABASE IF NOT EXISTS COF_C03_LAB;
USE WAREHOUSE COF_C03_WH;
USE DATABASE COF_C03_LAB;`;

function lab(
  title: string,
  objective: string,
  schema: string,
  action: { title: string; instruction: string; sql: string; hint: string; verify: string },
  inspection: { title: string; instruction: string; sql: string; hint: string; verify: string },
  editionNote?: string,
): Lab {
  return {
    title,
    objective,
    prerequisites: ['Snowflake 免费试用账户', '可使用 ACCOUNTADMIN 的练习环境', '在 Snowsight 中新建 SQL Worksheet'],
    editionNote,
    steps: [
      {
        title: '准备独立实验环境',
        instruction: '创建可自动挂起的 X-Small 仓库和专用数据库。对象使用 IF NOT EXISTS，可安全重复执行。',
        sql: `${setupSql}\nCREATE SCHEMA IF NOT EXISTS ${schema};\nUSE SCHEMA ${schema};`,
        hint: '若仓库刚恢复，首次查询会稍慢；AUTO_SUSPEND=60 可减少试用额度消耗。',
        verify: `运行 SELECT CURRENT_DATABASE(), CURRENT_SCHEMA(), CURRENT_WAREHOUSE(); 应看到 COF_C03_LAB、${schema} 和 COF_C03_WH。`,
      },
      { title: action.title, instruction: action.instruction, sql: action.sql, hint: action.hint, verify: action.verify },
      { title: inspection.title, instruction: inspection.instruction, sql: inspection.sql, hint: inspection.hint, verify: inspection.verify },
      {
        title: '清理并验证可重复性',
        instruction: '删除本知识点创建的 schema，然后重新执行前三步即可完整复现。',
        sql: `USE ROLE ACCOUNTADMIN;\nDROP SCHEMA IF EXISTS COF_C03_LAB.${schema} CASCADE;\nALTER WAREHOUSE COF_C03_WH SUSPEND;`,
        hint: '只删除当前实验 schema，不会影响其他知识点的实验对象。',
        verify: `SHOW SCHEMAS LIKE '${schema}' IN DATABASE COF_C03_LAB; 应返回 0 行。`,
      },
    ],
  };
}

export const TOPIC_DETAILS: Record<string, TopicEnrichment> = {
  'three-layers': {
    detailSections: [
      { title: '三层如何协作', body: 'Database Storage 负责持久数据与微分区；Query Processing 由虚拟仓库执行；Cloud Services 维护元数据、认证、优化与事务。查询先由服务层解析和优化，再由仓库扫描存储层，三层可独立扩展。', bullets: ['存储不会随仓库挂起而消失', '两个仓库查询同一份数据但拥有各自缓存', '元数据剪枝发生在真正读取微分区之前'] },
      { title: '场景题判断顺序', body: '先判断问题属于容量、单查询速度、并发还是控制面。容量交给存储层；单查询资源不足考虑 scale up；大量排队考虑多集群 scale out；登录、优化器或元数据行为属于 Cloud Services。' },
    ],
    officialLinks: [{ title: 'Snowflake 架构与关键概念', url: DOCS.architecture }],
    lab: lab('观察三层架构留下的痕迹', '用查询历史、仓库和微分区元数据把三层概念映射到可观察对象。', 'ARCHITECTURE',
      { title: '建立数据并执行查询', instruction: '创建表并运行聚合，生成一条真实查询记录。', sql: `CREATE OR REPLACE TABLE ARCH_DEMO AS
SELECT SEQ4() AS ID, UNIFORM(1, 10, RANDOM()) AS CATEGORY
FROM TABLE(GENERATOR(ROWCOUNT => 10000));
SELECT CATEGORY, COUNT(*) FROM ARCH_DEMO GROUP BY CATEGORY;`, hint: 'GENERATOR 在计算层造数，表结果落入存储层。', verify: '聚合应返回 10 行，COUNT 总和为 10000。' },
      { title: '分别检查服务、计算与存储', instruction: '读取查询历史、仓库状态和表存储统计。', sql: `SELECT QUERY_ID, WAREHOUSE_NAME, BYTES_SCANNED, TOTAL_ELAPSED_TIME
FROM TABLE(INFORMATION_SCHEMA.QUERY_HISTORY(RESULT_LIMIT => 10))
WHERE QUERY_TEXT ILIKE '%ARCH_DEMO%';
SHOW WAREHOUSES LIKE 'COF_C03_WH';
SHOW TABLES LIKE 'ARCH_DEMO';`, hint: '查询历史来自服务层；WAREHOUSE 是计算；TABLE 的 bytes 是存储。', verify: '能找到 ARCH_DEMO 查询、COF_C03_WH 仓库以及表的行数/字节信息。' }),
  },
  'objects-tools': {
    detailSections: [
      { title: '对象作用域', body: 'Organization 包含账户；账户包含角色、用户、仓库等账户对象；database 下是 schema，再包含 table、view、stage、stream、task 等 schema 对象。权限检查通常沿“账户角色 → 数据库 USAGE → 模式 USAGE → 对象权限”展开。' },
      { title: '工具选择', body: 'Snowsight 适合交互式 SQL 和管理；驱动/连接器嵌入应用；Snowflake CLI 面向项目、自动化和 CI。参数按账户、用户、会话逐层覆盖，排错时应查看当前会话的最终值。', bullets: ['SHOW PARAMETERS 可定位继承值', 'database role 不能跨数据库直接持有权限', '命名 stage/file format 适合复用'] },
    ],
    officialLinks: [{ title: '关键概念与对象模型', url: DOCS.architecture }],
    lab: lab('遍历对象层级和参数继承', '亲手创建 database/schema/table/view，并观察名称解析和会话参数。', 'OBJECTS',
      { title: '创建分层对象', instruction: '在 schema 内创建表和视图，使用完全限定名查询。', sql: `CREATE OR REPLACE TABLE EVENTS(ID NUMBER, KIND STRING);
INSERT INTO EVENTS VALUES (1, 'LOGIN'), (2, 'QUERY');
CREATE OR REPLACE VIEW EVENT_VIEW AS SELECT * FROM EVENTS;
SELECT * FROM COF_C03_LAB.OBJECTS.EVENT_VIEW;`, hint: '三段式名称是 DATABASE.SCHEMA.OBJECT。', verify: '视图应返回 LOGIN 与 QUERY 两行。' },
      { title: '查看对象和参数', instruction: '检查当前 namespace 和会话级参数。', sql: `SELECT CURRENT_DATABASE(), CURRENT_SCHEMA(), CURRENT_ROLE();
SHOW OBJECTS IN SCHEMA COF_C03_LAB.OBJECTS;
SHOW PARAMETERS LIKE 'TIMEZONE' IN SESSION;`, hint: 'SHOW 输出可通过 RESULT_SCAN(LAST_QUERY_ID()) 继续查询。', verify: '对象列表包含 EVENTS 和 EVENT_VIEW，TIMEZONE 显示当前会话生效值。' }),
  },
  'compute-storage': {
    detailSections: [
      { title: '计算选择', body: 'Resize 增强单条查询可用的 CPU/内存；multi-cluster 增加并发吞吐。自动挂起控制空闲成本，自动恢复确保下一次查询无需人工启动。每个仓库的本地缓存相互独立。' },
      { title: '存储组织', body: 'Snowflake 自动把表数据组织为不可变微分区并记录范围、空值数等元数据。查询通过 pruning 跳过不相关微分区；聚簇键只在大型表且稳定过滤模式下可能值得维护。', bullets: ['temporary 表仅会话内可见', 'transient 表没有 Fail-safe', 'permanent 表具有完整数据保护'] },
    ],
    officialLinks: [{ title: '存储查询优化', url: DOCS.storagePerf }, { title: '仓库缓存', url: DOCS.cache }],
    lab: lab('验证仓库与微分区', '比较表扫描统计，并检查仓库自动挂起配置。', 'COMPUTE_STORAGE',
      { title: '创建可剪枝数据', instruction: '创建有序数据并对小范围进行过滤。', sql: `CREATE OR REPLACE TABLE SALES AS
SELECT SEQ4() ID, DATEADD('day', MOD(SEQ4(), 365), '2025-01-01') SALE_DATE
FROM TABLE(GENERATOR(ROWCOUNT => 200000));
SELECT COUNT(*) FROM SALES WHERE SALE_DATE = '2025-03-01';`, hint: '按日期相关顺序生成的数据更容易观察微分区范围。', verify: '查询应返回约 548 行。' },
      { title: '检查分区和仓库', instruction: '查看 clustering 信息和仓库的 suspend/size。', sql: `SELECT SYSTEM$CLUSTERING_INFORMATION('SALES', '(SALE_DATE)');
SHOW WAREHOUSES LIKE 'COF_C03_WH';`, hint: 'clustering_information 返回 JSON，可关注 total_partition_count 与 depth。', verify: 'JSON 中能看到分区统计；仓库为 X-Small 且 AUTO_SUSPEND=60。' }),
  },
  'ai-apps': {
    detailSections: [
      { title: '三类 AI 能力', body: 'AISQL/Cortex Functions 直接对文本或图像执行模型函数；Cortex Search 为非结构化内容构建混合检索服务；Cortex Analyst 通过语义模型把自然语言转成可信 SQL。题目首先判断数据是非结构化文档还是结构化指标。' },
      { title: '应用与开发', body: 'Snowpark 把 DataFrame 逻辑下推到 Snowflake；Notebooks 提供交互式数据与 ML 环境；Streamlit in Snowflake 用 Python 快速构建数据应用。它们共享 Snowflake 治理，避免把大量数据导出到客户端。' },
    ],
    officialLinks: [{ title: 'Cortex Search 概览', url: DOCS.cortexSearch }, { title: 'Cortex Analyst 概览', url: DOCS.cortexAnalyst }],
    lab: lab('为 AI 场景准备受治理数据', '构造文档和指标两种数据形态，并判断应使用 Search 还是 Analyst。', 'AI_APPS',
      { title: '创建文档与指标数据', instruction: '分别创建文档语料表和按日指标表。', sql: `CREATE OR REPLACE TABLE DOCS(ID NUMBER, TITLE STRING, BODY STRING);
INSERT INTO DOCS VALUES (1, 'Returns', 'Returns are accepted within 30 days.'), (2, 'Shipping', 'Express shipping takes two days.');
CREATE OR REPLACE TABLE DAILY_REVENUE(DAY DATE, REGION STRING, REVENUE NUMBER);
INSERT INTO DAILY_REVENUE VALUES ('2026-01-01','EAST',1200), ('2026-01-01','WEST',900);`, hint: 'DOCS 适合语义检索；DAILY_REVENUE 适合有指标定义的自然语言分析。', verify: '两个表分别返回 2 行。' },
      { title: '检查服务可用性并做基线查询', instruction: '先用标准 SQL 验证数据；再检查账户中可用的 Cortex 功能。', sql: `SELECT * FROM DOCS WHERE BODY ILIKE '%30 days%';
SELECT REGION, SUM(REVENUE) FROM DAILY_REVENUE GROUP BY REGION;
SHOW FUNCTIONS LIKE 'CORTEX%';`, hint: 'AI 服务可用性与区域/账户配置有关；即使不可用，场景判断实验仍可完成。', verify: '文档查询命中 Returns；指标查询 EAST=1200、WEST=900。' }, 'Cortex 模型与服务受区域、权限和试用账户功能开放情况影响；本 Lab 将不可用情况设计为可验证的能力检查。'),
  },
  'accounts-roles': {
    detailSections: [
      { title: 'RBAC 授权链', body: '最佳实践是把对象权限授予自定义角色，再将角色组成层级并授给用户。访问表通常同时需要数据库 USAGE、模式 USAGE 和表 SELECT；OWNERSHIP 代表对象控制权且一次只能由一个角色持有。' },
      { title: '系统角色边界', body: 'USERADMIN 创建用户和角色；SECURITYADMIN 管理全局授权；SYSADMIN 管理业务对象；ACCOUNTADMIN 是顶层角色，应只在必要管理任务使用。Managed access schema 把授权决策集中到 schema owner。' },
    ],
    officialLinks: [{ title: '访问控制概览', url: 'https://docs.snowflake.com/en/user-guide/security-access-control-overview' }],
    lab: lab('搭建最小权限角色链', '创建读者角色并验证数据库、模式和表权限缺一不可。', 'RBAC',
      { title: '创建角色并授权', instruction: '创建表、角色，并完整授予查询所需的三层权限。', sql: `CREATE OR REPLACE TABLE PUBLIC_FACTS(ID NUMBER, VALUE STRING);
INSERT INTO PUBLIC_FACTS VALUES (1, 'VISIBLE');
CREATE ROLE IF NOT EXISTS COF_C03_READER;
GRANT USAGE ON DATABASE COF_C03_LAB TO ROLE COF_C03_READER;
GRANT USAGE ON SCHEMA COF_C03_LAB.RBAC TO ROLE COF_C03_READER;
GRANT SELECT ON TABLE PUBLIC_FACTS TO ROLE COF_C03_READER;`, hint: '不要把权限直接授给用户；用角色作为稳定的权限载体。', verify: 'SHOW GRANTS TO ROLE COF_C03_READER 应看到 USAGE、USAGE、SELECT。' },
      { title: '验证授权链', instruction: '把练习角色授给 ACCOUNTADMIN，再切换角色查询。', sql: `GRANT ROLE COF_C03_READER TO ROLE ACCOUNTADMIN;
USE ROLE COF_C03_READER;
SELECT * FROM COF_C03_LAB.RBAC.PUBLIC_FACTS;
USE ROLE ACCOUNTADMIN;`, hint: '角色切换不会改变当前对象；使用完全限定名最稳定。', verify: 'COF_C03_READER 能读到 VISIBLE，但不能创建或修改表。' }),
  },
  'identity-security': {
    detailSections: [
      { title: '认证与网络是两道门', body: '认证证明“你是谁”，网络策略决定“请求从哪里来”，授权决定“能做什么”。服务账户应使用密钥对或 OAuth，人员账户应启用 MFA/SSO，敏感环境再叠加网络策略和私有连接。' },
      { title: '加密责任', body: 'Snowflake 默认对传输和静态数据加密并管理密钥层级。客户管理密钥可增加控制，但不会替代访问控制、轮换和最小权限。考试常把加密、认证和授权混成干扰项。' },
    ],
    officialLinks: [{ title: '安全概览', url: 'https://docs.snowflake.com/en/user-guide/security' }],
    lab: lab('审计身份与认证策略', '不暴露凭据地检查当前身份、认证策略对象和网络策略能力。', 'IDENTITY',
      { title: '创建认证策略对象', instruction: '创建一个仅允许密码和密钥对的练习策略，不绑定真实用户。', sql: `CREATE OR REPLACE AUTHENTICATION POLICY LAB_AUTH_POLICY
  AUTHENTICATION_METHODS = ('PASSWORD', 'KEYPAIR')
  CLIENT_TYPES = ('SNOWFLAKE_UI', 'DRIVERS');`, hint: '创建策略本身不改变任何用户；必须显式绑定才生效。', verify: 'SHOW AUTHENTICATION POLICIES LIKE LAB_AUTH_POLICY; 应返回 1 行。' },
      { title: '检查当前会话安全上下文', instruction: '查看当前角色、用户、IP 与策略描述。', sql: `SELECT CURRENT_USER(), CURRENT_ROLE(), CURRENT_CLIENT(), CURRENT_IP_ADDRESS();
DESCRIBE AUTHENTICATION POLICY LAB_AUTH_POLICY;
SHOW NETWORK POLICIES;`, hint: '网络策略限制来源，不授予对象权限。', verify: '能看到当前客户端/IP，并在策略描述中看到 PASSWORD、KEYPAIR。' }),
  },
  'governance-policies': {
    detailSections: [
      { title: '策略选择矩阵', body: 'Masking policy 改变列值呈现；row access policy 过滤整行；projection policy 控制列能否投影；aggregation policy 限制数据只能以足够大的分组被聚合。策略在查询时根据 CURRENT_ROLE 等上下文动态评估。' },
      { title: '发现到执行', body: '先分类识别敏感列，再用 tag 记录治理语义，最后可用 tag-based masking 批量关联策略。Access History 用于回答谁读取了哪些对象或列，形成审计闭环。' },
    ],
    officialLinks: [{ title: 'Row access policy', url: DOCS.rowPolicy }],
    lab: lab('验证动态脱敏', '创建角色感知的 masking policy，并比较不同角色看到的值。', 'GOVERNANCE',
      { title: '创建脱敏策略', instruction: '让 ACCOUNTADMIN 看到明文，其他角色只看到掩码。', sql: `CREATE OR REPLACE TABLE CUSTOMERS(ID NUMBER, EMAIL STRING);
INSERT INTO CUSTOMERS VALUES (1, 'learner@example.com');
CREATE OR REPLACE MASKING POLICY EMAIL_MASK AS (VAL STRING) RETURNS STRING ->
  CASE WHEN CURRENT_ROLE() IN ('ACCOUNTADMIN') THEN VAL ELSE '***@***' END;
ALTER TABLE CUSTOMERS MODIFY COLUMN EMAIL SET MASKING POLICY EMAIL_MASK;`, hint: '策略与列数据类型必须匹配。', verify: 'ACCOUNTADMIN 查询时应看到完整邮箱。' },
      { title: '用受限角色验证', instruction: '创建只读角色并查询同一行。', sql: `CREATE ROLE IF NOT EXISTS COF_C03_MASKED;
GRANT USAGE ON DATABASE COF_C03_LAB TO ROLE COF_C03_MASKED;
GRANT USAGE ON SCHEMA COF_C03_LAB.GOVERNANCE TO ROLE COF_C03_MASKED;
GRANT SELECT ON TABLE CUSTOMERS TO ROLE COF_C03_MASKED;
GRANT ROLE COF_C03_MASKED TO ROLE ACCOUNTADMIN;
USE ROLE COF_C03_MASKED;
SELECT * FROM COF_C03_LAB.GOVERNANCE.CUSTOMERS;
USE ROLE ACCOUNTADMIN;`, hint: '同一份数据因执行上下文不同而动态呈现。', verify: '受限角色看到 ***@***，表中原始值没有被改写。' }),
  },
  'cost-observability': {
    detailSections: [
      { title: '两套成本护栏', body: 'Resource monitor 针对用户管理仓库的 credit 配额，可通知或挂起；Budget 对更多计算对象提供预测和告警，但本质仍是可观测与通知。不要假设任一机制能覆盖所有 serverless 成本。' },
      { title: '历史数据选择', body: 'INFORMATION_SCHEMA 表函数更接近当前对象和低延迟排错；SNOWFLAKE.ACCOUNT_USAGE 覆盖账户级、更长保留但通常有延迟。考试先问“需要多新、多长、什么范围”，再选视图。' },
    ],
    officialLinks: [{ title: '监控仓库负载', url: DOCS.warehouseLoad }],
    lab: lab('读取仓库成本与查询历史', '建立从查询到仓库计量的最小可观测路径。', 'FINOPS',
      { title: '产生可识别负载', instruction: '运行带 QUERY_TAG 的查询，方便后续从历史中定位。', sql: `ALTER SESSION SET QUERY_TAG = 'COF_C03_FINOPS_LAB';
SELECT COUNT(*) FROM SNOWFLAKE_SAMPLE_DATA.TPCH_SF1.LINEITEM;
ALTER SESSION UNSET QUERY_TAG;`, hint: '共享样例数据不收存储费，但运行查询仍消耗仓库计算。', verify: '查询返回 6,001,215。' },
      { title: '关联查询与计量', instruction: '先看低延迟查询历史，再查看账户计量视图。', sql: `SELECT QUERY_ID, QUERY_TAG, WAREHOUSE_NAME, TOTAL_ELAPSED_TIME, BYTES_SCANNED
FROM TABLE(INFORMATION_SCHEMA.QUERY_HISTORY_BY_SESSION(RESULT_LIMIT => 20))
WHERE QUERY_TAG = 'COF_C03_FINOPS_LAB';
SELECT START_TIME, WAREHOUSE_NAME, CREDITS_USED
FROM SNOWFLAKE.ACCOUNT_USAGE.WAREHOUSE_METERING_HISTORY
WHERE WAREHOUSE_NAME = 'COF_C03_WH'
ORDER BY START_TIME DESC LIMIT 5;`, hint: 'ACCOUNT_USAGE 有延迟，刚产生的计量记录可能稍后才出现。', verify: '第一条查询应立即定位成功；第二条若为空，等待数据延迟后重试。' }),
  },
  'stages-copy': {
    detailSections: [
      { title: '批量装载链路', body: '文件格式描述解析规则，stage 描述文件位置，COPY INTO table 执行装载。命名对象让多个任务共享定义；storage integration 把云身份与 stage 解耦，避免硬编码长期密钥。' },
      { title: '错误与幂等', body: 'COPY 记录已装载文件元数据，默认避免重复加载同一文件。VALIDATION_MODE 可只检查不落表；ON_ERROR 决定遇错时停止、跳过文件还是继续，生产中要与 load history 一起审计。' },
    ],
    officialLinks: [{ title: '数据装载概览', url: DOCS.loading }],
    lab: lab('从 internal stage 完成 COPY', '用 SQL 生成文件、stage 和 COPY 的完整可重复闭环。', 'BULK_LOAD',
      { title: '准备表、格式和 staged file', instruction: '创建源表并用 COPY INTO location 生成 CSV 到 internal stage。', sql: `CREATE OR REPLACE FILE FORMAT CSV_FF TYPE=CSV FIELD_OPTIONALLY_ENCLOSED_BY='"';
CREATE OR REPLACE STAGE LOAD_STAGE FILE_FORMAT=CSV_FF;
CREATE OR REPLACE TABLE SOURCE_ROWS(ID NUMBER, NAME STRING);
INSERT INTO SOURCE_ROWS VALUES (1,'ALPHA'),(2,'BETA');
COPY INTO @LOAD_STAGE/demo FROM SOURCE_ROWS HEADER=TRUE SINGLE=TRUE OVERWRITE=TRUE;`, hint: '这是为了在纯浏览器环境中构造可装载文件，无需本地 PUT。', verify: 'LIST @LOAD_STAGE; 应看到 demo 文件。' },
      { title: '装载并核对历史', instruction: '把文件装入目标表，再读取 COPY 结果。', sql: `CREATE OR REPLACE TABLE TARGET_ROWS(ID NUMBER, NAME STRING);
COPY INTO TARGET_ROWS FROM @LOAD_STAGE/demo FILE_FORMAT=(FORMAT_NAME=CSV_FF) MATCH_BY_COLUMN_NAME=CASE_INSENSITIVE;
SELECT * FROM TARGET_ROWS ORDER BY ID;`, hint: 'HEADER=TRUE 与 MATCH_BY_COLUMN_NAME 配合可按列名映射。', verify: '目标表应准确返回 ALPHA、BETA 两行。' }),
  },
  'continuous-load': {
    detailSections: [
      { title: 'Snowpipe', body: 'Snowpipe 仍以 staged file 和 COPY 定义为核心，但由云事件触发 Snowflake 管理的 serverless 计算做微批装载。AUTO_INGEST 负责事件接入，pipe status/load history 用于排错。' },
      { title: 'Snowpipe Streaming', body: 'Streaming 直接从 SDK/高性能接口写入行，不要求先生成文件，适合更低延迟。场景题看到“对象存储文件到达”优先 Snowpipe；看到“应用事件逐行且秒级可见”考虑 Streaming。' },
    ],
    officialLinks: [{ title: 'Snowpipe', url: DOCS.snowpipe }, { title: 'Snowpipe Streaming', url: DOCS.streaming }],
    lab: lab('创建并检查 Pipe', '不用外部云事件也能验证 pipe 的 COPY 定义、状态和手动刷新入口。', 'SNOWPIPE',
      { title: '创建 pipe 依赖对象', instruction: '创建目标表、格式、stage 和 pipe。', sql: `CREATE OR REPLACE TABLE EVENTS(ID NUMBER, PAYLOAD STRING);
CREATE OR REPLACE FILE FORMAT PIPE_CSV TYPE=CSV;
CREATE OR REPLACE STAGE PIPE_STAGE FILE_FORMAT=PIPE_CSV;
CREATE OR REPLACE PIPE EVENT_PIPE AS
  COPY INTO EVENTS FROM @PIPE_STAGE FILE_FORMAT=(FORMAT_NAME=PIPE_CSV);`, hint: 'Pipe 保存 COPY 语句；它不是仓库上的定时任务。', verify: 'SHOW PIPES LIKE EVENT_PIPE; 应显示 definition 中的 COPY INTO。' },
      { title: '查看运行状态', instruction: '读取 pipe 状态，并理解当前没有事件/文件时的结果。', sql: `SELECT SYSTEM$PIPE_STATUS('EVENT_PIPE');
DESCRIBE PIPE EVENT_PIPE;`, hint: '真实 AUTO_INGEST 还需要外部云通知集成；本实验聚焦 Snowflake 侧对象。', verify: 'PIPE_STATUS 返回 JSON，executionState 通常为 RUNNING。' }),
  },
  'semi-unstructured': {
    detailSections: [
      { title: 'VARIANT 查询', body: 'PARSE_JSON 把文本变为 VARIANT；冒号/点/方括号路径访问嵌套值；取出的标量通常仍要用 ::STRING、::NUMBER 转成目标 SQL 类型。FLATTEN 将数组或对象展开为行。' },
      { title: '非结构化文件', body: 'Directory table 保存 stage 中的文件元数据；scoped URL 适合受当前权限约束的临时访问；presigned URL 让外部客户端在时限内访问。它们不等同于 external table 的结构化查询能力。' },
    ],
    officialLinks: [{ title: '半结构化数据', url: 'https://docs.snowflake.com/en/user-guide/semistructured-concepts' }],
    lab: lab('展开嵌套 JSON', '从 VARIANT 到路径提取、类型转换和 LATERAL FLATTEN。', 'SEMISTRUCTURED',
      { title: '写入嵌套对象', instruction: '创建 VARIANT 表并写入含数组的订单 JSON。', sql: `CREATE OR REPLACE TABLE RAW_ORDERS(PAYLOAD VARIANT);
INSERT INTO RAW_ORDERS SELECT PARSE_JSON('{"id":101,"items":[{"sku":"A","qty":2},{"sku":"B","qty":1}]}');`, hint: 'JSON 字符串外层使用 SQL 单引号，内部键值使用双引号。', verify: 'SELECT PAYLOAD:id::NUMBER FROM RAW_ORDERS; 应返回 101。' },
      { title: '展开并验证类型', instruction: '用 LATERAL FLATTEN 把 items 数组变为两行。', sql: `SELECT PAYLOAD:id::NUMBER AS ORDER_ID,
       F.VALUE:sku::STRING AS SKU,
       F.VALUE:qty::NUMBER AS QTY
FROM RAW_ORDERS, LATERAL FLATTEN(INPUT => PAYLOAD:items) F
ORDER BY SKU;`, hint: 'LATERAL 让 FLATTEN 看到当前 RAW_ORDERS 行的 PAYLOAD。', verify: '结果为订单 101 的 A/2 与 B/1 两行。' }),
  },
  'unload-connect': {
    detailSections: [
      { title: '卸载语义', body: 'COPY INTO <table> 是装载，COPY INTO <location> 是卸载。MAX_FILE_SIZE、SINGLE、PARTITION BY 和 file format 控制输出；SINGLE=TRUE 方便交付但牺牲并行和大数据集伸缩性。' },
      { title: '连接安全', body: 'JDBC/ODBC 适合标准生态，Python Connector 面向 Python 应用，Spark Connector 面向 Spark。连接字符串需要正确 account identifier；云存储凭据优先使用 storage integration，客户端身份优先密钥对/OAuth。' },
    ],
    officialLinks: [{ title: '数据卸载', url: 'https://docs.snowflake.com/en/user-guide/data-unload-overview' }],
    lab: lab('卸载并检查文件', '把查询结果卸载到 internal stage，再验证文件内容和元数据。', 'UNLOAD',
      { title: '卸载查询结果', instruction: '创建表并导出单个带表头的 CSV 文件。', sql: `CREATE OR REPLACE TABLE EXPORT_ME(ID NUMBER, NAME STRING);
INSERT INTO EXPORT_ME VALUES (1,'NORTH'),(2,'SOUTH');
CREATE OR REPLACE STAGE OUT_STAGE;
COPY INTO @OUT_STAGE/regions.csv FROM EXPORT_ME
FILE_FORMAT=(TYPE=CSV FIELD_OPTIONALLY_ENCLOSED_BY='"')
HEADER=TRUE SINGLE=TRUE OVERWRITE=TRUE;`, hint: '目标是 @stage 路径，所以这是卸载。', verify: 'COPY 结果状态为 UPLOADED。' },
      { title: '检查 staged file', instruction: '列出文件并直接查询 stage 内容。', sql: `LIST @OUT_STAGE;
SELECT $1, $2 FROM @OUT_STAGE/regions.csv (FILE_FORMAT => (TYPE => 'CSV', SKIP_HEADER => 1));`, hint: 'Stage 查询用 $1、$2 表示文件中的位置列。', verify: '应看到 regions.csv 和 NORTH、SOUTH 两行。' }),
  },
  'diagnose': {
    detailSections: [
      { title: '先判症状', body: 'Queue 表示并发资源不足，优先 scale out；remote spill 表示内存不足或中间结果过大，考虑 scale up/改 SQL；bytes scanned 过大应改剪枝、搜索优化或数据组织；数据倾斜要检查 join/group key。' },
      { title: 'Profile 阅读路径', body: '从耗时最高的 operator 开始，再看扫描、join、aggregate 和 spill。仓库变大只能改变计算资源，不能自动修复无选择性过滤、笛卡尔连接或错误 SQL。' },
    ],
    officialLinks: [{ title: '查询性能选项', url: DOCS.queryPerf }, { title: '仓库负载监控', url: DOCS.warehouseLoad }],
    lab: lab('用 Query History 诊断扫描', '产生两种查询并比较扫描量、编译和执行时间。', 'DIAGNOSE',
      { title: '执行可对比查询', instruction: '分别运行全表聚合和高选择性过滤。', sql: `ALTER SESSION SET QUERY_TAG='COF_C03_DIAG';
SELECT SUM(L_EXTENDEDPRICE) FROM SNOWFLAKE_SAMPLE_DATA.TPCH_SF1.LINEITEM;
SELECT * FROM SNOWFLAKE_SAMPLE_DATA.TPCH_SF1.ORDERS WHERE O_ORDERKEY=42;
ALTER SESSION UNSET QUERY_TAG;`, hint: '连续执行后不要只比较总时间，还要看 bytes scanned。', verify: '两个查询均成功，并产生 COF_C03_DIAG 标签记录。' },
      { title: '读取诊断信号', instruction: '比较同标签查询的扫描、排队和 spill。', sql: `SELECT QUERY_TEXT, BYTES_SCANNED, TOTAL_ELAPSED_TIME,
       QUEUED_OVERLOAD_TIME, BYTES_SPILLED_TO_REMOTE_STORAGE
FROM TABLE(INFORMATION_SCHEMA.QUERY_HISTORY_BY_SESSION(RESULT_LIMIT=>20))
WHERE QUERY_TAG='COF_C03_DIAG'
ORDER BY START_TIME;`, hint: '实验规模小，queue/spill 很可能为 0；这本身就是可验证的健康信号。', verify: '能看到两行记录，并解释哪个查询扫描更多。' }),
  },
  'caching-optimization': {
    detailSections: [
      { title: '三类优化路径', body: '结果缓存返回完全相同且仍有效的查询结果；warehouse cache 复用该仓库本地读取的数据；存储层 pruning 通过微分区元数据少读数据。仓库暂停会让本地缓存逐步丢失，但不影响结果缓存。' },
      { title: '功能选择', body: 'Search Optimization 适合高选择性查找；materialized view 预计算昂贵结果；clustering 改善大型表的微分区组织；Query Acceleration 把可并行片段卸载。每项都有成本和适用查询形态。' },
    ],
    officialLinks: [{ title: 'Warehouse cache', url: DOCS.cache }, { title: '存储优化', url: DOCS.storagePerf }],
    lab: lab('观察结果缓存', '重复执行确定性查询并通过 QUERY_HISTORY 验证第二次几乎不扫描。', 'CACHE',
      { title: '重复执行同一查询', instruction: '关闭会话的随机变化，原样执行同一查询两次。', sql: `ALTER SESSION SET QUERY_TAG='COF_C03_CACHE';
SELECT O_ORDERSTATUS, COUNT(*)
FROM SNOWFLAKE_SAMPLE_DATA.TPCH_SF1.ORDERS
GROUP BY O_ORDERSTATUS ORDER BY O_ORDERSTATUS;
SELECT O_ORDERSTATUS, COUNT(*)
FROM SNOWFLAKE_SAMPLE_DATA.TPCH_SF1.ORDERS
GROUP BY O_ORDERSTATUS ORDER BY O_ORDERSTATUS;
ALTER SESSION UNSET QUERY_TAG;`, hint: '文本和底层数据未改变时，第二次通常可复用 persisted result。', verify: '两次结果完全相同。' },
      { title: '比较历史统计', instruction: '按开始时间查看两次查询的扫描量和耗时。', sql: `SELECT QUERY_ID, START_TIME, BYTES_SCANNED, TOTAL_ELAPSED_TIME,
       PERCENTAGE_SCANNED_FROM_CACHE
FROM TABLE(INFORMATION_SCHEMA.QUERY_HISTORY_BY_SESSION(RESULT_LIMIT=>20))
WHERE QUERY_TAG='COF_C03_CACHE' ORDER BY START_TIME;`, hint: '结果缓存命中时 BYTES_SCANNED 通常为 0；warehouse cache 指标含义不同。', verify: '第二条记录应显著更快或扫描为 0。' }),
  },
  'sql-transform': {
    detailSections: [
      { title: '转换工具箱', body: 'MERGE 将 matched/not matched 分支作为一个原子语句执行，适合 upsert；窗口函数保留行粒度；QUALIFY 在窗口函数之后过滤，避免为 ROW_NUMBER 再包一层子查询。' },
      { title: '事务边界', body: '显式 BEGIN/COMMIT 把多个 DML 放在事务中；ROLLBACK 撤销未提交 DML。DDL 有不同事务语义，考试要区分“语句原子性”和“多语句事务”。' },
    ],
    officialLinks: [{ title: '查询数据', url: 'https://docs.snowflake.com/en/user-guide/querying-data' }],
    lab: lab('完成 MERGE 与 QUALIFY', '构造增量批次，原子 upsert 后用窗口函数保留最新版。', 'SQL_TRANSFORM',
      { title: '执行增量合并', instruction: '创建目标和增量表，更新已存在行并插入新行。', sql: `CREATE OR REPLACE TABLE TARGET(ID NUMBER, VALUE STRING, UPDATED_AT TIMESTAMP);
INSERT INTO TARGET VALUES (1,'OLD','2026-01-01');
CREATE OR REPLACE TABLE DELTA(ID NUMBER, VALUE STRING, UPDATED_AT TIMESTAMP);
INSERT INTO DELTA VALUES (1,'NEW','2026-02-01'),(2,'INSERTED','2026-02-01');
MERGE INTO TARGET T USING DELTA D ON T.ID=D.ID
WHEN MATCHED THEN UPDATE SET VALUE=D.VALUE, UPDATED_AT=D.UPDATED_AT
WHEN NOT MATCHED THEN INSERT VALUES(D.ID,D.VALUE,D.UPDATED_AT);`, hint: 'MATCHED 分支更新 ID=1，NOT MATCHED 分支插入 ID=2。', verify: 'TARGET 应有 NEW 和 INSERTED 两行。' },
      { title: '用 QUALIFY 选最新版', instruction: '合并两表历史并在窗口计算后过滤。', sql: `SELECT ID, VALUE, UPDATED_AT
FROM (SELECT * FROM TARGET UNION ALL SELECT * FROM DELTA)
QUALIFY ROW_NUMBER() OVER(PARTITION BY ID ORDER BY UPDATED_AT DESC)=1
ORDER BY ID;`, hint: 'QUALIFY 类似 HAVING，但过滤的是窗口函数结果。', verify: '每个 ID 只保留 1 行，ID=1 的值为 NEW。' }),
  },
  'pipelines-code': {
    detailSections: [
      { title: '命令式与声明式', body: 'Stream 记录表变化的 offset；Task 按时间或条件执行 SQL 并可组成 DAG。Dynamic Table 则声明目标查询和 TARGET_LAG，由 Snowflake 决定刷新计划。需要过程控制/副作用用 tasks，需要维护结果新鲜度用 dynamic tables。' },
      { title: '代码扩展', body: 'UDF 一行输入产生一个值；UDTF 产生多行；stored procedure 执行多步过程和对象操作；Snowpark 用熟悉语言构建下推计算。选择取决于输入输出形态及是否需要副作用。' },
    ],
    officialLinks: [{ title: '数据管道概览', url: DOCS.pipelines }, { title: 'Dynamic table 迁移', url: 'https://docs.snowflake.com/en/user-guide/dynamic-tables/migrate-streams-tasks' }],
    lab: lab('构建 Stream + Task 增量管道', '创建 CDC stream 和手动 task，并验证消费 stream 会推进 offset。', 'PIPELINES',
      { title: '创建增量对象', instruction: '创建源表、目标表、stream 和默认暂停的 task。', sql: `CREATE OR REPLACE TABLE SOURCE(ID NUMBER, VALUE STRING);
CREATE OR REPLACE TABLE SINK(ID NUMBER, VALUE STRING);
CREATE OR REPLACE STREAM SOURCE_CHANGES ON TABLE SOURCE;
CREATE OR REPLACE TASK APPLY_CHANGES WAREHOUSE=COF_C03_WH
  WHEN SYSTEM$STREAM_HAS_DATA('SOURCE_CHANGES')
  AS INSERT INTO SINK SELECT ID, VALUE FROM SOURCE_CHANGES WHERE METADATA$ACTION='INSERT';
INSERT INTO SOURCE VALUES (1,'A'),(2,'B');`, hint: 'Stream 不复制表数据，只保存消费偏移。', verify: 'SELECT * FROM SOURCE_CHANGES; 应显示两条 INSERT 变化。' },
      { title: '手动执行并检查', instruction: '执行 task，等待片刻后核对目标与 stream。', sql: `EXECUTE TASK APPLY_CHANGES;
SELECT * FROM SINK ORDER BY ID;
SELECT SYSTEM$STREAM_HAS_DATA('SOURCE_CHANGES');
SHOW TASKS LIKE 'APPLY_CHANGES';`, hint: 'EXECUTE TASK 便于实验，不需要把定时任务长期 RESUME。', verify: 'SINK 最终包含 A、B，stream has data 返回 FALSE。' }),
  },
  'sharing-listings': {
    detailSections: [
      { title: '零复制分享', body: 'Provider 通过 share 暴露对象，consumer 从 share 创建 imported database 并用自己的仓库查询；底层数据不复制给 consumer。Direct share 面向明确账户，private listing 增加跨区域和产品化体验，Marketplace listing 面向更广发现。' },
      { title: 'Reader account', body: '没有 Snowflake 账户的消费者可使用 provider 创建的 reader account。计算成本由 provider 账户承担，因此需要资源监控和治理。Secure view 常用来控制共享数据模型并隐藏定义。' },
    ],
    officialLinks: [{ title: 'Secure Data Sharing', url: DOCS.sharing }],
    lab: lab('创建可审计 Share', '在单账户内完成 provider 侧 share 配置并检查授权，不需要第二个账户。', 'SHARING',
      { title: '准备共享对象', instruction: '创建表、secure view 和 share，并授予最小访问链。', sql: `CREATE OR REPLACE TABLE SALES(REGION STRING, AMOUNT NUMBER);
INSERT INTO SALES VALUES ('EAST',100),('WEST',200);
CREATE OR REPLACE SECURE VIEW SHARED_SALES AS SELECT * FROM SALES;
CREATE OR REPLACE SHARE COF_C03_SHARE;
GRANT USAGE ON DATABASE COF_C03_LAB TO SHARE COF_C03_SHARE;
GRANT USAGE ON SCHEMA COF_C03_LAB.SHARING TO SHARE COF_C03_SHARE;
GRANT SELECT ON VIEW SHARED_SALES TO SHARE COF_C03_SHARE;`, hint: 'Share 同样需要数据库、schema、对象三层权限。', verify: 'SHOW GRANTS TO SHARE COF_C03_SHARE; 应显示 3 项授权。' },
      { title: '检查 provider 侧元数据', instruction: '核对 share、secure view 和授权对象。', sql: `SHOW SHARES LIKE 'COF_C03_SHARE';
SHOW VIEWS LIKE 'SHARED_SALES';
SHOW GRANTS TO SHARE COF_C03_SHARE;`, hint: '没有第二账户时不能创建 imported database，但 provider 配置仍完全可验证。', verify: 'SHARE 存在且 VIEW 的 is_secure 为 true。' }),
  },
  'clean-rooms': {
    detailSections: [
      { title: '为什么需要 Clean Room', body: '普通 sharing 让消费者直接查询授权对象；Clean Room 让多方数据在预先批准的分析模板和隐私规则下协作，减少暴露行级数据。典型场景是广告重叠、转化归因和联合洞察。' },
      { title: '题目识别点', body: '看到“双方都不能看对方原始客户明细”“只允许批准查询”“需要重叠计数”时选择 Clean Rooms；只是实时共享受控视图则仍可用 Secure Sharing。' },
    ],
    officialLinks: [{ title: 'Snowflake Data Clean Rooms', url: 'https://docs.snowflake.com/en/user-guide/cleanrooms/introduction' }],
    lab: lab('模拟隐私安全的重叠分析', '用最小聚合阈值模拟 clean room 的核心输出约束。', 'CLEAN_ROOM',
      { title: '创建双方受保护集合', instruction: '构造 provider 与 consumer 的哈希标识集合。', sql: `CREATE OR REPLACE TABLE PROVIDER_IDS(ID_HASH STRING);
CREATE OR REPLACE TABLE CONSUMER_IDS(ID_HASH STRING);
INSERT INTO PROVIDER_IDS VALUES (SHA2('a')), (SHA2('b')), (SHA2('c'));
INSERT INTO CONSUMER_IDS VALUES (SHA2('b')), (SHA2('c')), (SHA2('d'));`, hint: '哈希不是完整 clean room 安全边界，只用于理解“匹配键不直接展示原始标识”。', verify: '两表各有 3 行。' },
      { title: '只输出批准的聚合', instruction: '创建 secure view，只暴露重叠数量而非匹配行。', sql: `CREATE OR REPLACE SECURE VIEW APPROVED_OVERLAP AS
SELECT COUNT(*) AS OVERLAP_COUNT
FROM PROVIDER_IDS P JOIN CONSUMER_IDS C USING(ID_HASH)
HAVING COUNT(*) >= 2;
SELECT * FROM APPROVED_OVERLAP;`, hint: '真正 Clean Rooms 还会控制模板、策略和参与方权限；这里验证分析思想。', verify: '只返回 OVERLAP_COUNT=2，视图不暴露 ID_HASH。' }, 'Managed Snowflake Data Clean Rooms 的可用性取决于区域和账户配置；此 Lab 使用 SQL 模拟其核心隐私输出模式。'),
  },
  'protection-clone': {
    detailSections: [
      { title: '三种恢复机制', body: 'Time Travel 允许查询/恢复历史数据；Fail-safe 是 Snowflake 管理的灾难恢复窗口，用户不能直接查询；zero-copy clone 通过元数据快速创建某时点对象，后续只为变化部分增加存储。' },
      { title: '保留期与表类型', body: '永久表支持完整 Time Travel 和 Fail-safe；transient/temporary 没有 Fail-safe。UNDROP 在保留期内恢复被删除对象，AT/BEFORE 可查询历史版本。Clone 不是独立备份策略。' },
    ],
    officialLinks: [{ title: 'Time Travel', url: 'https://docs.snowflake.com/en/user-guide/data-time-travel' }],
    lab: lab('Time Travel 与零复制 Clone', '记录 statement ID、修改数据，再恢复历史快照并比较。', 'PROTECTION',
      { title: '制造可恢复历史', instruction: '创建表、记录查询 ID，再执行误删除模拟。', sql: `CREATE OR REPLACE TABLE INVENTORY(ID NUMBER, QTY NUMBER);
INSERT INTO INVENTORY VALUES (1,10),(2,20);
SELECT * FROM INVENTORY ORDER BY ID;
SET SNAPSHOT_QID = LAST_QUERY_ID();
DELETE FROM INVENTORY WHERE ID=2;`, hint: '变量保存的是删除前 SELECT 的 statement ID。', verify: '当前 INVENTORY 只剩 ID=1。' },
      { title: '按历史创建 clone', instruction: '从 statement 之前的表状态创建零复制克隆。', sql: `CREATE OR REPLACE TABLE INVENTORY_RESTORED CLONE INVENTORY
  BEFORE (STATEMENT => $SNAPSHOT_QID);
SELECT * FROM INVENTORY_RESTORED ORDER BY ID;
SELECT * FROM INVENTORY ORDER BY ID;`, hint: '如果 BEFORE 边界不符合预期，可改用 AT (STATEMENT => $SNAPSHOT_QID) 对比。', verify: 'RESTORED 应包含两行，而当前表仍只有一行。' }),
  },
  'replication': {
    detailSections: [
      { title: '复制与故障转移', body: 'Replication group 把选定数据库和账户对象复制到其他区域/账户；failover group 还允许目标提升为主对象。复制是异步的，RPO 取决于刷新频率，RTO 还包含提升和应用重连。' },
      { title: '选择边界', body: 'Time Travel 处理逻辑误操作；Fail-safe 是最后恢复手段；replication/failover 面向区域级业务连续性。场景题先确认故障范围，再选择机制。' },
    ],
    officialLinks: [{ title: '复制与故障转移', url: 'https://docs.snowflake.com/en/user-guide/account-replication-intro' }],
    lab: lab('检查复制就绪性', '在单账户免费环境中盘点可复制对象和版本，不执行跨区域复制。', 'REPLICATION',
      { title: '创建待复制对象清单', instruction: '创建一个示例业务表，并记录其依赖对象。', sql: `CREATE OR REPLACE TABLE CRITICAL_DATA(ID NUMBER, VALUE STRING);
INSERT INTO CRITICAL_DATA VALUES (1,'PRIMARY');
SHOW DATABASES LIKE 'COF_C03_LAB';
SHOW WAREHOUSES LIKE 'COF_C03_WH';`, hint: '复制计划不仅要列数据库，还要考虑网络策略、集成等账户对象。', verify: '数据库和仓库均存在，业务表可查询。' },
      { title: '检查账户复制能力', instruction: '查看账户可见的 replication/failover group，并记录当前区域。', sql: `SELECT CURRENT_ACCOUNT(), CURRENT_REGION(), CURRENT_ORGANIZATION_NAME();
SHOW REPLICATION GROUPS;
SHOW FAILOVER GROUPS;`, hint: '免费试用通常没有可用的第二账户/区域；空结果是预期且可验证。', verify: '能记录当前 account/region；SHOW 命令成功或明确提示版本/权限要求。' }, '真正的跨区域复制通常需要组织内第二账户及相应版本；免费试用可完成就绪性检查与对象清单。'),
  },
};
