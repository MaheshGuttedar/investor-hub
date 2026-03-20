# Deploying Investor Hub

**Frontend → GitHub Pages** (free) | **Backend → AWS ECS Fargate** (~$9/mo)

```
  GitHub push (main)
       │
       ├──► Frontend changed?
       │       └──► Build React → Deploy to GitHub Pages (free)
       │               https://<user>.github.io/<repo>/
       │
       └──► Backend changed?
               └──► Build Docker → Push to ECR → Deploy to ECS Fargate
                       https://api.yourdomain.com
```

| Component | Hosting | Cost |
|-----------|---------|------|
| Frontend (React SPA) | GitHub Pages | **Free** |
| Backend (Express API) | AWS ECS Fargate | ~$9/mo |
| Database | MongoDB Atlas | Free–$57/mo |
| **Total** | | **$0–$66/mo** |

---

## Part 1 — Frontend: GitHub Pages (3 minutes)

### Step 1: Enable GitHub Pages

1. Go to your repo on GitHub
2. **Settings → Pages**
3. Under "Source", select **GitHub Actions**
4. Done — the workflow in `.github/workflows/deploy-frontend.yml` handles the rest

### Step 2: Set the API URL

1. Go to **Settings → Environments → github-pages → Environment variables**
2. Add variable:

| Name | Value |
|------|-------|
| `VITE_API_BASE_URL` | `https://api.yourdomain.com/api` (your backend URL) |

### Step 3: Push and deploy

```bash
git add .
git commit -m "Enable GitHub Pages deployment"
git push origin main
```

Your site will be live at: `https://<username>.github.io/<repo-name>/`

### How SPA routing works

GitHub Pages returns 404 for routes like `/dashboard`. The included `404.html` redirects these to `index.html` with the path preserved, so React Router handles them correctly.

---

## Part 2 — Backend: AWS ECS Fargate

### Step 1: One-time AWS setup

```bash
# Install & configure AWS CLI
aws configure

# Run the setup script
chmod +x deploy/aws-setup.sh
./deploy/aws-setup.sh
```

### Step 2: Store secrets

```bash
aws ssm put-parameter \
  --name /investor-hub/MONGODB_URI \
  --value "mongodb+srv://user:pass@cluster.mongodb.net/investorhub" \
  --type SecureString

aws ssm put-parameter \
  --name /investor-hub/JWT_SECRET \
  --value "your-jwt-secret-here" \
  --type SecureString
```

### Step 3: Register task definition

Edit `deploy/task-def-backend.json` — replace `ACCOUNT_ID` with your AWS account ID.

```bash
aws ecs register-task-definition --cli-input-json file://deploy/task-def-backend.json
```

### Step 4: Create the service

```bash
aws ecs create-service \
  --cluster investor-hub \
  --service-name backend-svc \
  --task-definition backend-task \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"
```

### Step 5: Add GitHub secret

In your repo: **Settings → Secrets → Actions**, add:

| Secret | Value |
|--------|-------|
| `AWS_ROLE_ARN` | `arn:aws:iam::<ACCOUNT_ID>:role/GitHubActionsRole` |

Now every push that changes `services/backend/` auto-deploys the backend.

---

## Local Development

```bash
# Option A: Docker Compose (full stack)
docker compose up --build
# Visit http://localhost

# Option B: Without Docker
npm run dev:all
# Visit http://localhost:8080
```

---

## Useful Commands

```bash
# Check GitHub Pages deployment status
# Go to: Actions tab → "Deploy Frontend to GitHub Pages"

# View backend logs
aws logs tail /ecs/backend-task --follow

# Force backend redeploy
aws ecs update-service --cluster investor-hub --service backend-svc --force-new-deployment

# Check backend health
curl https://api.yourdomain.com/api/health
```

---

## Files

```
.github/workflows/
  deploy-frontend.yml      # Build React → GitHub Pages
  deploy-backend.yml       # Build Docker → ECR → ECS
deploy/
  aws-setup.sh             # One-time AWS infra creation
  nginx.conf               # Nginx config (docker-compose only)
  task-def-backend.json    # ECS task definition
  task-def-frontend.json   # ECS task definition (docker-compose only)
Dockerfile.frontend        # Frontend container (docker-compose only)
Dockerfile.backend         # Backend container
docker-compose.yml         # Local full-stack testing
public/404.html            # GitHub Pages SPA routing fix
```
