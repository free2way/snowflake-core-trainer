export type LabLink = { label: string; url: string };

export type SnowLabStep = {
  title: string;
  action: string;
  expected: string;
  troubleshooting: string;
  sql?: string;
  terminal?: string;
  json?: string;
  files?: LabLink[];
};

export type SnowLab = {
  id: string;
  level: '基础' | '进阶' | '高级' | '选修';
  title: string;
  outcome: string;
  minutes: number;
  requires: string;
  prerequisite?: string;
  steps: SnowLabStep[];
  sources: LabLink[];
};

const bootcamp = 'https://github.com/free2way/snowflake-bootcamp';
const revision = 'edde69bee144d95978a1c0ad61c6b4504aa7a8d9';
const docs = 'https://docs.snowflake.com/en';
const labDb = 'SNOW_LABS_TRAINING';
const labWh = 'SNOW_LABS_XS';

export const snowLabSources = {
  video: 'https://www.youtube.com/watch?v=7lpp5N73V98&t=1661s',
  bootcamp: `${bootcamp}/tree/${revision}`,
};

const doc = (label: string, path: string): LabLink => ({ label, url: `${docs}/${path}` });
const material = (file: string): LabLink => ({
  label: file.split('/').at(-1)!,
  url: `${bootcamp}/blob/${revision}/${file.split('/').map(encodeURIComponent).join('/')}`,
});
const download = (file: string): LabLink => ({
  label: `下载 ${file}`,
  url: `https://raw.githubusercontent.com/free2way/snowflake-bootcamp/${revision}/${encodeURIComponent(file)}`,
});

function sql(title: string, action: string, code: string, expected: string, troubleshooting: string): SnowLabStep {
  return { title, action, sql: code, expected, troubleshooting };
}

function setup(schema: string): SnowLabStep {
  return sql('设置练习上下文', '在个人试用账户的 SQL Worksheet 中依次运行这段。后续步骤沿用同一个 Worksheet 和会话。',
    `USE ROLE ACCOUNTADMIN;
USE SECONDARY ROLES NONE;
USE WAREHOUSE ${labWh};
CREATE SCHEMA IF NOT EXISTS ${labDb}.${schema};
USE SCHEMA ${labDb}.${schema};
SELECT CURRENT_ROLE(), CURRENT_WAREHOUSE(), CURRENT_SCHEMA();`,
    `返回 ACCOUNTADMIN、${labWh}、${schema}。`,
    '找不到数据库或仓库时先做「申请并配置试用账户」。重开 Worksheet 后先恢复角色、仓库及 Schema。');
}

function cleanup(schema: string, before = ''): SnowLabStep {
  return sql('清理与重跑', '完成验收后运行。仅对本课程专用试用环境操作，此步骤会删除本 Lab 的实验对象。重做时从第一步开始。',
    `USE ROLE ACCOUNTADMIN;
${before}DROP SCHEMA IF EXISTS ${labDb}.${schema} CASCADE;
SHOW SCHEMAS LIKE '${schema}' IN DATABASE ${labDb};`,
    `${schema} 不再出现。共享的练习仓库会在空闲后自动挂起。`,
    '确认当前账户是个人试用账户。若还要检查历史记录，先保留对象，完成检查后再清理。');
}

function upload(target: string, ...files: string[]): SnowLabStep {
  return {
    title: '下载并上传样例文件',
    action: `保存下面的原始文件并保持文件名。Snowsight 中打开 Ingestion → Add Data → Load files into a Stage，选 ${labDb}.${target}，上传到 Stage 根目录。浏览器若直接打开文本，用「另存为」保存原始文件。`,
    files: files.map(download),
    expected: `回到 Worksheet 执行 LIST @${target.split('.').at(-1)};，确认所有指定文件都在列表中。`,
    troubleshooting: '找不到 Stage 时检查 Snowsight 当前角色和目标 Schema。确保文件名没有附加 .txt 或 (1)，也没有上传到子目录。',
  };
}

const csvFormat = 'CREATE OR REPLACE FILE FORMAT CSV_HEADER TYPE = CSV SKIP_HEADER = 1;';
const salesColumns = 'transaction_id NUMBER, customer_id NUMBER, product_id NUMBER, quantity NUMBER, amount NUMBER(12,2), transaction_date DATE';

export const SNOW_LABS: SnowLab[] = [
  {
    id: 'trial', level: '基础', title: '申请并配置试用账户', minutes: 20,
    outcome: '登录 Snowsight，执行第一条查询，建立课程专用数据库和低成本仓库。',
    requires: '可以接收验证邮件的邮箱。为后续脱敏实验建议选择 Enterprise 试用版。',
    sources: [doc('Snowflake 试用账户', 'user-guide/admin-trial-account')],
    steps: [
      { title: '申请并激活', action: '访问 Snowflake 注册页，填写信息，在可用列表选择云平台、区域及版本。收到确认邮件后点击激活，设置登录凭据，按界面要求完成 MFA。保存自己的 Snowsight 登录地址。', files: [{ label: '注册 Snowflake 试用账户', url: 'https://signup.snowflake.com/' }], expected: '进入自己的 Snowsight 试用账户。', troubleshooting: '收不到邮件时检查垃圾邮件和地址拼写。已有试用账户可直接登录并检查版本和余额。' },
      sql('确认账户和角色', '从 Create 菜单新建 SQL Worksheet，在角色选择器使用 ACCOUNTADMIN，运行下面的查询。',
        'USE ROLE ACCOUNTADMIN;\nSELECT CURRENT_ACCOUNT(), CURRENT_REGION(), CURRENT_ROLE();',
        '结果有一行，第三列为 ACCOUNTADMIN。', '若角色列表没有 ACCOUNTADMIN，确认登录的是自己创建的试用账户及其初始管理员。'),
      sql('建立课程资源', '只在个人练习账户执行。试用额度随计算消耗，练习使用 X-Small，每次空闲 60 秒后自动挂起。',
        `CREATE WAREHOUSE IF NOT EXISTS ${labWh}
  WAREHOUSE_SIZE = 'XSMALL' AUTO_SUSPEND = 60
  AUTO_RESUME = TRUE INITIALLY_SUSPENDED = TRUE;
CREATE DATABASE IF NOT EXISTS ${labDb};
USE WAREHOUSE ${labWh};
USE DATABASE ${labDb};
SELECT CURRENT_WAREHOUSE(), CURRENT_DATABASE(), 1 + 1 AS CHECK_VALUE;`,
        `仓库为 ${labWh}，数据库为 ${labDb}，CHECK_VALUE = 2。`,
        '检查 Snowsight 的试用余额。若名称已被其他项目使用，请换一个干净的个人练习账户。'),
      sql('检查仓库并保留环境', '查看仓库配置。下一个 Lab 会复用这个仓库和数据库，重复运行本 Lab 的 CREATE IF NOT EXISTS 即可。',
        `SHOW WAREHOUSES LIKE '${labWh}';`,
        'size 为 X-Small，auto_suspend 为 60。退出后仓库可在空闲时挂起。', '若发现配置不同，确认这是自己专门创建的仓库后再在仓库详情里调整。'),
    ],
  },
  {
    id: 'sql-foundations', level: '基础', title: '建立表、JOIN 与视图', minutes: 25,
    outcome: '得到保留无订单客户的汇总视图，并验证事务内 DELETE 可以回滚。',
    requires: '完成试用账户配置。', prerequisite: 'trial', sources: [material('snoflake practical sql files/sql_commands.sql'), doc('JOIN', 'sql-reference/constructs/join')],
    steps: [
      setup('L02_SQL'),
      sql('创建客户和订单', '运行脚本，用三位虚构客户和三条订单搭建小型关系模型。',
        `CREATE OR REPLACE TABLE customers(id INT, name VARCHAR);
INSERT INTO customers VALUES (1,'Ada'),(2,'Lin'),(3,'Max');
CREATE OR REPLACE TABLE orders(id INT, customer_id INT, amount NUMBER(10,2));
INSERT INTO orders VALUES (101,1,30),(102,1,20),(103,2,40);
SELECT COUNT(*) FROM orders;`, '返回 3。', '行数异常时从本步开头重跑，CREATE OR REPLACE 会重建两张实验表。'),
      sql('对账并保存为视图', '用 LEFT JOIN 保留没有订单的客户。对比 COUNT(o.id) 和 COUNT(*) 在无订单客户上的差异。',
        `CREATE OR REPLACE VIEW customer_totals AS
SELECT c.id, c.name, COUNT(o.id) AS order_count, COALESCE(SUM(o.amount),0) AS total
FROM customers c LEFT JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.name;
SELECT * FROM customer_totals ORDER BY id;`,
        'Ada 为 2 单 / 50，Lin 为 1 单 / 40，Max 为 0 单 / 0。', '若 Max 消失，检查是否用了 INNER JOIN 或在 WHERE 中过滤了右表。'),
      sql('模拟删除再回滚', '在同一会话依次执行。事务中只运行这些 DML 和查询，避免插入会隐式提交的 DDL。',
        'BEGIN TRANSACTION;\nDELETE FROM orders WHERE id = 101;\nSELECT COUNT(*) AS DURING_DELETE FROM orders;\nROLLBACK;\nSELECT COUNT(*) AS AFTER_ROLLBACK FROM orders;',
        '事务中为 2，回滚后为 3。', '若仍为 2，核对 BEGIN 和 ROLLBACK 是否在同一个 SQL 会话。'),
      cleanup('L02_SQL'),
    ],
  },
  {
    id: 'warehouse-table-types', level: '基础', title: '观察仓库状态与三种表的生命周期', minutes: 25,
    outcome: '在两个会话比较表的可见性，区分仓库扩容与多集群的适用场景。',
    requires: '完成试用账户配置。', prerequisite: 'trial', sources: [material('snoflake practical sql files/table types.sql'), doc('临时表与瞬态表', 'user-guide/tables-temp-transient'), doc('虚拟仓库管理', 'user-guide/warehouses-tasks')],
    steps: [
      setup('L15_OBJECTS'),
      sql('检查共享仓库', '查看 SQL 仓库的状态与最大集群数。记下 state，空闲时停止使用 60 秒以上，再单独执行 SHOW 查看状态。',
        "SHOW WAREHOUSES LIKE 'SNOW_LABS_XS';", '仓库为 X-Small 和单集群，空闲后可变为 SUSPENDED。', '挂起检测有轮询延迟。增大规格是 scale up，多集群是 scale out，需要 Enterprise 或更高版本。本实验只观察现有配置。'),
      sql('创建三种表', '在当前 Worksheet 逐条运行，观察 SHOW TABLES 的 kind 字段。',
        'CREATE OR REPLACE TABLE durable_row(id INT);\nCREATE OR REPLACE TRANSIENT TABLE staging_row(id INT);\nCREATE OR REPLACE TEMP TABLE session_row(id INT);\nSHOW TABLES IN SCHEMA SNOW_LABS_TRAINING.L15_OBJECTS;',
        '可见永久、TRANSIENT、TEMPORARY 三张表。', '未选 Warehouse 时先回到准备步骤。不要用同名临时表覆盖练习中的其他表。'),
      sql('从新会话比较生命周期', '另建 SQL Worksheet 执行，检查是否能看到上一个会话的三张表。永久表有 Fail-safe，Transient 和 Temporary 都无 Fail-safe。',
        'USE ROLE ACCOUNTADMIN;\nSHOW TABLES IN SCHEMA SNOW_LABS_TRAINING.L15_OBJECTS;',
        'DURABLE_ROW 和 STAGING_ROW 可见，SESSION_ROW 只在原会话可见。', '若看到 SESSION_ROW，请检查是否确实开启了独立 Worksheet 会话。'),
      cleanup('L15_OBJECTS'),
    ],
  },
  {
    id: 'csv-stage', level: '基础', title: '从内部 Stage 批量装载 CSV', minutes: 25,
    outcome: '用仓库中的客户样例演练上传、预览、COPY 与行数核对。',
    requires: '完成试用账户配置。', prerequisite: 'trial', sources: [material('snoflake practical sql files/STAGE.sql'), doc('Snowsight 上传到命名内部 Stage', 'user-guide/data-load-local-file-system-stage-ui')],
    steps: [
      setup('L03_CSV'),
      sql('创建文件格式、Stage 和目标表', '客户样例首行是表头，建表顺序与 CSV 文件列顺序一致。',
        `${csvFormat}
CREATE OR REPLACE STAGE intake FILE_FORMAT = (FORMAT_NAME='CSV_HEADER');
CREATE OR REPLACE TABLE customers(customer_id INT, customer_name VARCHAR, city VARCHAR);
SHOW STAGES LIKE 'INTAKE';`, '返回 INTAKE，类型为 INTERNAL。', '若要重跑，先清理再重做，重建 Stage 会删除其中的文件。'),
      upload('L03_CSV.INTAKE', 'customer_01.csv'),
      sql('预览、装载与验收', '先读 Stage 的位置列，再 COPY。点击查看 COPY 结果中的 ROWS_LOADED。',
        `SELECT $1, $2, $3 FROM @intake/customer_01.csv ORDER BY $1;
COPY INTO customers FROM @intake FILES = ('customer_01.csv') ON_ERROR = ABORT_STATEMENT;
SELECT COUNT(*) AS TOTAL, MIN(customer_id), MAX(customer_id) FROM customers;`,
        '预览 3 行，首次 COPY 导入 3 行，ID 范围为 101–103。', '若装载 0 行但总数为 3，文件可能已被加载。LIST 核对拼写和路径。'),
      cleanup('L03_CSV'),
    ],
  },
  {
    id: 'cli-stages', level: '进阶', title: '在命令行比较 User、Table 和 Named Stage', minutes: 30,
    outcome: '用客户端 PUT 上传同一份 CSV 到三种内部 Stage，验证可见位置和清理命令。',
    requires: '完成 CSV Stage Lab。需要能安装 Snowflake CLI 或已经安装 SnowSQL 的本地电脑。',
    prerequisite: 'csv-stage',
    sources: [material('snoflake practical sql files/STAGE_EXAMPLE.sql'), doc('Snowflake CLI 连接配置', 'developer-guide/snowflake-cli/connecting/configure-cli'), doc('SnowSQL 连接', 'user-guide/snowsql-start'), doc('PUT', 'sql-reference/sql/put')],
    steps: [
      setup('L16_CLI'),
      sql('建立 Table Stage 和 Named Stage', '表和用户自带各自的 Stage，另创建一个命名 Stage。',
        'CREATE OR REPLACE TABLE employee_stage(id INT, name VARCHAR, salary INT);\nCREATE OR REPLACE STAGE named_intake;',
        '三种目标写法分别为 @~、@%EMPLOYEE_STAGE、@NAMED_INTAKE。', '表或命名 Stage 找不到时，核对 Worksheet 使用的是 L16_CLI。'),
      { title: '安装客户端、测试连接和下载样例', action: '按 Snowflake CLI 文档安装 CLI，执行 snow connection add 创建 snow_labs_trial 连接，使用你的 Snowflake 试用账号标识与用户名，并按当前账户要求配置认证。执行 snow connection test -c snow_labs_trial。下载下面的文件并记录绝对路径。也可按 SnowSQL 文档登录，以交互方式运行下一步的 SQL。', files: [download('employee_user_stage.csv')], expected: '连接测试成功，本地文件名保持 employee_user_stage.csv。', troubleshooting: '有 MFA 的账户需要使用对应的连接认证流程。不要把密码写进命令、仓库或 Worksheet。' },
      { title: '上传并列出三种 Stage', action: 'macOS/Linux 终端中，把 /absolute/path 替换成实际路径，并保持整个 SQL 参数的双引号。Windows 用 file://C:/... 的路径写法。若用 SnowSQL，将引号内的 SQL 按顺序执行。',
        terminal: `snow sql -c snow_labs_trial -q "USE ROLE ACCOUNTADMIN;
USE SCHEMA ${labDb}.L16_CLI;
PUT 'file:///absolute/path/employee_user_stage.csv' @~/snow_labs_l16/ AUTO_COMPRESS=FALSE OVERWRITE=TRUE;
PUT 'file:///absolute/path/employee_user_stage.csv' @%employee_stage AUTO_COMPRESS=FALSE OVERWRITE=TRUE;
PUT 'file:///absolute/path/employee_user_stage.csv' @named_intake AUTO_COMPRESS=FALSE OVERWRITE=TRUE;
LIST @~/snow_labs_l16/;
LIST @%employee_stage;
LIST @named_intake;"`,
        expected: '每个 LIST 都能看到 employee_user_stage.csv。', troubleshooting: 'PUT 从运行客户端的电脑读取文件。在 Snowsight 里可以上传到命名内部 Stage；User/Table Stage 的这个练习需要本地客户端。' },
      sql('装载并清理 User Stage 文件', '回到同一个 Snowflake 用户的 Worksheet，使用与 CLI 相同的用户才能看见 @~ 中的练习文件。',
        "COPY INTO employee_stage FROM @~/snow_labs_l16/ FILES=('employee_user_stage.csv') FILE_FORMAT=(TYPE=CSV SKIP_HEADER=1);\nSELECT COUNT(*) AS TOTAL FROM employee_stage;\nREMOVE @~/snow_labs_l16/employee_user_stage.csv;\nLIST @~/snow_labs_l16/;",
        'TOTAL=3。删除后 @~ 的练习前缀为空。Schema 清理会移除余下实验对象。', '如果 COPY 找不到文件，核对 CLI 与 Snowsight 的 CURRENT_USER() 是否相同。'),
      cleanup('L16_CLI'),
    ],
  },
  {
    id: 'copy-errors', level: '进阶', title: '诊断 CSV 日期与表头错误', minutes: 25,
    outcome: '先定位装载错误，再修复日期格式和多行头部，验证未产生脏数据。',
    requires: '了解命名内部 Stage 与 COPY。', prerequisite: 'csv-stage', sources: [doc('装载前验证', 'user-guide/data-load-local-file-system-copy'), material('date_format_mismatch_demo.csv'), material('employee_header_at_second_row.csv')],
    steps: [
      setup('L04_ERRORS'),
      sql('构造可复现的格式不匹配', '为第一份文件故意配置错误日期格式，并创建两张实验表。',
        `CREATE OR REPLACE STAGE intake;
CREATE OR REPLACE TABLE joins_demo(emp_id INT, join_date DATE, salary INT);
CREATE OR REPLACE TABLE emp_demo(emp_id INT, emp_name VARCHAR, salary INT);
CREATE OR REPLACE FILE FORMAT wrong_date TYPE=CSV SKIP_HEADER=1 DATE_FORMAT='YYYY-MM-DD';`,
        '两张表均为空。', '待装载样例的日期形如 23/05/2026，后续预期报解析错误。'),
      upload('L04_ERRORS.INTAKE', 'date_format_mismatch_demo.csv', 'employee_header_at_second_row.csv'),
      sql('先验证，再修复日期', '先单独运行第一条并查看错误输出，再运行后续语句。',
        `COPY INTO joins_demo FROM @intake FILES=('date_format_mismatch_demo.csv')
  FILE_FORMAT=(FORMAT_NAME='WRONG_DATE') VALIDATION_MODE=RETURN_ALL_ERRORS;
SELECT COUNT(*) AS BEFORE_LOAD FROM joins_demo;
CREATE OR REPLACE FILE FORMAT fixed_date TYPE=CSV SKIP_HEADER=1 DATE_FORMAT='DD/MM/YYYY';
COPY INTO joins_demo FROM @intake FILES=('date_format_mismatch_demo.csv')
  FILE_FORMAT=(FORMAT_NAME='FIXED_DATE') ON_ERROR=ABORT_STATEMENT;
SELECT COUNT(*) AS TOTAL, TO_CHAR(MAX(join_date),'YYYY-MM-DD') AS MAX_DATE FROM joins_demo;`,
        '验证阶段返回日期错误，BEFORE_LOAD=0。修复后共 3 行，最晚日期 2026-05-23。', '不要用 ON_ERROR=CONTINUE 掩盖系统性格式错误。确保验证命令没有使用转换 SELECT。'),
      sql('跳过报告行和列标题', '第二份文件的第一行是报告说明，第二行才是字段名。',
        `CREATE OR REPLACE FILE FORMAT report_csv TYPE=CSV SKIP_HEADER=2;
COPY INTO emp_demo FROM @intake FILES=('employee_header_at_second_row.csv')
  FILE_FORMAT=(FORMAT_NAME='REPORT_CSV') ON_ERROR=ABORT_STATEMENT;
SELECT COUNT(*) AS TOTAL, SUM(salary) AS SALARY_TOTAL FROM emp_demo;`,
        'TOTAL=3，SALARY_TOTAL=180000。', '若报告说明被当成数据行，核对 SKIP_HEADER 是否为 2。'),
      cleanup('L04_ERRORS'),
    ],
  },
  {
    id: 'json-variant', level: '进阶', title: '加载 JSON 并查询 VARIANT', minutes: 20,
    outcome: '把仓库的 JSON 数组拆成 20 条记录，提取字段并验证布尔类型。',
    requires: '了解内部 Stage 上传。', prerequisite: 'csv-stage', sources: [doc('半结构化数据', 'user-guide/semistructured-concepts'), doc('JSON 文件格式', 'sql-reference/sql/create-file-format')],
    steps: [
      setup('L05_JSON'),
      sql('准备 JSON 格式和原始层', '通过 STRIP_OUTER_ARRAY 把每个数组元素分别载入一行。',
        "CREATE OR REPLACE FILE FORMAT employee_json TYPE=JSON STRIP_OUTER_ARRAY=TRUE;\nCREATE OR REPLACE STAGE intake FILE_FORMAT=(FORMAT_NAME='EMPLOYEE_JSON');\nCREATE OR REPLACE TABLE employee_raw(payload VARIANT);",
        'Stage 和一列表均已创建。', '本 Lab 使用单个顶层数组文件，请保持原文件结构。'),
      upload('L05_JSON.INTAKE', 'snowflake_ui_load_practice.json'),
      sql('装载并提取字段', '通过路径表达式读取字段，用类型转换构建结构化结果。',
        `COPY INTO employee_raw FROM @intake FILES=('snowflake_ui_load_practice.json') ON_ERROR=ABORT_STATEMENT;
SELECT payload:emp_id::INT AS ID, payload:department::VARCHAR AS DEPARTMENT
FROM employee_raw ORDER BY ID LIMIT 5;
SELECT COUNT(*) AS TOTAL, COUNT_IF(payload:is_active::BOOLEAN) AS ACTIVE
FROM employee_raw;`, 'TOTAL=20，ACTIVE=17。', '若只有 1 行，检查 Stage 默认格式的 STRIP_OUTER_ARRAY。JSON 键区分大小写。'),
      cleanup('L05_JSON'),
    ],
  },
  {
    id: 'incremental-copy', level: '进阶', title: '按文件增量装载与防重', minutes: 30,
    outcome: '装载三个日批，重跑第二批，验证目标仍然只有 15 条唯一交易。',
    requires: '完成 CSV Stage 练习。', prerequisite: 'csv-stage', sources: [material('copy into - incremental file load practical.txt'), doc('COPY INTO 表', 'sql-reference/sql/copy-into-table')],
    steps: [
      setup('L06_INCREMENTAL'),
      sql('建表与 Stage', '使用销售样例的六列数据类型建表。金额保留两位小数。',
        `${csvFormat}
CREATE OR REPLACE STAGE intake FILE_FORMAT=(FORMAT_NAME='CSV_HEADER');
CREATE OR REPLACE TABLE sales(${salesColumns});`, 'SALES 初始为空。', '重跑中间的 COPY 时不要重建 SALES，这会丢失本轮用于防重的表装载元数据。'),
      upload('L06_INCREMENTAL.INTAKE', 'sales_20260701.csv', 'sales_20260702.csv', 'sales_20260703.csv'),
      sql('依次进货与重放', '逐条运行，记录每条 COPY 的结果。第四次有意重放第二个文件。',
        `COPY INTO sales FROM @intake FILES=('sales_20260701.csv');
COPY INTO sales FROM @intake FILES=('sales_20260702.csv');
COPY INTO sales FROM @intake FILES=('sales_20260703.csv');
COPY INTO sales FROM @intake FILES=('sales_20260702.csv');
SELECT COUNT(*) AS TOTAL, COUNT(DISTINCT transaction_id) AS UNIQUE_IDS FROM sales;
SELECT transaction_date, COUNT(*) FROM sales GROUP BY 1 ORDER BY 1;`,
        '首次每批 5 行，重放不新增。TOTAL 与 UNIQUE_IDS 都为 15，每天 5 行。', '如果重放新增，检查有无 FORCE=TRUE、文件改名、文件内容被替换或目标表被重建。文件防重不等同于业务键去重。'),
      cleanup('L06_INCREMENTAL'),
    ],
  },
  {
    id: 'cache-profile', level: '进阶', title: '观察结果缓存和 Query Profile', minutes: 20,
    outcome: '用相同查询比较结果复用和实际扫描，避免根据一次耗时判断性能。',
    requires: '完成试用账户配置。', prerequisite: 'trial', sources: [material('snoflake practical sql files/CACHE.sql'), doc('持久化查询结果', 'user-guide/querying-persisted-results')],
    steps: [
      setup('L07_CACHE'),
      sql('建立固定基线', '造少量合成数据，并以完全相同的文本连续运行两次聚合。',
        `CREATE OR REPLACE TABLE demo AS
SELECT SEQ4() AS id, UNIFORM(1,100,RANDOM()) AS amount
FROM TABLE(GENERATOR(ROWCOUNT=>50000));
ALTER SESSION SET USE_CACHED_RESULT=TRUE;
SELECT SUM(amount) FROM demo;
SELECT SUM(amount) FROM demo;`, '两次 SUM 一致。记录两次聚合 query ID。', '不要修改查询文本、角色或源表。结果复用由 Snowflake 决定，不能把耗时阈值作为验收。'),
      sql('关闭结果复用作为对照', '在 Snowsight 的 Query History 打开三次 SUM 的详情，对比扫描统计和 Profile 是否有扫描算子。',
        'ALTER SESSION SET USE_CACHED_RESULT=FALSE;\nSELECT SUM(amount) FROM demo;\nALTER SESSION UNSET USE_CACHED_RESULT;',
        '三次结果一致。记录二次执行是否有零扫描，并说明关闭的是结果缓存，仓库仍可能有本地数据缓存。', '看不到 Profile 时先确认选中的是 SUM 的 query ID。数据很小，耗时差异可能不明显。'),
      cleanup('L07_CACHE'),
    ],
  },
  {
    id: 'recovery', level: '进阶', title: '用 Time Travel 恢复误删', minutes: 25,
    outcome: '按 DELETE 的查询 ID 找回历史行，克隆并验证原表和克隆独立写入。',
    requires: '使用开启 Time Travel 的个人试用账户。', prerequisite: 'sql-foundations', sources: [material('snoflake practical sql files/zero copy.sql'), doc('AT / BEFORE', 'sql-reference/constructs/at-before')],
    steps: [
      setup('L08_RECOVERY'),
      sql('制造一个练习事故', '运行下面四条。SET 必须紧跟 DELETE，中间不运行其它语句。',
        `CREATE OR REPLACE TABLE inventory(id INT, qty INT) DATA_RETENTION_TIME_IN_DAYS=1;
INSERT INTO inventory VALUES (1,10),(2,20),(3,30);
DELETE FROM inventory WHERE id=2;
SET delete_id = LAST_QUERY_ID();`,
        'DELETE 影响 1 行。SELECT $delete_id 可看到已保存的查询 ID。', '若会话变量丢失，从 Query History 找 DELETE 的 ID，执行 SET delete_id = \'实际ID\';。'),
      sql('读历史并验证克隆独立', '先比较删除前的数据，再创建历史克隆。更新克隆的 ID=1，核对原表。',
        `SELECT * FROM inventory BEFORE (STATEMENT => $delete_id) ORDER BY id;
CREATE OR REPLACE TABLE inventory_restore CLONE inventory BEFORE (STATEMENT => $delete_id);
UPDATE inventory_restore SET qty=99 WHERE id=1;
SELECT * FROM inventory_restore ORDER BY id;
SELECT * FROM inventory ORDER BY id;`,
        '历史和克隆均为 3 行，原表为 2 行。克隆中 ID=1 的 QTY 是 99，原表中仍是 10。', '对象重建会重置历史边界，确认查询 ID 对应当前表的 DELETE 且仍在保留期。'),
      cleanup('L08_RECOVERY'),
    ],
  },
  {
    id: 'rbac-masking', level: '高级', title: '验证最小权限与列级脱敏', minutes: 30,
    outcome: '用同一行合成数据对比管理员和只读角色，确认脱敏在查询时发生。',
    requires: '本人创建的试用管理员。动态脱敏需 Enterprise 或更高版本。', prerequisite: 'trial', sources: [material('snoflake practical sql files/data_masking.sql'), doc('动态数据脱敏', 'user-guide/security-column-ddm-intro')],
    steps: [
      setup('L09_SECURITY'),
      sql('创建样例表和只读角色', '把角色授给 ACCOUNTADMIN 以便试用管理员切换，不创建其他真实用户。只授予查询需要的四类权限。',
        `CREATE OR REPLACE TABLE employee(id INT, email VARCHAR);
INSERT INTO employee VALUES (1,'sample@example.com');
CREATE ROLE IF NOT EXISTS SNOW_LABS_L09_READER;
GRANT ROLE SNOW_LABS_L09_READER TO ROLE ACCOUNTADMIN;
GRANT USAGE ON WAREHOUSE ${labWh} TO ROLE SNOW_LABS_L09_READER;
GRANT USAGE ON DATABASE ${labDb} TO ROLE SNOW_LABS_L09_READER;
GRANT USAGE ON SCHEMA ${labDb}.L09_SECURITY TO ROLE SNOW_LABS_L09_READER;
GRANT SELECT ON TABLE employee TO ROLE SNOW_LABS_L09_READER;
SHOW GRANTS TO ROLE SNOW_LABS_L09_READER;`,
        '可见仓库、数据库、Schema 的 USAGE 和表 SELECT。', '仅在专用试用账户使用这个角色名，避免与已有角色重名。'),
      sql('应用策略并切换角色', '管理员先读明文，再用只读角色读取。若版本不支持 masking policy，跳过前三条语句，仍可切换角色验证 RBAC 授权链。',
        `CREATE MASKING POLICY email_mask AS (v VARCHAR) RETURNS VARCHAR ->
  CASE WHEN CURRENT_ROLE() = 'ACCOUNTADMIN' THEN v ELSE '***' END;
ALTER TABLE employee MODIFY COLUMN email SET MASKING POLICY email_mask;
SELECT CURRENT_ROLE(), email FROM employee;
USE ROLE SNOW_LABS_L09_READER;
USE SECONDARY ROLES NONE;
USE WAREHOUSE ${labWh};
SELECT CURRENT_ROLE(), email FROM ${labDb}.L09_SECURITY.employee;
USE ROLE ACCOUNTADMIN;`,
        '管理员看到 sample@example.com，读者看到 ***。无 Enterprise 的 RBAC 分支中，读者可以查询且仍看到明文。', '若查询报权限错误，分层核对三项 USAGE 与 SELECT。若要重跑策略步骤，先清理整个实验。'),
      cleanup('L09_SECURITY', 'DROP ROLE IF EXISTS SNOW_LABS_L09_READER;\n'),
    ],
  },
  {
    id: 'streams-tasks', level: '高级', title: '用 Stream 和 Task 消费增量', minutes: 35,
    outcome: '观察 CDC、运行一次异步任务，并证明空增量不会造成重复写入。',
    requires: '熟悉 DML 与仓库，使用个人试用账户的 ACCOUNTADMIN。',
    prerequisite: 'sql-foundations',
    sources: [material('snoflake practical sql files/steams.sql'), doc('手动执行 Task', 'sql-reference/sql/execute-task')],
    steps: [
      setup('L10_CDC'),
      sql('捕获追加事件', '在空源表上创建 append-only Stream，再插入两条事件。先查询 Stream 验证读取不会消费偏移。',
        `CREATE OR REPLACE TABLE raw_events(id INT, detail VARCHAR);
CREATE OR REPLACE TABLE clean_events(id INT, detail VARCHAR);
CREATE OR REPLACE STREAM event_delta ON TABLE raw_events APPEND_ONLY=TRUE;
INSERT INTO raw_events VALUES (1,'NEW'),(2,'PAID');
SELECT id, METADATA$ACTION FROM event_delta ORDER BY id;
SELECT COUNT(*) FROM event_delta;`,
        '两个 INSERT，第二次检查依然为 2。', '创建 Stream 的顺序必须早于 INSERT。'),
      sql('创建仅手动运行的 Task', '运行后保留任务默认挂起状态。没有定时调度，手动执行即可。',
        `CREATE OR REPLACE TASK apply_delta WAREHOUSE=${labWh}
  WHEN SYSTEM$STREAM_HAS_DATA('EVENT_DELTA')
  AS INSERT INTO clean_events SELECT id, detail FROM event_delta;
EXECUTE TASK apply_delta;`,
        'EXECUTE TASK 受理执行请求。', '若执行权限不足，检查任务所有者的全局 EXECUTE TASK 权限与仓库 USAGE。'),
      sql('等候、核对并重放', '每隔数秒重跑查询，待任务成功后再执行一次 EXECUTE TASK apply_delta，并重复检查。',
        `SELECT name, state, error_message
FROM TABLE(INFORMATION_SCHEMA.TASK_HISTORY(TASK_NAME=>'APPLY_DELTA', RESULT_LIMIT=>10))
ORDER BY scheduled_time DESC;
SELECT COUNT(*) AS CONSUMED FROM clean_events;
SELECT COUNT(*) AS PENDING FROM event_delta;`,
        '首跑 SUCCEEDED、CONSUMED=2、PENDING=0。第二次没有新事件，通常显示 SKIPPED，目标仍是 2。', '状态有延迟，先检查历史是否 FAILED。不要在任务仍执行时重复提交。'),
      cleanup('L10_CDC'),
    ],
  },
  {
    id: 'orders-capstone', level: '高级', title: '综合项目：订单到每日销售报表', minutes: 45,
    outcome: '从样例订单 CSV 构建可重放的两日批处理，验证动态表刷新后与原始层对账。',
    requires: '完成 CSV 和增量装载 Lab。', prerequisite: 'incremental-copy', sources: [material('orders_20260601.csv'), material('orders_20260602.csv'), doc('动态表 TARGET_LAG', 'user-guide/dynamic-tables/target-lag')],
    steps: [
      setup('L11_CAPSTONE'),
      sql('准备订单原始层', '将五列订单 CSV 按文件顺序对应到目标表。另一日批先上传，稍后再装载。',
        `${csvFormat}
CREATE OR REPLACE STAGE intake FILE_FORMAT=(FORMAT_NAME='CSV_HEADER');
CREATE OR REPLACE TABLE raw_orders(order_id INT, customer_id INT, product VARCHAR, amount NUMBER(12,2), order_date DATE);`,
        'RAW_ORDERS 初始为空。', '保留每个批次原始文件名，便于查找 COPY 结果。'),
      upload('L11_CAPSTONE.INTAKE', 'orders_20260601.csv', 'orders_20260602.csv'),
      sql('装载首日并建立报表', '使用手动刷新的叶子动态表，试用时不会持续调度。ON_CREATE 会等到首轮初始化结束。',
        `COPY INTO raw_orders FROM @intake FILES=('orders_20260601.csv');
CREATE OR REPLACE DYNAMIC TABLE daily_sales
  TARGET_LAG=DOWNSTREAM WAREHOUSE=${labWh} INITIALIZE=ON_CREATE
  AS SELECT order_date, COUNT(*) AS order_count, SUM(amount) AS revenue
    FROM raw_orders GROUP BY order_date;
SELECT * FROM daily_sales ORDER BY order_date;`,
        '只有 2026-06-01 一行，3 单，营收 57000。', '初始化报错时核对仓库、数据库及角色。如果账户不支持动态表，可改成普通 VIEW 并跳过刷新指令，继续完成对账。'),
      sql('重放、刷新和对账', '执行两次第二日 COPY，再手动刷新。核对源表和报表金额，若刷新尚未完成，稍后重跑 SELECT。',
        `COPY INTO raw_orders FROM @intake FILES=('orders_20260602.csv');
COPY INTO raw_orders FROM @intake FILES=('orders_20260602.csv');
ALTER DYNAMIC TABLE daily_sales REFRESH;
SELECT * FROM daily_sales ORDER BY order_date;
SELECT (SELECT COUNT(DISTINCT order_id) FROM raw_orders) AS UNIQUE_ORDERS,
       (SELECT SUM(amount) FROM raw_orders) AS RAW_TOTAL,
       (SELECT SUM(revenue) FROM daily_sales) AS REPORT_TOTAL;`,
        '两天各 3 单，营收 57000 和 23500。UNIQUE_ORDERS=6，RAW_TOTAL 与 REPORT_TOTAL 都等于 80500。', '若只有首日，核对第二日 COPY 的文件名和结果，再在 Snowsight 查看动态表刷新历史。'),
      cleanup('L11_CAPSTONE'),
    ],
  },
  {
    id: 'aws-s3-stage', level: '选修', title: 'AWS S3 与外部 Stage', minutes: 45,
    outcome: '通过 Snowflake Storage Integration 和只读 IAM Role，从私有 S3 装载 3 条客户记录。',
    requires: '已配置 Snowflake 试用账户。另需有权管理 S3 bucket、IAM policy 和 role 的 AWS 练习账户；AWS 可能收费。',
    prerequisite: 'trial',
    sources: [material('AWS S3 TO SNOWFLAKE TABLE COPY.txt'), doc('配置 S3 Storage Integration', 'user-guide/data-load-s3-config-storage-integration')],
    steps: [
      setup('L12_S3'),
      { title: '创建私有练习 bucket', action: '在 AWS S3 控制台创建只用于本课程的 bucket（全局唯一名称）。保持 Block Public Access 全部开启，使用 SSE-S3。在 snow-labs/manual/ 路径上传下面的 CSV。记录 bucket 名称，后续把 MY_LAB_BUCKET 替换成该名称。', files: [download('customer_01.csv')], expected: '对象键为 snow-labs/manual/customer_01.csv，公共访问仍处于阻止状态。', troubleshooting: '在存储桶中逐层进入 snow-labs 和 manual 后再上传。若后续要做 Snowpipe，请使用可以配置 S3 事件通知的 bucket。' },
      { title: '创建限定范围的 IAM Role', action: '在 IAM → Policies → Create policy 的 JSON 编辑器中粘贴下方策略并替换 bucket 名。再到 IAM → Roles 创建角色，选择 AWS account → This account，附上这条策略。保存角色 ARN，后面会把信任关系改成 Snowflake 指定的身份。',
        json: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            { Effect: 'Allow', Action: 's3:GetBucketLocation', Resource: 'arn:aws:s3:::MY_LAB_BUCKET' },
            { Effect: 'Allow', Action: 's3:ListBucket', Resource: 'arn:aws:s3:::MY_LAB_BUCKET',
              Condition: { StringLike: { 's3:prefix': ['snow-labs', 'snow-labs/*'] } } },
            { Effect: 'Allow', Action: ['s3:GetObject', 's3:GetObjectVersion'], Resource: 'arn:aws:s3:::MY_LAB_BUCKET/snow-labs/*' },
          ],
        }, null, 2),
        expected: '角色 ARN 类似 arn:aws:iam::123456789012:role/snow-labs-reader，权限策略仅覆盖练习 bucket。', troubleshooting: '若控制台要求指定外部 ID，先使用占位值，稍后更新。Bucket ARN 和 object ARN 是两种不同资源。' },
      sql('创建 Storage Integration', '替换 MY_LAB_ROLE_ARN 和 MY_LAB_BUCKET 后运行，保留现有集成以免重跑时更换 External ID。',
        `CREATE STORAGE INTEGRATION IF NOT EXISTS SNOW_LABS_L12_S3_INT
  TYPE=EXTERNAL_STAGE STORAGE_PROVIDER='S3' ENABLED=TRUE
  STORAGE_AWS_ROLE_ARN='MY_LAB_ROLE_ARN'
  STORAGE_ALLOWED_LOCATIONS=('s3://MY_LAB_BUCKET/snow-labs/');
DESC INTEGRATION SNOW_LABS_L12_S3_INT;`,
        '输出 STORAGE_AWS_IAM_USER_ARN 和 STORAGE_AWS_EXTERNAL_ID。', '将这两项用于 AWS 信任策略。若需换 bucket 或 role，在清理旧集成后再创建。'),
      { title: '更新 IAM 信任策略', action: '在该课程专用 IAM Role 的 Trust relationships → Edit trust policy 中，用下方 JSON 替换初始信任策略。将两个占位值替换成 DESC INTEGRATION 返回的实际值，保存后等待 IAM 权限生效。',
        json: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Principal: { AWS: 'REPLACE_STORAGE_AWS_IAM_USER_ARN' }, Action: 'sts:AssumeRole',
            Condition: { StringEquals: { 'sts:ExternalId': 'REPLACE_STORAGE_AWS_EXTERNAL_ID' } } }],
        }, null, 2),
        expected: '信任策略精准匹配 Snowflake 托管 IAM principal 与 external ID。', troubleshooting: 'AssumeRole 失败时核对两个值是否来自同一个 Integration。保留 bucket 公共访问阻止设置。' },
      sql('建立 Stage 并验证 COPY', '替换 bucket 名，先执行 LIST 检查可读，再执行 COPY。',
        `${csvFormat}
CREATE OR REPLACE STAGE s3_manual URL='s3://MY_LAB_BUCKET/snow-labs/manual/'
  STORAGE_INTEGRATION=SNOW_LABS_L12_S3_INT
  FILE_FORMAT=(FORMAT_NAME='CSV_HEADER');
LIST @s3_manual;
CREATE OR REPLACE TABLE customers(customer_id INT, customer_name VARCHAR, city VARCHAR);
COPY INTO customers FROM @s3_manual FILES=('customer_01.csv');
SELECT COUNT(*) AS TOTAL FROM customers;`,
        'LIST 中有 1 个文件，TOTAL=3。', 'LIST 报 403 时核对信任策略、ListBucket 前缀与 GetObject 资源。LIST 为空时检查实际对象键和 URL 尾部斜杠。'),
      cleanup('L12_S3'),
      { title: '决定是否保留 AWS 连接', action: '若继续自动 Snowpipe 或外部表，保留 S3 bucket、IAM Role 和 SNOW_LABS_L12_S3_INT。全部 AWS Lab 做完后，在 Snowflake 执行 DROP INTEGRATION IF EXISTS SNOW_LABS_L12_S3_INT;，再从 AWS 删除本 Lab 的 S3 通知、样例对象、bucket 及专用 IAM Role 和 policy。只删除自己为本课程创建的资源。', expected: '继续时，下游 Lab 可以复用集成。退役时，Snowflake 中没有该 Integration，AWS 中没有专用练习资源。', troubleshooting: '集成仍被用到时，先完成 L13 与 L14 清理。若 bucket 开启了版本控制，删除 bucket 前要在 AWS 控制台清空对象版本及删除标记。' },
    ],
  },
  {
    id: 'auto-snowpipe', level: '选修', title: '自动 Snowpipe：让 S3 事件触发装载', minutes: 40,
    outcome: '上传新文件后由 S3 事件驱动 Snowpipe，使用运行状态和 COPY_HISTORY 验证入表。',
    requires: '已完成 AWS S3 Lab，并保留 Storage Integration、IAM Role、bucket。能编辑该 bucket 的事件通知。',
    prerequisite: 'aws-s3-stage',
    sources: [material('SNOWPIPE PRACTICAL.txt'), material('snowpipe monitoring.sql'), doc('Amazon S3 自动 Snowpipe', 'user-guide/data-load-snowpipe-auto-s3')],
    steps: [
      setup('L13_PIPE'),
      sql('创建独立 Stage、目标和 Pipe', '替换 bucket 名称。先创建 Pipe 和事件通知，再上传测试文件。练习使用独立 pipe/ 前缀。',
        `${csvFormat}
CREATE OR REPLACE STAGE s3_pipe URL='s3://MY_LAB_BUCKET/snow-labs/pipe/'
  STORAGE_INTEGRATION=SNOW_LABS_L12_S3_INT
  FILE_FORMAT=(FORMAT_NAME='CSV_HEADER');
CREATE OR REPLACE TABLE pipe_customers(customer_id INT, customer_name VARCHAR, city VARCHAR);
CREATE OR REPLACE PIPE customer_pipe AUTO_INGEST=TRUE
  AS COPY INTO pipe_customers FROM @s3_pipe;
SHOW PIPES LIKE 'CUSTOMER_PIPE';`,
        'notification_channel 字段包含 Snowflake 管理的 SQS ARN。', '若找不到集成，先完成 AWS S3 Lab 的集成步骤。重做前先移除上一次的事件通知。'),
      { title: '连接 S3 事件通知', action: '在专用 bucket 的 Properties → Event notifications → Create event notification，填练习名称，Prefix 为 snow-labs/pipe/，Suffix 为 .csv，Events 选 All object create events，Destination 选 SQS queue 并粘贴 Snowflake 返回的 notification_channel ARN。保存。', expected: 'S3 控制台显示对应事件通知，目标 ARN 与 SHOW PIPES 一致。', troubleshooting: '若 AWS 拒绝目的地，先核对 queue 与 bucket 区域、队列 ARN 和现有通知的前缀冲突。若需要在有既有通知的 bucket 上继续，参照官方文档的 SNS 方案。' },
      { title: '触发真实事件', action: '事件通知保存后，把下面的文件上传到 snow-labs/pipe/。重跑时先完成清理，再重新上传。', files: [download('customer_02.csv')], expected: 'S3 中出现 snow-labs/pipe/customer_02.csv。稍后 Snowpipe 把 3 行写进目标表。', troubleshooting: '通知保存之前的历史对象不会凭空生成事件。若文件之前已存在，请在本 Lab 清理后重新上传。测试自动链路时避免先手动 COPY 或 REFRESH。' },
      sql('核对状态、历史和业务数据', '上传后在同一个 Worksheet 运行，等待数分钟后可重复查询。',
        `SELECT SYSTEM$PIPE_STATUS('${labDb}.L13_PIPE.CUSTOMER_PIPE');
SELECT file_name, status, row_count, first_error_message
FROM TABLE(INFORMATION_SCHEMA.COPY_HISTORY(
  TABLE_NAME=>'PIPE_CUSTOMERS', START_TIME=>DATEADD('hour',-1,CURRENT_TIMESTAMP())));
SELECT COUNT(*) AS TOTAL, MIN(customer_id), MAX(customer_id) FROM pipe_customers;`,
        'COPY_HISTORY 显示文件已加载；TOTAL=3，ID 范围为 104–106。', 'LIST @s3_pipe 有文件但无装载历史时，查 PIPE_STATUS 的消息接收时间，复核 S3 通知前缀、后缀和 ARN。若 COPY_HISTORY 有错误，先检查文件格式和列顺序。'),
      { title: '停止事件并清理 S3 路径', action: '在 AWS 控制台删除本 Lab 新建的 S3 通知，再删除 snow-labs/pipe/ 下的样例文件。之后清理 Snowflake Schema。', expected: 'S3 中已无这条通知和本 Lab 的测试文件。', troubleshooting: '保留其他规则与公共访问阻止设置。AWS 保留对象版本时按需清除实验文件版本。' },
      cleanup('L13_PIPE', 'DROP PIPE IF EXISTS SNOW_LABS_TRAINING.L13_PIPE.CUSTOMER_PIPE;\n'),
    ],
  },
  {
    id: 'external-tables', level: '选修', title: '外部表：在 S3 上查询与刷新元数据', minutes: 35,
    outcome: '直接查询两个订单文件，观察上传前后与手动 REFRESH 后的行数变化。',
    requires: '已完成 AWS S3 Lab，并保留只读 Integration 和 bucket。无需配置 Snowpipe。',
    prerequisite: 'aws-s3-stage',
    sources: [material('snoflake practical sql files/EXTERNAL TABLE.sql'), doc('CREATE EXTERNAL TABLE', 'sql-reference/sql/create-external-table')],
    steps: [
      setup('L14_EXTERNAL'),
      { title: '上传首批订单', action: '在专用 bucket 的 snow-labs/external/ 路径只上传首日订单文件。重跑前移除上一轮两个实验对象。', files: [download('orders_20260601.csv')], expected: '该路径只有首日文件。', troubleshooting: '如果未刷新时行数已经是 6，请检查上一轮第二日文件是否仍在 S3 中。' },
      sql('创建外部表并登记首批文件', '替换 bucket 名，创建 Stage 与外部表。VALUE:cN 映射 CSV 的位置列；FILE_NAME 用于对账。',
        `${csvFormat}
CREATE OR REPLACE STAGE s3_external URL='s3://MY_LAB_BUCKET/snow-labs/external/'
  STORAGE_INTEGRATION=SNOW_LABS_L12_S3_INT;
CREATE OR REPLACE EXTERNAL TABLE ext_orders(
  order_id NUMBER AS (VALUE:c1::NUMBER),
  amount NUMBER(12,2) AS (VALUE:c4::NUMBER(12,2)),
  file_name VARCHAR AS (METADATA$FILENAME)
)
  LOCATION=@s3_external
  AUTO_REFRESH=FALSE REFRESH_ON_CREATE=TRUE
  FILE_FORMAT=(FORMAT_NAME='CSV_HEADER');
SELECT COUNT(*) AS TOTAL, SUM(amount) AS REVENUE FROM ext_orders;`,
        'TOTAL=3，REVENUE=57000。', '若无记录，LIST @s3_external 核对路径，再运行 ALTER EXTERNAL TABLE ext_orders REFRESH。'),
      { title: '追加第二批，再看刷新前结果', action: '上传第二日文件到同一个 S3 路径。回到 Worksheet 运行 LIST @s3_external; 与 SELECT COUNT(*) FROM ext_orders;。', files: [download('orders_20260602.csv')], expected: 'LIST 看到两个文件，外部表仍只有 3 行。', troubleshooting: '外部表的 AUTO_REFRESH 必须为 FALSE，且还没有执行手动 REFRESH。' },
      sql('刷新元数据并对账', '手动登记新增文件，按文件核对各批次行数和金额。',
        `ALTER EXTERNAL TABLE ext_orders REFRESH;
SELECT file_name, COUNT(*) AS TOTAL, SUM(amount) AS REVENUE
FROM ext_orders GROUP BY file_name ORDER BY file_name;
SELECT COUNT(*) AS TOTAL, SUM(amount) AS REVENUE FROM ext_orders;`,
        '两份文件各 3 行；TOTAL=6，REVENUE=80500。', '文件出现在 LIST 但刷新后仍没有数据时，检查文件路径、格式和 IAM 的对象读取权限。'),
      cleanup('L14_EXTERNAL'),
      { title: '清理外部样例文件', action: '在 S3 删除 snow-labs/external/ 内的两份订单文件。若 AWS Lab 已全部完成，回到 S3 Lab 的最终步骤清理共享连接。', expected: '练习前缀中不再有这两份文件。', troubleshooting: '删除 Snowflake 外部表只移除 Snowflake 中的对象，S3 端文件要单独清理。' },
    ],
  },
];
