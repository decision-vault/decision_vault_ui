// Deployment Terraform template (MVP-level) – Startup Analytics Dashboard
// AWS Single Region: VPC, Public Subnets, ALB, ECS Fargate, RDS PostgreSQL, S3, CloudWatch

export const TERRAFORM_CONTENT = `# Deployment Terraform Template (MVP)

**Project:** Startup Analytics Dashboard  
**Scope:** AWS Single Region, MVP-level  
**Structure:** VPC • Public + Private Subnets • ALB • ECS Fargate • RDS PostgreSQL • S3 • CloudWatch • Security groups

---

## Project structure

\`\`\`
infra/
  ├── main.tf
  ├── variables.tf
  ├── outputs.tf
  ├── provider.tf
  └── versions.tf
\`\`\`

---

## 1. versions.tf

\`\`\`hcl
terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}
\`\`\`

---

## 2. provider.tf

\`\`\`hcl
provider "aws" {
  region = var.aws_region
}
\`\`\`

---

## 3. variables.tf

\`\`\`hcl
variable "aws_region" {
  default = "us-east-1"
}

variable "project_name" {
  default = "analytics-dashboard"
}

variable "db_username" {}
variable "db_password" {}

variable "container_image" {
  description = "Docker image for FastAPI backend"
}
\`\`\`

---

## 4. main.tf

### VPC

\`\`\`hcl
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
}
\`\`\`

### Subnets (public)

\`\`\`hcl
resource "aws_subnet" "public_1" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "\${var.aws_region}a"
  map_public_ip_on_launch = true
}

resource "aws_subnet" "public_2" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "\${var.aws_region}b"
  map_public_ip_on_launch = true
}
\`\`\`

### Internet Gateway

\`\`\`hcl
resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.main.id
}
\`\`\`

### Security groups

**ALB Security Group**

\`\`\`hcl
resource "aws_security_group" "alb_sg" {
  vpc_id = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
\`\`\`

**ECS Security Group**

\`\`\`hcl
resource "aws_security_group" "ecs_sg" {
  vpc_id = aws_vpc.main.id

  ingress {
    from_port       = 8000
    to_port         = 8000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
\`\`\`

**RDS Security Group**

\`\`\`hcl
resource "aws_security_group" "rds_sg" {
  vpc_id = aws_vpc.main.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_sg.id]
  }
}
\`\`\`

### RDS PostgreSQL

\`\`\`hcl
resource "aws_db_instance" "postgres" {
  allocated_storage       = 20
  engine                  = "postgres"
  engine_version          = "15"
  instance_class          = "db.t3.micro"
  db_name                 = "analytics"
  username                = var.db_username
  password                = var.db_password
  skip_final_snapshot     = true
  publicly_accessible     = false
  vpc_security_group_ids  = [aws_security_group.rds_sg.id]
}
\`\`\`

### ECS Task Execution Role

\`\`\`hcl
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "\${var.project_name}-ecs-execution"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_execution" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}
\`\`\`

### ECS Cluster

\`\`\`hcl
resource "aws_ecs_cluster" "main" {
  name = "\${var.project_name}-cluster"
}
\`\`\`

### CloudWatch Logs

\`\`\`hcl
resource "aws_cloudwatch_log_group" "ecs_logs" {
  name = "/ecs/\${var.project_name}"
}
\`\`\`

### ECS Task Definition

\`\`\`hcl
resource "aws_ecs_task_definition" "app" {
  family                   = "\${var.project_name}-task"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name  = "app"
      image = var.container_image
      portMappings = [{
        containerPort = 8000
      }]
      environment = [
        {
          name  = "DATABASE_URL"
          value = "postgresql://\${var.db_username}:\${var.db_password}@\${aws_db_instance.postgres.address}:5432/analytics"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.ecs_logs.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix  = "ecs"
        }
      }
    }
  ])
}
\`\`\`

### ECS Service

\`\`\`hcl
resource "aws_ecs_service" "app" {
  name            = "\${var.project_name}-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  launch_type     = "FARGATE"
  desired_count   = 2

  network_configuration {
    subnets         = [aws_subnet.public_1.id, aws_subnet.public_2.id]
    security_groups = [aws_security_group.ecs_sg.id]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.app.arn
    container_name   = "app"
    container_port   = 8000
  }
}
\`\`\`

### Application Load Balancer

\`\`\`hcl
resource "aws_lb" "app" {
  name               = "\${var.project_name}-alb"
  load_balancer_type = "application"
  subnets            = [aws_subnet.public_1.id, aws_subnet.public_2.id]
  security_groups    = [aws_security_group.alb_sg.id]
}

resource "aws_lb_target_group" "app" {
  port     = 8000
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.app.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }
}
\`\`\`

### S3 (frontend + exports)

\`\`\`hcl
resource "aws_s3_bucket" "frontend" {
  bucket = "\${var.project_name}-frontend"
}

resource "aws_s3_bucket" "exports" {
  bucket = "\${var.project_name}-exports"
}
\`\`\`

---

## 5. outputs.tf

\`\`\`hcl
output "alb_dns" {
  value = aws_lb.app.dns_name
}

output "database_endpoint" {
  value = aws_db_instance.postgres.address
}
\`\`\`

---

*Terraform template — MVP-level, single region. Security groups scoped; extendable for private subnets and HTTPS.*
`
