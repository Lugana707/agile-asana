![Web CD](https://github.com/Lugana707/app.agilelytics.ca/workflows/Web%20CD/badge.svg)
![CloudFormation CD](https://github.com/Lugana707/app.agilelytics.ca/workflows/CloudFormation%20CD/badge.svg)
![Trunk Updated](https://github.com/Lugana707/app.agilelytics.ca/workflows/Trunk%20Updated/badge.svg)

# agilelytics (app.agilelytics.ca)

Web UI aimed towards providing tools for agile organisations using Asana.

## Getting Started

1. Checkout the code
2. Install docker
3. Install docker-compose
4. Ensure you have the experimental buildkit enabled for docker & docker-compose

```bash
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
```

5. Run `docker-compose --service-ports web`
6. Navigate to `http://localhost/` in your browser
7. Follow the steps to configure Agilelytics
