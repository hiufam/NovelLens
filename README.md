# NovelLens

NovelLens is a homemade crude Rails web application for reading docx/pdf of novels or books with built-in definition, images and wiki search.
<img width="1836" height="932" alt="Screenshot 2026-10-04 223812" src="https://github.com/user-attachments/assets/aaad0d27-21b6-46b2-a99a-191948effb07" />

## Sample

**Note**: I'm currently using [Render](https://render.com/) free tier to deploy application image. Therefore, **it will take a few seconds to minutes for the application to spin up**. [Aiven](https://aiven.io/) Postgres free tier is used with termination date to database; thus, **authentication may cease to work**.

**URL**: [https://novellens-latest.onrender.com](https://novellens-latest.onrender.com/)

## Tech Stacks

Backend
- [PostgreSQL](https://www.postgresql.org)
- [ERB](https://guides.rubyonrails.org/layouts_and_rendering.html)

Frontend
- [Esbuild](https://esbuild.github.io/)
- [Bootstrap](https://getbootstrap.com/)

## Local Deployment

**Prerequisite**

Ensure [Docker](https://docs.docker.com/) is installed.\
Acquires following environment values:
- PEXELS_API_KEY (Optional): [https://www.pexels.com/api](https://www.pexels.com/api/) 

**Repo Cloning**

```bash
git clone git@github.com:hiufam/NovelLens.git
```

**Environment Config** 

Generate Rails credentials for development environment

```bash
bin/rails credentials:edit -e development
```

Update the credentials with the following values
```bash
# credentials.yml.enc
secret_key_base: <YOUR_SECRET_KEY_BASE>
dictionary:
  api_url: https://api.dictionaryapi.dev/api/v2
pexels:
  api_key: <PEXELS_API_KEY>
  api_url: https://api.pexels.com/v1
wiki:
  api_url: https://en.wikipedia.org
```

Create .env file
```bash
touch .env
```

Add following values to .env file

```bash
# .env
export DOCKER_BUILDKIT=1

export COMPOSE_PROJECT_NAME=novel-lens
export COMPOSE_PROFILES=postgres,redis,assets,web

export RAILS_ENV=development
export NODE_ENV=development

export POSTGRES_USER=postgres
export POSTGRES_PASSWORD=123456
export POSTGRES_DB=postgres
export POSTGRES_HOST=postgres
export POSTGRES_PORT=5432

export DOCKER_RESTART_POLICY=no
export DOCKER_WEB_HEALTHCHECK_TEST=/bin/true
export DOCKER_WEB_PORT_FORWARD=8000
export DOCKER_CABLE_PORT_FORWARD=28080
export DOCKER_WEB_VOLUME=.:/app
```

**Build Project**

```bash
docker compose up --build
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## Authors and acknowledgment

Thanks Nick Janetakis
for [Example of Rails with Docker](https://github.com/nickjj/docker-rails-example)

## License

[MIT](https://choosealicense.com/licenses/mit/)
