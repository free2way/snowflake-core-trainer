import { Module, ModuleId } from './types';

export const CURRICULUM: Module[] = [
  {
    id: ModuleId.INTRO,
    title: 'Snowflake Overview',
    icon: 'Snowflake',
    description: 'Cloud data platform concepts, editions, and ecosystem.',
    topics: [
      {
        id: 'editions',
        title: 'Snowflake Editions',
        description: 'Differences between Standard, Enterprise, Business Critical, and VPS.',
        keyPoints: [
          'Standard: Base SQL, Time Travel (1 day).',
          'Enterprise: Multi-cluster warehouses, 90-day Time Travel, Materialized Views.',
          'Business Critical: PrivateLink, PHI/HIPAA compliance, Database Failover.',
          'VPS: Dedicated metadata store and compute.'
        ]
      },
      {
        id: 'cloud-platforms',
        title: 'Cloud Agnostic',
        description: 'Supported cloud providers and regions.',
        keyPoints: ['AWS', 'Azure', 'GCP', 'Cross-cloud replication support.']
      }
    ]
  },
  {
    id: ModuleId.ARCH,
    title: 'Architecture',
    icon: 'Layers',
    description: 'The three unique layers of Snowflake architecture.',
    topics: [
      {
        id: 'storage',
        title: 'Database Storage',
        description: 'Centralized, hybrid columnar storage.',
        keyPoints: ['Micro-partitions', 'Immutable files (S3/Blob)', 'Automatic compression.']
      },
      {
        id: 'compute',
        title: 'Query Processing',
        description: 'Virtual Warehouses (MPP compute clusters).',
        keyPoints: ['Independent scaling', 'No contention with storage', 'Cache usage (Local Disk).']
      },
      {
        id: 'services',
        title: 'Cloud Services',
        description: 'The "Brain" of Snowflake.',
        keyPoints: ['Metadata management', 'Authentication/Authorization', 'Optimizer', 'Transaction management.']
      }
    ]
  },
  {
    id: ModuleId.ACCOUNT,
    title: 'Account & Security',
    icon: 'Shield',
    description: 'RBAC, MFA, Network Policies, and Data Governance.',
    topics: [
      {
        id: 'rbac',
        title: 'RBAC Model',
        description: 'Role Based Access Control hierarchy.',
        keyPoints: ['System roles: ACCOUNTADMIN, SECURITYADMIN, USERADMIN, SYSADMIN, PUBLIC.', 'Granting privileges to roles, not users.']
      },
      {
        id: 'network',
        title: 'Network Security',
        description: 'Controlling access via IP.',
        keyPoints: ['Network Policies (Allow/Block lists)', 'Account-level vs User-level policies.']
      }
    ]
  },
  {
    id: ModuleId.WAREHOUSE,
    title: 'Virtual Warehouses',
    icon: 'Cpu',
    description: 'Compute sizing, credit usage, and scaling.',
    topics: [
      {
        id: 'sizing',
        title: 'Warehouse Sizing',
        description: 'T-shirt sizes (XS to 6XL).',
        keyPoints: ['XS = 1 credit/hr', 'Doubles each size up', 'Linear performance scaling.']
      },
      {
        id: 'properties',
        title: 'Key Properties',
        description: 'Configuration for cost and performance.',
        keyPoints: ['AUTO_SUSPEND', 'AUTO_RESUME', 'SCALING_POLICY (Standard vs Economy).']
      },
      {
        id: 'multi-cluster',
        title: 'Multi-cluster Warehouses',
        description: 'Handling concurrency.',
        keyPoints: ['Enterprise Edition+', 'Max/Min clusters', 'Scaling mode: Auto-scale vs Maximized.']
      }
    ]
  },
  {
    id: ModuleId.DATA_MOVEMENT,
    title: 'Data Movement',
    icon: 'ArrowRightLeft',
    description: 'Ingestion, Export, and Stages.',
    topics: [
      {
        id: 'stages',
        title: 'Stages',
        description: 'Locations where data files are stored.',
        keyPoints: ['Internal: User, Table, Named.', 'External: S3, Azure Blob, GCS.']
      },
      {
        id: 'loading',
        title: 'Loading Data',
        description: 'Methods to get data in.',
        keyPoints: ['COPY INTO (Bulk)', 'Snowpipe (Continuous/Event-based)', 'INSERT / REST API.']
      },
      {
        id: 'formats',
        title: 'File Formats',
        description: 'Supported structural formats.',
        keyPoints: ['CSV, JSON, Avro, Orc, Parquet, XML.']
      }
    ]
  },
  {
    id: ModuleId.PERFORMANCE,
    title: 'Performance',
    icon: 'Zap',
    description: 'Optimization techniques and caching.',
    topics: [
      {
        id: 'caching',
        title: 'Caching Layers',
        description: 'Where Snowflake stores results.',
        keyPoints: ['Result Cache (24hrs)', 'Local Disk Cache (Warehouse SSD)', 'Remote Disk (Storage).']
      },
      {
        id: 'clustering',
        title: 'Clustering',
        description: 'Organizing micro-partitions.',
        keyPoints: ['Natural ingestion order', 'Automatic Clustering service (Re-clustering).', 'Cluster Keys.']
      }
    ]
  },
  {
    id: ModuleId.STORAGE,
    title: 'Storage & Protection',
    icon: 'Database',
    description: 'CDP, Time Travel, and Cloning.',
    topics: [
      {
        id: 'timetravel',
        title: 'Time Travel',
        description: 'Accessing historical data.',
        keyPoints: ['Standard: 0-1 day', 'Enterprise: 0-90 days', 'UNDROP command.']
      },
      {
        id: 'failsafe',
        title: 'Fail-safe',
        description: 'Disaster recovery area.',
        keyPoints: ['7 days non-configurable', 'Only accessible by Snowflake support', 'After Time Travel ends.']
      },
      {
        id: 'cloning',
        title: 'Zero-Copy Cloning',
        description: 'Metadata-only duplication.',
        keyPoints: ['Fast and efficient', 'No storage cost initially', 'Independent changes after clone.']
      }
    ]
  }
];
