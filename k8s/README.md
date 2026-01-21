# Kubernetes Deployment for Pastebin

Deploy the Pastebin application with self-hosted Convex backend on Kubernetes.

## Architecture

```text
┌──────────────────────────────────────────────────────────────┐
│                        Ingress                               │
│  pastebin.example.com  api.pastebin.example.com  dashboard.  │
└──────────┬─────────────────────┬────────────────────┬────────┘
           │                     │                    │
           ▼                     ▼                    ▼
    ┌─────────────┐      ┌──────────────┐     ┌─────────────┐
    │ pastebin-app│      │convex-backend│     │  dashboard  │
    │  (Next.js)  │◄────►│  :3210/:3211 │◄────│   :6791     │
    │    :3000    │      └──────┬───────┘     └─────────────┘
    └─────────────┘             │
                                ▼
                         ┌─────────────┐
                         │  SQLite DB  │
                         │  (PVC 10Gi) │
                         └─────────────┘
```

## Prerequisites

- Kubernetes cluster (1.24+)
- kubectl configured
- ingress controller installed
- (Optional) cert-manager for TLS

## Quick Start

### 1. Generate Admin Key

```bash
# Generate a secure admin key
openssl rand -base64 32
```

### 2. Update Configuration

Edit the following files with your values:

**k8s/secrets.yaml:**
```yaml
stringData:
  admin-key: "YOUR_GENERATED_ADMIN_KEY"
```

**k8s/configmap.yaml:**
```yaml
data:
  CONVEX_CLOUD_ORIGIN: "https://api.your-domain.com"
  CONVEX_SITE_ORIGIN: "https://site.your-domain.com"
```

**k8s/ingress.yaml:**
- Update hostnames to match your domain
- Uncomment TLS section if using HTTPS

**k8s/nextjs-app-deployment.yaml:**
- Update the image to your container registry

### 3. Build and Push the App Image

```bash
# Build the Docker image and push to the registry
docker-buildx build . --tag your-registry/pastebin-app:latest --platform linux/amd64 --push
```

### 4. Deploy with Kustomize

```bash
# Preview the deployment
kubectl kustomize k8s/

# Apply the deployment
kubectl apply -k k8s/

# Or apply files individually
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/convex-backend-pvc.yaml
kubectl apply -f k8s/convex-backend-deployment.yaml
kubectl apply -f k8s/convex-backend-service.yaml
kubectl apply -f k8s/convex-dashboard-deployment.yaml
kubectl apply -f k8s/convex-dashboard-service.yaml
kubectl apply -f k8s/nextjs-app-deployment.yaml
kubectl apply -f k8s/nextjs-app-service.yaml
kubectl apply -f k8s/ingress.yaml
```

### 5. Push Convex Functions

After the backend is running, push your Convex functions:

```bash
# Set environment for self-hosted Convex
export CONVEX_SELF_HOSTED_URL="https://api.your-domain.com"
export CONVEX_SELF_HOSTED_ADMIN_KEY="your-admin-key"

# Push functions
bunx convex deploy
```

## Verify Deployment

```bash
# Check all pods are running
kubectl get pods -n pastebin

# Check services
kubectl get svc -n pastebin

# Check ingress
kubectl get ingress -n pastebin

# View logs
kubectl logs -n pastebin -l app=convex-backend -f
kubectl logs -n pastebin -l app=pastebin-app -f
```

## Configuration

### Storage

The default configuration uses SQLite with a 10Gi PVC. To change storage size, edit `convex-backend-pvc.yaml`:

```yaml
resources:
  requests:
    storage: 20Gi  # Increase as needed
```

### Resources

Adjust resource limits in the deployment files based on your workload:

| Component | Default Memory | Default CPU |
|-----------|---------------|-------------|
| convex-backend | 512Mi-2Gi | 250m-1000m |
| convex-dashboard | 256Mi-512Mi | 100m-500m |
| pastebin-app | 256Mi-512Mi | 100m-500m |

### Scaling

- **convex-backend**: Must be single replica with SQLite (file locking)
- **pastebin-app**: Can scale horizontally (2+ replicas)
- **convex-dashboard**: Single replica sufficient

## Troubleshooting

### Backend not starting

```bash
# Check pod events
kubectl describe pod -n pastebin -l app=convex-backend

# Check logs
kubectl logs -n pastebin -l app=convex-backend
```

### Database issues

```bash
# Access the backend pod
kubectl exec -it -n pastebin deploy/convex-backend -- sh

# Check data directory
ls -la /convex/data
```

### Ingress not working

```bash
# Verify ingress controller is running
kubectl get pods -n ingress-nginx

# Check ingress status
kubectl describe ingress -n pastebin pastebin-ingress
```

## Cleanup

```bash
# Delete all resources
kubectl delete -k k8s/

# Or delete namespace (removes everything)
kubectl delete namespace pastebin
```

## Production Considerations

1. **TLS**: Enable TLS in ingress with cert-manager
2. **Backup**: Set up regular PVC snapshots
3. **Monitoring**: Add Prometheus annotations for metrics
4. **PostgreSQL**: Consider switching to PostgreSQL for better concurrency
5. **Resource limits**: Adjust based on actual usage patterns
