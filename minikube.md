# Step-by-Step Local Deployment Guide: Minikube & GitHub

This guide covers installing Minikube on Windows, deploying the **FreshCart** application, and pushing your codebase to a remote GitHub repository.

---

## Part 1: Install & Set Up Minikube on Windows

### Step 1: Install Prerequisites

To run Minikube locally, you need a **hypervisor** (VirtualBox, Hyper-V, or Docker Desktop). The easiest approach is using **Docker Desktop** or **Hyper-V**.

1. **Install kubectl** (Kubernetes CLI):
   * Run PowerShell as Administrator:
     ```powershell
     winget install Kubernetes.kubectl
     ```
2. **Install Minikube**:
   * Run in PowerShell:
     ```powershell
     winget install -e --id Kubernetes.minikube
     ```
3. Restart your PowerShell window so path changes take effect.

---

### Step 2: Start Minikube

Start your local single-node cluster using Docker as the driver (make sure Docker Desktop is running first):

```powershell
minikube start --driver=docker
```

Confirm the cluster is running:
```powershell
kubectl cluster-info
```

---

## Part 2: Build & Deploy FreshCart on Minikube

To avoid pushing docker images to a public registry (Docker Hub/ECR) during local testing, we can configure our terminal to build images directly inside Minikube's internal Docker registry.

### Step 1: Configure Terminal to use Minikube Docker Daemon

In your active PowerShell window, run:
```powershell
& minikube -p minikube docker-env | Invoke-Expression
```
*Note: Any images built in this terminal session will now reside inside Minikube and be immediately available for Kubernetes to pull.*

---

### Step 2: Build the Container Images

1. **Build backend image:**
   From the repository root directory, run:
   ```powershell
   docker build -t freshcart-backend:latest ./backend
   ```
2. **Build frontend image:**
   ```powershell
   docker build -t freshcart-frontend:latest ./frontend
   ```

Verify the images are loaded in Minikube's registry:
```powershell
docker images | findstr freshcart
```

---

### Step 3: Deploy to Kubernetes

All deployment manifests are configured under the [k8s/](file:///c:/Users/ZML-WIN-DeepS-01/Desktop/FreshCart/k8s) folder. Run the following command from the repository root:

```powershell
kubectl apply -k ./k8s
```

Check the status of your pods (it might take a minute to pull database images and complete initialization scripts):
```powershell
kubectl get pods
```

---

### Step 4: Access the Application

Since Minikube runs inside a virtualized environment or container, NodePorts are not immediately accessible via `localhost`.

To map the services locally:

1. **Start Minikube Tunnel (Keeps running in background):**
   Open a separate PowerShell window and run:
   ```powershell
   minikube tunnel
   ```
2. **Or run Port-Forwarding commands:**
   * **Backend:**
     ```powershell
     kubectl port-forward svc/backend 8000:8000
     ```
   * **Frontend:**
     ```powershell
     kubectl port-forward svc/frontend 3000:3000
     ```
3. Open your browser and navigate to:
   * Frontend Shop: **[http://localhost:3000](http://localhost:3000)**
   * Backend Swagger API: **[http://localhost:8000/docs](http://localhost:8000/docs)**

---

## Part 3: Push Code to your GitHub Repository

Once local testing passes, push the codebase (including the new Dockerfiles and Kubernetes manifests) to GitHub.

### Step 1: Create a GitHub Repository
1. Log in to [GitHub](https://github.com).
2. Click **New Repository**.
3. Name it `FreshCart`, choose **Private** or **Public**, and click **Create repository** (do not add README, .gitignore, or license since they already exist in the codebase).

### Step 2: Initialize & Push from Local Machine

Run the following commands in your repository root directory:

1. **Configure Git Remotes:**
   ```powershell
   # Add your github remote link (replace with your repository url)
   git remote add origin https://github.com/YOUR_USERNAME/FreshCart.git
   ```

2. **Commit Your Code changes:**
   ```powershell
   # Add all new/modified files (including frontend Dockerfile & k8s manifests)
   git add .

   # Commit
   git commit -m "feat: add frontend Dockerfile, Kubernetes manifests, and Minikube guides"
   ```

3. **Push to Main branch:**
   ```powershell
   # Rename default branch to main if it isn't already
   git branch -M main

   # Push to remote
   git push -u origin main
   ```

---

## Part 4: Cleanup Local Minikube Cluster

To stop the cluster and save system resources:
```powershell
minikube stop
```

To delete the cluster completely (wipes local database/cache volumes):
```powershell
minikube delete
```
