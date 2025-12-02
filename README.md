# Monitoring Dashboard — DevOps Assignment

## Overview
A simple monitoring dashboard built as containerized microservices:
- **Backend**: Flask service exposing `/metrics` (simulated CPU, latency, errors + monotonic counter)
- **Frontend**: React dashboard polling `/metrics` every 10s and rendering charts
- **CI/CD**: GitHub Actions to lint, test, build images, push to registry and deploy to Kubernetes (instructions below)
- **Kubernetes**: k3s/minikube/kind manifests included

## Architecture Diagram

```
┌───────────────────────────────────────────────────────────┐
│                     Kubernetes Cluster                    | 
|  ┌────────────────────────────────────────────────────    │
│  │                    Namespace: monitoring           │   │
│  │                                                    │   │
│  │  ┌──────────────────┐      ┌──────────────────┐    │   │
│  │  │   Frontend Pod   │      │   Backend Pod    │    │   │
│  │  │  (React/Nginx)   │◄────►│  (Node.js/Expr)  │    │   │
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
## Tech choices & reasoning
- Python/Flask for backend: fast to prototype, small dependency footprint.
- React + Vite for frontend: quick dev feedback and small production bundle.
- Chart.js for plotting — simple and effective.
- Docker multi-stage builds to keep images small.
- k3s/minikube/kind — any local Kubernetes is supported.
- GitHub Actions for CI/CD: free-tier, widely used.

## Local setup (Docker Compose)
1. Build & start:
   ```docker-compose up --build```
2. Access: 
   1. Frontend: http://localhost:3000
   2. Backend metrics: http://localhost:5000/metrics

Kubernetes (local)

Start k3s / minikube / kind cluster.

Build & push images to your registry (or load images into the local cluster):

Docker Hub:

docker build -t youruser/monitoring-backend:latest ./backend
docker push youruser/monitoring-backend:latest
docker build -t youruser/monitoring-frontend:latest ./frontend
docker push youruser/monitoring-frontend:latest


For kind:

docker build -t monitoring-backend:latest ./backend
kind load docker-image monitoring-backend:latest


Update k8s/*.yaml replacing <REGISTRY> with your image path.

Apply manifests:

kubectl apply -f k8s/namespace.yaml
kubectl apply -n monitor-app -f k8s/


Access:

Frontend: <NodeIP>:30080

Backend: <NodeIP>:30050/metrics

CI/CD

Workflow location: .github/workflows/ci-cd.yml

Secrets required: DOCKER_REGISTRY, DOCKER_USERNAME, DOCKER_PASSWORD, KUBECONFIG (if runner can access cluster)

For assignment: run a self-hosted runner on your machine configured with kubectl to have the workflow apply manifests directly.

How to run tests & lint locally

Backend:

python -m pip install -r backend/requirements.txt
python -c "import flask; print('ok')"


Frontend:

cd frontend
npm ci
npm run lint
npm run build

Logs & Troubleshooting

Docker compose logs:

docker-compose logs -f


Kubernetes:

kubectl -n monitor-app get pods,svc
kubectl -n monitor-app logs <pod-name>
kubectl -n monitor-app describe pod <pod-name>


Common issues:

ImagePullBackOff: ensure images exist in registry or loaded into local cluster.

Probes failing: check container logs; initialDelaySeconds may need increase on slow machines.
