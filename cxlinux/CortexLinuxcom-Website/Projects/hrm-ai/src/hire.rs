/*!
 * Copyright (c) 2026 AI Venture Holdings LLC
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

//! AI Agent hiring and deployment system

use crate::agent::{Agent, AgentDeployment, AgentError, DeploymentConfig};
use crate::database::{AgentRepository, DatabaseError};
use crate::theme::{CommandBlockRenderer, SovereignTheme};
use crate::types::{AgentId, AgentType, DeploymentResult, DeploymentStatus, ServerId};
use chrono::Utc;
use clap::Parser;
use log::{error, info, warn};
use std::collections::HashMap;
use tokio::time::{sleep, Duration};

/// Hire command for deploying AI agents to specific servers
#[derive(Debug, Parser, Clone)]
pub struct HireCommand {
    /// Server ID to deploy the agent to
    #[arg(short, long, value_name = "SERVER_ID")]
    pub server: String,

    /// Type of AI agent to hire
    #[arg(short, long, default_value = "sysadmin")]
    pub agent_type: String,

    /// Agent name/identifier
    #[arg(short, long)]
    pub name: Option<String>,

    /// Agent capabilities (comma-separated)
    #[arg(short, long)]
    pub capabilities: Option<String>,

    /// Force deployment without confirmation
    #[arg(long, action)]
    pub force: bool,

    /// Dry run mode (validate but don't deploy)
    #[arg(long, action)]
    pub dry_run: bool,
}

/// Configuration for hiring/deployment operations
pub struct HireConfig {
    pub database_url: String,
    pub default_capabilities: HashMap<String, Vec<String>>,
    pub max_agents_per_server: u32,
}

impl Default for HireConfig {
    fn default() -> Self {
        let mut default_capabilities = HashMap::new();
        default_capabilities.insert("sysadmin".to_string(), vec![
            "system_monitoring".to_string(),
            "log_analysis".to_string(),
            "performance_tuning".to_string(),
            "security_audit".to_string(),
        ]);
        default_capabilities.insert("devops".to_string(), vec![
            "ci_cd_management".to_string(),
            "container_orchestration".to_string(),
            "infrastructure_automation".to_string(),
            "monitoring_setup".to_string(),
        ]);
        default_capabilities.insert("security".to_string(), vec![
            "vulnerability_scanning".to_string(),
            "threat_detection".to_string(),
            "compliance_checking".to_string(),
            "incident_response".to_string(),
        ]);

        Self {
            database_url: std::env::var("DATABASE_URL")
                .unwrap_or_else(|_| "postgresql://localhost/cx_hrm".to_string()),
            default_capabilities,
            max_agents_per_server: 5,
        }
    }
}

/// AI Agent hiring service
pub struct AgentHiringService<R: AgentRepository> {
    repository: R,
    config: HireConfig,
    theme: SovereignTheme,
    renderer: CommandBlockRenderer,
}

impl<R: AgentRepository> AgentHiringService<R> {
    pub fn new(repository: R, config: HireConfig) -> Self {
        Self {
            repository,
            config,
            theme: SovereignTheme::default(),
            renderer: CommandBlockRenderer::new(),
        }
    }

    /// Execute agent hiring/deployment
    pub async fn hire_agent(&self, cmd: &HireCommand) -> Result<DeploymentResult, HireError> {
        let server_id = ServerId(cmd.server.clone());

        // Validate server availability
        self.validate_server(&server_id).await?;

        // Check existing agents on server
        let existing_agents = self.repository
            .get_agent_by_server(&server_id)
            .await
            .map_err(HireError::Database)?;

        if existing_agents.len() >= self.config.max_agents_per_server as usize && !cmd.force {
            return Err(HireError::ServerCapacityExceeded(server_id));
        }

        // Parse agent type
        let agent_type = self.parse_agent_type(&cmd.agent_type)?;

        // Generate agent capabilities
        let capabilities = self.generate_capabilities(&cmd.agent_type, &cmd.capabilities);

        // Generate agent name if not provided
        let agent_name = cmd.name.clone()
            .unwrap_or_else(|| format!("Agent-{}-{}", cmd.agent_type, server_id.0));

        // Create agent
        let mut agent = Agent::new(agent_name.clone(), agent_type, capabilities);

        if cmd.dry_run {
            return Ok(DeploymentResult {
                agent_id: agent.id.clone(),
                server_id,
                status: DeploymentStatus::Deploying,
                deployment_time: Utc::now(),
                message: format!("DRY RUN: Would deploy {} to server {}", agent_name, cmd.server),
            });
        }

        // Deploy agent
        info!("Deploying agent {} to server {}", agent_name, cmd.server);
        self.deploy_agent_to_server(&mut agent, &server_id).await?;

        // Store in database
        self.repository
            .create_agent(&agent)
            .await
            .map_err(HireError::Database)?;

        // Create deployment record
        let deployment = AgentDeployment {
            agent_id: agent.id.clone(),
            server_id: server_id.clone(),
            deployment_config: DeploymentConfig::default(),
            status: DeploymentStatus::Hired,
            deployed_at: Some(Utc::now()),
            last_heartbeat: Some(Utc::now()),
        };

        self.repository
            .deploy_agent(&deployment)
            .await
            .map_err(HireError::Database)?;

        // Render success with Sovereign Purple glow
        let success_message = self.renderer.render_agent_activation(&agent_name, &cmd.server);
        println!("{}", success_message);

        info!("Successfully deployed agent {} to server {}", agent_name, cmd.server);

        Ok(DeploymentResult {
            agent_id: agent.id,
            server_id,
            status: DeploymentStatus::Hired,
            deployment_time: Utc::now(),
            message: format!("Agent {} successfully hired and deployed with Sovereign Purple glow", agent_name),
        })
    }

    /// Validate that server is accessible for deployment
    async fn validate_server(&self, server_id: &ServerId) -> Result<(), HireError> {
        // TODO: Implement actual server connectivity check
        // For now, simulate validation with a small delay
        sleep(Duration::from_millis(100)).await;

        // Basic validation - check if server ID format is valid
        if server_id.0.is_empty() || server_id.0.len() < 3 {
            return Err(HireError::InvalidServerId(server_id.clone()));
        }

        info!("Server {} validation passed", server_id);
        Ok(())
    }

    /// Deploy agent to the specified server
    async fn deploy_agent_to_server(&self, agent: &mut Agent, server_id: &ServerId) -> Result<(), HireError> {
        // TODO: Implement actual deployment logic (SSH, container deployment, etc.)
        // For now, simulate deployment process
        sleep(Duration::from_millis(500)).await;

        agent.deploy_to(server_id.clone())
            .map_err(HireError::Agent)?;

        info!("Agent {} deployed to server {}", agent.name, server_id);
        Ok(())
    }

    /// Parse agent type string into enum
    fn parse_agent_type(&self, agent_type_str: &str) -> Result<AgentType, HireError> {
        match agent_type_str.to_lowercase().as_str() {
            "sysadmin" | "sys" => Ok(AgentType::SysAdmin),
            "devops" | "dev" => Ok(AgentType::DevOps),
            "security" | "sec" => Ok(AgentType::Security),
            "database" | "db" => Ok(AgentType::Database),
            "network" | "net" => Ok(AgentType::Network),
            custom => Ok(AgentType::Custom(custom.to_string())),
        }
    }

    /// Generate agent capabilities based on type and custom input
    fn generate_capabilities(&self, agent_type: &str, custom_capabilities: &Option<String>) -> Vec<String> {
        let mut capabilities = self.config.default_capabilities
            .get(agent_type)
            .cloned()
            .unwrap_or_else(|| vec!["basic_operations".to_string()]);

        if let Some(custom) = custom_capabilities {
            let additional: Vec<String> = custom
                .split(',')
                .map(|s| s.trim().to_string())
                .collect();
            capabilities.extend(additional);
        }

        capabilities
    }

    /// List available agents for hiring
    pub async fn list_available_agents(&self) -> Result<Vec<Agent>, HireError> {
        self.repository
            .list_available_agents()
            .await
            .map_err(HireError::Database)
    }
}

/// Errors that can occur during hiring process
#[derive(Debug, thiserror::Error)]
pub enum HireError {
    #[error("Invalid server ID: {0}")]
    InvalidServerId(ServerId),

    #[error("Server {0} has reached capacity limit")]
    ServerCapacityExceeded(ServerId),

    #[error("Server {0} is not accessible")]
    ServerUnavailable(ServerId),

    #[error("Agent error: {0}")]
    Agent(AgentError),

    #[error("Database error: {0}")]
    Database(DatabaseError),

    #[error("Deployment failed: {0}")]
    DeploymentFailed(String),

    #[error("Configuration error: {0}")]
    Configuration(String),
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::database::DatabaseError;
    use async_trait::async_trait;

    // Mock repository for testing
    struct MockAgentRepository {
        agents: Vec<Agent>,
        should_fail: bool,
    }

    #[async_trait]
    impl AgentRepository for MockAgentRepository {
        async fn create_agent(&self, _agent: &Agent) -> Result<(), DatabaseError> {
            if self.should_fail {
                Err(DatabaseError::Connection("Mock error".to_string()))
            } else {
                Ok(())
            }
        }

        async fn get_agent(&self, _id: &AgentId) -> Result<Option<Agent>, DatabaseError> {
            Ok(None)
        }

        async fn update_agent_status(&self, _id: &AgentId, _status: crate::agent::AgentStatus) -> Result<(), DatabaseError> {
            Ok(())
        }

        async fn deploy_agent(&self, _deployment: &AgentDeployment) -> Result<(), DatabaseError> {
            Ok(())
        }

        async fn get_agent_by_server(&self, _server_id: &ServerId) -> Result<Vec<Agent>, DatabaseError> {
            Ok(self.agents.clone())
        }

        async fn list_available_agents(&self) -> Result<Vec<Agent>, DatabaseError> {
            Ok(self.agents.clone())
        }

        async fn get_deployment_status(&self, _agent_id: &AgentId) -> Result<Option<DeploymentStatus>, DatabaseError> {
            Ok(Some(DeploymentStatus::Hired))
        }
    }

    #[tokio::test]
    async fn test_hire_agent_success() {
        let mock_repo = MockAgentRepository {
            agents: vec![],
            should_fail: false,
        };
        let config = HireConfig::default();
        let service = AgentHiringService::new(mock_repo, config);

        let cmd = HireCommand {
            server: "test-server-001".to_string(),
            agent_type: "sysadmin".to_string(),
            name: Some("TestAgent".to_string()),
            capabilities: None,
            force: false,
            dry_run: false,
        };

        let result = service.hire_agent(&cmd).await;
        assert!(result.is_ok());

        let deployment = result.unwrap();
        assert_eq!(deployment.status, DeploymentStatus::Hired);
        assert_eq!(deployment.server_id.0, "test-server-001");
    }

    #[tokio::test]
    async fn test_dry_run_mode() {
        let mock_repo = MockAgentRepository {
            agents: vec![],
            should_fail: false,
        };
        let config = HireConfig::default();
        let service = AgentHiringService::new(mock_repo, config);

        let cmd = HireCommand {
            server: "test-server-001".to_string(),
            agent_type: "sysadmin".to_string(),
            name: Some("TestAgent".to_string()),
            capabilities: None,
            force: false,
            dry_run: true,
        };

        let result = service.hire_agent(&cmd).await;
        assert!(result.is_ok());

        let deployment = result.unwrap();
        assert_eq!(deployment.status, DeploymentStatus::Deploying);
        assert!(deployment.message.contains("DRY RUN"));
    }
}