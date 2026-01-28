/*!
 * Copyright (c) 2026 AI Venture Holdings LLC
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

//! Database operations for HRM AI agent management

use crate::agent::{Agent, AgentDeployment, AgentStatus};
use crate::types::{AgentId, DeploymentStatus, ServerId};
use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::{Pool, Postgres, Row};
use std::collections::HashMap;

/// Database connection manager
pub struct DatabaseConnection {
    pool: Pool<Postgres>,
}

impl DatabaseConnection {
    /// Create new database connection
    pub async fn new(database_url: &str) -> Result<Self, sqlx::Error> {
        let pool = sqlx::postgres::PgPoolOptions::new()
            .max_connections(5)
            .connect(database_url)
            .await?;

        Ok(Self { pool })
    }

    /// Initialize database schema
    pub async fn initialize_schema(&self) -> Result<(), sqlx::Error> {
        // Create agents table
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS agents (
                id UUID PRIMARY KEY,
                name TEXT NOT NULL,
                agent_type TEXT NOT NULL,
                capabilities TEXT[] NOT NULL,
                deployed_to TEXT NULL,
                status TEXT NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                last_activity TIMESTAMPTZ NULL,
                metadata JSONB NOT NULL DEFAULT '{}'
            )
            "#,
        )
        .execute(&self.pool)
        .await?;

        // Create agent_deployments table
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS agent_deployments (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                agent_id UUID NOT NULL REFERENCES agents(id),
                server_id TEXT NOT NULL,
                status TEXT NOT NULL,
                deployment_config JSONB NOT NULL,
                deployed_at TIMESTAMPTZ NULL,
                last_heartbeat TIMESTAMPTZ NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
            "#,
        )
        .execute(&self.pool)
        .await?;

        // Create indexes for performance
        sqlx::query("CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status)")
            .execute(&self.pool)
            .await?;

        sqlx::query("CREATE INDEX IF NOT EXISTS idx_agents_deployed_to ON agents(deployed_to)")
            .execute(&self.pool)
            .await?;

        sqlx::query("CREATE INDEX IF NOT EXISTS idx_deployments_agent_id ON agent_deployments(agent_id)")
            .execute(&self.pool)
            .await?;

        Ok(())
    }
}

/// Repository for agent database operations
#[async_trait]
pub trait AgentRepository {
    async fn create_agent(&self, agent: &Agent) -> Result<(), DatabaseError>;
    async fn get_agent(&self, id: &AgentId) -> Result<Option<Agent>, DatabaseError>;
    async fn update_agent_status(&self, id: &AgentId, status: AgentStatus) -> Result<(), DatabaseError>;
    async fn deploy_agent(&self, deployment: &AgentDeployment) -> Result<(), DatabaseError>;
    async fn get_agent_by_server(&self, server_id: &ServerId) -> Result<Vec<Agent>, DatabaseError>;
    async fn list_available_agents(&self) -> Result<Vec<Agent>, DatabaseError>;
    async fn get_deployment_status(&self, agent_id: &AgentId) -> Result<Option<DeploymentStatus>, DatabaseError>;
}

/// Database agent repository implementation
pub struct PostgresAgentRepository {
    db: DatabaseConnection,
}

impl PostgresAgentRepository {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }
}

#[async_trait]
impl AgentRepository for PostgresAgentRepository {
    async fn create_agent(&self, agent: &Agent) -> Result<(), DatabaseError> {
        let agent_type_str = format!("{:?}", agent.agent_type);
        let status_str = format!("{:?}", agent.status);
        let metadata_json = serde_json::to_value(&agent.metadata)
            .map_err(|e| DatabaseError::Serialization(e.to_string()))?;

        sqlx::query(
            r#"
            INSERT INTO agents (id, name, agent_type, capabilities, deployed_to, status, created_at, last_activity, metadata)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            "#,
        )
        .bind(agent.id.0)
        .bind(&agent.name)
        .bind(agent_type_str)
        .bind(&agent.capabilities)
        .bind(agent.deployed_to.as_ref().map(|s| &s.0))
        .bind(status_str)
        .bind(agent.created_at)
        .bind(agent.last_activity)
        .bind(metadata_json)
        .execute(&self.db.pool)
        .await
        .map_err(DatabaseError::Query)?;

        Ok(())
    }

    async fn get_agent(&self, id: &AgentId) -> Result<Option<Agent>, DatabaseError> {
        let row = sqlx::query("SELECT * FROM agents WHERE id = $1")
            .bind(id.0)
            .fetch_optional(&self.db.pool)
            .await
            .map_err(DatabaseError::Query)?;

        match row {
            Some(row) => {
                let agent = row_to_agent(row)?;
                Ok(Some(agent))
            }
            None => Ok(None),
        }
    }

    async fn update_agent_status(&self, id: &AgentId, status: AgentStatus) -> Result<(), DatabaseError> {
        let status_str = match status {
            AgentStatus::Available => "Available",
            AgentStatus::Deployed => "Deployed",
            AgentStatus::Deploying => "Deploying",
            AgentStatus::Terminated => "Terminated",
            AgentStatus::Error(_) => "Error",
        };

        sqlx::query(
            "UPDATE agents SET status = $1, last_activity = NOW() WHERE id = $2"
        )
        .bind(status_str)
        .bind(id.0)
        .execute(&self.db.pool)
        .await
        .map_err(DatabaseError::Query)?;

        Ok(())
    }

    async fn deploy_agent(&self, deployment: &AgentDeployment) -> Result<(), DatabaseError> {
        let config_json = serde_json::to_value(&deployment.deployment_config)
            .map_err(|e| DatabaseError::Serialization(e.to_string()))?;

        // Insert deployment record
        sqlx::query(
            r#"
            INSERT INTO agent_deployments (agent_id, server_id, status, deployment_config, deployed_at, last_heartbeat)
            VALUES ($1, $2, $3, $4, $5, $6)
            "#,
        )
        .bind(deployment.agent_id.0)
        .bind(&deployment.server_id.0)
        .bind(format!("{:?}", deployment.status))
        .bind(config_json)
        .bind(deployment.deployed_at)
        .bind(deployment.last_heartbeat)
        .execute(&self.db.pool)
        .await
        .map_err(DatabaseError::Query)?;

        // Update agent status to Hired/Deployed
        self.update_agent_status(&deployment.agent_id, AgentStatus::Deployed).await?;

        // Update agent deployed_to field
        sqlx::query("UPDATE agents SET deployed_to = $1 WHERE id = $2")
            .bind(&deployment.server_id.0)
            .bind(deployment.agent_id.0)
            .execute(&self.db.pool)
            .await
            .map_err(DatabaseError::Query)?;

        Ok(())
    }

    async fn get_agent_by_server(&self, server_id: &ServerId) -> Result<Vec<Agent>, DatabaseError> {
        let rows = sqlx::query("SELECT * FROM agents WHERE deployed_to = $1")
            .bind(&server_id.0)
            .fetch_all(&self.db.pool)
            .await
            .map_err(DatabaseError::Query)?;

        let agents: Result<Vec<Agent>, DatabaseError> = rows
            .into_iter()
            .map(row_to_agent)
            .collect();

        agents
    }

    async fn list_available_agents(&self) -> Result<Vec<Agent>, DatabaseError> {
        let rows = sqlx::query("SELECT * FROM agents WHERE status = 'Available'")
            .fetch_all(&self.db.pool)
            .await
            .map_err(DatabaseError::Query)?;

        let agents: Result<Vec<Agent>, DatabaseError> = rows
            .into_iter()
            .map(row_to_agent)
            .collect();

        agents
    }

    async fn get_deployment_status(&self, agent_id: &AgentId) -> Result<Option<DeploymentStatus>, DatabaseError> {
        let row = sqlx::query(
            "SELECT status FROM agent_deployments WHERE agent_id = $1 ORDER BY created_at DESC LIMIT 1"
        )
        .bind(agent_id.0)
        .fetch_optional(&self.db.pool)
        .await
        .map_err(DatabaseError::Query)?;

        match row {
            Some(row) => {
                let status_str: String = row.try_get("status").map_err(DatabaseError::Query)?;
                let status = match status_str.as_str() {
                    "Hired" => DeploymentStatus::Hired,
                    "Deploying" => DeploymentStatus::Deploying,
                    "Failed" => DeploymentStatus::Failed,
                    "Fired" => DeploymentStatus::Fired,
                    _ => DeploymentStatus::Failed,
                };
                Ok(Some(status))
            }
            None => Ok(None),
        }
    }
}

/// Convert database row to Agent struct
fn row_to_agent(row: sqlx::postgres::PgRow) -> Result<Agent, DatabaseError> {
    use crate::types::AgentType;

    let id_uuid: uuid::Uuid = row.try_get("id").map_err(DatabaseError::Query)?;
    let agent_id = AgentId(id_uuid);

    let name: String = row.try_get("name").map_err(DatabaseError::Query)?;
    let agent_type_str: String = row.try_get("agent_type").map_err(DatabaseError::Query)?;
    let capabilities: Vec<String> = row.try_get("capabilities").map_err(DatabaseError::Query)?;
    let deployed_to: Option<String> = row.try_get("deployed_to").map_err(DatabaseError::Query)?;
    let status_str: String = row.try_get("status").map_err(DatabaseError::Query)?;
    let created_at: DateTime<Utc> = row.try_get("created_at").map_err(DatabaseError::Query)?;
    let last_activity: Option<DateTime<Utc>> = row.try_get("last_activity").map_err(DatabaseError::Query)?;
    let metadata_json: serde_json::Value = row.try_get("metadata").map_err(DatabaseError::Query)?;

    // Parse agent type
    let agent_type = match agent_type_str.as_str() {
        "SysAdmin" => AgentType::SysAdmin,
        "DevOps" => AgentType::DevOps,
        "Security" => AgentType::Security,
        "Database" => AgentType::Database,
        "Network" => AgentType::Network,
        custom => AgentType::Custom(custom.to_string()),
    };

    // Parse status
    let status = match status_str.as_str() {
        "Available" => AgentStatus::Available,
        "Deployed" => AgentStatus::Deployed,
        "Deploying" => AgentStatus::Deploying,
        "Terminated" => AgentStatus::Terminated,
        error => AgentStatus::Error(error.to_string()),
    };

    // Parse metadata
    let metadata: HashMap<String, String> = serde_json::from_value(metadata_json)
        .map_err(|e| DatabaseError::Serialization(e.to_string()))?;

    Ok(Agent {
        id: agent_id,
        name,
        agent_type,
        capabilities,
        deployed_to: deployed_to.map(ServerId),
        status,
        created_at,
        last_activity,
        metadata,
    })
}

/// Database operation errors
#[derive(Debug, thiserror::Error)]
pub enum DatabaseError {
    #[error("Database query error: {0}")]
    Query(sqlx::Error),

    #[error("Serialization error: {0}")]
    Serialization(String),

    #[error("Connection error: {0}")]
    Connection(String),
}