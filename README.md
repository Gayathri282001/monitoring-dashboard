# Monitoring Dashboard — DevOps Assignment

# 1. Architecture Diagram
 ```
┌───────────────────────────────────────────────────────────┐
│                     Kubernetes Cluster                    | 
|  ┌────────────────────────────────────────────────────    │
│  │                    Namespace: monitoring           │   │
│  │                                                    │   │
│  │  ┌──────────────────┐      ┌──────────────────┐    │   │
│  │  │   Frontend Pod   │      │   Backend Pod    │    │   │
│  │  │                  │◄────►│                  │    │   │
│  │  │  Port: 80        │      │  Port: 3001      │    │   │
│  │  │  Replicas: 2     │      │  Replicas: 2     │    │   │
│  │  └──────────────────┘      └──────────────────┘    │   │
│  │         ▲                          ▲               │   │
│  │         │                          │               │   │
│  │  ┌──────┴──────────┐      ┌───────┴──────────┐     │   │
│  │  │ Frontend Svc    │      │  Backend Svc     │     │   │
│  │  │ NodePort:30080  │      │  ClusterIP:3001  │     │   │
│  │  └─────────────────┘      └──────────────────┘     │   │
│  │                                                    │   │
│  └────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────┘
 ```

## 2. Tech choices & reasoning

- continer: nginx:stable-alpine(frontend),  python:3.11-slim(backend)
- Docker multi-stage builds to keep images small.
- k3s/minikube/kind — any local Kubernetes is supported.
- GitHub Actions for CI/CD: free-tier, widely used.
- CI/CD : Github Actions.
- Registry: DockerHub
- Why: Industry-standard automation server with powerful pipeline capabilities

# 3. Local deployment (Docker Compose)

**Prerequisites
- Docker Desktop or Docker Engine (v20+)
- kubectl (v1.28+)
- k3s, minikube, or kind installed
- Git
1. Clone the repository**
   ```bash
   git clone <repository-url>
   cd monitoring-dashboard

2. Build & start:
   ```docker-compose up --build```

3. Access: 
   1. Frontend: http://localhost:3000
   2. Backend metrics: http://localhost:3001/metrics

4. to stop the application:
   ```bash
   docker-compose down
     ```

# Kubernetes (local):

1. Start k3s / minikube / kind cluster.

2. Build & push images to your registry(DockerHub) :
   ```
docker build -t your-dockerhub-username/monitoring-backend:latest ./backend
docker push your-dockerhub-username/monitoring-backend:latest
docker build -t your-dockerhub-username/monitoring-frontend:latest ./frontend
docker push your-dockerhub-username/monitoring-frontend:latest
 ```

3. Apply manifests:
 ```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -n monitoring -f k8s/
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
```
4. Verify deployment
   ```bash
   kubectl get pods -n monitoring
   kubectl get svc -n monitoring
   ```

# 4.  how to run the CI/CD pipeline:   

Workflow location: .github/workflows/ci-cd.yml

Secrets required: DOCKER_REGISTRY, DOCKER_USERNAME, DOCKER_PASSWORD, KUBECONFIG (if runner can access cluster)

For assignment: run a self-hosted runner on your machine configured with kubectl to have the workflow apply manifests directly.

How to run tests & lint locally

# Backend:
 ```
python -m pip install -r backend/requirements.txt
python -c "import flask; print('ok')"

 ```
# Frontend:
 ```
cd frontend
npm ci
npm run lint
npm run build
 ```
# 5. How to access frontend/backend services:  

Frontend: <NodeIP>:30080

Backend: <NodeIP>:3001/metrics

# 6. How to view Logs & Troubleshooting:

# Docker
 ```
Docker compose logs:
docker-compose logs -f
 ```
# Kubernetes:
 ```
kubectl -n monitoring get pods,svc
kubectl -n monitoring logs <pod-name>
kubectl -n monitoring describe pod <pod-name>
 ```
# Common issues:

ImagePullBackOff: ensure images exist in registry or loaded into local cluster.

Probes failing: check container logs; initialDelaySeconds may need increase on slow machines.
