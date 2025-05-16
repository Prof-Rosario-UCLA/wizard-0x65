# Wizard 0x65

## Installation

This project requires Node (v18), Rust, and wasm-pack.

## Setup
MacOS: Install [OrbStack](https://orbstack.dev/), an app for running Docker containers on macOS.
Windows: Install [Docker Desktop](https://docs.docker.com/desktop/setup/install/windows-install/).

Both of these options will allow you to run Docker containers.

There is a `docker-compose.yaml` file which creates Postgres and Redis containers cache and exposes them to the host. The Next.js app is not included in this because it should be live reloaded on changes.

## App Setup
Create a .env file and add the following lines:
```
POSTGRES_URL=postgresql://postgres:password@localhost:5432/wizard
REDIS_URL=redis://localhost:6379
```

Run `docker compose up` to start the database and cache. You can run `docker compose down` when you are finished.

### Database
Run `npx prisma migrate dev`. Check to make sure your database has been populated with tables based on the models listed in `schema.prisma`.


### Next.js App
Now you can run `npm run dev` to start the Next.js app. You are now ready to start developing locally!

## Kubernetes
To deploy to production, we use a [GKE](https://cloud.google.com/kubernetes-engine?hl=en) Kubernetes cluster. The manifests for deployments are found in the [infra](./infra) directory.

To save money, we delete the cluster when it is not in use. This means we must create the cluster each time we want to test in production. To do this, run the [create cluster workflow](https://github.com/wizard-0x65/wizard-0x65/actions/workflows/create-cluster.yaml). This will take a few minutes. You can check that it is completed by visiting the GCP Console page and clicking on Kubernetes Engine -> Clusters. There should be a cluster named `wizard`.

Now we must create the one-time services (those that will not change over the lifetime of the cluster). Run the [deploy services workflow](https://github.com/wizard-0x65/wizard-0x65/actions/workflows/deploy-services.yaml). This will deploy the Postgres database and Redis cache to the cluster.

The web app deploys to the cluster on every commit. This is disabled right now since the cluster will not always be running. You can deploy it manually using [this workflow](https://github.com/wizard-0x65/wizard-0x65/actions/workflows/deploy.yaml) (make sure to enable the workflow first and disable it after you are done).

When you are done, please [delete the cluster](https://github.com/wizard-0x65/wizard-0x65/actions/workflows/destroy-cluster.yaml).

### Kubectl
To access the cluster locally using `kubectl`, follow [these steps](https://cloud.google.com/kubernetes-engine/docs/how-to/cluster-access-for-kubectl):
```sh
gcloud components install kubectl
gcloud components install gke-gcloud-auth-plugin
gcloud container clusters get-credentials wizard --location=us-west1-a
```

You can check that it is working by running this to see a list of all active pods:
```sh
kubectl get pods
```
