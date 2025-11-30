import { ModuleId, Module } from './types';

export const CURRICULUM: Module[] = [
  {
    id: ModuleId.INTRO,
    title: "Introduction to Snowflake",
    icon: "BookOpen",
    description: "Fundamentals and core concepts of Snowflake architecture",
    topics: [
      {
        id: "intro-overview",
        title: "Snowflake Overview",
        description: "Understanding what Snowflake is and its key features",
        keyPoints: [
          "Cloud-native data warehouse",
          "Separation of storage and compute",
          "Multi-cloud support (AWS, Azure, GCP)",
          "Zero maintenance and automatic scaling"
        ]
      },
      {
        id: "intro-key-features",
        title: "Key Features",
        description: "Core features that make Snowflake unique",
        keyPoints: [
          "Automatic scaling",
          "Data sharing and marketplace",
          "Time travel and zero-copy cloning",
          "Security and compliance"
        ]
      }
    ]
  },
  {
    id: ModuleId.ARCH,
    title: "Architecture",
    icon: "Building",
    description: "Deep dive into Snowflake's architecture and components",
    topics: [
      {
        id: "arch-cloud-services",
        title: "Cloud Services Layer",
        description: "Understanding the brain of Snowflake",
        keyPoints: [
          "Metadata management",
          "Query processing and optimization",
          "Security and authentication",
          "Resource management"
        ]
      },
      {
        id: "arch-storage",
        title: "Database Storage",
        description: "How Snowflake stores and manages data",
        keyPoints: [
          "Micro-partitions",
          "Columnar storage format",
          "Data clustering and pruning",
          "Immutable and compressed storage"
        ]
      },
      {
        id: "arch-compute",
        title: "Compute Layer (Virtual Warehouses)",
        description: "Understanding virtual warehouses for processing",
        keyPoints: [
          "Independent scaling of compute",
          "Multi-cluster architecture",
          "Resource isolation",
          "Billing based on usage"
        ]
      }
    ]
  },
  {
    id: ModuleId.ACCOUNT,
    title: "Account & Security",
    icon: "Shield",
    description: "Account management and security best practices",
    topics: [
      {
        id: "account-structure",
        title: "Account Structure",
        description: "Understanding account hierarchy and organization",
        keyPoints: [
          "Organizations and accounts",
          "Roles and role hierarchy",
          "Users and grants",
          "Account parameters"
        ]
      },
      {
        id: "security-auth",
        title: "Authentication & Authorization",
        description: "Security mechanisms and access control",
        keyPoints: [
          "Multi-factor authentication (MFA)",
          "Single sign-on (SSO) integration",
          "Role-based access control (RBAC)",
          "Object privileges and grant hierarchy"
        ]
      }
    ]
  },
  {
    id: ModuleId.WAREHOUSE,
    title: "Warehouses & Compute",
    icon: "Database",
    description: "Virtual warehouses and compute management",
    topics: [
      {
        id: "warehouse-types",
        title: "Warehouse Types and Sizes",
        description: "Different warehouse types and sizing strategies",
        keyPoints: [
          "Standard vs Enterprise vs Business Critical",
          "Warehouse size options (XS to 5XL)",
          "Auto-suspend and auto-resume",
          "Resource monitors for cost control"
        ]
      },
      {
        id: "warehouse-multicluster",
        title: "Multi-Cluster Warehouses",
        description: "Scaling compute resources dynamically",
        keyPoints: [
          "Concurrent scaling",
          "Min and max clusters",
          "Statement queues",
          "Workload isolation"
        ]
      }
    ]
  },
  {
    id: ModuleId.DATA_MOVEMENT,
    title: "Data Movement & Loading",
    icon: "Move",
    description: "Data ingestion, transformation, and loading strategies",
    topics: [
      {
        id: "data-loading",
        title: "Data Loading",
        description: "Various methods to load data into Snowflake",
        keyPoints: [
          "Bulk loading (COPY INTO)",
          "Continuous loading (Snowpipe)",
          "JSON and semi-structured data",
          "Data validation during loading"
        ]
      },
      {
        id: "data-unloading",
        title: "Data Unloading",
        description: "Exporting data from Snowflake",
        keyPoints: [
          "UNLOAD command",
          "Export formats (CSV, Parquet, JSON)",
          "Partitioning strategies",
          "Performance considerations"
        ]
      }
    ]
  },
  {
    id: ModuleId.PERFORMANCE,
    title: "Performance Optimization",
    icon: "Zap",
    description: "Query optimization and performance tuning",
    topics: [
      {
        id: "query-optimization",
        title: "Query Optimization",
        description: "Techniques for optimizing query performance",
        keyPoints: [
          "Query profiling and analysis",
          "Clustering and search optimization",
          "Join optimization strategies",
          "Materialized views and caching"
        ]
      },
      {
        id: "performance-monitoring",
        title: "Performance Monitoring",
        description: "Tools and techniques for monitoring performance",
        keyPoints: [
          "Query history and profiling",
          "Resource utilization metrics",
          "Query acceleration features",
          "Performance troubleshooting"
        ]
      }
    ]
  },
  {
    id: ModuleId.STORAGE,
    title: "Storage & Data Management",
    icon: "HardDrive",
    description: "Data storage optimization and management",
    topics: [
      {
        id: "storage-optimization",
        title: "Storage Optimization",
        description: "Managing and optimizing data storage",
        keyPoints: [
          "Table clustering",
          "Search optimization service",
          "Zero-copy cloning",
          "Time travel and fail-safe"
        ]
      },
      {
        id: "data-sharing",
        title: "Data Sharing",
        description: "Secure data sharing capabilities",
        keyPoints: [
          "Data marketplace",
          "Secure data sharing",
          "Data consumers vs providers",
          "Sharing constraints and limitations"
        ]
      }
    ]
  }
];
