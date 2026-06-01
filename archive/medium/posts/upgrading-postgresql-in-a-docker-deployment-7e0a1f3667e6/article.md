# Upgrading PostgreSQL in a docker deployment

![](images/image-001.png)

Recently, I had to upgrade an older Django-Docker-PostgreSQL deployment, only to discover that PostgreSQL 9.0 files weren’t compatible with PostgreSQL 15.0. After many hours of trying and failing, and searching the net for solutions, this is what I came up with.

My old docker-compose.yml looked like this, without specifying the PostgreSQL version. At the time of deployment, the current version was 9.0.

```
version: '3'
services:
  db:
    image: postgres:latest
    volumes:
      - postgres_data:/var/lib/postgresql/data/

volumes:
  postgres_data:
```

My current version specifies the PostgreSQL version as version 15.1.

```
version: '3'
```

```
services:
```

```
  db:
    image: postgres:15.1-alpine
    environment:
      - POSTGRES_HOST_AUTH_METHOD=trust
    volumes:
      - postgres_data:/var/lib/postgresql/data/
```

```
volumes:
  postgres_data:
```

As I tried to run my new docker-compose.yml the database crashed with a message that it was incompatible with older database files. I checkout out the previous version, and started the container.

```
$ docker-compose up -d
```

Then I logged into the running container:

```
$ docker exec -ti db sh
```

Inside the container, I dumped the database into a file:

```
$ pg_dump -U postgres > sql_dump.sql
$ exit
```

To locate the database dump, which at the moment exists deep inside the docker filesystem, I did a filesystem-wide search:

```
$ find / -name sql_dump.sql
```

This will list something like:

```
/var/lib/docker/overlay2/bd512eb256c....cd6c862d/diff/sql_dump.sql
```

Copy the file to something more suitable, like /tmp

```
$ cp /var/lib/docker/overlay2/bd512ebc....cd6c862d/diff/sql_dump.sql /tmp/
```

At this point, I spun up a new Digitial Ocean droplet with docker installed and copied the sql_dump.sql file to the new droplet. I started my server:

```
$ docker-compose up --build -d
```

Then I logged into the running db container, and touched a file to locate where to copy the sql_dump.sql file:

```
$ docker exec -ti db sh
# inside the container
$ touch here.dot
```

Then I did a filesystem-wide search to locate the correct folder from the outside of the container:

```
$ find / name here.dot
/var/lib/docker/overlay2/bd512eb256c....cd6c862d/diff/here.dot
```

I copied the sql_dump.sql into that folder to be able to use it from inside the container:

```
$ cp /tmp/sql_dump.sql /var/lib/docker/overlay2/bd512eb6c....cd6c862d/diff/
```

Then I logged into the running database container once again, to drop the existing database, create a new, empty database, and then import the old database data into the new server:

```
$ docker exec -ti db sh
# Inside the container
$ dropdb -U postgres postgres
$ createdb -U postgres postgres
$ psql -U postgres -f sql_dump.sql
```

For all the latest articles, follow me over at my personal blog as well, at [weholt.org](http://weholt.org/category/developer-diary/).
