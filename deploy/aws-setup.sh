#!/bin/bash
#
# One-time AWS infrastructure setup for Investor Hub.
# Run this from your local machine with AWS CLI configured.
#
# Prerequisites:
#   - AWS CLI v2 installed & configured (aws configure)
#   - A MongoDB Atlas connection string (or other hosted MongoDB)
#   - A registered domain (optional, for custom domain)
#
# Usage:
#   chmod +x deploy/aws-setup.sh
#   ./deploy/aws-setup.sh
#
set -euo pipefail

REGION="us-east-1"
CLUSTER_NAME="investor-hub"
FRONTEND_REPO="investor-hub-frontend"
BACKEND_REPO="investor-hub-backend"
FRONTEND_SERVICE="frontend-svc"
BACKEND_SERVICE="backend-svc"
FRONTEND_TASK="frontend-task"
BACKEND_TASK="backend-task"
VPC_CIDR="10.0.0.0/16"

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "==> AWS Account: $ACCOUNT_ID  Region: $REGION"

# ---------- ECR Repositories ----------
echo "==> Creating ECR repositories..."
for REPO in $FRONTEND_REPO $BACKEND_REPO; do
  aws ecr describe-repositories --repository-names "$REPO" --region "$REGION" 2>/dev/null || \
    aws ecr create-repository --repository-name "$REPO" --region "$REGION" --image-scanning-configuration scanOnPush=true
done

# ---------- ECS Cluster ----------
echo "==> Creating ECS cluster..."
aws ecs describe-clusters --clusters "$CLUSTER_NAME" --region "$REGION" --query "clusters[?status=='ACTIVE'].clusterName" --output text | grep -q "$CLUSTER_NAME" || \
  aws ecs create-cluster --cluster-name "$CLUSTER_NAME" --region "$REGION" --capacity-providers FARGATE --default-capacity-provider-strategy capacityProvider=FARGATE,weight=1

# ---------- CloudWatch Log Groups ----------
echo "==> Creating log groups..."
for LG in "/ecs/$FRONTEND_TASK" "/ecs/$BACKEND_TASK"; do
  aws logs describe-log-groups --log-group-name-prefix "$LG" --region "$REGION" --query "logGroups[].logGroupName" --output text | grep -q "$LG" || \
    aws logs create-log-group --log-group-name "$LG" --region "$REGION"
done

# ---------- IAM Execution Role ----------
EXEC_ROLE_NAME="ecsTaskExecutionRole"
if ! aws iam get-role --role-name "$EXEC_ROLE_NAME" 2>/dev/null; then
  echo "==> Creating ECS task execution role..."
  aws iam create-role \
    --role-name "$EXEC_ROLE_NAME" \
    --assume-role-policy-document '{
      "Version": "2012-10-17",
      "Statement": [{
        "Effect": "Allow",
        "Principal": {"Service": "ecs-tasks.amazonaws.com"},
        "Action": "sts:AssumeRole"
      }]
    }'
  aws iam attach-role-policy \
    --role-name "$EXEC_ROLE_NAME" \
    --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
fi

EXEC_ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${EXEC_ROLE_NAME}"

echo ""
echo "========================================="
echo "  Infrastructure created successfully!"
echo "========================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Store your backend secrets in AWS Systems Manager Parameter Store:"
echo "   aws ssm put-parameter --name /investor-hub/MONGODB_URI --value 'mongodb+srv://...' --type SecureString"
echo "   aws ssm put-parameter --name /investor-hub/JWT_SECRET --value 'your-secret' --type SecureString"
echo ""
echo "2. Register the task definitions (see deploy/task-def-backend.json and deploy/task-def-frontend.json)"
echo "   aws ecs register-task-definition --cli-input-json file://deploy/task-def-backend.json"
echo "   aws ecs register-task-definition --cli-input-json file://deploy/task-def-frontend.json"
echo ""
echo "3. Create the ECS services (you need a VPC with subnets and a security group):"
echo "   aws ecs create-service --cluster $CLUSTER_NAME --service-name $BACKEND_SERVICE --task-definition $BACKEND_TASK --desired-count 1 --launch-type FARGATE --network-configuration '...'"
echo "   aws ecs create-service --cluster $CLUSTER_NAME --service-name $FRONTEND_SERVICE --task-definition $FRONTEND_TASK --desired-count 1 --launch-type FARGATE --network-configuration '...'"
echo ""
echo "4. Add these GitHub repo secrets:"
echo "   AWS_ROLE_ARN = arn:aws:iam::${ACCOUNT_ID}:role/GitHubActionsRole"
echo ""
echo "5. Push to 'main' branch — GitHub Actions will build, push, and deploy automatically."
echo ""
