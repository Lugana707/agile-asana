[![Trunk Updated](https://github.com/Lugana707/app.agilelytics.ca/actions/workflows/trunk-updated.yml/badge.svg)](https://github.com/Lugana707/app.agilelytics.ca/actions/workflows/trunk-updated.yml)
[![Release](https://github.com/Lugana707/app.agilelytics.ca/actions/workflows/release.yml/badge.svg)](https://github.com/Lugana707/app.agilelytics.ca/actions/workflows/release.yml)

# [<img src="https://app.agilelytics.ca/static/media/logo.c3abc04e.png" alt="drawing" width="50px" alt="agilelytics"/>](https://app.agilelytics.ca/) agilelytics

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
